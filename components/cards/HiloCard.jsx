"use client";

import { useState, useEffect } from "react";
import styles from "./HiloCard.module.css";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import { darLike, quitarLike, tieneLike, contarLikes } from "../../lib/reacciones";

export default function HiloCard({ hilo, idMateria, idForo, tipoForo, redirigir }) {
  const supabase = getSupabaseBrowserClient();

  // Datos del autor del hilo
  const [autorHilo, setAutorHilo] = useState(null);

  // Datos de autores de subhilos
  const [autoresSub, setAutoresSub] = useState({});

  // Likes del hilo
  const [likedHilo, setLikedHilo] = useState(false);
  const [likeCountHilo, setLikeCountHilo] = useState(0);

  // Likes de subhilos
  const [likedSub, setLikedSub] = useState({});
  const [likeCountSub, setLikeCountSub] = useState({});

  const cacheHiloKey = `like_hilo_${hilo.idHilo}`;
  const cacheSubKey = (id) => `like_subhilo_${id}`;

  // ============================
  // CARGAR AUTOR DEL HILO
  // ============================
  useEffect(() => {
    const cargarAutor = async () => {
      if (!hilo.idUsuarioCreador) return;

      const { data, error } = await supabase
        .from("Usuario")
        .select("nombre, correoInstitucional, imagenPerfil")
        .eq("id", hilo.idUsuarioCreador)
        .single();

      if (!error) setAutorHilo(data);
    };

    cargarAutor();
  }, [hilo.idUsuarioCreador]);

  // ============================
  // CARGAR AUTORES DE SUBHILOS
  // ============================
  useEffect(() => {
    const cargarAutoresSub = async () => {
      const nuevosAutores = {};

      for (const sub of hilo.subhilos || []) {
        const { data } = await supabase
          .from("Usuario")
          .select("nombre, correoInstitucional, imagenPerfil")
          .eq("id", sub.idUsuarioCreador)
          .single();

        nuevosAutores[sub.idSubHilo] = data;
      }

      setAutoresSub(nuevosAutores);
    };

    cargarAutoresSub();
  }, [hilo.subhilos]);

  // ============================
  // CARGAR LIKE DEL HILO
  // ============================
  useEffect(() => {
    const cargarLikesHilo = async () => {
      const cache = localStorage.getItem(cacheHiloKey);
      if (cache) {
        const parsed = JSON.parse(cache);
        setLikedHilo(parsed.liked);
        setLikeCountHilo(parsed.likeCount);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const idUsuario = userData?.user?.id;
      if (!idUsuario) return;

      const yaTiene = await tieneLike(idUsuario, hilo.idHilo, "HILO");
      const total = await contarLikes(hilo.idHilo, "HILO");

      setLikedHilo(yaTiene);
      setLikeCountHilo(total);

      localStorage.setItem(cacheHiloKey, JSON.stringify({ liked: yaTiene, likeCount: total }));
    };

    cargarLikesHilo();
  }, [hilo.idHilo]);

  // ============================
  // CARGAR LIKE DE SUBHILOS
  // ============================
  useEffect(() => {
    const cargarLikesSubhilos = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const idUsuario = userData?.user?.id;
      if (!idUsuario) return;

      const nuevoLiked = {};
      const nuevoCount = {};

      for (const sub of hilo.subhilos || []) {
        const cache = localStorage.getItem(cacheSubKey(sub.idSubHilo));

        if (cache) {
          const parsed = JSON.parse(cache);
          nuevoLiked[sub.idSubHilo] = parsed.liked;
          nuevoCount[sub.idSubHilo] = parsed.likeCount;
          continue;
        }

        const yaTiene = await tieneLike(idUsuario, sub.idSubHilo, "SUBHILO");
        const total = await contarLikes(sub.idSubHilo, "SUBHILO");

        nuevoLiked[sub.idSubHilo] = yaTiene;
        nuevoCount[sub.idSubHilo] = total;

        localStorage.setItem(
          cacheSubKey(sub.idSubHilo),
          JSON.stringify({ liked: yaTiene, likeCount: total })
        );
      }

      setLikedSub(nuevoLiked);
      setLikeCountSub(nuevoCount);
    };

    cargarLikesSubhilos();
  }, [hilo.subhilos]);

  // ============================
  // TOGGLE LIKE DEL HILO
  // ============================
  const toggleLikeHilo = async (e) => {
    e.stopPropagation();
    const { data: userData } = await supabase.auth.getUser();
    const idUsuario = userData?.user?.id;
    if (!idUsuario) return;

    if (likedHilo) {
      setLikedHilo(false);
      setLikeCountHilo(prev => prev - 1);
      quitarLike(idUsuario, hilo.idHilo, "HILO");
    } else {
      setLikedHilo(true);
      setLikeCountHilo(prev => prev + 1);
      darLike(idUsuario, hilo.idHilo, "HILO");
    }

    localStorage.setItem(
      cacheHiloKey,
      JSON.stringify({
        liked: !likedHilo,
        likeCount: likedHilo ? likeCountHilo - 1 : likeCountHilo + 1
      })
    );
  };

  // ============================
  // TOGGLE LIKE DE SUBHILO
  // ============================
  const toggleLikeSubhilo = async (e, idSubHilo) => {
    e.stopPropagation();
    const { data: userData } = await supabase.auth.getUser();
    const idUsuario = userData?.user?.id;
    if (!idUsuario) return;

    const yaTiene = likedSub[idSubHilo];

    if (yaTiene) {
      setLikedSub(prev => ({ ...prev, [idSubHilo]: false }));
      setLikeCountSub(prev => ({ ...prev, [idSubHilo]: prev[idSubHilo] - 1 }));
      quitarLike(idUsuario, idSubHilo, "SUBHILO");
    } else {
      setLikedSub(prev => ({ ...prev, [idSubHilo]: true }));
      setLikeCountSub(prev => ({ ...prev, [idSubHilo]: prev[idSubHilo] + 1 }));
      darLike(idUsuario, idSubHilo, "SUBHILO");
    }

    localStorage.setItem(
      cacheSubKey(idSubHilo),
      JSON.stringify({
        liked: !yaTiene,
        likeCount: yaTiene ? likeCountSub[idSubHilo] - 1 : likeCountSub[idSubHilo] + 1
      })
    );
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div
      className={styles.hiloCard}
      onClick={() =>
        redirigir.push(
          `/dashboard/foro/mostrar-foro/${idMateria}/hilo/${hilo.idHilo}?idForo=${idForo}&tipoForo=${tipoForo}`
        )
      }
    >
      {/* HEADER */}
      <div className={styles.hiloHeader}>
        <h3 className={styles.hiloTitle}>{hilo.titulo}</h3>

        {/* ⭐ Autor real del hilo */}
        <div className={styles.hiloAutorBox}>
          <img
            src={autorHilo?.imagenPerfil || "/default-user.png"}
            className={styles.hiloAutorFoto}
          />
          <span className={styles.hiloAutorNombre}>
            {autorHilo?.nombre || autorHilo?.correoInstitucional || "Usuario"}
          </span>
        </div>
      </div>

      {/* EXCERPT */}
      <p className={styles.hiloExcerpt}>
        {hilo.contenido.length > 160
          ? hilo.contenido.slice(0, 160) + "..."
          : hilo.contenido}
      </p>

      {/* INFO */}
      <div className={styles.hiloInfo}>
        <span>Comentarios: {hilo.subhilos?.length || 0}</span>
        <span>Adjuntos: {hilo.archivos?.length || 0}</span>
      </div>

      <small className={styles.hiloFecha}>
        {new Date(hilo.created_at).toLocaleString()}
      </small>

      {/* LIKE DEL HILO */}
      <button className={styles.likeBtn} onClick={toggleLikeHilo}>
        <span
          className={`${styles.likeIcon} ${
            likedHilo ? styles.likeIconLiked : ""
          }`}
        >
          {likedHilo ? "❤️" : "🤍"}
        </span>
        {likeCountHilo}
      </button>

      {/* RESPONDER */}
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

      {/* SUBHILOS */}
      {hilo.subhilos?.length > 0 && (
        <div className={styles.subhilosList}>
          {hilo.subhilos.map((sub) => (
            <div key={sub.idSubHilo} className={styles.subhiloCard}>
              
              {/* Autor real del subhilo */}
              <div className={styles.subAutorBox}>
                <img
                  src={autoresSub[sub.idSubHilo]?.imagenPerfil || "/default-user.png"}
                  className={styles.subAutorFoto}
                />
                <span className={styles.subAutorNombre}>
                  {autoresSub[sub.idSubHilo]?.nombre ||
                    autoresSub[sub.idSubHilo]?.correoInstitucional ||
                    "Usuario"}
                </span>
              </div>

              <p>{sub.contenido}</p>
              <small>{new Date(sub.created_at).toLocaleString()}</small>

              <button
                className={styles.likeBtn}
                onClick={(e) => toggleLikeSubhilo(e, sub.idSubHilo)}
              >
                <span
                  className={`${styles.likeIcon} ${
                    likedSub[sub.idSubHilo] ? styles.likeIconLiked : ""
                  }`}
                >
                  {likedSub[sub.idSubHilo] ? "❤️" : "🤍"}
                </span>
                {likeCountSub[sub.idSubHilo] || 0}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
