//archivo button.jsx
import styles from "./Button.module.css";

const variantes = {
    primario: styles.primario,
    enlace: styles.enlace,
    enlaceDestacado: styles.enlaceDestacado,
};

export default function Button({
    children,
    type = "button",
    variante = "primario",
    onClick,
    disabled = false,
}) {
    const clase = `${styles.base} ${variantes[variante] ?? styles.primario}`;

    return (
        <button type={type} className={clase} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}
