import styles from "./BigButton.module.css";

export default function BigButton({ children, onClick, type = "button" }) {
  return (
    <button type={type} className={styles.botonGrande} onClick={onClick}>
      {children}
    </button>
  );
}
