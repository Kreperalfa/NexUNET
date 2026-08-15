"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

import {
  obtenerCuentaCompleta,
  obtenerPublicacionesConMultimedia,
  obtenerHashtagsPublicacion
} from "@/lib/publicacion";

import styles from "./page.module.css";

export default function PerfilCuenta() {
  const params = useParams();
  const idCuenta = params.idCuenta;

  const [cuenta, setCuenta] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [hashtagsPorPublicacion, setHashtagsPorPublicacion] = useState({});
  const [user, setUser] = useState(null);
  const [cacheBust, setCacheBust] = useState(Date.now());
  const [cargando, setCargando] = useState(true);

  // Seguidores
  const [seguidores, setSeguidores] = useState([]);
  const [siguiendo, setSiguiendo] = useState(false);
  const [procesandoFollow, setProcesandoFollow] = useState(false);
  const [mostrarModalSeguidores, setMostrarModalSeguidores] = useState(false);

  /* ============================
     CARGAR USUARIO
     ============================ */
  useEffect(() => {
    const cargarUsuario = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);
    };
    cargarUsuario();
  }, []);

  /* ============================
     CARGAR CUENTA
     ============================ */
  useEffect(() => {
    const cargarCuenta = async () => {
      try {
        const respuesta = await obtenerCuentaCompleta(idCuenta);
        if (!respuesta.ok) return;
        setCuenta(respuesta.cuenta);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    if (idCuenta) cargarCuenta();
  }, [idCuenta]);

  /* ============================
     CARGAR PUBLICACIONES
     ============================ */
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

  /* ============================
     CARGAR HASHTAGS
     ============================ */
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

  /* ============================
     CARGAR SEGUIDORES
     ============================ */
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
            apellido,
            fotoPerfil,
            correo
          )
        `)
        .eq("idCuenta", idCuenta)
        .order("created_at", { ascending: false });

      setSeguidores(data || []);
    };

    if (idCuenta) cargarSeguidores();
  }, [idCuenta, cacheBust]);

  /* ============================
     VERIFICAR SI SIGUE
     ============================ */
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

  /* ============================
     ACCIÓN SEGUIR / DEJAR DE SEGUIR
     ============================ */
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

  /* ============================
     ESTADOS DE CARGA
     ============================ */
  if (cargando) return <Loader texto="Cargando cuenta..." />;
  if (!cuenta) return <ErrorMessage mensaje="Cuenta no encontrada" />;

  /* ============================
     RENDER
     ============================ */
  return (
    <div className={styles.contenedor}>
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
      </section>

      <PageTitle>{cuenta.nombre}</PageTitle>

      {/* ============================
          SEGUIDORES
         ============================ */}
      <section className={styles.seguidoresContainer}>
        <div className={styles.seguidoresHeader}>
          <p className={styles.seguidoresContador}>
            {seguidores.length} seguidores
          </p>

          <button
            className={
              siguiendo
                ? styles.botonSiguiendo
                : styles.botonSeguir
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

        {seguidores.length > 5 && (
          <button
            className={styles.botonVerTodos}
            onClick={() => setMostrarModalSeguidores(true)}
          >
            Ver todos los seguidores
          </button>
        )}
      </section>

      {/* MODAL */}
      {mostrarModalSeguidores && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitulo}>Todos los seguidores</h3>

            <div className={styles.modalLista}>
              {seguidores.map((s) => (
                <div key={s.idSeguido} className={styles.modalItem}>
                  <img
                    src={
                      s.Usuario?.fotoPerfil
                        ? `${s.Usuario.fotoPerfil}?t=${cacheBust}`
                        : "/default-user.png"
                    }
                    className={styles.modalFoto}
                  />

                  <div>
                    <p className={styles.modalNombre}>
                      {s.Usuario?.nombre} {s.Usuario?.apellido}
                    </p>
                    <p className={styles.modalCorreo}>{s.Usuario?.correo}</p>
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

      {/* Detalles */}
      <SectionCard titulo="Detalles de la cuenta">
        <p className={styles.descripcion}>
          {cuenta.descripcion || "Sin descripción."}
        </p>
      </SectionCard>

      {/* Miembros */}
      <SectionCard titulo="Miembros">
        {cuenta.miembros?.length === 0 ? (
          <EmptyState
            titulo="Sin miembros"
            descripcion="No hay miembros registrados en esta cuenta."
            icono="👥"
          />
        ) : (
          <ul className={styles.adminGrid}>
            {cuenta.miembros.map((m) => (
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
                        p.autor?.imagenPerfil
                          ? `${p.autor.imagenPerfil}?t=${cacheBust}`
                          : "/default-user.png"
                      }
                      className={styles.publicacionAutorFoto}
                    />
                    <div>
                      <p className={styles.publicacionAutorNombre}>
                        {p.autor?.nombre || "Autor desconocido"}
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

                  {/* Título */}
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
                      setPublicaciones((prev) =>
                        prev.map((pub) =>
                          pub.idPublicacion === p.idPublicacion
                            ? { ...pub, expandida: !pub.expandida }
                            : pub
                        )
                      )
                    }
                  >
                    {expandida ? "Ver menos" : "Ver más"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
