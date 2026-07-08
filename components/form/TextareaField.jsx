'use client';

import styles from "./TextareaField.module.css";

export default function TextareaField({ label, value, onChange, rows = 4 }) {
  return (
    <div className={styles.campo}>
      <label className={styles.label}>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        className={styles.textarea}
      />
    </div>
  );
}
