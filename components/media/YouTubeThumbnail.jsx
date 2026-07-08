"use client";

import styles from "./YouTubeThumbnail.module.css";

export default function YouTubeThumbnail({ url }) {
  if (!url) return null;

  const extractId = (link) => {
    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = link.match(regExp);
    return match ? match[1] : null;
  };

  const id = extractId(url);
  if (!id) return null;

  return (
    <div className={styles.thumbnailContainer}>
      <img
        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
        alt="Miniatura de YouTube"
        className={styles.thumbnailImage}
      />
      <div className={styles.playOverlay}>▶</div>
    </div>
  );
}
