"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { logoutUser } from "@/lib/auth";
import { cargarPerfilUsuario } from "@/lib/perfil";

import styles from "./Nav.module.css";

import NavUser from "./nav/NavUser";
import NavLevelMenu from "./nav/NavLevelMenu";

/* ⭐ Íconos correctos */
import {
  IconoInicio,
  IconoCampana,
  IconoSalir,
  IconoFlecha,

  /* Íconos nuevos */
  IconoListaUsuarios,
  IconoNoticiasAlt,
  IconoAbrirCuenta,
  IconoDirectorio,
  IconoForoAlt,
  IconoPanelAdmin
} from "./nav/NavIcons";

/* ⭐ Opciones por nivel */
const OPCIONES_POR_NIVEL = {
  7: [
    { etiqueta: "Crear cuenta", href: "/dashboard/cuenta/crear-cuenta" },
    { etiqueta: "Crear carrera", href: "/dashboard/carrera/crear-carrera" },
  ],
  8: [
    { etiqueta: "Crear cuenta", href: "/dashboard/cuenta/crear-cuenta" },
    { etiqueta: "Crear carrera", href: "/dashboard/carrera/crear-carrera" },
  ],
};

export default function Nav() {
  const [perfil, setPerfil] = useState(null);
  const [expandido, setExpandido] = useState(true);
  const [submenuAbierto, setSubmenuAbierto] = useState(false);
  const submenuRef = useRef(null);
  const router = useRouter();
  const [cacheBust, setCacheBust] = useState(Date.now());

  /* ⭐ Cargar perfil */
  useEffect(() => {
    async function cargar() {
      const resultado = await cargarPerfilUsuario();
      if (resultado.ok) {
        setPerfil(resultado.perfil);
        setCacheBust(Date.now());
      }
    }
    cargar();
  }, []);

  const nivel = perfil?.nivel ?? null;
  const opcionesNivel = OPCIONES_POR_NIVEL[nivel] ?? [];

  /* ⭐ Cerrar submenu al hacer clic fuera */
  useEffect(() => {
    function manejarClicFuera(e) {
      if (submenuRef.current && !submenuRef.current.contains(e.target)) {
        setSubmenuAbierto(false);
      }
    }
    if (submenuAbierto) {
      document.addEventListener("mousedown", manejarClicFuera);
    }
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, [submenuAbierto]);

  const alternarMenu = () => {
    setExpandido(prev => !prev);
    setSubmenuAbierto(false);
  };

  /* ⭐ Cerrar sesión */
  const manejoLogout = async () => {
    const { ok, error } = await logoutUser();
    if (!ok) {
      alert(error);
      return;
    }
    router.push("/");
  };

  return (
    <div className={styles.contenedor}>
      {expandido ? (
        <nav className={styles.navExpandido}>
          <div className={styles.fila}>
            <div className={styles.grupo}>

              {/* ⭐ Lista usuarios */}
              <Link href="/dashboard/perfil/lista-usuarios" className={styles.enlace}>
                <IconoListaUsuarios />
                <span>Lista usuarios</span>
              </Link>

              {/* ⭐ Noticias */}
              <Link href="/dashboard/noticias" className={styles.enlace}>
                <IconoNoticiasAlt />
                <span>Ver noticias</span>
              </Link>

              {/* ⭐ Abrir cuenta */}
              <Link href="/dashboard/cuenta/abrir-cuenta" className={styles.enlace}>
                <IconoAbrirCuenta />
                <span>Abrir cuenta</span>
              </Link>

              {/* ⭐ Directorio de cuentas */}
              <Link href="/dashboard/cuenta" className={styles.enlace}>
                <IconoDirectorio />
                <span>Directorio de cuentas</span>
              </Link>

              {/* ⭐ Foro */}
              <Link href="/dashboard/foro/listado-materia" className={styles.enlace}>
                <IconoForoAlt />
                <span>Abrir foro</span>
              </Link>

              {/* ⭐ Panel Admin */}
              {nivel >= 4 && (
                <Link href="/dashboard/admin" className={styles.enlace}>
                  <IconoPanelAdmin />
                  <span>Panel Admin</span>
                </Link>
              )}

            </div>

            {perfil && (
              <div className={styles.grupo}>
                <NavUser perfil={perfil} cacheBust={cacheBust} />
                <span className={styles.separadorVertical} />
                <button
                  type="button"
                  className={styles.botonIcono}
                  aria-label="Cerrar sesión"
                  onClick={manejoLogout}
                >
                  <IconoSalir />
                </button>
              </div>
            )}
          </div>

          <div className={`${styles.fila} ${styles.filaInferior}`}>
            <div className={styles.grupo}>
              <button
                type="button"
                className={styles.botonIcono}
                aria-label="Inicio"
                onClick={() => router.push("/dashboard")}
              >
                <IconoInicio />
              </button>

              {opcionesNivel.length > 0 && (
                <>
                  <span className={styles.separadorVertical} />
                  <div ref={submenuRef}>
                    <NavLevelMenu
                      opciones={opcionesNivel}
                      abierto={submenuAbierto}
                      setAbierto={setSubmenuAbierto}
                      IconoFlecha={IconoFlecha}
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              className={styles.botonIcono}
              style={{ position: "relative" }}
              aria-label="Notificaciones"
            >
              <IconoCampana />
              <span className={styles.puntoInsignia} />
            </button>
          </div>
        </nav>
      ) : (
        <div className={styles.navColapsado}>
          <button
            type="button"
            className={styles.botonIcono}
            aria-label="Inicio"
            onClick={() => router.push("/dashboard")}
          >
            <IconoInicio />
          </button>

          <div className={styles.grupo}>
            <button
              type="button"
              className={styles.botonIcono}
              style={{ position: "relative" }}
              aria-label="Notificaciones"
            >
              <IconoCampana />
              <span className={styles.puntoInsignia} />
            </button>

            <NavUser perfil={perfil} cacheBust={cacheBust} />

            <button
              type="button"
              className={styles.botonIcono}
              aria-label="Cerrar sesión"
              onClick={manejoLogout}
            >
              <IconoSalir />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.pestanaToggle}
        aria-label={expandido ? "Contraer menú" : "Expandir menú"}
        aria-expanded={expandido}
        onClick={alternarMenu}
      >
        <IconoFlecha className={expandido ? styles.flechaArriba : ""} />
      </button>
    </div>
  );
}


