"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  obtenerCuentaCompleta,
  actualizarEstadoMiembro
} from "../../../../../../lib/cuenta";

import {
  obtenerHashtagsPublicacion,
  obtenerPublicacionesConMultimedia
} from "../../../../../../lib/publicacion";

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

export default function PrincipalCuenta() {
  const params = useParams();
  const idCuenta = params.idCuenta;
  const router = useRouter();
  const [cacheBust, setCacheBust] = useState(Date.now());
  const [cuenta, setCuenta] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(null);
  const [user, setUser] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [hashtagsPorPublicacion, setHashtagsPorPublicacion] = useState({});
  const [cargando, setCargando] = useState(true);

  /* ============================================================
     USUARIO AUTENTICADO
     ============================================================ */
  useEffect(() => {
    const cargarUsuario = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);
    };
    cargarUsuario();
  }, []);

  /* ============================================================
     CARGAR CUENTA
     ============================================================ */
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

  /* ============================================================
     CARGAR PUBLICACIONES
     ============================================================ */
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

  /* ============================================================
     CARGAR HASHTAGS POR PUBLICACIÓN
     ============================================================ */
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

  /* ============================================================
     ESTADOS DE CARGA Y ERROR
     ============================================================ */
  if (cargando) return <Loader texto="Cargando cuenta..." />;

  if (mensaje && tipoMensaje === "error") {
    return (
      <div className={styles.contenedor}>
        <ErrorMessage mensaje={mensaje} />
      </div>
    );
  }

  if (!cuenta || !user) {
    return (
      <div className={styles.contenedor}>
        <Loader texto="Cargando información..." />
      </div>
    );
  }

  /* ============================================================
     ROLES Y PERMISOS
     ============================================================ */
  const esAdmin = miembros.some(
    (m) => m.idUsuario === user.id && m.rol === "Admin"
  );

  const esSubAdmin = miembros.some(
    (m) => m.idUsuario === user.id && m.rol === "SubAdmin"
  );

  const puedePublicar = esAdmin || esSubAdmin;

  const administradores = miembros.filter(
    (m) => m.rol === "Admin" && m.estado !== "rechazado"
  );

  const pendientes = miembros.filter((m) => m.estado === "pendiente");

  /* ============================================================
     ACEPTAR / RECHAZAR SOLICITUDES
     ============================================================ */
  const procesarDecision = async (idUsuarioMiembro, decision) => {
    const nuevoEstado = decision === "aceptado" ? "activo" : "rechazado";

    try {
      const respuesta = await actualizarEstadoMiembro(
        cuenta.idCuenta,
        idUsuarioMiembro,
        nuevoEstado
      );

      if (!respuesta.ok) {
        setMensaje(respuesta.mensaje);
        setTipoMensaje("error");
        return;
      }

      setMiembros((prev) =>
        prev.map((m) =>
          m.idUsuario === idUsuarioMiembro ? { ...m, decision } : m
        )
      );

      setMensaje(
        `Solicitud ${
          decision === "aceptado" ? "aceptada" : "rechazada"
        } correctamente`
      );
      setTipoMensaje("success");

      await cargarCuenta();
    } catch (error) {
      setMensaje("Error procesando solicitud");
      setTipoMensaje("error");
      console.error("Error procesando decisión:", error);
    }
  };

  /* ============================================================
     TOGGLE EXPANSIÓN DE PUBLICACIÓN
     ============================================================ */
  const toggleExpansionPublicacion = (idPublicacion) => {
    setPublicaciones((prev) =>
      prev.map((pub) =>
        pub.idPublicacion === idPublicacion
          ? { ...pub, expandida: !pub.expandida }
          : pub
      )
    );
  };

  /* ============================================================
     RENDERIZADO
     ============================================================ */
  return (
    <div className={styles.contenedor}>
      {mensaje && tipoMensaje === "success" && (
        <SuccessMessage mensaje={mensaje} />
      )}

      {mensaje && tipoMensaje === "error" && (
        <ErrorMessage mensaje={mensaje} />
      )}

      {/* Fondo */}
      <div
        className={styles.fondo}
        style={{ backgroundImage: `url(${cuenta.imagenFondoCuenta}?t=${cacheBust})` }}
      />

      {/* Foto */}
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

      {/* Detalles */}
      <SectionCard titulo="Detalles de la cuenta">
        <p className={styles.descripcion}>
          {cuenta.descripcion || "Sin descripción."}
        </p>
      </SectionCard>

      {/* Miembros */}
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
                      ? `${m.perfil.imagenPerfil}?t=${cacheBust}` // ⭐ cache busting aplicado
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

      {/* Opciones administrativas */}
      {esAdmin && (
        <SectionCard titulo="Opciones administrativas">
          <div className={styles.adminOpcionesGrid}>
            <AdminButton
              onClick={() =>
                router.push(
                  `/dashboard/cuenta/abrir-cuenta/${cuenta.idCuenta}/editar-cuenta`
                )
              }
            >
              Editar cuenta
            </AdminButton>

            <AdminButton
              onClick={() =>
                router.push(
                  `/dashboard/cuenta/abrir-cuenta/${cuenta.idCuenta}/cambiar-clave`
                )
              }
            >
              Cambiar clave
            </AdminButton>

            {cuenta.cuentaDepartamento && (
              <AdminButton
                onClick={() =>
                  router.push(
                    `/dashboard/cuenta/abrir-cuenta/${cuenta.idCuenta}/materia`
                  )
                }
              >
                Materias
              </AdminButton>
            )}
          </div>
        </SectionCard>
      )}

      {/* Solicitudes pendientes */}
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
                  onAceptar={() => procesarDecision(m.idUsuario, "aceptado")}
                  onRechazar={() => procesarDecision(m.idUsuario, "rechazado")}
                />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Botones grandes */}
      <div className={styles.botonesGrid}>
        <BigButton onClick={() => router.push("/dashboard/noticias")}>
          Ver noticias
        </BigButton>
        <BigButton onClick={() => router.push("/dashboard/foro/listado-materia")}>
          Ver foros
        </BigButton>
      </div>

      {/* Publicar */}
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

      {/* Publicaciones */}
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
              const expandida = p.expandida || false;

              const resumen =
                p.contenido.length > 220
                  ? p.contenido.slice(0, 220) + "..."
                  : p.contenido;

              const portada =
                p.multimedia?.find((m) => m.tipoArchivo === "imagen")?.url ||
                null;

              return (
                <article key={p.idPublicacion} className={styles.publicacionCard}>
                  {/* Autor */}
                  <div className={styles.publicacionAutor}>
                    <img
                      src={
                        autor?.perfil?.imagenPerfil
                          ? `${autor.perfil.imagenPerfil}?t=${cacheBust}` // ⭐ cache busting aplicado
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
                        {new Date(p.fechaCreacion).toLocaleString()}
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
                    ) : p.youtubeURL ? (
                      <YouTubeThumbnail
                        url={p.youtubeURL}
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

                  {/* Títulos */}
                  {p.titulo && (
                    <h3 className={styles.publicacionTitulo}>{p.titulo}</h3>
                  )}

                  {/* Contenido */}
                  <p className={styles.publicacionContenido}>
                    {expandida ? p.contenido : resumen}
                  </p>

                  {/* Carrusel */}
                  {expandida && p.multimedia?.length > 0 && (
                    <MediaCarousel items={p.multimedia} />
                  )}

                  {/* YouTube */}
                  {expandida && p.youtubeURL && (
                    <YouTubePlayer url={p.youtubeURL} />
                  )}

                  {/* Hashtags */}
                  {hashtagsPorPublicacion[p.idPublicacion]?.length > 0 && (
                    <div className={styles.publicacionHashtags}>
                      {hashtagsPorPublicacion[p.idPublicacion].map((h) => (
                        <span key={h.idHashtag}>
                          <HashtagChip nombre={h.nombre} />
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandir */}
                  <button
                    className={styles.botonExpandir}
                    onClick={() =>
                      toggleExpansionPublicacion(p.idPublicacion)
                    }
                  >
                    {expandida ? "Ver menos" : "Ver más"}
                  </button>

                  {/* Acciones */}
                  {expandida && (
                    <div className={styles.publicacionAcciones}>
                      {p.idUsuarioAutor === user.id && (
                        <button
                          className={styles.botonEditar}
                          onClick={() =>
                            router.push(
                              `/dashboard/cuenta/abrir-cuenta/${cuenta.idCuenta}/editar-publicacion/${p.idPublicacion}`
                            )
                          }
                        >
                          Editar
                        </button>
                      )}

                      {esAdmin && (
                        <button
                          className={styles.botonEliminar}
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Está seguro de que desea eliminar esta publicación?"
                              )
                            ) {
                              console.log("Eliminar publicación:", p.idPublicacion);
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
