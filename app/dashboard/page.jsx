import styles from "./page.module.css";
import FeedPage from "./feed/page";
import Link from "next/link";

// Íconos SVG de un solo color
const Icon = ({ children }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
        {children}
    </svg>
);

export default function Dashboard() {
    return (
        <div className={styles.grid}>

            {/* COLUMNA IZQUIERDA — FEED */}
            <section className={styles.feedSection}>
                <FeedPage />
            </section>

            {/* COLUMNA DERECHA — ACCESOS RÁPIDOS */}
            <section>
                <h2 className={styles.tituloSeccion}>Accesos rápidos</h2>

                <div className={styles.quickAccessGrid}>

                    {/* Inicio */}
                    <Link href="/dashboard" className={styles.quickItem}>
                        <Icon>
                            <path d="M4 12l8-8 8 8" />
                            <path d="M6 10v10h12V10" />
                        </Icon>
                        <span>Inicio</span>
                    </Link>

                    {/* Directorio de usuarios */}
                    <Link href="/dashboard/perfil/lista-usuarios" className={styles.quickItem}>
                        <Icon>
                            <circle cx="12" cy="7" r="4" />
                            <path d="M5.5 21c1.5-4 12.5-4 14 0" />
                        </Icon>
                        <span>Directorio de usuarios</span>
                    </Link>

                    {/* Cuentas / Departamentos */}
                    <Link href="/dashboard/cuenta" className={styles.quickItem}>
                        <Icon>
                            <path d="M3 7h18" />
                            <path d="M3 12h18" />
                            <path d="M3 17h18" />
                        </Icon>
                        <span>Cuentas / Departamentos</span>
                    </Link>

                    {/* Materias */}
                    <Link href="/dashboard/foro/listado-materia" className={styles.quickItem}>
                        <Icon>
                            <path d="M4 4h16v16H4z" />
                            <path d="M8 8h8" />
                            <path d="M8 12h8" />
                            <path d="M8 16h8" />
                        </Icon>
                        <span>Materias</span>
                    </Link>

                </div>
            </section>

        </div>
    );
}

