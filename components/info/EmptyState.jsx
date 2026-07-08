"use client";

import styles from "./EmptyState.module.css";

export default function EmptyState({
  titulo = "No hay información disponible",
  descripcion = "Intenta cambiar los filtros o vuelve más tarde.",
  icono = "📄",
}) {
  return (
    <div className={styles.contenedor}>
      <div className={styles.icono}>{icono}</div>
      <h3 className={styles.titulo}>{titulo}</h3>
      <p className={styles.descripcion}>{descripcion}</p>
    </div>
  );
}
