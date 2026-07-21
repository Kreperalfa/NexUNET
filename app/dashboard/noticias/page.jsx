"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

import {
  obtenerPublicacionesCompletas,
  borrarPublicacion
} from "../../../lib/publicacion";

import {
  darLike,
  quitarLike,
  tieneLike,
  contarLikes
} from "../../../lib/reacciones";

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
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hashtags, setHashtags] = useState([]);

  // Likes
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

  // Hashtags
  useEffect(() => {
    const cargarHashtags = async () => {
      try {
        const { data, error } = await supabase
          .from("Publicacion_Hashtags") // ✅ nombre correcto
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

  const toggleLike = async () => {
    if (!idUsuario) return;
    try {
      if (liked) {
        await quitarLike(idUsuario, publicacion.idPublicacion, "PUBLICACION");
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await darLike(idUsuario, publicacion.idPublicacion, "PUBLICACION");
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const resumen =
    publicacion.contenido.length > 220
      ? publicacion.contenido.slice(0, 220) + "..."
      : publicacion.contenido;

  const portada =
    publicacion.multimedia?.find((m) => m.tipoArchivo === "imagen")?.url || null;

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
        />
        <div>
          <p className={styles.publicacionAutorNombre}>
            {publicacion.cuenta?.nombre || "Cuenta desconocida"}
          </p>
          {publicacion.autor && (
            <p className={styles.publicacionAutorSecundario}>
              Autor:{" "}
              <a
                href={`/dashboard/perfil/${publicacion.autor.id}`}
                className={styles.publicacionAutorLink}
              >
                {publicacion.autor.nombre || "Autor desconocido"}
              </a>
            </p>
          )}
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
      {expandida && publicacion.multimedia?.length > 0 && (
        <MediaCarousel items={publicacion.multimedia} />
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

        {/* Botón de like */}
        <button
          className={`${styles.botonAccion} ${liked ? styles.botonAccionActivo : ""}`}
          onClick={toggleLike}
        >
          <span className={styles.iconoAccion}>❤️</span>
          <span className={styles.contadorAccion}>{likeCount}</span>
        </button>

        {/* Botón de comentarios */}
        <button className={styles.botonAccion}>
          <span className={styles.iconoAccion}>💬</span>
          <span className={styles.contadorAccion}>0</span>
        </button>
      </div>
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
