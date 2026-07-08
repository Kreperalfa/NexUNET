"use client";

import styles from "./Select.module.css";

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
}) {
  return (
    <div className={styles.contenedor}>
      {label && <label className={styles.label}>{label}</label>}

      <select
        className={styles.select}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>

        {options.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
    </div>
  );
}
