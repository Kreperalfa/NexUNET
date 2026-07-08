"use client";

import styles from "./ErrorMessage.module.css";

export default function ErrorMessage({ mensaje }) {
  if (!mensaje) return null;

  return (
    <div className={styles.errorBox}>
      <span className={styles.icono}>⚠️</span>
      <p className={styles.texto}>{mensaje}</p>
    </div>
  );
}
