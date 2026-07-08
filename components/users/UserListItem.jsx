"use client";

import Link from "next/link";
import styles from "./UserListItem.module.css";

export default function UserListItem({ id, nombre, imagenPerfil, correo }) {
  return (
    <div className={styles.card}>
      <img
        src={imagenPerfil || "/default-user.png"}
        alt={nombre}
        className={styles.foto}
      />

      <div className={styles.info}>
        <Link href={`/dashboard/perfil/${id}`} className={styles.nombre}>
          {nombre}
        </Link>

        <span className={styles.correo}>{correo}</span>
      </div>
    </div>
  );
}
