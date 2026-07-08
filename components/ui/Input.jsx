//input.jsx

'use client'

import { useState } from "react";
import styles from "./Input.module.css";

export default function Input({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    autoComplete,
}) {
    const [mostrarTexto, setMostrarTexto] = useState(false);
    const esContrasena = type === "password";
    const tipoFinal = esContrasena && mostrarTexto ? "text" : type;

    return (
        <div className={styles.campo}>
            <label htmlFor={id} className={styles.etiqueta}>
                {label}
            </label>
            <div className={styles.contenedorInput}>
                <input
                    id={id}
                    type={tipoFinal}
                    className={`${styles.input} ${esContrasena ? styles.inputConIcono : ""}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    autoComplete={autoComplete}
                />

                {esContrasena && (
                    <button
                        type="button"
                        className={styles.botonOjo}
                        onClick={() => setMostrarTexto((prev) => !prev)}
                        aria-label={mostrarTexto ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-pressed={mostrarTexto}
                    >
                        {mostrarTexto ? <IconoOjoCerrado /> : <IconoOjo />}
                    </button>
                )}
            </div>
        </div>
    );
}

function IconoOjo() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function IconoOjoCerrado() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.4 13.4 0 0 1-3.2 4.1" />
            <path d="M6.6 6.6C3.4 8.6 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 5.1-1.3" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
    );
}
