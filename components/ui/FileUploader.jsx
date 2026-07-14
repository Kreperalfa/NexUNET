"use client";

import { useState } from "react";
import styles from "./FileUploader.module.css";
import { getSupabaseBrowserClient } from "@lib/supabase";

export default function FileUploader({ onFilesChange }) {
  const supabase = getSupabaseBrowserClient();

  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({}); // { filename: porcentaje }

  const handleSelect = (e) => {
    const nuevos = Array.from(e.target.files);
    const actualizados = [...files, ...nuevos];
    setFiles(actualizados);
    onFilesChange(actualizados);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const nuevos = Array.from(e.dataTransfer.files);
    const actualizados = [...files, ...nuevos];
    setFiles(actualizados);
    onFilesChange(actualizados);
  };

  const subirArchivo = async (file) => {
    const nombre = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("archivosHilo") // ⭐ tu bucket real
      .upload(nombre, file, {
        upsert: true,
        onUploadProgress: (evt) => {
          const porcentaje = Math.round((evt.loaded / evt.total) * 100);
          setProgress((prev) => ({ ...prev, [file.name]: porcentaje }));
        },
      });

    if (error) {
      console.error("Error subiendo archivo:", error);
    }
  };

  const subirTodos = async () => {
    for (const file of files) {
      await subirArchivo(file);
    }
  };

  const handleRemove = (index) => {
    const actualizados = files.filter((_, i) => i !== index);
    setFiles(actualizados);
    onFilesChange(actualizados);
  };

  return (
    <div className={styles.uploader}>
      <label
        className={styles.dropArea}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className={styles.inputFile}
          onChange={handleSelect}
        />
        <span className={styles.dropText}>
          Arrastra archivos aquí o haz clic para subir
        </span>
      </label>

      {files.length > 0 && (
        <>
          <div className={styles.fileList}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <span className={styles.fileName}>{file.name}</span>

                {progress[file.name] ? (
                  <div className={styles.progressContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${progress[file.name]}%` }}
                    ></div>
                    <span className={styles.progressText}>
                      {progress[file.name]}%
                    </span>
                  </div>
                ) : (
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button className={styles.uploadBtn} onClick={subirTodos}>
            Subir archivos
          </button>
        </>
      )}
    </div>
  );
}
