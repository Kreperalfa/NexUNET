"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  obtenerCuentaCompleta,
  actualizarEstadoMiembro
} from "../../../../../../lib/cuenta";

import {
  obtenerHashtagsPublicacion,
  obtenerPublicacionesConMultimedia,
  borrarPublicacion
} from "../../../../../../lib/publicacion";

import {
  darLike,
  quitarLike,
  tieneLike,
  contarLikes
} from "../../../../../../lib/reacciones";

import {
  crearComentario,
  obtenerComentariosPublicacion,
  contarComentarios
} from "../../../../../../lib/comentario";

import {
  seguirCuenta,
  dejarDeSeguirCuenta,
  verificarSeguimiento
} from "../../../../../../lib/seguimiento";

import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";

import ErrorMessage from "@/components/ui/ErrorMessage";
import SuccessMessage from "@/components/ui/SuccessMessage";
import Loader from "@/components/ui/Loader";
import PageTitle from "@/components/ui/PageTitle";
import SectionCard from "@/components/cards/SectionCard";
import AdminButton from "@/components/buttons/AdminButton";
import BigButton from "@/components/buttons/BigButton";
import PendingRequestItem from "@/components/cards/PendingRequestItem";
import HashtagChip from "@/components/ui/HashtagChip";
import EmptyState from "@/components/info/EmptyState";

import MediaCarousel from "@/components/media/MediaCarousel";
import YouTubePlayer from "@/components/media/YouTubePlayer";
import YouTubeThumbnail from "@/components/media/YouTubeThumbnail";

import styles from "./page.module.css";

/* ============================================================
   COMPONENTE HIJO: PublicacionCardPrincipalCuenta
============================================================ */
function PublicacionCardPrincipalCuenta({
  publicacion,
  autor,
  cacheBust,
  user,
  esAdmin,
  puedeEditar,
  onToggleExpand,
  onBorrar,
  hashtags
}) {
  const router = useRouter();

  const supabase = getSupabaseBrowserClient();

  const expandida = publicacion.expandida || false;

  // PORTADA Y CARRUSEL MIXTO
  const portada =
    publicacion.multimedia?.find((m) => m.tipoArchivo === "imagen")?.url ||
    null;

  const imagenesAdicionales = publicacion.multimedia?.filter(
    (m) => m.tipoArchivo === "imagen" && m.url !== portada
  ) || [];

  const videosLocales = publicacion.multimedia?.filter(
    (m) => m.tipoArchivo === "video"
  ) || [];

  const carruselMixto = [...imagenesAdicionales, ...videosLocales];

  const resumen =
    publicacion.contenido.length > 220
      ? publicacion.contenido.slice(0, 220) + "..."
      : publicacion.contenido;

  // LIKES
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const cargarLikes = async () => {
      if (!user?.id) return;
      const yaTiene = await tieneLike(user.id, publicacion.idPublicacion, "PUBLICACION");
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

  // COMENTARIOS
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [comentariosCount, setComentariosCount] = useState(0);

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

  const enviarComentario = async () => {
    if (!user?.id || !nuevoComentario.trim()) return;
    try {
      await crearComentario(user.id, publicacion.idPublicacion, nuevoComentario);
      setNuevoComentario("");

      const data = await obtenerComentariosPublicacion(publicacion.idPublicacion);
      setComentarios(data);

      const total = await contarComentarios(publicacion.idPublicacion);
      setComentariosCount(total);
    } catch (err) {
      console.error("Error creando comentario:", err);
    }
  };

  return (
    <article className={styles.publicacionCard}>
      {/* Autor */}
      <div className={styles.publicacionAutor}>
        <img
          src={
            autor?.perfil?.imagenPerfil
              ? `${autor.perfil.imagenPerfil}?t=${cacheBust}`
              : "/default-user.png"
          }
          className={styles.publicacionAutorFoto}
          alt={`Foto de ${autor?.perfil?.nombre || "Autor desconocido"}`}
        />
        <div>
          <p className={styles.publicacionAutorNombre}>
            {autor?.perfil?.nombre || "Autor desconocido"}
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

      {/* Carrusel mixto */}
      {expandida && carruselMixto.length > 0 && (
        <MediaCarousel items={carruselMixto} />
      )}

      {/* YouTube */}
      {expandida && publicacion.youtubeURL && (
        <YouTubePlayer url={publicacion.youtubeURL} />
      )}

      {/* Hashtags */}
      {hashtags?.length > 0 && (
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

        {/* Like */}
        <button
          className={styles.botonEditar}
          onClick={toggleLike}
        >
          {liked ? "❤️" : "🤍"} {likeCount}
        </button>

        {/* Comentarios contador */}
        <button
          className={styles.botonEditar}
          onClick={() => onToggleExpand(publicacion.idPublicacion)}
        >
          💬 {comentariosCount}
        </button>

        {/* Editar / Eliminar (se mantienen) */}
        {expandida && (
          <>
            {puedeEditar && (
              <button
                className={styles.botonEditar}
                onClick={() =>
                  router.push(
                    `/dashboard/cuenta/abrir-cuenta/${publicacion.idCuenta}/editar-publicacion/${publicacion.idPublicacion}`
                  )
                }
              >
                Editar
              </button>
            )}

            {esAdmin && (
              <button
                className={styles.botonEliminar}
                onClick={() => onBorrar(publicacion.idPublicacion)}
              >
                Eliminar
              </button>
            )}
          </>
        )}
      </div>

      {/* Comentarios */}
      {expandida && (
        <div className={styles.comentariosSection}>
          <h4>Comentarios</h4>

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

          {comentarios.length === 0 ? (
            <p className={styles.comentarioEmpty}>No hay comentarios aún.</p>
          ) : (
            <ul className={styles.comentarioList}>
              {comentarios.map((c) => (
                <li key={c.idComentario} className={styles.comentarioItem}>
                  <img
                    src={c.Usuario?.imagenPerfil || "/default-user.png"}
                    className={styles.comentarioAutorFoto}
                  />
                  <div>
                    <p className={styles.comentarioAutor}>
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
   COMPONENTE PRINCIPAL: PrincipalCuenta
============================================================ */
export default function PrincipalCuenta() {
  const params = useParams();
  const idCuenta = params.idCuenta;
  const router = useRouter();

  const supabase = getSupabaseBrowserClient();

  const [cacheBust, setCacheBust] = useState(Date.now());
  const [cuenta, setCuenta] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [seguidores, setSeguidores] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(null);
  const [user, setUser] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [hashtagsPorPublicacion, setHashtagsPorPublicacion] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);
    };
    cargarUsuario();
  }, []);

  const cargarSeguidores = async () => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      setSeguidores(data || []);
    } catch (error) {
      console.error("Error cargando seguidores:", error);
    }
  };

  const toggleSeguir = async () => {
    try {
      const yaSigue = seguidores.some(s => s.Usuario?.id === user.id);

      if (yaSigue) {
        await dejarDeSeguirCuenta(user.id, idCuenta);
      } else {
        await seguirCuenta(user.id, idCuenta);
      }

      cargarSeguidores();
    } catch (error) {
      console.error("Error siguiendo cuenta:", error);
    }
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

  const manejarBorrarPublicacion = async (idPublicacion) => {
    try {
      const confirmado = window.confirm("¿Seguro que quieres borrar esta publicación?");
      if (!confirmado) return;

      await borrarPublicacion(idPublicacion);
      setMensaje("Publicación borrada correctamente");
      setTipoMensaje("success");

      await cargarPublicaciones();
    } catch (error) {
      console.error("Error borrando publicación:", error);
      setMensaje("Error borrando publicación");
      setTipoMensaje("error");
    }
  };

  const cargarCuenta = async () => {
    try {
      setCargando(true);
      const respuesta = await obtenerCuentaCompleta(idCuenta);

      if (!respuesta.ok) {
        setMensaje(respuesta.mensaje);
        setTipoMensaje("error");
        return;
      }

      const miembrosConDecision = respuesta.miembros.map((m) => ({
        ...m,
        decision: null
      }));

      setCuenta(respuesta.cuenta);
      setMiembros(miembrosConDecision);
      setMensaje("");
      setTipoMensaje(null);
      setCacheBust(Date.now());
    } catch (error) {
      setMensaje("Error al cargar la cuenta");
      setTipoMensaje("error");
      console.error("Error cargando cuenta:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (idCuenta) cargarCuenta();
  }, [idCuenta]);

  const cargarPublicaciones = async () => {
    try {
      const data = await obtenerPublicacionesConMultimedia(idCuenta);
      setPublicaciones(data);
    } catch (error) {
      console.error("Error cargando publicaciones:", error);
      setMensaje("Error al cargar publicaciones");
      setTipoMensaje("error");
    }
  };

  useEffect(() => {
    if (idCuenta) cargarPublicaciones();
  }, [idCuenta]);

  useEffect(() => {
    const cargarHashtags = async () => {
      try {
        const resultado = {};
        for (const pub of publicaciones) {
          const hs = await obtenerHashtagsPublicacion(pub.idPublicacion);
          resultado[pub.idPublicacion] = hs;
        }
        setHashtagsPorPublicacion(resultado);
      } catch (error) {
        console.error("Error cargando hashtags:", error);
      }
    };
    if (publicaciones.length > 0) cargarHashtags();
  }, [publicaciones]);

  useEffect(() => {
    if (idCuenta) cargarSeguidores();
  }, [idCuenta]);

  if (cargando) return <Loader texto="Cargando cuenta..." />;

  if (!cuenta || !user) {
    return <Loader texto="Cargando información..." />;
  }

  const esAdmin = miembros.some(
    (m) => m.idUsuario === user.id && m.rol === "Admin"
  );

  const esSubAdmin = miembros.some(
    (m) => m.idUsuario === user.id && m.rol === "SubAdmin"
  );

  const puedePublicar = esAdmin || esSubAdmin;

  const pendientes = miembros.filter((m) => m.estado === "pendiente");

  const yaSigue = seguidores.some(s => s.Usuario?.id === user.id);

  return (
    <div className={styles.contenedor}>
      {mensaje && tipoMensaje === "success" && (
        <SuccessMessage mensaje={mensaje} />
      )}
      {mensaje && tipoMensaje === "error" && (
        <ErrorMessage mensaje={mensaje} />
      )}

      <div
        className={styles.fondo}
        style={{ backgroundImage: `url(${cuenta.imagenFondoCuenta}?t=${cacheBust})` }}
      />

      <section className={styles.fotoContainer}>
        <img
          src={`${cuenta.imagenCuenta}?t=${cacheBust}`}
          alt={`Imagen de perfil de ${cuenta.nombre}`}
          className={styles.foto}
        />

        <button
          className={styles.botonSecundario}
          onClick={() => window.open(`${cuenta.imagenCuenta}?t=${cacheBust}`, "_blank")}
        >
          Ver foto
        </button>
      </section>

      <PageTitle>{cuenta.nombre}</PageTitle>

      <button
        className={styles.botonVerPublico}
        onClick={() =>
          router.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}`)
        }
      >
        Ver perfil público
      </button>

      <button
        className={styles.botonSecundario}
        onClick={toggleSeguir}
      >
        {yaSigue ? "Dejar de seguir" : "Seguir"}
      </button>

      <SectionCard titulo="Detalles de la cuenta">
        <p className={styles.descripcion}>
          {cuenta.descripcion || "Sin descripción."}
        </p>
      </SectionCard>

      <SectionCard titulo="Estadísticas generales">
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <p className={styles.statNumero}>{seguidores.length}</p>
            <p className={styles.statLabel}>Seguidores</p>
          </div>

          <div className={styles.statItem}>
            <p className={styles.statNumero}>
              {miembros.filter((m) => m.estado === "activo").length}
            </p>
            <p className={styles.statLabel}>Miembros activos</p>
          </div>

          <div className={styles.statItem}>
            <p className={styles.statNumero}>{pendientes.length}</p>
            <p className={styles.statLabel}>Solicitudes pendientes</p>
          </div>

          <div className={styles.statItem}>
            <p className={styles.statNumero}>{publicaciones.length}</p>
            <p className={styles.statLabel}>Publicaciones</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard titulo="Seguidores">
        {seguidores.length === 0 ? (
          <EmptyState
            titulo="Sin seguidores"
            descripcion="Esta cuenta aún no tiene seguidores."
            icono="👥"
          />
        ) : (
          <ul className={styles.adminGrid}>
            {seguidores.map((s) => (
              <li key={s.idSeguido} className={styles.adminItem}>
                <img
                  src={
                    s.Usuario?.imagenPerfil
                      ? `${s.Usuario.imagenPerfil}?t=${cacheBust}`
                      : "/default-user.png"
                  }
                  className={styles.adminFoto}
                />
                <div>
                  <p className={styles.adminNombre}>
                    {s.Usuario?.nombre}
                  </p>
                  <p className={styles.adminCorreo}>
                    {s.Usuario?.correoInstitucional}
                  </p>
                  <p className={styles.publicacionFecha}>
                    Seguidor desde: {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

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
                  <div className={styles.rolEstado}>
                    <span className={styles.adminRol}>{m.rol}</span>
                    <span
                      className={`${styles.estado} ${
                        styles[
                          `estado${
                            m.estado.charAt(0).toUpperCase() + m.estado.slice(1)
                          }`
                        ]
                      }`}
                    >
                      {m.estado === "pendiente" && "⏳ Pendiente"}
                      {m.estado === "activo" && "✅ Activo"}
                      {m.estado === "rechazado" && "❌ Rechazado"}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {esAdmin && (
        <SectionCard titulo="Solicitudes de acceso">
          {pendientes.length === 0 ? (
            <EmptyState
              titulo="Sin solicitudes pendientes"
              descripcion="No hay solicitudes de acceso en este momento."
              icono="📋"
            />
          ) : (
            <div>
              {pendientes.map((m) => (
                <PendingRequestItem
                  key={m.idUsuario}
                  foto={m.perfil?.imagenPerfil || "/default-user.png"}
                  nombre={m.perfil?.nombre}
                  correo={m.perfil?.correoInstitucional}
                  onAceptar={() => actualizarEstadoMiembro(m.idUsuario, idCuenta, "aceptado")}
                  onRechazar={() => actualizarEstadoMiembro(m.idUsuario, idCuenta, "rechazado")}
                />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      <div className={styles.botonesGrid}>
        <BigButton onClick={() => router.push("/dashboard/noticias")}>
          Ver noticias
        </BigButton>
        <BigButton onClick={() => router.push("/dashboard/foro/listado-materia")}>
          Ver foros
        </BigButton>
      </div>

      {puedePublicar && (
        <SectionCard titulo="Publicar contenido">
          <div className={styles.adminOpcionesGrid}>
            <AdminButton
              onClick={() =>
                router.push(
                  `/dashboard/cuenta/abrir-cuenta/${cuenta.idCuenta}/publicar-noticia`
                )
              }
            >
              Publicar noticia
            </AdminButton>

            <AdminButton
              onClick={() =>
                router.push(
                  `/dashboard/cuenta/abrir-cuenta/${cuenta.idCuenta}/publicar-foro`
                )
              }
            >
              Publicar foro
            </AdminButton>
          </div>
        </SectionCard>
      )}

      <SectionCard titulo="Noticias / Artículos publicados">
        {publicaciones.length === 0 ? (
          <EmptyState
            titulo="Sin publicaciones"
            descripcion="No hay publicaciones registradas en esta cuenta."
            icono="📰"
          />
        ) : (
          <div className={styles.publicacionesLista}>
            {publicaciones.map((p) => {
              const autor = miembros.find(
                (m) => m.idUsuario === p.idUsuarioAutor
              );

              const puedeEditar = p.idUsuarioAutor === user.id;

              const hashtags = hashtagsPorPublicacion[p.idPublicacion] || [];

              return (
                <PublicacionCardPrincipalCuenta
                  key={p.idPublicacion}
                  publicacion={p}
                  autor={autor}
                  cacheBust={cacheBust}
                  user={user}
                  esAdmin={esAdmin}
                  puedeEditar={puedeEditar}
                  onToggleExpand={toggleExpansionPublicacion}
                  onBorrar={manejarBorrarPublicacion}
                  hashtags={hashtags}
                />
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

