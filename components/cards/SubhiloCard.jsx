"use client";

import { useState, useEffect } from "react";
import styles from "./SubhiloCard.module.css";
import ArchivoAdjunto from "./ArchivoAdjunto";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import { darLike, quitarLike, tieneLike, contarLikes } from "../../lib/reacciones";

export default function SubhiloCard({
  subhilo,
  nivel,
  hilo,
  idMateria,
  redirigir,
  hijos
}) {
  const supabase = getSupabaseBrowserClient();
  const [mostrarHijos, setMostrarHijos] = useState(false);

  const tieneHijos = hijos && hijos.length > 0;

  // Estados para likes del subhilo
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Cargar likes del subhilo
  useEffect(() => {
    const cargarLikes = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const idUsuario = userData?.user?.id;
      if (!idUsuario) return;

      const yaTiene = await tieneLike(idUsuario, subhilo.idSubHilo, "SUBHILO");
      setLiked(yaTiene);

      const total = await contarLikes(subhilo.idSubHilo, "SUBHILO");
      setLikeCount(total);
    };

    cargarLikes();
  }, [subhilo.idSubHilo]);

  // Toggle like del subhilo
  const toggleLike = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const idUsuario = userData?.user?.id;
    if (!idUsuario) return;

    if (liked) {
      await quitarLike(idUsuario, subhilo.idSubHilo, "SUBHILO");
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      await darLike(idUsuario, subhilo.idSubHilo, "SUBHILO");
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

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

      {/* Botón de like del subhilo */}
      <button
        className={styles.likeBtn}
        onClick={toggleLike}
      >
        {liked ? "❤️" : "🤍"} {likeCount}
      </button>

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
