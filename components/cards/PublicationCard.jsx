import { useState } from "react";
import styles from "./PublicationCard.module.css";
import HashtagChip from "@/components/ui/HashtagChip";

export default function PublicationCard({
  publicacion,
  autor,
  hashtags,
  esAdmin,
  esAutor,
  onEditar,
  onEliminar
}) {
  const [expandido, setExpandido] = useState(false);

  // ✔ Usar contenido como descripción
  const descripcion = publicacion.contenido ?? "";

  return (
    <div className={styles.publicacionCard}>
      
      {/* Portada */}
      <div className={styles.portadaContainer}>
        {publicacion.imagenPortada ? (
          <img
            src={publicacion.imagenPortada}
            alt="Portada"
            className={styles.portadaImagen}
          />
        ) : (
          <div className={styles.portadaContainer}>Sin imagen</div>
        )}
      </div>

      {/* Título (contenido) */}
      <h3 className={styles.publicacionTitulo}>
        {publicacion.contenido}
      </h3>

      {/* Autor */}
      {autor && (
        <div className={styles.publicacionAutor}>
          <img
            src={autor.perfil?.imagenPerfil || "/default-user.png"}
            alt="Autor"
            className={styles.publicacionAutorFoto}
          />
          <span className={styles.publicacionAutorNombre}>
            {autor.perfil?.nombre} ({autor.rol})
          </span>
        </div>
      )}

      {/* Hashtags */}
      <div className={styles.publicacionHashtags}>
        {hashtags.map((h) => (
          <HashtagChip key={h.idHashtag} texto={h.nombre} />
        ))}
      </div>

      {/* Descripción */}
      <p className={styles.publicacionContenido}>
        {expandido
          ? descripcion
          : descripcion.slice(0, 150) + "..."}
      </p>

      <button
        className={styles.botonExpandir}
        onClick={() => setExpandido(!expandido)}
      >
        {expandido ? "Ver menos" : "Ver más"}
      </button>

      {/* Acciones */}
      {(esAdmin || esAutor) && (
        <div className={styles.publicacionAcciones}>
          <button className={styles.botonEditar} onClick={onEditar}>
            Editar
          </button>
          <button className={styles.botonEliminar} onClick={onEliminar}>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}


