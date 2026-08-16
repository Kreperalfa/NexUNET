'use client';

import Image from "next/image";
import styles from "./CandyButton.module.css";
import candyIcon from "@/resources/candy-chat.jpeg";

export default function CandyButton({ abrir, chatAbierto }) {
    return (
        <button
            className={`${styles.candyButton} ${chatAbierto ? styles.mover : ""}`}
            onClick={abrir}
        >
            <div className={styles.candyIconWrapper}>
                <Image
                    src={candyIcon}
                    alt="Candy"
                    fill
                    sizes="64px"
                    loading="eager"
                    className={styles.candyIcon}
                />
            </div>
        </button>
    );
}
