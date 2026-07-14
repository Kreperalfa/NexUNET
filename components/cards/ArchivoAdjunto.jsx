"use client";

import { getSupabaseBrowserClient } from "@lib/supabase";
import styles from "./ArchivoAdjunto.module.css";

export default function ArchivoAdjunto({ archivo, hilo }) {
  const supabase = getSupabaseBrowserClient();

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

  const materiaFolder = hilo.nombreMateria.replace(/\s+/g, "_").toLowerCase();
  const foroFolder = hilo.tipoForo.replace(/\s+/g, "_").toLowerCase();

  // ⭐ RUTA REAL SEGÚN TU BUCKET
  const ruta = `/hilo/${materiaFolder}/${foroFolder}/${hilo.idHilo}/${archivo.nombreArchivo}`;

  // ⭐ LOGS PARA VER QUÉ ESTÁ PASANDO
  console.log("========== DEBUG ARCHIVO ==========");
  console.log("Materia folder:", materiaFolder);
  console.log("Foro folder:", foroFolder);
  console.log("idHilo:", hilo.idHilo);
  console.log("Archivo:", archivo.nombreArchivo);
  console.log("Ruta generada:", ruta);
  console.log("====================================");

  const { data } = supabase.storage.from("hilo").getPublicUrl(ruta);
  const url = data.publicUrl;

  console.log("URL pública generada:", url);

  const esImagen =
    archivo.tipoArchivo?.includes("image") ||
    archivo.nombreArchivo.match(/\.(jpg|jpeg|png|gif)$/i);

  const esPDF = archivo.nombreArchivo.match(/\.pdf$/i);

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









