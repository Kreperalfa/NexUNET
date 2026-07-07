"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";
import { crearHiloUsuario } from "../../../../../../lib/hilo";

export default function CrearHiloPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const searchParams = useSearchParams();
  const redirigir = useRouter();

  const idMateria = params.idMateria;
  const tipoForo = searchParams.get("tipo") || "NO_OFICIAL";
  const idForoFuente = searchParams.get("idForo"); // 👈 UUID REAL DEL FORO

  const [nombreMateria, setNombreMateria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [linksExternos, setLinksExternos] = useState([]);
  const [nuevoLink, setNuevoLink] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar nombre de la materia
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

  const manejarCrearHilo = async () => {
    setMensaje("");

    if (!titulo.trim() || !contenido.trim()) {
      setMensaje("Debes completar título y contenido.");
      return;
    }

    // Obtener usuario autenticado
    const { data: userData } = await supabase.auth.getUser();
    const idUsuarioCreador = userData?.user?.id;

    if (!idUsuarioCreador) {
      setMensaje("❌ No se encontró usuario autenticado.");
      return;
    }

    // 👇 LOGS IMPORTANTES PARA DEPURAR
    console.log("➡️ idMateria recibido:", idMateria);
    console.log("➡️ tipoForo recibido:", tipoForo);
    console.log("➡️ idForoFuente recibido (UUID):", idForoFuente);
    console.log("➡️ Usuario creador:", idUsuarioCreador);

    const respuesta = await crearHiloUsuario({
      titulo,
      contenido,
      idUsuarioCreador,
      idForoFuente, // 👈 UUID válido
      nombreMateria,
      tipoForo,
      archivos,
      linksExternos,
    });

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje || "Error al crear el hilo.");
      return;
    }

    setMensaje("✅ Hilo creado exitosamente.");
    setTimeout(() => {
      redirigir.push(`/dashboard/foro/mostrar-foro/${idMateria}`);
    }, 1500);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Crear Hilo en Foro {tipoForo}</h1>
      <p>Materia: {nombreMateria}</p>

      <div style={{ marginTop: "1rem" }}>
        <label>Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título del hilo"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Contenido</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe el contenido del hilo..."
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
        onClick={manejarCrearHilo}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Publicar Hilo
      </button>

      {mensaje && (
        <p style={{ marginTop: "20px", color: mensaje.startsWith("✅") ? "green" : "red" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
