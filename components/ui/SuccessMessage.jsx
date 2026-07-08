"use client";

import styles from "./SuccessMessage.module.css";

export default function SuccessMessage({ mensaje }) {
  if (!mensaje) return null;

  return (
    <div className={styles.successBox}>
      <span className={styles.icono}>✔️</span>
      <p className={styles.texto}>{mensaje}</p>
    </div>
  );
}
