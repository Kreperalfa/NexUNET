"use client";

import styles from "./PageTitle.module.css";

export default function PageTitle({ children }) {
  return (
    <h1 className={styles.titulo}>
      {children}
    </h1>
  );
}
