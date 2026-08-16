'use client';

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import styles from "./layout.module.css";

import CandyButton from "./CandyButton";
import CandySidebar from "./CandySidebar";

export default function DashboardLayout({ children }) {
    const [chatAbierto, setChatAbierto] = useState(false);

    return (
        <div className={styles.pagina}>
            <Nav />

            <main className={styles.contenido}>
                {children}
            </main>

            {/* ⭐ Botón flotante recibe el estado */}
            <CandyButton 
                abrir={() => setChatAbierto(true)}
                chatAbierto={chatAbierto}
            />

            {/* ⭐ Sidebar */}
            <CandySidebar 
                abierto={chatAbierto}
                cerrar={() => setChatAbierto(false)}
            />
        </div>
    );
}

