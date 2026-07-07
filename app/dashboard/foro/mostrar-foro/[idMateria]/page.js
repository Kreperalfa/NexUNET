"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../../lib/supabase";

export default function MostrarForoPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const redirigir = useRouter();
  const idMateria = params.idMateria;

  const [foros, setForos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nivel, setNivel] = useState(null);

  const cargarNivelUsuario = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from("Usuario")
      .select("nivel")
      .eq("id", userId)
      .single();

    if (!error && data) setNivel(Number(data.nivel));
  };

  const cargarForos = async () => {
    const { data, error } = await supabase
      .from("Foro")
      .select("idForo, tipo, created_at")
      .eq("idMateria", idMateria);

    if (!error && data) {
      const ordenados = data.sort((a, b) => {
        if (a.tipo === "OFICIAL" && b.tipo !== "OFICIAL") return -1;
        if (a.tipo !== "OFICIAL" && b.tipo === "OFICIAL") return 1;
        return 0;
      });
      setForos(ordenados);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarForos();
    cargarNivelUsuario();
  }, [idMateria]);

  const cargarHilosForo = async (idForo) => {
    const { data, error } = await supabase
      .from("Hilo")
      .select("idHilo, titulo, contenido, created_at, idUsuarioCreador, idCuentaCreador")
      .eq("idForoFuente", idForo)
      .order("created_at", { ascending: false });

    return error ? [] : data;
  };

  const cargarArchivos = async (idHilo) => {
    const { data, error } = await supabase
      .from("ArchivoHilo")
      .select("nombreArchivo, tipoArchivo")
      .eq("idHilo", idHilo);

    return error ? [] : data;
  };

  const cargarSubHilos = async (idHilo) => {
    const { data, error } = await supabase
      .from("SubHilo")
      .select("idSubHilo, contenido, created_at, idUsuarioCreador, idRespuestaPadre")
      .eq("idHilo", idHilo)
      .order("created_at", { ascending: true });

    return error ? [] : data;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Foros de la Materia</h1>

      {cargando && <p>Cargando foros...</p>}
      {!cargando && foros.length === 0 && <p>No hay foros registrados para esta materia.</p>}

      {foros.map((foro) => (
        <div key={foro.idForo} style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>{foro.tipo === "OFICIAL" ? "Foro Oficial" : "Foro No Oficial"}</h2>
          <p>Creado: {new Date(foro.created_at).toLocaleString()}</p>

          {foro.tipo === "NO_OFICIAL" && (
            <button
              onClick={() =>
                redirigir.push(`/dashboard/foro/mostrar-foro/${idMateria}/crear-hilo?tipo=${foro.tipo}&idForo=${foro.idForo}`)
              }
              style={{ marginTop: "10px" }}
            >
              Publicar Hilo
            </button>
          )}

          {foro.tipo === "OFICIAL" && (nivel === 2 || nivel === 3) && (
            <button
              onClick={() =>
                redirigir.push(`/dashboard/foro/mostrar-foro/${idMateria}/crear-hilo?tipo=${foro.tipo}&idForo=${foro.idForo}`)
              }
              style={{ marginTop: "10px" }}
            >
              Publicar Hilo
            </button>
          )}

          <ForoContenido
            idForo={foro.idForo}
            tipoForo={foro.tipo}
            idMateria={idMateria}
            cargarHilos={cargarHilosForo}
            cargarArchivos={cargarArchivos}
            cargarSubHilos={cargarSubHilos}
          />
        </div>
      ))}
    </div>
  );
}

function ForoContenido({ idForo, tipoForo, idMateria, cargarHilos, cargarArchivos, cargarSubHilos }) {
  const [hilos, setHilos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const redirigir = useRouter();

  useEffect(() => {
    const fetchHilos = async () => {
      const data = await cargarHilos(idForo);

      const hilosConExtras = await Promise.all(
        data.map(async (hilo) => {
          const archivos = await cargarArchivos(hilo.idHilo);
          const subhilos = await cargarSubHilos(hilo.idHilo);
          return { ...hilo, archivos, subhilos };
        })
      );

      setHilos(hilosConExtras);
      setCargando(false);
    };
    fetchHilos();
  }, [idForo, cargarHilos, cargarArchivos, cargarSubHilos]);

  if (cargando) return <p>Cargando hilos...</p>;
  if (hilos.length === 0) return <p>Este foro aún no tiene hilos.</p>;

  return (
    <ul>
      {hilos.map((hilo) => (
        <li key={hilo.idHilo} style={{ marginBottom: "1rem" }}>
          <strong>{hilo.titulo}</strong>
          <br />
          {hilo.contenido}
          <br />
          <small>
            Creado por usuario {hilo.idUsuarioCreador}
            {hilo.idCuentaCreador && ` (Cuenta ${hilo.idCuentaCreador})`} - {new Date(hilo.created_at).toLocaleString()}
          </small>

          {hilo.archivos?.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <p><strong>Adjuntos:</strong></p>
              <ul>
                {hilo.archivos.map((a, idx) => (
                  <li key={idx}>
                    {a.tipoArchivo === "link" ? (
                      <a href={a.nombreArchivo} target="_blank" rel="noopener noreferrer">{a.nombreArchivo}</a>
                    ) : (
                      <span>{a.nombreArchivo}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tipoForo === "NO_OFICIAL" && (
            <button
              onClick={() =>
                redirigir.push(`/dashboard/foro/mostrar-foro/${idMateria}/responder-hilo?idHiloOrigen=${hilo.idHilo}&idRespuesta=${hilo.idHilo}`)
              }
              style={{ marginTop: "10px", padding: "6px 12px" }}
            >
              Responder
            </button>
          )}

          {/* Subhilos */}
          {hilo.subhilos?.length > 0 && (
            <ul style={{ marginTop: "10px", marginLeft: "20px", borderLeft: "2px solid #ccc", paddingLeft: "10px" }}>
              {hilo.subhilos.map((sub) => (
                <li key={sub.idSubHilo} style={{ marginBottom: "0.5rem" }}>
                  {sub.contenido}
                  <br />
                  <small>
                    Respuesta de usuario {sub.idUsuarioCreador} - {new Date(sub.created_at).toLocaleString()}
                  </small>
                  <button
                    onClick={() =>
                      redirigir.push(`/dashboard/foro/mostrar-foro/${idMateria}/responder-hilo?idHiloOrigen=${hilo.idHilo}&idRespuesta=${sub.idSubHilo}`)
                    }
                    style={{ marginTop: "5px", padding: "4px 10px" }}
                  >
                    Responder
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
