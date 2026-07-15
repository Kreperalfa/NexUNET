"use client";

import styles from "./HiloCard.module.css";

export default function HiloCard({ hilo, idMateria, idForo, tipoForo, redirigir }) {
  return (
    <div
      className={styles.hiloCard}
      onClick={() =>
        redirigir.push(
          `/dashboard/foro/mostrar-foro/${idMateria}/hilo/${hilo.idHilo}?idForo=${idForo}&tipoForo=${tipoForo}`
        )
      }
    >
      <div className={styles.hiloHeader}>
        <h3 className={styles.hiloTitle}>{hilo.titulo}</h3>
        <span className={styles.hiloAutor}>Autor: {hilo.idUsuarioCreador}</span>
      </div>

      <p className={styles.hiloExcerpt}>
        {hilo.contenido.length > 160
          ? hilo.contenido.slice(0, 160) + "..."
          : hilo.contenido}
      </p>

      <div className={styles.hiloInfo}>
        <span>Comentarios: {hilo.subhilos?.length || 0}</span>
        <span>Adjuntos: {hilo.archivos?.length || 0}</span>
      </div>

      <small className={styles.hiloFecha}>
        {new Date(hilo.created_at).toLocaleString()}
      </small>

      <button
        className={styles.responderBtn}
        onClick={(e) => {
          e.stopPropagation();
          redirigir.push(
            `/dashboard/foro/mostrar-foro/${idMateria}/responder-hilo?idHiloOrigen=${hilo.idHilo}&idRespuesta=${hilo.idHilo}`
          );
        }}
      >
        Responder al hilo
      </button>
    </div>
  );
}




