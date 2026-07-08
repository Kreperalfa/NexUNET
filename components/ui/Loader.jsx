"use client";

import styles from "./Loader.module.css";

export default function Loader({ texto = "Cargando..." }) {
  return (
    <div className={styles.contenedor}>
      <div className={styles.spinner}></div>
      <p className={styles.texto}>{texto}</p>
    </div>
  );
}
