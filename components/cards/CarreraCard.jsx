import styles from "./CarreraCard.module.css";

/**
 * CarreraCard - Componente para mostrar información de una carrera
 * 
 * Props:
 * @param {object} carrera - Objeto con datos: {idCarrera, nombreCarrera, created_at, idUsuarioCreador}
 * @param {Function} onEdit - Callback al hacer click en Editar
 * @param {Function} onDelete - Callback al hacer click en Eliminar (opcional)
 * @param {string} nombreCreador - Nombre del usuario creador (opcional)
 * @param {boolean} mostrarAcciones - Mostrar botones de editar/eliminar (defecto: true)
 * 
 * Escalable para:
 * - Agregar más acciones (duplicar, vista previa, etc.)
 * - Mostrar estadísticas (materias vinculadas, estudiantes, etc.)
 * - Cambiar estado (activo, inactivo, archivado)
 * - Agregar badges/etiquetas
 */
export default function CarreraCard({
  carrera,
  onEdit,
  onDelete = null,
  nombreCreador = "Usuario desconocido",
  mostrarAcciones = true,
}) {
  if (!carrera) return null;

  // Formatear fecha de creación
  const fechaFormato = new Date(carrera.created_at).toLocaleDateString();

  return (
    <div className={styles.card} role="article" aria-label={`Carrera: ${carrera.nombreCarrera}`}>
      {/* Encabezado con nombre de carrera */}
      <div className={styles.encabezado}>
        <h3 className={styles.nombre}>{carrera.nombreCarrera}</h3>
      </div>

      {/* Información de la carrera */}
      <div className={styles.informacion}>
        <div className={styles.fila}>
          <span className={styles.etiqueta}>Creador:</span>
          <span className={styles.valor}>{nombreCreador}</span>
        </div>

        <div className={styles.fila}>
          <span className={styles.etiqueta}>Creada:</span>
          <time className={styles.valor} dateTime={carrera.created_at}>
            {fechaFormato}
          </time>
        </div>

        <div className={styles.fila}>
          <span className={styles.etiqueta}>ID:</span>
          <code className={styles.id}>{carrera.idCarrera}</code>
        </div>
      </div>

      {/* Botones de acción */}
      {mostrarAcciones && (
        <div className={styles.acciones} role="group" aria-label="Acciones de carrera">
          <button
            className={`${styles.boton} ${styles.botonEditar}`}
            onClick={() => onEdit(carrera)}
            aria-label={`Editar carrera ${carrera.nombreCarrera}`}
          >
            Editar
          </button>

        </div>
      )}
    </div>
  );
}