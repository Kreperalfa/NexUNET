'use client';

import Link from "next/link";
import styles from "./NavUser.module.css";

export default function NavUser({ perfil, cacheBust }) {
  if (!perfil) return null;

  return (
    <Link
      href={`/dashboard/perfil/${perfil.id}`}
      className={styles.detalleUsuario}
    >
      <img
        src={
          perfil.imagenPerfil
            ? `${perfil.imagenPerfil}?t=${cacheBust}`
            : "/default-user.png"
        }
        alt={`Foto de ${perfil.correoInstitucional}`}
        className={styles.avatar}
      />
      <span className={styles.correo}>{perfil.correoInstitucional}</span>
    </Link>
  );
}
