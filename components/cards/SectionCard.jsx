import styles from "./SectionCard.module.css";

export default function SectionCard({ titulo, children }) {
  return (
    <div className={styles.tarjeta}>
      {titulo && <h2 className={styles.tarjetaTitulo}>{titulo}</h2>}
      {children}
    </div>
  );
}
