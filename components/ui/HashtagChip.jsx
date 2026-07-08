import styles from "./HashtagChip.module.css";

export default function HashtagChip({ nombre }) {
  return <span className={styles.hashtagChip}>#{nombre}</span>;
}
