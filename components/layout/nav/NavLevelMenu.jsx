'use client';

import Link from "next/link";
import styles from "./NavLevelMenu.module.css";

export default function NavLevelMenu({
  opciones,
  abierto,
  setAbierto,
  IconoFlecha
}) {
  return (
    <div className={styles.contenedorSubmenu}>
      <button
        type="button"
        className={styles.enlace}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto(prev => !prev)}
      >
        Opciones de nivel
        <IconoFlecha className={abierto ? styles.flechaArriba : ""} />
      </button>

      {abierto && (
        <div className={styles.submenu} role="menu">
          {opciones.map(opcion => (
            <Link
              key={opcion.href}
              href={opcion.href}
              className={styles.itemSubmenu}
              role="menuitem"
              onClick={() => setAbierto(false)}
            >
              {opcion.etiqueta}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

