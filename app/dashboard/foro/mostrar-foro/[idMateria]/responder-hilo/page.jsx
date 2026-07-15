"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@lib/supabase";
import { crearSubHilo } from "@lib/subhilo";

import FileUploader from "@ui/FileUploader";
import styles from "./page.module.css";

export default function Page() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const searchParams = useSearchParams();
  const redirigir = useRouter();

  const idMateria = params.idMateria;
  const idHiloOrigen = searchParams.get("idHiloOrigen");
  const idRespuesta = searchParams.get("idRespuesta");

  const [nombreMateria, setNombreMateria] = useState("");
  const [contenido, setContenido] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [linksExternos, setLinksExternos] = useState([]);
  const [nuevoLink, setNuevoLink] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false); // ⭐ evita duplicados

  useEffect(() => {
    const cargarMateria = async () => {
      const { data, error } = await supabase
        .from("Materia")
        .select("nombreMateria")
        .eq("idMateria", idMateria)
        .single();

      if (!error && data) {
        setNombreMateria(data.nombreMateria);
      }
    };
    cargarMateria();
  }, [idMateria, supabase]);

  const manejarResponder = async () => {
    if (loading) return; // ⭐ evita doble clic
    setLoading(true);
    setMensaje("");

    if (!contenido.trim()) {
      setMensaje("Debes escribir contenido para la respuesta.");
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const idUsuarioCreador = userData?.user?.id;

    if (!idUsuarioCreador) {
      setMensaje("❌ No se encontró usuario autenticado.");
      setLoading(false);
      return;
    }

    const respuesta = await crearSubHilo({
      contenido,
      idUsuarioCreador,
      idHilo: idHiloOrigen,
      idRespuestaPadre:
        idRespuesta && idRespuesta !== idHiloOrigen ? idRespuesta : null,
      nombreMateria,
      tipoForo: "NO_OFICIAL",
      archivos,
      linksExternos,
    });

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje || "Error al crear la respuesta.");
      setLoading(false);
      return;
    }

    setMensaje("✅ Respuesta publicada exitosamente.");

    setTimeout(() => {
      redirigir.push(
        `/dashboard/foro/mostrar-foro/${idMateria}/hilo/${idHiloOrigen}`
      );
    }, 1500);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <h1 className={styles.title}>Responder al Hilo</h1>
        <p className={styles.materiaTexto}>
          Materia: <strong>{nombreMateria || idMateria}</strong>
        </p>

        <div className={styles.field}>
          <label className={styles.label}>Contenido</label>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className={styles.textarea}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Archivos</label>
          <FileUploader onFilesChange={setArchivos} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Links externos</label>

          <div className={styles.linkInputRow}>
            <input
              type="text"
              value={nuevoLink}
              onChange={(e) => setNuevoLink(e.target.value)}
              placeholder="https://ejemplo.com"
              className={styles.inputText}
            />

            <button
              className={styles.btnSecundario}
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
            <ul className={styles.linksList}>
              {linksExternos.map((link, idx) => (
                <li key={idx} className={styles.linkItem}>
                  {link}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ⭐ Botón protegido contra doble clic */}
        <button
          className={styles.btnPrimario}
          onClick={manejarResponder}
          disabled={loading}
        >
          {loading ? "Publicando..." : "Publicar Respuesta"}
        </button>

        {mensaje && (
          <p
            className={`${styles.mensaje} ${
              mensaje.startsWith("✅") ? styles.ok : styles.error
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}

