"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  obtenerPublicacionPorId,
  obtenerTodosLosHashtags,
  editarPublicacion,
  borrarMultimedia,
  subirMultimediaPublicacion,
  actualizarHashtagsPublicacion,
  obtenerLinksPublicacion,
  actualizarLinksPublicacion
} from "../../../../../../../lib/publicacion";

import styles from "./page.module.css";

import SectionCard from "@/components/cards/SectionCard";
import TextareaField from "@/components/form/TextareaField";
import SubmitButton from "@/components/ui/SubmitButton";
import UploadBox from "@/components/form/UploadBox";

export default function EditarPublicacion({ params }) {
  const router = useRouter();
  const { idCuenta, idPublicacion } = use(params);

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const [multimedia, setMultimedia] = useState([]);
  const [links, setLinks] = useState([]);
  const [nuevoLink, setNuevoLink] = useState("");

  const [hashtagsDisponibles, setHashtagsDisponibles] = useState([]);
  const [hashtagsSeleccionados, setHashtagsSeleccionados] = useState([]);

  /* ============================================================
     CARGAR PUBLICACIÓN
     ============================================================ */
  useEffect(() => {
    const cargar = async () => {
      try {
        const pub = await obtenerPublicacionPorId(idPublicacion);
        if (!pub) return;

        setTitulo(pub.titulo ?? "");
        setContenido(pub.contenido ?? "");
        setMultimedia(pub.multimedia?.filter((m) => m.tipoArchivo !== "link") ?? []);
        setHashtagsSeleccionados(pub.hashtags?.map((h) => h.idHashtag) ?? []);

        const dataLinks = await obtenerLinksPublicacion(idPublicacion);
        setLinks(dataLinks || []);
      } catch (err) {
        console.error("Error cargando publicación:", err);
      }
    };
    cargar();
  }, [idPublicacion]);

  /* ============================================================
     CARGAR HASHTAGS
     ============================================================ */
  useEffect(() => {
    const cargarHashtags = async () => {
      try {
        const data = await obtenerTodosLosHashtags();
        setHashtagsDisponibles(data || []);
      } catch (error) {
        console.error("Error cargando hashtags:", error);
      }
    };
    cargarHashtags();
  }, []);

  /* ============================================================
     TOGGLE HASHTAG
     ============================================================ */
  const toggleHashtag = (idHashtag) => {
    setHashtagsSeleccionados((prev) =>
      prev.includes(idHashtag)
        ? prev.filter((id) => id !== idHashtag)
        : [...prev, idHashtag]
    );
  };

  /* ============================================================
     EXTRAER ID DE YOUTUBE
     ============================================================ */
  const obtenerIdYoutube = (url) => {
    try {
      const regExp =
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regExp);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  /* ============================================================
     GUARDAR CAMBIOS
     ============================================================ */
  const guardarCambios = async () => {
    if (cargando) return;
    setCargando(true);
    setProgreso(10);

    try {
      await editarPublicacion({ idPublicacion, titulo, contenido });

      // Subir nuevos archivos
      for (const file of multimedia) {
        if (!file.idMultimedia) {
          await subirMultimediaPublicacion(file, idPublicacion, "nombreCuenta");
        }
      }

      // Actualizar links
      const urls = links.map((l) => l.url);
      if (nuevoLink.trim()) urls.push(nuevoLink.trim());
      await actualizarLinksPublicacion(idPublicacion, urls, "nombreCuenta");

      // Actualizar hashtags
      await actualizarHashtagsPublicacion(idPublicacion, hashtagsSeleccionados);

      setProgreso(100);
      alert("Cambios guardados correctamente");
      router.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}/principal-cuenta`);
    } catch (err) {
      console.error("Error guardando cambios:", err);
      alert("Error guardando cambios");
    } finally {
      setTimeout(() => {
        setCargando(false);
        setProgreso(0);
      }, 500);
    }
  };
  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Editar publicación</h1>

      {/* Barra de carga */}
      {cargando && (
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
      )}

      {/* Título */}
      <SectionCard titulo="Título de la publicación">
        <TextareaField
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          rows={1}
        />
      </SectionCard>

      {/* Contenido */}
      <SectionCard titulo="Contenido de la publicación">
        <TextareaField
          label="Escribe el contenido de la publicación"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={6}
        />
      </SectionCard>

      {/* Multimedia */}
      <SectionCard titulo="Agregar imágenes o videos">
        <UploadBox
          label="Seleccionar archivos multimedia"
          onFileSelect={(file) => setMultimedia((prev) => [...prev, file])}
        />

        {multimedia.length > 0 && (
          <div className={styles.previewGrid}>
            {multimedia.map((m, index) => (
              <div key={m.idMultimedia ?? index} className={styles.previewItem}>
                <button
                  className={styles.deleteButton}
                  onClick={() =>
                    setMultimedia((prev) =>
                      prev.filter((item) => item.idMultimedia !== m.idMultimedia)
                    )
                  }
                >
                  ✕
                </button>
                {m.tipoArchivo === "imagen" ? (
                  <img
                    src={m.url ?? (m instanceof File ? URL.createObjectURL(m) : "")}
                    alt="multimedia"
                    className={styles.previewMedia}
                  />
                ) : (
                  <video
                    src={m.url ?? (m instanceof File ? URL.createObjectURL(m) : "")}
                    className={styles.previewMedia}
                    muted
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Links / YouTube */}
      <SectionCard titulo="Agregar links o videos de YouTube">
        <TextareaField
          label="Enlace"
          value={nuevoLink}
          onChange={(e) => setNuevoLink(e.target.value)}
          rows={1}
        />

        {obtenerIdYoutube(nuevoLink) && (
          <div className={styles.youtubePreview}>
            <img
              src={`https://img.youtube.com/vi/${obtenerIdYoutube(nuevoLink)}/hqdefault.jpg`}
              alt="YouTube preview"
              className={styles.youtubeThumbnail}
            />
          </div>
        )}

        {links.length > 0 && (
          <div className={styles.previewGrid}>
            {links.map((l) => (
              <div key={l.idMultimedia} className={styles.previewItem}>
                <button
                  className={styles.deleteButton}
                  onClick={() =>
                    setLinks((prev) =>
                      prev.filter((item) => item.idMultimedia !== l.idMultimedia)
                    )
                  }
                >
                  ✕
                </button>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Hashtags */}
      <SectionCard titulo="Seleccionar hashtags">
        <div className={styles.hashtagGrid}>
          {hashtagsDisponibles.map((h) => {
            const activo = hashtagsSeleccionados.includes(h.idHashtag);
            return (
              <button
                key={h.idHashtag}
                onClick={() => toggleHashtag(h.idHashtag)}
                className={`${styles.hashtagItem} ${
                  activo ? styles.hashtagActivo : ""
                }`}
              >
                #{h.nombre}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Botón guardar */}
      <SubmitButton
        texto={cargando ? "Guardando..." : "Guardar cambios"}
        onClick={guardarCambios}
        disabled={cargando}
      />
    </div>
  );
}
