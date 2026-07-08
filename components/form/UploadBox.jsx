'use client';

import { useState } from "react";
import styles from "./UploadBox.module.css";

export default function UploadBox({ label, onFileSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) return;

    onFileSelect(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.contenedor}>
      <label className={styles.label}>{label}</label>

      <div className={styles.uploadArea}>
        {preview ? (
          <img src={preview} alt="Vista previa" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <span>Selecciona una imagen</span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
          className={styles.input}
        />
      </div>
    </div>
  );
}

