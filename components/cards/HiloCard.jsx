"use client";

import { useState, useEffect } from "react";
import styles from "./HiloCard.module.css";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import { darLike, quitarLike, tieneLike, contarLikes } from "../../lib/reacciones";

export default function HiloCard({ hilo, idMateria, idForo, tipoForo, redirigir }) {
  const supabase = getSupabaseBrowserClient();

  // Estados para likes del hilo
  const [likedHilo, setLikedHilo] = useState(false);
  const [likeCountHilo, setLikeCountHilo] = useState(0);

  // Estados para likes de subhilos
  const [likedSub, setLikedSub] = useState({});
  const [likeCountSub, setLikeCountSub] = useState({});

  // Cargar likes del hilo
  useEffect(() => {
    const cargarLikesHilo = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const idUsuario = userData?.user?.id;
      if (!idUsuario) return;

      const yaTiene = await tieneLike(idUsuario, hilo.idHilo, "HILO");
      setLikedHilo(yaTiene);

      const total = await contarLikes(hilo.idHilo, "HILO");
      setLikeCountHilo(total);
    };

    cargarLikesHilo();
  }, [hilo.idHilo]);

  // Cargar likes de subhilos
  useEffect(() => {
    const cargarLikesSubhilos = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const idUsuario = userData?.user?.id;
      if (!idUsuario) return;

      const nuevoLiked = {};
      const nuevoCount = {};

      for (const sub of hilo.subhilos || []) {
        const yaTiene = await tieneLike(idUsuario, sub.idSubHilo, "SUBHILO");
        const total = await contarLikes(sub.idSubHilo, "SUBHILO");

        nuevoLiked[sub.idSubHilo] = yaTiene;
        nuevoCount[sub.idSubHilo] = total;
      }

      setLikedSub(nuevoLiked);
      setLikeCountSub(nuevoCount);
    };

    cargarLikesSubhilos();
  }, [hilo.subhilos]);

  // Toggle like del hilo
  const toggleLikeHilo = async (e) => {
    e.stopPropagation();
    const { data: userData } = await supabase.auth.getUser();
    const idUsuario = userData?.user?.id;
    if (!idUsuario) return;

    if (likedHilo) {
      await quitarLike(idUsuario, hilo.idHilo, "HILO");
      setLikedHilo(false);
      setLikeCountHilo(prev => prev - 1);
    } else {
      await darLike(idUsuario, hilo.idHilo, "HILO");
      setLikedHilo(true);
      setLikeCountHilo(prev => prev + 1);
    }
  };

  // Toggle like de subhilo
  const toggleLikeSubhilo = async (e, idSubHilo) => {
    e.stopPropagation();
    const { data: userData } = await supabase.auth.getUser();
    const idUsuario = userData?.user?.id;
    if (!idUsuario) return;

    const yaTiene = likedSub[idSubHilo];

    if (yaTiene) {
      await quitarLike(idUsuario, idSubHilo, "SUBHILO");
      setLikedSub(prev => ({ ...prev, [idSubHilo]: false }));
      setLikeCountSub(prev => ({ ...prev, [idSubHilo]: prev[idSubHilo] - 1 }));
    } else {
      await darLike(idUsuario, idSubHilo, "SUBHILO");
      setLikedSub(prev => ({ ...prev, [idSubHilo]: true }));
      setLikeCountSub(prev => ({ ...prev, [idSubHilo]: prev[idSubHilo] + 1 }));
    }
  };

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

      {/* Botón de like del hilo */}
      <button
        className={styles.likeBtn}
        onClick={toggleLikeHilo}
      >
        {likedHilo ? "❤️" : "🤍"} {likeCountHilo}
      </button>

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

      {/* Render de subhilos con botón de like */}
      {hilo.subhilos?.length > 0 && (
        <div className={styles.subhilosList}>
          {hilo.subhilos.map((sub) => (
            <div key={sub.idSubHilo} className={styles.subhiloCard}>
              <p>{sub.contenido}</p>
              <small>{new Date(sub.created_at).toLocaleString()}</small>
              <button
                className={styles.likeBtn}
                onClick={(e) => toggleLikeSubhilo(e, sub.idSubHilo)}
              >
                {likedSub[sub.idSubHilo] ? "❤️" : "🤍"} {likeCountSub[sub.idSubHilo] || 0}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
