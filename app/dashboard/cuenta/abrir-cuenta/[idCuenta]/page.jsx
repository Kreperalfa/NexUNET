"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

import PageTitle from "@/components/ui/PageTitle";
import SectionCard from "@/components/cards/SectionCard";
import HashtagChip from "@/components/ui/HashtagChip";
import MediaCarousel from "@/components/media/MediaCarousel";
import YouTubePlayer from "@/components/media/YouTubePlayer";
import YouTubeThumbnail from "@/components/media/YouTubeThumbnail";
import Loader from "@/components/ui/Loader";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/info/EmptyState";

import { obtenerCuentaCompleta } from "@/lib/cuenta";
import {
  obtenerPublicacionesConMultimedia,
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

/* ============================================================
   COMPONENTE HIJO — Publicación estilo Instagram mejorado
============================================================ */
function PublicacionIG({
  publicacion,
  autor,
  cacheBust,
  user,
  onToggleExpand,
  hashtags
}) {
  const router = useRouter();
  const expandida = publicacion.expandida || false;

  const portada =
    publicacion.multimedia?.find((m) => m.tipoArchivo === "imagen")?.url ||
    null;

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

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const cargarLikes = async () => {
      const yaTiene = await tieneLike(
        user.id,
        publicacion.idPublicacion,
        "PUBLICACION"
      );
      setLiked(yaTiene);

      const total = await contarLikes(publicacion.idPublicacion, "PUBLICACION");
      setLikeCount(total);
    };

    cargarLikes();
  }, [publicacion.idPublicacion, user?.id]);

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

  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [comentariosCount, setComentariosCount] = useState(0);

  useEffect(() => {
    if (!expandida) return;

    const cargarComentarios = async () => {
      const data = await obtenerComentariosPublicacion(
        publicacion.idPublicacion
      );
      setComentarios(data);

      const total = await contarComentarios(publicacion.idPublicacion);
      setComentariosCount(total);
    };

    cargarComentarios();
  }, [expandida, publicacion.idPublicacion]);

  const enviarComentario = async () => {
    if (!user?.id || !nuevoComentario.trim()) return;

    try {
      await crearComentario(
        user.id,
        publicacion.idPublicacion,
        nuevoComentario
      );
      setNuevoComentario("");

      const data = await obtenerComentariosPublicacion(
        publicacion.idPublicacion
      );
      setComentarios(data);

      const total = await contarComentarios(publicacion.idPublicacion);
      setComentariosCount(total);
    } catch (err) {
      console.error("Error creando comentario:", err);
    }
  };

  return (
    <article className={styles.publicacionCard}>
      <div className={styles.publicacionAutor}>
        <img
          src={
            autor?.imagenPerfil
              ? `${autor.imagenPerfil}?t=${cacheBust}`
              : "/default-user.png"
          }
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

      {publicacion.titulo && (
        <h3 className={styles.publicacionTitulo}>{publicacion.titulo}</h3>
      )}

      <p className={styles.publicacionContenido}>
        {expandida ? publicacion.contenido : resumen}
      </p>

      {expandida && carruselMixto.length > 0 && (
        <MediaCarousel items={carruselMixto} />
      )}

      {expandida && publicacion.youtubeURL && (
        <YouTubePlayer url={publicacion.youtubeURL} />
      )}

      {hashtags?.length > 0 && (
        <div className={styles.publicacionHashtags}>
          {hashtags.map((h) => (
            <span key={h.idHashtag}>
              <HashtagChip nombre={h.nombre} />
            </span>
          ))}
        </div>
      )}

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
          onClick={() => onToggleExpand(publicacion.idPublicacion)}
        >
          💬 {comentariosCount}
        </button>
      </div>

      <button
        className={styles.botonExpandir}
        onClick={() => onToggleExpand(publicacion.idPublicacion)}
      >
        {expandida ? "Ver menos" : "Ver más"}
      </button>

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
   COMPONENTE PRINCIPAL — Perfil Público IG mejorado
============================================================ */
export default function PerfilCuenta() {
  const params = useParams();
  const idCuenta = params.idCuenta;
  const router = useRouter();

  const [cuenta, setCuenta] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [hashtagsPorPublicacion, setHashtagsPorPublicacion] = useState({});
  const [user, setUser] = useState(null);
  const [cacheBust, setCacheBust] = useState(Date.now());
  const [cargando, setCargando] = useState(true);

  const [seguidores, setSeguidores] = useState([]);
  const [siguiendo, setSiguiendo] = useState(false);
  const [procesandoFollow, setProcesandoFollow] = useState(false);
  const [mostrarModalSeguidores, setMostrarModalSeguidores] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);
    };
    cargarUsuario();
  }, []);

  useEffect(() => {
    const cargarCuenta = async () => {
      try {
        const respuesta = await obtenerCuentaCompleta(idCuenta);

        if (!respuesta.ok) return;

        const miembrosConDecision = respuesta.miembros.map((m) => ({
          ...m,
          decision: null
        }));

        setCuenta(respuesta.cuenta);
        setMiembros(miembrosConDecision);
        setCacheBust(Date.now());
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    if (idCuenta) cargarCuenta();
  }, [idCuenta]);

  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        const data = await obtenerPublicacionesConMultimedia(idCuenta);
        setPublicaciones(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (idCuenta) cargarPublicaciones();
  }, [idCuenta]);

  useEffect(() => {
    const cargarHashtags = async () => {
      const resultado = {};
      for (const pub of publicaciones) {
        const hs = await obtenerHashtagsPublicacion(pub.idPublicacion);
        resultado[pub.idPublicacion] = hs;
      }
      setHashtagsPorPublicacion(resultado);
    };
    if (publicaciones.length > 0) cargarHashtags();
  }, [publicaciones]);

  useEffect(() => {
    const cargarSeguidores = async () => {
      const supabase = getSupabaseBrowserClient();

      const { data } = await supabase
        .from("SeguimientoCuenta")
        .select(`
          idSeguido,
          created_at,
          Usuario (
            id,
            nombre,
            imagenPerfil,
            correoInstitucional
          )
        `)
        .eq("idCuenta", idCuenta)
        .order("created_at", { ascending: false });

      setSeguidores(data || []);
    };

    if (idCuenta) cargarSeguidores();
  }, [idCuenta, cacheBust]);

  useEffect(() => {
    const verificarFollow = async () => {
      if (!user) return;

      const supabase = getSupabaseBrowserClient();

      const { data } = await supabase
        .from("SeguimientoCuenta")
        .select("idSeguido")
        .eq("idUsuario", user.id)
        .eq("idCuenta", idCuenta)
        .single();

      setSiguiendo(!!data);
    };

    verificarFollow();
  }, [user, idCuenta]);

  const manejarFollow = async () => {
    if (!user) return;

    setProcesandoFollow(true);
    const supabase = getSupabaseBrowserClient();

    try {
      if (siguiendo) {
        await supabase
          .from("SeguimientoCuenta")
          .delete()
          .eq("idUsuario", user.id)
          .eq("idCuenta", idCuenta);

        setSiguiendo(false);
      } else {
        await supabase
          .from("SeguimientoCuenta")
          .insert({
            idUsuario: user.id,
            idCuenta: idCuenta
          });

        setSiguiendo(true);
      }

      setCacheBust(Date.now());
    } catch (error) {
      console.error("Error follow:", error);
    }

    setProcesandoFollow(false);
  };

  const toggleExpansionPublicacion = (idPublicacion) => {
    setPublicaciones((prev) =>
      prev.map((pub) =>
        pub.idPublicacion === idPublicacion
          ? { ...pub, expandida: !pub.expandida }
          : pub
      )
    );
  };

  if (cargando) return <Loader texto="Cargando cuenta..." />;
  if (!cuenta) return <ErrorMessage mensaje="Cuenta no encontrada" />;

  return (
    <div className={styles.contenedor}>
      <div
        className={styles.fondo}
        style={{
          backgroundImage: `url(${cuenta.imagenFondoCuenta}?t=${cacheBust})`
        }}
      />

      <section className={styles.fotoContainer}>
        <img
          src={`${cuenta.imagenCuenta}?t=${cacheBust}`}
          alt={`Imagen de perfil de ${cuenta.nombre}`}
          className={styles.foto}
        />
      </section>

      <PageTitle>{cuenta.nombre}</PageTitle>

      <section className={styles.seguidoresContainer}>
        <div className={styles.seguidoresHeader}>
          <p className={styles.seguidoresContador}>
            {seguidores.length} seguidores
          </p>

          <button
            className={
              siguiendo ? styles.botonSiguiendo : styles.botonSeguir
            }
            disabled={procesandoFollow}
            onClick={manejarFollow}
          >
            {procesandoFollow
              ? siguiendo
                ? "Dejando de seguir..."
                : "Siguiendo..."
              : siguiendo
              ? "Siguiendo"
              : "Seguir"}
          </button>
        </div>

        <div className={styles.seguidoresGrid}>
          {seguidores.slice(0, 9).map((s) => (
            <div key={s.idSeguido} className={styles.seguidorItem}>
              <img
                src={
                  s.Usuario?.imagenPerfil
                    ? `${s.Usuario.imagenPerfil}?t=${cacheBust}`
                    : "/default-user.png"
                }
                className={styles.seguidorFoto}
              />
              <p className={styles.seguidorNombre}>{s.Usuario?.nombre}</p>
            </div>
          ))}
        </div>

        {seguidores.length > 9 && (
          <button
            className={styles.botonVerTodos}
            onClick={() => setMostrarModalSeguidores(true)}
          >
            Ver todos los seguidores
          </button>
        )}
      </section>

      {mostrarModalSeguidores && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitulo}>Todos los seguidores</h3>

            <div className={styles.modalLista}>
              {seguidores.map((s) => (
                <div key={s.idSeguido} className={styles.modalItem}>
                  <img
                    src={
                      s.Usuario?.imagenPerfil
                        ? `${s.Usuario.imagenPerfil}?t=${cacheBust}`
                        : "/default-user.png"
                    }
                    className={styles.modalFoto}
                  />

                  <div>
                    <p className={styles.modalNombre}>{s.Usuario?.nombre}</p>
                    <p className={styles.modalCorreo}>
                      {s.Usuario?.correoInstitucional}
                    </p>
                    <time className={styles.modalFecha}>
                      Desde {new Date(s.created_at).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              ))}
            </div>

            <button
              className={styles.botonCerrarModal}
              onClick={() => setMostrarModalSeguidores(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <SectionCard titulo="Miembros de la cuenta">
        {miembros.length === 0 ? (
          <EmptyState
            titulo="Sin miembros"
            descripcion="No hay miembros registrados en esta cuenta."
            icono="👥"
          />
        ) : (
          <ul className={styles.adminGrid}>
            {miembros.map((m) => (
              <li key={m.idUsuario} className={styles.adminItem}>
                <img
                  src={
                    m.perfil?.imagenPerfil
                      ? `${m.perfil.imagenPerfil}?t=${cacheBust}`
                      : "/default-user.png"
                  }
                  className={styles.adminFoto}
                />
                <div>
                  <p className={styles.adminNombre}>{m.perfil?.nombre}</p>
                  <p className={styles.adminCorreo}>
                    {m.perfil?.correoInstitucional}
                  </p>
                  <span className={styles.adminRol}>{m.rol}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard titulo="Detalles de la cuenta">
        <p className={styles.descripcion}>
          {cuenta.descripcion || "Sin descripción."}
        </p>
      </SectionCard>

      <SectionCard titulo="Noticias / Artículos publicados">
        {publicaciones.length === 0 ? (
          <EmptyState
            titulo="Sin publicaciones"
            descripcion="No hay publicaciones registradas en esta cuenta."
            icono="📰"
          />
        ) : (
          <div className={styles.publicacionesLista}>
            {publicaciones.map((p) => (
              <PublicacionIG
                key={p.idPublicacion}
                publicacion={p}
                autor={p.autor}
                cacheBust={cacheBust}
                user={user}
                onToggleExpand={toggleExpansionPublicacion}
                hashtags={hashtagsPorPublicacion[p.idPublicacion] || []}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

