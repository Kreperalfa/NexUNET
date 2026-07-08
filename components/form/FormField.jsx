'use client';

import styles from "./FormField.module.css";

export default function FormField({ label, value, onChange, type = "text" }) {
  return (
    <div className={styles.campo}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={styles.input}
      />
    </div>
  );
}
