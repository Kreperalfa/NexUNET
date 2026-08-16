"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import {
  obtenerPublicacionesCompletas,
} from "../../../lib/publicacion";

import {
  darLike,
  quitarLike,
  tieneLike,
  contarLikes
} from "../../../lib/reacciones";

import {
  crearComentario,
  obtenerComentariosPublicacion,
  contarComentarios
} from "../../../lib/comentario";

import {
  seguirCuenta,
  dejarDeSeguirCuenta,
  verificarSeguimiento
} from "../../../lib/seguimiento";

import { getSupabaseBrowserClient } from "../../../lib/supabase";

import ErrorMessage from "@/components/ui/ErrorMessage";
import Loader from "@/components/ui/Loader";
import PageTitle from "@/components/ui/PageTitle";
import SectionCard from "@/components/cards/SectionCard";
import HashtagChip from "@/components/ui/HashtagChip";
import EmptyState from "@/components/info/EmptyState";

import MediaCarousel from "@/components/media/MediaCarousel";
import YouTubePlayer from "@/components/media/YouTubePlayer";
import YouTubeThumbnail from "@/components/media/YouTubeThumbnail";

/* ============================================================
   COMPONENTE HIJO: PublicacionCard
============================================================ */
function PublicacionCard({ publicacion, expandida, onToggleExpand, cacheBust, idUsuario }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hashtags, setHashtags] = useState([]);

  // Estados para comentarios
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [comentariosCount, setComentariosCount] = useState(0);

  // Estado para seguimiento
  const [isFollowing, setIsFollowing] = useState(false);

  /* ============================================================
     CARGAR LIKES
  ============================================================ */
  useEffect(() => {
    if (!idUsuario) return;
    const cargarLikes = async () => {
      try {
        const yaTiene = await tieneLike(idUsuario, publicacion.idPublicacion, "PUBLICACION");
        setLiked(yaTiene);

        const total = await contarLikes(publicacion.idPublicacion, "PUBLICACION");
        setLikeCount(total);
      } catch (err) {
        console.error("Error cargando likes:", err);
      }
    };
    cargarLikes();
  }, [idUsuario, publicacion.idPublicacion]);

  /* ============================================================
     CARGAR HASHTAGS
  ============================================================ */
  useEffect(() => {
    const cargarHashtags = async () => {
      try {
        const { data, error } = await supabase
          .from("Publicacion_Hashtags")
          .select("Hashtag(idHashtag, nombre)")
          .eq("idPublicacion", publicacion.idPublicacion);

        if (error) {
          console.error("Error cargando hashtags:", error);
          return;
        }
        setHashtags(data?.map((d) => d.Hashtag) || []);
      } catch (err) {
        console.error("Error cargando hashtags:", err);
      }
    };
    cargarHashtags();
  }, [publicacion.idPublicacion]);

  /* ============================================================
     CARGAR COMENTARIOS
  ============================================================ */
  useEffect(() => {
    if (!expandida) return;

    const cargarComentarios = async () => {
      try {
        const data = await obtenerComentariosPublicacion(publicacion.idPublicacion);
        setComentarios(data);

        const total = await contarComentarios(publicacion.idPublicacion);
        setComentariosCount(total);
      } catch (err) {
        console.error("Error cargando comentarios:", err);
      }
    };

    cargarComentarios();
  }, [expandida, publicacion.idPublicacion]);

  /* ============================================================
     CARGAR SEGUIMIENTO
  ============================================================ */
  useEffect(() => {
    if (!idUsuario || !publicacion.cuenta?.idCuenta) return;
    const checkFollow = async () => {
      try {
        const sigue = await verificarSeguimiento(idUsuario, publicacion.cuenta.idCuenta);
        setIsFollowing(sigue);
      } catch (err) {
        console.warn("Error verificando seguimiento:", err.message);
        setIsFollowing(false);
      }
    };
    checkFollow();
  }, [idUsuario, publicacion.cuenta?.idCuenta]);

  /* ============================================================
     LIKE — ❤️ / 🤍 y contador correcto
  ============================================================ */
  const toggleLike = async () => {
    if (!idUsuario) return;

    try {
      if (liked) {
        await quitarLike(idUsuario, publicacion.idPublicacion, "PUBLICACION");
        setLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      } else {
        await darLike(idUsuario, publicacion.idPublicacion, "PUBLICACION");
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  /* ============================================================
     SEGUIR / DEJAR DE SEGUIR
  ============================================================ */
  const toggleFollow = async () => {
    if (!idUsuario || !publicacion.cuenta?.idCuenta) return;

    try {
      if (isFollowing) {
        await dejarDeSeguirCuenta(idUsuario, publicacion.cuenta.idCuenta);
        setIsFollowing(false);
      } else {
        await seguirCuenta(idUsuario, publicacion.cuenta.idCuenta);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  /* ============================================================
     ENVIAR COMENTARIO
  ============================================================ */
  const enviarComentario = async () => {
    if (!idUsuario || !nuevoComentario.trim()) return;
    try {
      await crearComentario(idUsuario, publicacion.idPublicacion, nuevoComentario);
      setNuevoComentario("");

      const data = await obtenerComentariosPublicacion(publicacion.idPublicacion);
      setComentarios(data);

      const total = await contarComentarios(publicacion.idPublicacion);
      setComentariosCount(total);
    } catch (err) {
      console.error("Error creando comentario:", err);
    }
  };

  /* ============================================================
     PORTADA Y CARRUSEL MIXTO
  ============================================================ */

  // Imagen principal (portada)
  const portada =
    publicacion.multimedia?.find((m) => m.tipoArchivo === "imagen")?.url || null;

  // Imágenes adicionales (sin la portada)
  const imagenesAdicionales = publicacion.multimedia?.filter(
    (m) => m.tipoArchivo === "imagen" && m.url !== portada
  ) || [];

  // Videos locales
  const videosLocales = publicacion.multimedia?.filter(
    (m) => m.tipoArchivo === "video"
  ) || [];

  // Carrusel mixto (imágenes adicionales + videos)
  const carruselMixto = [...imagenesAdicionales, ...videosLocales];

  const resumen =
    publicacion.contenido.length > 220
      ? publicacion.contenido.slice(0, 220) + "..."
      : publicacion.contenido;

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <article className={styles.publicacionCard}>
      {/* Autor */}
      <div className={styles.publicacionAutor}>
        <img
          src={
            publicacion.cuenta?.imagenCuenta
              ? `${publicacion.cuenta.imagenCuenta}?t=${cacheBust}`
              : "/default-user.png"
          }
          className={styles.publicacionAutorFoto}
          onClick={() =>
            router.push(`/dashboard/cuenta/abrir-cuenta/${publicacion.cuenta.idCuenta}`)
          }
          style={{ cursor: "pointer" }}
        />

        <div className={styles.publicacionAutorInfo}>
          <p
            className={styles.publicacionAutorNombre}
            onClick={() =>
              router.push(`/dashboard/cuenta/abrir-cuenta/${publicacion.cuenta.idCuenta}`)
            }
          >
            {publicacion.cuenta?.nombre || "Cuenta desconocida"}
          </p>

          <time className={styles.publicacionFecha}>
            {new Date(publicacion.fechaCreacion).toLocaleString()}
          </time>
        </div>

        {publicacion.cuenta?.idCuenta && (
          <button
            className={isFollowing ? styles.botonSiguiendo : styles.botonSeguir}
            onClick={toggleFollow}
          >
            {isFollowing ? "Siguiendo" : "Seguir"}
          </button>
        )}
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

      {/* Carrusel mixto */}
      {expandida && carruselMixto.length > 0 && (
        <MediaCarousel items={carruselMixto} />
      )}

      {/* YouTube */}
      {expandida && publicacion.youtubeURL && (
        <YouTubePlayer url={publicacion.youtubeURL} />
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className={styles.publicacionHashtags}>
          {hashtags.map((h) => (
            <span key={h.idHashtag}>
              <HashtagChip nombre={h.nombre} />
            </span>
          ))}
        </div>
      )}

      {/* Acciones */}
      <div className={styles.publicacionAcciones}>
        <button
          className={styles.botonExpandir}
          onClick={() => onToggleExpand(publicacion.idPublicacion)}
        >
          {expandida ? "Ver menos" : "Ver más"}
        </button>

        {/* Botón de like ❤️ / 🤍 */}
        <button
          className={`${styles.botonAccion} ${liked ? styles.botonAccionActivo : ""}`}
          onClick={toggleLike}
        >
          <span className={styles.iconoAccion}>
            {liked ? "❤️" : "🤍"}
          </span>
          <span className={styles.contadorAccion}>{likeCount}</span>
        </button>

        {/* Botón de comentarios */}
        <button
          className={styles.botonAccion}
          onClick={() => onToggleExpand(publicacion.idPublicacion)}
        >
          <span className={styles.iconoAccion}>💬</span>
          <span className={styles.contadorAccion}>{comentariosCount}</span>
        </button>
      </div>

      {/* Sección de comentarios */}
      {expandida && (
        <div className={styles.comentariosSection}>
          <h4>Comentarios</h4>

          {/* Formulario */}
          <div className={styles.comentarioForm}>
            <input
              type="text"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              className={styles.comentarioInput}
            />
            <button onClick={enviarComentario} className={styles.comentarioBtn}>
              Enviar
            </button>
          </div>

          {/* Lista de comentarios */}
          {comentarios.length === 0 ? (
            <p className={styles.comentarioEmpty}>No hay comentarios aún.</p>
          ) : (
            <ul className={styles.comentarioList}>
              {comentarios.map((c) => (
                <li key={c.idComentario} className={styles.comentarioItem}>
                  <img
                    src={c.Usuario?.imagenPerfil || "/default-user.png"}
                    className={styles.comentarioAutorFoto}
                    onClick={() => router.push(`/dashboard/perfil/${c.Usuario?.id}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <div>
                    <p
                      className={styles.comentarioAutor}
                      onClick={() => router.push(`/dashboard/perfil/${c.Usuario?.id}`)}
                    >
                      {c.Usuario?.nombre || "Usuario desconocido"}
                    </p>
                    <p className={styles.comentarioContenido}>{c.contenido}</p>
                    <small className={styles.comentarioFecha}>
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
   PÁGINA PRINCIPAL: NoticiasPage
============================================================ */
export default function NoticiasPage() {
  const supabase = getSupabaseBrowserClient();
  const [idUsuario, setIdUsuario] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cacheBust] = useState(Date.now());
  const [expandidaId, setExpandidaId] = useState(null);

  const toggleExpansionPublicacion = (id) => {
    setExpandidaId(expandidaId === id ? null : id);
  };

  useEffect(() => {
    const cargarUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIdUsuario(user?.id);
    };
    cargarUsuario();
  }, []);

  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        const resultado = await obtenerPublicacionesCompletas();
        if (!resultado.ok) {
          setMensaje(resultado.mensaje);
          setTipoMensaje("error");
          return;
        }
        setPublicaciones(resultado.publicaciones);
      } catch (error) {
        console.error("Error cargando publicaciones:", error);
        setMensaje("Error al cargar publicaciones");
        setTipoMensaje("error");
      } finally {
        setCargando(false);
      }
    };

    cargarPublicaciones();
  }, []);

  if (cargando) return <Loader texto="Cargando noticias..." />;
  if (mensaje && tipoMensaje === "error") {
    return (
      <div className={styles.contenedor}>
        <ErrorMessage mensaje={mensaje} />
      </div>
    );
  }

  return (
    <div className={styles.contenedor}>
      <PageTitle titulo="Noticias de NexUNET" />
      <SectionCard titulo="Noticias / Artículos publicados">
        {publicaciones.length === 0 ? (
          <EmptyState
            titulo="Sin publicaciones"
            descripcion="No hay noticias registradas."
            icono="📰"
          />
        ) : (
          <div className={styles.publicacionesLista}>
            {publicaciones.map((p) => (
              <PublicacionCard
                key={p.idPublicacion}
                publicacion={p}
                expandida={expandidaId === p.idPublicacion}
                onToggleExpand={toggleExpansionPublicacion}
                cacheBust={cacheBust}
                idUsuario={idUsuario}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}


