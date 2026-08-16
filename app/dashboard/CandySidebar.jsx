"use client";

import Image from "next/image";
import styles from "./CandySidebar.module.css";
import CandyChatPage from "./candy-chat/page";

// ⭐ Importamos la imagen desde resources
import candyIcon from "@/resources/candy-chat.jpeg";

export default function CandySidebar({ abierto, cerrar }) {
  return (
    <div className={`${styles.sidebar} ${abierto ? styles.abierto : ""}`}>
      
      <div className={styles.header}>
        
        {/* ⭐ Foto circular de Candy */}
        <div className={styles.candyAvatarWrapper}>
          <Image
            src={candyIcon}
            alt="Candy"
            fill
            sizes="48px"
            loading="eager"
            className={styles.candyAvatar}
          />
        </div>

        <span className={styles.title}>Candy Chat</span>

        <button className={styles.closeBtn} onClick={cerrar}>✖</button>
      </div>

      <div className={styles.chatContent}>
        <CandyChatPage />
      </div>
    </div>
  );
}
