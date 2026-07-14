"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// Alias modernos
import { getSupabaseBrowserClient } from "@lib/supabase";
import { crearHiloUsuario } from "@lib/hilo";

// Componente reutilizable de subida de archivos
import FileUploader from "@ui/FileUploader";

import styles from "./page.module.css";

export default function CrearHiloPage() {
  // Inicializar Supabase y utilidades de Next.js
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const searchParams = useSearchParams();
  const redirigir = useRouter();

  // Parámetros recibidos desde la URL
  const idMateria = params.idMateria;
  const tipoForo = searchParams.get("tipo") || "NO_OFICIAL";
  const idForoFuente = searchParams.get("idForo");

  // Estados del formulario
  const [nombreMateria, setNombreMateria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [linksExternos, setLinksExternos] = useState([]);
  const [nuevoLink, setNuevoLink] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

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
      }
    };

    cargarMateria();
  }, [idMateria, supabase]);

  // Crear hilo
  const manejarCrearHilo = async () => {
    if (loading) return;
    setLoading(true);
    setMensaje("");

    if (!titulo.trim() || !contenido.trim()) {
      setMensaje("Debes completar título y contenido.");
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const idUsuarioCreador = userData?.user?.id;

    if (!idUsuarioCreador) {
      setMensaje("No se encontró usuario autenticado.");
      setLoading(false);
      return;
    }

    const respuesta = await crearHiloUsuario({
      titulo,
      contenido,
      idUsuarioCreador,
      idForoFuente,
      nombreMateria,
      tipoForo,
      archivos,
      linksExternos,
    });

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje || "Error al crear el hilo.");
      setLoading(false);
      return;
    }

    setMensaje("Hilo creado exitosamente.");

    setTimeout(() => {
      redirigir.push(`/dashboard/foro/mostrar-foro/${idMateria}`);
    }, 1500);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crear Hilo en Foro {tipoForo}</h1>
        <p className={styles.materiaTexto}>Materia: {nombreMateria}</p>

        {/* Campo: Título */}
        <div className={styles.field}>
          <label className={styles.label}>Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título del hilo"
            className={styles.inputText}
          />
        </div>

        {/* Campo: Contenido */}
        <div className={styles.field}>
          <label className={styles.label}>Contenido</label>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe el contenido del hilo..."
            className={styles.textarea}
          />
        </div>

        {/* Campo: Archivos */}
        <div className={styles.field}>
          <label className={styles.label}>Archivos</label>
          <FileUploader onFilesChange={setArchivos} />
        </div>

        {/* Campo: Links externos */}
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

        {/* Botón principal */}
        <button
          className={styles.btnPrimario}
          onClick={manejarCrearHilo}
          disabled={loading}
        >
          {loading ? "Publicando..." : "Publicar Hilo"}
        </button>

        {/* Mensaje */}
        {mensaje && (
          <p
            className={`${styles.mensaje} ${
              mensaje.startsWith("Hilo creado") ? styles.ok : styles.error
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
