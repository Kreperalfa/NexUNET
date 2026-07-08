"use client";

import styles from "./MateriaCard.module.css";

export default function MateriaCard({
  titulo,
  descripcion,
  onClick,
  colorBarra = "var(--color-acento)",
}) {
  return (
    <div
      className={styles.card}
      onClick={onClick}
      style={{ "--color-barra": colorBarra }}
    >
      <div className={styles.contenido}>
        <h3 className={styles.titulo}>{titulo}</h3>

        {descripcion && (
          <p className={styles.descripcion}>{descripcion}</p>
        )}
      </div>
    </div>
  );
}
