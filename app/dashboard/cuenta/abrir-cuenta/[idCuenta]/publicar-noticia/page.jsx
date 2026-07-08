'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import {
  crearPublicacion,
  obtenerTodosLosHashtags,
  asignarHashtagsPublicacion
} from "../../../../../../lib/publicacion";

import { obtenerCuentaCompleta } from "../../../../../../lib/cuenta";

import styles from "./page.module.css";

// Componentes reutilizables
import SectionCard from "@/components/cards/SectionCard";
import TextareaField from "@/components/form/TextareaField";
import SubmitButton from "@/components/ui/SubmitButton";
import UploadBox from "@/components/form/UploadBox";

export default function PublicarNoticia() {
  const router = useRouter();
  const params = useParams();
  const idCuenta = params.idCuenta;

  const [titulo, setTitulo] = useState("");        // ← NUEVO
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const [hashtags, setHashtags] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  const [archivos, setArchivos] = useState([]);
  const [youtubeURL, setYoutubeURL] = useState("");

  const [cuenta, setCuenta] = useState(null);

  /* ============================================================
     CARGAR INFO DE LA CUENTA
     ============================================================ */
  useEffect(() => {
    const cargarCuenta = async () => {
      const respuesta = await obtenerCuentaCompleta(idCuenta);

      if (!respuesta.ok) {
        console.error("Error cargando cuenta:", respuesta.mensaje);
        return;
      }

      setCuenta(respuesta.cuenta);
    };

    cargarCuenta();
  }, [idCuenta]);

  /* ============================================================
     CARGAR HASHTAGS
     ============================================================ */
  useEffect(() => {
    const cargarHashtags = async () => {
      try {
        const data = await obtenerTodosLosHashtags();
        setHashtags(data);
      } catch (error) {
        console.error("Error cargando hashtags:", error);
      }
    };

    cargarHashtags();
  }, []);

  /* ============================================================
     SELECCIONAR / DESELECCIONAR HASHTAG
     ============================================================ */
  const toggleHashtag = (idHashtag) => {
    setSeleccionados((prev) =>
      prev.includes(idHashtag)
        ? prev.filter((id) => id !== idHashtag)
        : [...prev, idHashtag]
    );
  };

  /* ============================================================
     MANEJAR ARCHIVOS
     ============================================================ */
  const manejarArchivos = (file) => {
    if (!file || !file.type) return;
    setArchivos((prev) => [...prev, file]);
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
     MANEJAR PUBLICACIÓN
     ============================================================ */
  async function manejarPublicacion() {
    try {
      setCargando(true);
      setProgreso(10);

      // Validación del título
      if (!titulo.trim()) {
        alert("Debes escribir un título para la noticia.");
        setCargando(false);
        return;
      }

      if (!cuenta) {
        alert("Error: No se pudo obtener la información de la cuenta.");
        setCargando(false);
        return;
      }

      // Simulación de progreso visual
      setTimeout(() => setProgreso(40), 300);
      setTimeout(() => setProgreso(70), 700);

      const idPublicacion = await crearPublicacion({
        titulo,                      // ← NUEVO
        contenido,
        idCuenta,
        archivos,
        nombreCuenta: cuenta.nombre,
        youtubeURL: youtubeURL.trim() || null
      });

      setProgreso(100);

      if (seleccionados.length > 0) {
        await asignarHashtagsPublicacion(idPublicacion, seleccionados);
      }

      router.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}/principal-cuenta`);

    } catch (error) {
      console.error(error);
      alert("Error creando publicación");
    } finally {
      setTimeout(() => {
        setCargando(false);
        setProgreso(0);
      }, 500);
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Publicar noticia</h1>

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
      <SectionCard titulo="Título de la noticia">
        <TextareaField
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          rows={1}
        />
      </SectionCard>

      {/* Contenido */}
      <SectionCard titulo="Contenido de la noticia">
        <TextareaField
          label="Escribe el contenido de la noticia"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={6}
        />
      </SectionCard>

      {/* Multimedia */}
      <SectionCard titulo="Agregar imágenes o videos">
        <UploadBox
          label="Seleccionar archivos multimedia"
          onFileSelect={manejarArchivos}
        />

        {archivos.length > 0 && (
          <div className={styles.previewGrid}>
            {archivos.map((file, index) => {
              if (!file || !file.type) return null;

              return (
                <div key={index} className={styles.previewItem}>
                  {file.type.startsWith("image") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className={styles.previewMedia}
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      className={styles.previewMedia}
                      muted
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* YouTube */}
      <SectionCard titulo="Agregar video de YouTube">
        <TextareaField
          label="Enlace de YouTube"
          value={youtubeURL}
          onChange={(e) => setYoutubeURL(e.target.value)}
          rows={1}
        />

        {obtenerIdYoutube(youtubeURL) && (
          <div className={styles.youtubePreview}>
            <img
              src={`https://img.youtube.com/vi/${obtenerIdYoutube(youtubeURL)}/hqdefault.jpg`}
              alt="YouTube preview"
              className={styles.youtubeThumbnail}
            />
          </div>
        )}
      </SectionCard>

      {/* Hashtags */}
      <SectionCard titulo="Seleccionar hashtags">
        <div className={styles.hashtagGrid}>
          {hashtags.map((h) => {
            const activo = seleccionados.includes(h.idHashtag);

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

      {/* Botón publicar */}
      <SubmitButton
        texto={cargando ? "Publicando..." : "Publicar noticia"}
        onClick={manejarPublicacion}
        disabled={cargando}
      />
    </div>
  );
}
