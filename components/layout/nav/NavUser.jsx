"use client";

import Link from "next/link";
import styles from "./NavUser.module.css";

/* ⭐ Roles por nivel */
const ROLES = {
  1: "Usuario",
  2: "Subadministrador",
  3: "Administrador total",
  4: "Coordinador de departamento",
  5: "Jefe de departamento",
  6: "Administrador institucional",
  7: "Superadministrador",
  8: "Desarrollador",
};

export default function NavUser({ perfil, cacheBust }) {
  if (!perfil) return null;

  const rol = ROLES[perfil.nivel] ?? "Rol desconocido";

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

      <div className={styles.info}>
        <span className={styles.correo}>{perfil.correoInstitucional}</span>

        {/* ⭐ Rol con responsividad */}
        <span className={styles.rol}>{rol}</span>
      </div>
    </Link>
  );
}
