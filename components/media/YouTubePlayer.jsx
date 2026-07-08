"use client";

import styles from "./YouTubePlayer.module.css";

export default function YouTubePlayer({ url }) {
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
    <div className={styles.youtubeContainer}>
      <iframe
        className={styles.youtubeFrame}
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
