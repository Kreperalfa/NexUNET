"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

import {
  obtenerPublicacionesCompletas, // ⭐ trae todas las publicaciones globales
  borrarPublicacion
} from "../../../lib/publicacion";

import ErrorMessage from "@/components/ui/ErrorMessage";
import Loader from "@/components/ui/Loader";
import PageTitle from "@/components/ui/PageTitle";
import SectionCard from "@/components/cards/SectionCard";
import HashtagChip from "@/components/ui/HashtagChip";
import EmptyState from "@/components/info/EmptyState";

import MediaCarousel from "@/components/media/MediaCarousel";
import YouTubePlayer from "@/components/media/YouTubePlayer";
import YouTubeThumbnail from "@/components/media/YouTubeThumbnail";

export default function NoticiasPage() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cacheBust] = useState(Date.now());
  const [expandidaId, setExpandidaId] = useState(null);

  const toggleExpansionPublicacion = (id) => {
    setExpandidaId(expandidaId === id ? null : id);
  };

  // ⭐ Cargar publicaciones globales
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

  // ⭐ Estados de carga
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
            {publicaciones.map((p) => {
              const expandida = expandidaId === p.idPublicacion;

              const resumen =
                p.contenido.length > 220
                  ? p.contenido.slice(0, 220) + "..."
                  : p.contenido;

              const portada =
                p.multimedia?.find((m) => m.tipoArchivo === "imagen")?.url ||
                null;

              return (
                <article key={p.idPublicacion} className={styles.publicacionCard}>
                  
                  {/* Cuenta y autor */}
                  <div className={styles.publicacionAutor}>
                    <img
                      src={
                        p.cuenta?.imagenCuenta
                          ? `${p.cuenta.imagenCuenta}?t=${cacheBust}`
                          : "/default-user.png"
                      }
                      className={styles.publicacionAutorFoto}
                    />
                    <div>
                      <p className={styles.publicacionAutorNombre}>
                        {p.cuenta?.nombre || "Cuenta desconocida"}
                      </p>

                      {/* Autor justo debajo del nombre de la cuenta */}
                      {p.autor && (
                        <p className={styles.publicacionAutorSecundario}>
                          Autor: {p.autor.nombre || "Autor desconocido"}
                        </p>
                      )}

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
                  {p.hashtags?.length > 0 && (
                    <div className={styles.publicacionHashtags}>
                      {p.hashtags.map((h) => (
                        <span key={h.idHashtag}>
                          <HashtagChip nombre={h.nombre} />
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandir */}
                  <button
                    className={styles.botonExpandir}
                    onClick={() => toggleExpansionPublicacion(p.idPublicacion)}
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
