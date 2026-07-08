//Nav.jsx

'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { logoutUser } from "@/lib/auth";
import { cargarPerfilUsuario } from "@/lib/perfil";

import styles from "./Nav.module.css";


// Qué opciones desbloquea cada nivel. Para agregar un nivel nuevo con
// opciones propias, basta con añadir una entrada aquí.
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

    useEffect(() => {
        async function cargar() {
            const resultado = await cargarPerfilUsuario();
            if (resultado.ok) {
                setPerfil(resultado.perfil);
            }
        }
        cargar();
    }, []);

    // cargarPerfilUsuario ya trae "nivel" (select("*") sobre Usuario),
    // así que no hace falta una segunda llamada a obtenerNivel().
    const nivel = perfil?.nivel ?? null;
    const opcionesNivel = OPCIONES_POR_NIVEL[nivel] ?? [];

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
        setExpandido((prev) => !prev);
        setSubmenuAbierto(false);
    };

    const manejoLogout = async () => {
        const { ok, error } = await logoutUser();
        if (!ok) {
            alert(error);
            return;
        }
        router.push("/login");
    };

    const DetalleUsuario = () =>
        perfil && (
            <Link href={`/dashboard/perfil/${perfil.id}`} className={styles.detalleUsuario}>
                <img src={perfil.imagenPerfil} alt="" className={styles.avatar} />
                <span>{perfil.correoInstitucional}</span>
            </Link>
        );

    return (
        <div className={styles.contenedor}>
            {expandido ? (
                <nav className={styles.navExpandido}>
                    <div className={styles.fila}>
                        <div className={styles.grupo}>
                            <Link href="/dashboard/perfil/lista-usuarios" className={styles.enlace}>
                                Lista usuarios
                            </Link>
                            <Link href="/dashboard/noticias" className={styles.enlace}>
                                Ver noticias
                            </Link>
                            <Link href="/dashboard/cuenta/abrir-cuenta" className={styles.enlace}>
                                Abrir cuenta
                            </Link>
                            <Link href="/dashboard/foro/listado-materia" className={styles.enlace}>
                                Abrir foro
                            </Link>
                        </div>

                        {perfil && (
                            <div className={styles.grupo}>
                                <DetalleUsuario />
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
                                    <div className={styles.contenedorSubmenu} ref={submenuRef}>
                                        <button
                                            type="button"
                                            className={styles.enlace}
                                            aria-haspopup="menu"
                                            aria-expanded={submenuAbierto}
                                            onClick={() => setSubmenuAbierto((prev) => !prev)}
                                        >
                                            Opciones de nivel
                                            <IconoFlecha
                                                className={submenuAbierto ? styles.flechaArriba : ""}
                                            />
                                        </button>

                                        {submenuAbierto && (
                                            <div className={styles.submenu} role="menu">
                                                {opcionesNivel.map((opcion) => (
                                                    <Link
                                                        key={opcion.href}
                                                        href={opcion.href}
                                                        className={styles.itemSubmenu}
                                                        role="menuitem"
                                                        onClick={() => setSubmenuAbierto(false)}
                                                    >
                                                        {opcion.etiqueta}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* TODO: conectar con el sistema de notificaciones cuando exista */}
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
                        <DetalleUsuario />
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

function IconoInicio() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
        </svg>
    );
}

function IconoCampana() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
    );
}

function IconoSalir() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
        </svg>
    );
}

function IconoFlecha({ className = "" }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}
