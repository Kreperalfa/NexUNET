//app\dashboard\admin\lobby\page.jsx

"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";
import { subirImagenLobby } from "../../../../lib/storage";
import styles from "./lobby.module.css";

export default function AdminLobbyPage() {
  const supabase = getSupabaseBrowserClient();

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [slides, setSlides] = useState([]);

  /* ⭐ Cargar slides actuales */
  useEffect(() => {
    const cargarSlides = async () => {
      const { data } = await supabase
        .from("ContenidoLobby")
        .select("*")
        .order("created_at", { ascending: false });

      setSlides(data || []);
    };

    cargarSlides();
  }, []);

  /* ⭐ Manejar múltiples imágenes */
  const manejarArchivos = (e) => {
    const archivos = Array.from(e.target.files);
    setFiles(archivos);

    const nuevasPreviews = archivos.map((file) => URL.createObjectURL(file));
    setPreviews(nuevasPreviews);
  };

  /* ⭐ Eliminar slide */
  const eliminarSlide = async (idContenido) => {
    setMensaje("Eliminando slide...");

    const { error } = await supabase
      .from("ContenidoLobby")
      .delete()
      .eq("idContenido", idContenido);

    if (error) {
      setMensaje("Error eliminando slide: " + error.message);
      return;
    }

    setSlides((prev) => prev.filter((s) => s.idContenido !== idContenido));
    setMensaje("Slide eliminado ✔");
  };

  /* ⭐ Guardar slides */
  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setMensaje("Debes seleccionar al menos una imagen.");
      return;
    }

    setMensaje("Subiendo imágenes...");

    const urls = [];

    for (const file of files) {
      const subida = await subirImagenLobby(file);

      if (!subida.ok) {
        setMensaje("Error subiendo imagen: " + subida.error);
        return;
      }

      urls.push(subida.url);
    }

    setMensaje("Guardando slides...");

    for (const url of urls) {
      await supabase.from("ContenidoLobby").insert([
        {
          titulo,
          contenido,
          imagen: url,
        },
      ]);
    }

    setMensaje("Slides creados correctamente ✔");

    setTitulo("");
    setContenido("");
    setFiles([]);
    setPreviews([]);

    // Recargar slides
    const { data } = await supabase
      .from("ContenidoLobby")
      .select("*")
      .order("created_at", { ascending: false });

    setSlides(data || []);
  };

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Gestión del Lobby Institucional</h1>
      <p className={styles.subtitulo}>
        Crea slides para el carrusel del Lobby y administra los existentes.
      </p>

      {/* ⭐ FORMULARIO */}
      <form className={styles.formulario} onSubmit={manejarSubmit}>
        <label className={styles.label}>Título del slide</label>
        <input
          type="text"
          className={styles.input}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label className={styles.label}>Contenido del slide</label>
        <textarea
          className={styles.textarea}
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          required
        />

        <label className={styles.label}>Imágenes del carrusel</label>

        {/* ⭐ Dropzone moderna */}
        <div className={styles.dropzone}>
          <input
            type="file"
            accept="image/*"
            multiple
            className={styles.inputFile}
            onChange={manejarArchivos}
          />
          <p>Haz clic o arrastra tus imágenes aquí</p>
        </div>

        {/* ⭐ Vista previa responsiva */}
        {previews.length > 0 && (
          <div className={styles.previewGrid}>
            {previews.map((src, index) => (
              <div key={index} className={styles.previewItem}>
                <img src={src} className={styles.previewImg} />
              </div>
            ))}
          </div>
        )}

        <button type="submit" className={styles.boton}>
          Crear Slides
        </button>
      </form>

      {mensaje && <p className={styles.mensaje}>{mensaje}</p>}

      {/* ⭐ LISTA DE SLIDES ACTUALES */}
      <h2 className={styles.subtitulo2}>Slides actuales</h2>

      <div className={styles.slidesGrid}>
        {slides.map((slide) => (
          <div key={slide.idContenido} className={styles.slideCard}>
            <img src={slide.imagen} className={styles.slideImg} />

            <div className={styles.slideInfo}>
              <h3>{slide.titulo}</h3>
              <p>{slide.contenido}</p>

              <button
                className={styles.botonEliminar}
                onClick={() => eliminarSlide(slide.idContenido)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
