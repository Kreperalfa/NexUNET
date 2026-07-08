'use client';

import Nav from "@/components/layout/Nav";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }) {
    return (
        <div className={styles.pagina}>
            <Nav />
            <main className={styles.contenido}>{children}</main>
        </div>
    );
}

