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

  // Cargar nivel del usuario actual
  const cargarNivelUsuario = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    console.log("➡️ Resultado getUser:", userData, "Error:", userError);
    console.log("➡️ userId obtenido:", userId);

    if (!userId) {
      console.warn("⚠️ No se encontró userId, usuario no autenticado.");
      return;
    }

    const { data, error } = await supabase
      .from("Usuario")
      .select("nivel")
      .eq("id", userId)   // 👈 usamos la columna correcta
      .single();

    console.log("➡️ Consulta nivel Usuario:", data, "Error:", error);

    if (!error && data) {
      const nivelNum = Number(data.nivel);
      console.log("✅ Nivel convertido a número:", nivelNum);
      setNivel(nivelNum);
    } else {
      console.error("❌ No se pudo cargar nivel del usuario.");
    }
  };

  // Cargar foros de la materia
  const cargarForos = async () => {
    const { data, error } = await supabase
      .from("Foro")
      .select("idForo, tipo, created_at")
      .eq("idMateria", idMateria);

    if (error) {
      console.error("Error cargando foros:", error);
    } else {
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

  // Cargar hilos de cada foro
  const cargarHilosForo = async (idForo) => {
    const { data, error } = await supabase
      .from("Hilo")
      .select("idHilo, titulo, contenido, created_at, idUsuarioCreador, idCuentaCreador")
      .eq("idForoFuente", idForo)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando hilos del foro:", error);
      return [];
    }
    return data;
  };

  // Cargar archivos/links de un hilo
  const cargarArchivosHilo = async (idHilo) => {
    const { data, error } = await supabase
      .from("ArchivoHilo")
      .select("nombreArchivo, tipoArchivo")
      .eq("idHilo", idHilo);

    if (error) {
      console.error("Error cargando archivos del hilo:", error);
      return [];
    }
    return data;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Foros de la Materia</h1>

      {/* Debug visual */}
      <p style={{ color: "blue" }}>DEBUG → Nivel actual: {nivel}</p>

      {cargando && <p>Cargando foros...</p>}

      {!cargando && foros.length === 0 && (
        <p>No hay foros registrados para esta materia.</p>
      )}

      {foros.map((foro) => (
        <div
          key={foro.idForo}
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h2>
            {foro.tipo === "OFICIAL" ? "Foro Oficial" : "Foro No Oficial"}
          </h2>
          <p>Creado: {new Date(foro.created_at).toLocaleString()}</p>

          {/* Botón de publicar hilo */}
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

          {/* Hilos del foro */}
          <ForoContenido
            idForo={foro.idForo}
            cargarHilos={cargarHilosForo}
            cargarArchivos={cargarArchivosHilo}
          />
        </div>
      ))}
    </div>
  );
}

// Componente para mostrar hilos de un foro
function ForoContenido({ idForo, cargarHilos, cargarArchivos }) {
  const [hilos, setHilos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchHilos = async () => {
      const data = await cargarHilos(idForo);

      const hilosConArchivos = await Promise.all(
        data.map(async (hilo) => {
          const archivos = await cargarArchivos(hilo.idHilo);
          return { ...hilo, archivos };
        })
      );

      setHilos(hilosConArchivos);
      setCargando(false);
    };
    fetchHilos();
  }, [idForo, cargarHilos, cargarArchivos]);

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
            {hilo.idCuentaCreador && ` (Cuenta ${hilo.idCuentaCreador})`}
            {" - "}
            {new Date(hilo.created_at).toLocaleString()}
          </small>

          {hilo.archivos && hilo.archivos.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <p><strong>Adjuntos:</strong></p>
              <ul>
                {hilo.archivos.map((a, idx) => (
                  <li key={idx}>
                    {a.tipoArchivo === "link" ? (
                      <a href={a.nombreArchivo} target="_blank" rel="noopener noreferrer">
                        {a.nombreArchivo}
                      </a>
                    ) : (
                      <span>{a.nombreArchivo}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
