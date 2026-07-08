"use client";

import styles from "./InfoBanner.module.css";

export default function InfoBanner({
  titulo,
  children,
  colorBarra = "var(--color-primario)",
}) {
  return (
    <div className={styles.banner} style={{ "--color-barra": colorBarra }}>
      {titulo && <h2 className={styles.titulo}>{titulo}</h2>}
      <div className={styles.contenido}>{children}</div>
    </div>
  );
}
