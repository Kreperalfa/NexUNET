'use client';

import styles from "./SubmitButton.module.css";

export default function SubmitButton({ texto, onClick }) {
  return (
    <button className={styles.boton} onClick={onClick}>
      {texto}
    </button>
  );
}
