import styles from "./PendingRequestItem.module.css";

export default function PendingRequestItem({
  foto,
  nombre,
  correo,
  onAceptar,
  onRechazar
}) {
  return (
    <div className={styles.pendienteItem}>
      <img
        src={foto || "/default-user.png"}
        className={styles.pendienteFoto}
        alt="Foto del usuario"
      />

      <div className={styles.pendienteInfo}>
        <p className={styles.pendienteNombre}>{nombre}</p>
        <p className={styles.pendienteCorreo}>{correo}</p>
      </div>

      <div className={styles.pendienteBotones}>
        <button className={styles.botonAceptar} onClick={onAceptar}>
          Aceptar
        </button>

        <button className={styles.botonRechazar} onClick={onRechazar}>
          Rechazar
        </button>
      </div>
    </div>
  );
}
