"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

import Loader from "@/components/ui/Loader";
import ErrorMessage from "@/components/ui/ErrorMessage";
import HashtagChip from "@/components/ui/HashtagChip";
import MediaCarousel from "@/components/media/MediaCarousel";
import YouTubePlayer from "@/components/media/YouTubePlayer";
import YouTubeThumbnail from "@/components/media/YouTubeThumbnail";

import {
  obtenerHashtagsPublicacion
} from "@/lib/publicacion";

import {
  darLike,
  quitarLike,
  tieneLike,
  contarLikes
} from "@/lib/reacciones";

import {
  crearComentario,
  obtenerComentariosPublicacion,
  contarComentarios
} from "@/lib/comentario";

import styles from "./page.module.css";

export default function FeedPage() {
  const supabase = getSupabaseBrowserClient();

  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false); // ← CLAVE
  const [feed, setFeed] = useState([]);
  const [cargando, setCargando] = useState(true);

  /* ============================
     1) CARGAR USUARIO UNA SOLA VEZ
  ============================ */
  useEffect(() => {
    const cargarUsuario = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setUserLoaded(true); // ← SIEMPRE booleano, tamaño fijo
    };
    cargarUsuario();
  }, []); // ← SIEMPRE vacío

  /* ============================
     2) CARGAR FEED CUANDO USER EXISTA
     (DEPENDENCIA ESTABLE)
  ============================ */
  useEffect(() => {
    if (!userLoaded || !user) return;

    const cargarFeed = async () => {
      try {
        // PUBLICACIONES
        const { data: publicaciones } = await supabase
          .from("Publicacion")
          .select(`
            *,
            autor:Usuario(id, nombre, imagenPerfil),
            multimedia:MultimediaPublicacion(*)
          `)
          .order("fechaCreacion", { ascending: false });

        // HILOS
        const { data: hilos } = await supabase
          .from("Hilo")
          .select(`
            *,
            autor:Usuario(id, nombre, imagenPerfil)
          `)
          .order("fechaCreacion", { ascending: false });

        const feedMezclado = [
          ...(publicaciones || []).map((p) => ({
            tipo: "publicacion",
            ...p,
            expandida: false,
            likesInicial: 0,
            comentariosInicial: 0,
            likedInicial: false,
          })),
          ...(hilos || []).map((h) => ({
            tipo: "hilo",
            ...h,
          }))
        ].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

        // ============================
        // CARGAR LIKES Y COMENTARIOS INICIALES
        // ============================
        for (const item of feedMezclado) {
          if (item.tipo === "publicacion") {
            item.likesInicial = await contarLikes(item.idPublicacion, "PUBLICACION");
            item.comentariosInicial = await contarComentarios(item.idPublicacion);
            item.likedInicial = await tieneLike(user.id, item.idPublicacion, "PUBLICACION");
          }
        }

        setFeed(feedMezclado);

      } catch (error) {
        console.error("Error cargando feed:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarFeed();
  }, [userLoaded]); // ← SIEMPRE tamaño 1

  if (cargando) return <Loader texto="Cargando feed..." />;
  if (!user) return <ErrorMessage mensaje="Usuario no autenticado" />;

  /* ============================================================
     RENDER DEL FEED
  ============================================================ */
  return (
    <div className={styles.contenedor}>
      <div className={styles.feedLista}>
        {feed.map((item) => {
          if (item.tipo === "publicacion") {
            return (
              <PublicacionIGFeed
                key={`pub-${item.idPublicacion}`}
                publicacion={item}
                autor={item.autor}
                user={user}
              />
            );
          }

          if (item.tipo === "hilo") {
            return (
              <HiloIGFeed
                key={`hilo-${item.idHilo}`}
                hilo={item}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

/* ============================================================
   PUBLICACIÓN IG — CARGA DIFERIDA + LIKES INICIALES
============================================================ */
function PublicacionIGFeed({ publicacion, autor, user }) {
  const [expandida, setExpandida] = useState(false);

  const [hashtags, setHashtags] = useState([]);

  // Likes iniciales
  const [liked, setLiked] = useState(publicacion.likedInicial);
  const [likeCount, setLikeCount] = useState(publicacion.likesInicial);

  // Comentarios iniciales
  const [comentarios, setComentarios] = useState([]);
  const [comentariosCount, setComentariosCount] = useState(publicacion.comentariosInicial);

  const portada =
    publicacion.multimedia?.find((m) => m.tipoArchivo === "imagen")?.url || null;

  const imagenesAdicionales =
    publicacion.multimedia?.filter(
      (m) => m.tipoArchivo === "imagen" && m.url !== portada
    ) || [];

  const videosLocales =
    publicacion.multimedia?.filter((m) => m.tipoArchivo === "video") || [];

  const carruselMixto = [...imagenesAdicionales, ...videosLocales];

  const resumen =
    publicacion.contenido.length > 220
      ? publicacion.contenido.slice(0, 220) + "..."
      : publicacion.contenido;

  /* ============================
     CARGA DIFERIDA AL EXPANDIR
  ============================ */
  const cargarDatosExpandido = async () => {
    // Hashtags
    const hs = await obtenerHashtagsPublicacion(publicacion.idPublicacion);
    setHashtags(hs);

    // Comentarios completos
    const com = await obtenerComentariosPublicacion(publicacion.idPublicacion);
    setComentarios(com);
  };

  const toggleExpand = async () => {
    const nueva = !expandida;
    setExpandida(nueva);

    if (nueva) {
      await cargarDatosExpandido();
    }
  };

  /* ============================
     LIKE
  ============================ */
  const toggleLike = async () => {
    if (!user?.id) return;

    try {
      if (liked) {
        await quitarLike(user.id, publicacion.idPublicacion, "PUBLICACION");
        setLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      } else {
        await darLike(user.id, publicacion.idPublicacion, "PUBLICACION");
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  /* ============================
     COMENTAR
  ============================ */
  const [nuevoComentario, setNuevoComentario] = useState("");

  const enviarComentario = async () => {
    if (!user?.id || !nuevoComentario.trim()) return;

    try {
      await crearComentario(
        user.id,
        publicacion.idPublicacion,
        nuevoComentario
      );
      setNuevoComentario("");

      const data = await obtenerComentariosPublicacion(publicacion.idPublicacion);
      setComentarios(data);

      const total = await contarComentarios(publicacion.idPublicacion);
      setComentariosCount(total);
    } catch (err) {
      console.error("Error creando comentario:", err);
    }
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <article className={styles.publicacionCard}>
      <div className={styles.publicacionAutor}>
        <img
          src={autor?.imagenPerfil || "/default-user.png"}
          className={styles.publicacionAutorFoto}
        />
        <div>
          <p className={styles.publicacionAutorNombre}>
            {autor?.nombre || "Autor desconocido"}
          </p>
          <time className={styles.publicacionFecha}>
            {new Date(publicacion.fechaCreacion).toLocaleString()}
          </time>
        </div>
      </div>

      {/* Portada */}
      <div
        className={
          expandida
            ? styles.portadaContainerExpandida
            : styles.portadaContainer
        }
      >
        {portada ? (
          <img
            src={portada}
            className={
              expandida
                ? styles.portadaImagenExpandida
                : styles.portadaImagen
            }
          />
        ) : publicacion.youtubeURL ? (
          <YouTubeThumbnail
            url={publicacion.youtubeURL}
            className={
              expandida
                ? styles.portadaImagenExpandida
                : styles.portadaImagen
            }
          />
        ) : (
          <div className={styles.portadaSinImagen}>Sin imagen</div>
        )}
      </div>

      {/* Título */}
      {publicacion.titulo && (
        <h3 className={styles.publicacionTitulo}>{publicacion.titulo}</h3>
      )}

      {/* Contenido */}
      <p className={styles.publicacionContenido}>
        {expandida ? publicacion.contenido : resumen}
      </p>

      {/* Carrusel */}
      {expandida && carruselMixto.length > 0 && (
        <MediaCarousel items={carruselMixto} />
      )}

      {/* YouTube */}
      {expandida && publicacion.youtubeURL && (
        <YouTubePlayer url={publicacion.youtubeURL} />
      )}

      {/* Hashtags */}
      {expandida && hashtags.length > 0 && (
        <div className={styles.publicacionHashtags}>
          {hashtags.map((h) => (
            <span key={h.idHashtag}>
              <HashtagChip nombre={h.nombre} />
            </span>
          ))}
        </div>
      )}

      {/* Acciones */}
      <div className={styles.publicacionAccionesIG}>
        <button
          className={`${styles.likeButtonIG} ${
            liked ? styles.likeButtonIGActivo : ""
          }`}
          onClick={toggleLike}
        >
          {liked ? "❤️" : "🤍"}
        </button>

        <span className={styles.likeCountIG}>{likeCount} likes</span>

        <button
          className={styles.comentariosButtonIG}
          onClick={toggleExpand}
        >
          💬 {comentariosCount}
        </button>
      </div>

      {/* Expandir */}
      <button
        className={styles.botonExpandir}
        onClick={toggleExpand}
      >
        {expandida ? "Ver menos" : "Ver más"}
      </button>

      {/* Comentarios */}
      {expandida && (
        <div className={styles.comentariosSectionIG}>
          <h4 className={styles.comentariosTituloIG}>Comentarios</h4>

          <div className={styles.comentarioFormIG}>
            <input
              type="text"
              placeholder="Añadir un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              className={styles.comentarioInputIG}
            />
            <button
              onClick={enviarComentario}
              className={styles.comentarioBtnIG}
            >
              Publicar
            </button>
          </div>

          {comentarios.length === 0 ? (
            <p className={styles.comentarioEmptyIG}>No hay comentarios aún.</p>
          ) : (
            <ul className={styles.comentarioListIG}>
              {comentarios.map((c) => (
                <li key={c.idComentario} className={styles.comentarioItemIG}>
                  <img
                    src={c.Usuario?.imagenPerfil || "/default-user.png"}
                    className={styles.comentarioAutorFotoIG}
                  />
                  <div>
                    <p className={styles.comentarioAutorIG}>
                      {c.Usuario?.nombre || "Usuario desconocido"}
                    </p>
                    <p className={styles.comentarioContenidoIG}>
                      {c.contenido}
                    </p>
                    <small className={styles.comentarioFechaIG}>
                      {new Date(c.created_at).toLocaleString()}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

/* ============================================================
   HILO IG
============================================================ */
function HiloIGFeed({ hilo }) {
  return (
    <article className={styles.hiloCard}>
      <div className={styles.hiloAutor}>
        <img
          src={hilo.autor?.imagenPerfil || "/default-user.png"}
          className={styles.hiloAutorFoto}
        />
        <div>
          <p className={styles.hiloAutorNombre}>
            {hilo.autor?.nombre || "Autor desconocido"}
          </p>
          <time className={styles.hiloFecha}>
            {new Date(hilo.fechaCreacion).toLocaleString()}
          </time>
        </div>
      </div>

      <h3 className={styles.hiloTitulo}>{hilo.titulo}</h3>

      <p className={styles.hiloContenido}>
        {hilo.contenido.slice(0, 300)}...
      </p>

      <button className={styles.hiloBoton}>
        Ver hilo completo →
      </button>
    </article>
  );
}

