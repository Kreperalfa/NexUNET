"use client";

import { getSupabaseBrowserClient } from "@lib/supabase";
import styles from "./ArchivoAdjunto.module.css";

export default function ArchivoAdjunto({ archivo, hilo }) {
  const supabase = getSupabaseBrowserClient();

  // ⭐ Detectar si es un link externo
  const esLink = archivo.nombreArchivo.startsWith("http");

  if (esLink) {
    return (
      <div className={styles.archivoItem}>
        <span className={`${styles.icono} ${styles.linkIcon}`}>🔗</span>

        <div className={styles.archivoInfo}>
          <span className={styles.archivoNombre}>{archivo.nombreArchivo}</span>

          <a
            href={archivo.nombreArchivo}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.archivoLink}
          >
            Abrir enlace
          </a>
        </div>
      </div>
    );
  }

  // ⭐ Carpetas correctas
  const materiaFolder = hilo.nombreMateria.replace(/\s+/g, "_").toLowerCase();
  const foroFolder = hilo.tipoForo.replace(/\s+/g, "_").toLowerCase();

  // ⭐ Carpeta correcta: idSubHilo si existe, si no idHilo
  const idCarpeta = archivo.idSubHilo || archivo.idHilo;

  // ⭐ Ruta interna del bucket
  const ruta = `hilo/${materiaFolder}/${foroFolder}/${idCarpeta}/${archivo.nombreArchivo}`;

  // ⭐ Obtener URL pública
  const { data } = supabase.storage.from("hilo").getPublicUrl(ruta);
  const url = data.publicUrl;

  // ⭐ Detectar tipo de archivo
  const esImagen =
    archivo.tipoArchivo?.includes("image") ||
    archivo.nombreArchivo.match(/\.(jpg|jpeg|png|gif)$/i);

  const esPDF = archivo.nombreArchivo.match(/\.pdf$/i);

  // ⭐ Descargar archivo
  const descargarArchivo = async () => {
    console.log("Intentando descargar:", ruta);

    const { data, error } = await supabase.storage.from("hilo").download(ruta);

    if (error) {
      console.error("❌ Error al descargar archivo:", error);
      console.error("❌ Ruta usada:", ruta);
      return;
    }

    const blobUrl = URL.createObjectURL(data);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = archivo.nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className={styles.archivoItem}>
      <span
        className={`${styles.icono} ${
          esImagen ? styles.fileIcon : styles.linkIcon
        }`}
      >
        {esImagen ? "🖼️" : esPDF ? "📄" : "📎"}
      </span>

      <div className={styles.archivoInfo}>
        <span className={styles.archivoNombre}>{archivo.nombreArchivo}</span>

        {esImagen && (
          <img src={url} alt="archivo adjunto" className={styles.archivoPreview} />
        )}

        <button className={styles.archivoLink} onClick={descargarArchivo}>
          Descargar archivo
        </button>
      </div>
    </div>
  );
}











