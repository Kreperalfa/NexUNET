import styles from "./AdminButton.module.css";

export default function AdminButton({ children, onClick, type = "button" }) {
  return (
    <button type={type} className={styles.botonAdmin} onClick={onClick}>
      {children}
    </button>
  );
}
