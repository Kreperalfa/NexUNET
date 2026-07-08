"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import styles from "./MediaCarousel.module.css";

export default function MediaCarousel({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={styles.carouselContainer}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={1}
        className={styles.swiper}
      >
        {items.map((item) => (
          <SwiperSlide key={item.idMultimedia || item.url}>
            {item.tipoArchivo === "imagen" ? (
              <img
                src={item.url}
                alt="Imagen de publicación"
                className={styles.mediaImage}
              />
            ) : (
              <video
                src={item.url}
                controls
                className={styles.mediaVideo}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
