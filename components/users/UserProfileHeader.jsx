"use client";

import styles from "./UserProfileHeader.module.css";

export default function UserProfileHeader({ fondo, foto, nombre, correo }) {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.fondo}
        style={{ backgroundImage: `url(${fondo || "/default-bg.png"})` }}
      />

      <div className={styles.fotoContainer}>
        <img
          src={foto || "/default-user.png"}
          alt="Foto de perfil"
          className={styles.foto}
        />

        <div className={styles.info}>
          <h1 className={styles.nombre}>{nombre}</h1>
        </div>
      </div>
    </div>
  );
}
