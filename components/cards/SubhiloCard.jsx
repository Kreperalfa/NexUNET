"use client";

import { useState } from "react";
import styles from "./SubhiloCard.module.css";
import ArchivoAdjunto from "./ArchivoAdjunto";

export default function SubhiloCard({
  subhilo,
  nivel,
  hilo,
  idMateria,
  redirigir,
  hijos
}) {
  const [mostrarHijos, setMostrarHijos] = useState(false);

  const tieneHijos = hijos && hijos.length > 0;

  return (
    <div
      className={styles.subCard}
      style={{
        marginLeft: `clamp(0px, ${nivel * 32}px, 200px)`
      }}
    >
      {/* Información del usuario que respondió */}
      <div className={styles.subMeta}>
        <span>
          Respuesta del usuario: <strong>{subhilo.idUsuarioCreador}</strong>
        </span>
        <span>{new Date(subhilo.created_at).toLocaleString()}</span>
      </div>

      {/* Contenido del subhilo */}
      <p className={styles.subContenido}>{subhilo.contenido}</p>

      {/* ⭐ Archivos adjuntos del subhilo */}
      {subhilo.archivos?.length > 0 && (
        <div className={styles.subArchivos}>
          <p className={styles.subSectionTitle}>Archivos adjuntos</p>
          <ul>
            {subhilo.archivos.map((a, idx) => (
              <li key={idx} className={styles.subArchivoItem}>
                <ArchivoAdjunto archivo={a} hilo={hilo} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ⭐ Links externos del subhilo */}
      {subhilo.links?.length > 0 && (
        <div className={styles.subLinks}>
          <p className={styles.subSectionTitle}>Links externos</p>
          <ul>
            {subhilo.links.map((l, idx) => (
              <li key={idx} className={styles.subLinkItem}>
                <a
                  href={l.nombreArchivo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.nombreArchivo}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón responder */}
      <button
        className={styles.subResponderBtn}
        onClick={() =>
          redirigir.push(
            `/dashboard/foro/mostrar-foro/${idMateria}/responder-hilo?idHiloOrigen=${hilo.idHilo}&idRespuesta=${subhilo.idSubHilo}`
          )
        }
      >
        Responder
      </button>

      {/* Botón mostrar/ocultar hijos */}
      {tieneHijos && (
        <button
          className={styles.toggleBtn}
          onClick={() => setMostrarHijos(!mostrarHijos)}
        >
          <span
            className={`${styles.toggleIcon} ${
              mostrarHijos ? styles.abierto : ""
            }`}
          >
            ▶
          </span>

          {mostrarHijos
            ? "Ocultar respuestas"
            : `Mostrar respuestas (${hijos.length})`}
        </button>
      )}

      {/* Renderizado recursivo de hijos */}
      {mostrarHijos &&
        hijos.map((hijo) => (
          <SubhiloCard
            key={hijo.idSubHilo}
            subhilo={hijo}
            nivel={nivel + 1}
            hilo={hilo}
            idMateria={idMateria}
            redirigir={redirigir}
            hijos={hijo.hijos}
          />
        ))}
    </div>
  );
}








