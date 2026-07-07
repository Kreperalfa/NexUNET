"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";
import { crearSubHilo } from "../../../../../../lib/subhilo";

export default function ResponderHiloPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const searchParams = useSearchParams();
  const redirigir = useRouter();

  const idMateria = params.idMateria;
  const idHiloOrigen = searchParams.get("idHiloOrigen"); // hilo raíz
  const idRespuesta = searchParams.get("idRespuesta");   // hilo o subhilo al que se responde

  const [nombreMateria, setNombreMateria] = useState(""); // 👈 nuevo estado
  const [contenido, setContenido] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [linksExternos, setLinksExternos] = useState([]);
  const [nuevoLink, setNuevoLink] = useState("");
  const [mensaje, setMensaje] = useState("");

  // 👇 cargar nombre de la materia desde la BD
  useEffect(() => {
    const cargarMateria = async () => {
      const { data, error } = await supabase
        .from("Materia")
        .select("nombreMateria")
        .eq("idMateria", idMateria)
        .single();

      if (!error && data) {
        setNombreMateria(data.nombreMateria);
      } else {
        console.error("❌ Error cargando nombre de materia:", error);
      }
    };
    cargarMateria();
  }, [idMateria, supabase]);

  const manejarResponder = async () => {
    setMensaje("");

    if (!contenido.trim()) {
      setMensaje("Debes escribir contenido para la respuesta.");
      return;
    }

    // Obtener usuario autenticado
    const { data: userData } = await supabase.auth.getUser();
    const idUsuarioCreador = userData?.user?.id;

    if (!idUsuarioCreador) {
      setMensaje("❌ No se encontró usuario autenticado.");
      return;
    }

    console.log("➡️ idMateria:", idMateria);
    console.log("➡️ nombreMateria:", nombreMateria);
    console.log("➡️ idHiloOrigen:", idHiloOrigen);
    console.log("➡️ idRespuesta:", idRespuesta);
    console.log("➡️ Usuario creador:", idUsuarioCreador);

    const respuesta = await crearSubHilo({
      contenido,
      idUsuarioCreador,
      idHilo: idHiloOrigen,       
      // 👇 si idRespuesta es igual al hilo raíz, lo dejamos en null
      idRespuestaPadre: idRespuesta && idRespuesta !== idHiloOrigen ? idRespuesta : null,
      nombreMateria,   // 👈 ahora sí el nombre real
      tipoForo: "NO_OFICIAL", // fijo
      archivos,
      linksExternos,
    });

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje || "Error al crear la respuesta.");
      return;
    }

    setMensaje("✅ Respuesta publicada exitosamente.");
    setTimeout(() => {
      redirigir.push(`/dashboard/foro/mostrar-foro/${idMateria}`);
    }, 1500);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Responder al Hilo</h1>
      <p>Materia: {nombreMateria || idMateria}</p>

      <div style={{ marginTop: "1rem" }}>
        <label>Contenido</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe tu respuesta..."
          style={{ width: "100%", padding: "8px", marginTop: "5px", minHeight: "120px" }}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Archivos</label>
        <input
          type="file"
          multiple
          onChange={(e) => setArchivos(Array.from(e.target.files))}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Links externos</label>
        <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
          <input
            type="text"
            value={nuevoLink}
            onChange={(e) => setNuevoLink(e.target.value)}
            placeholder="https://ejemplo.com"
            style={{ flex: 1, padding: "8px" }}
          />
          <button
            onClick={() => {
              if (nuevoLink.trim()) {
                setLinksExternos([...linksExternos, nuevoLink.trim()]);
                setNuevoLink("");
              }
            }}
          >
            Agregar
          </button>
        </div>
        {linksExternos.length > 0 && (
          <ul style={{ marginTop: "10px" }}>
            {linksExternos.map((link, idx) => (
              <li key={idx}>{link}</li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={manejarResponder}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Publicar Respuesta
      </button>

      {mensaje && (
        <p style={{ marginTop: "20px", color: mensaje.startsWith("✅") ? "green" : "red" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
