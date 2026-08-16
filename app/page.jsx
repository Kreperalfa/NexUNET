"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../lib/supabase";
import styles from "./landing.module.css";

/* ⭐ IMPORTAR EL LOGO DESDE resources */
import logoUNET from "../resources/logo-unet.png";

export default function LandingPage() {
  const supabase = getSupabaseBrowserClient();
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [cargando, setCargando] = useState(true);

  /* ⭐ Cargar contenido del carrusel */
  useEffect(() => {
    const cargarSlides = async () => {
      const { data, error } = await supabase
        .from("ContenidoLobby")
        .select("idContenido, titulo, contenido, imagen")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error cargando slides:", error.message);
        setSlides([]);
      } else {
        setSlides(data || []);
      }

      setCargando(false);
    };

    cargarSlides();
  }, []);

  /* ⭐ Carrusel automático con transición */
  useEffect(() => {
    if (slides.length === 0) return;

    const intervalo = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [slides]);

  const slideActual = slides[index];

  return (
    <div className={styles.contenedor}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logoGrupo}>
          <img src={logoUNET.src} alt="UNET" className={styles.logo} />
          <span className={styles.nombreSistema}>NexUNET</span>
        </div>
      </header>

      {/* ⭐ HERO CON CARRUSEL CENTRADO */}
      <section className={styles.heroCarrusel}>

        {/* ⭐ Botones sobre el carrusel */}
        <div className={styles.heroBotones}>
          <Link href="/login" className={styles.botonHero}>
            Iniciar sesión
          </Link>

          <Link href="/register" className={styles.botonHeroSecundario}>
            Registrarse
          </Link>
        </div>

        {/* ⭐ Estado de carga */}
        {cargando && (
          <div className={styles.carruselPlaceholder}>
            <h1 className={styles.placeholderTitulo}>Cargando contenido...</h1>
          </div>
        )}

        {/* ⭐ Si hay slides */}
        {!cargando && slideActual && (
          <>
            <img
              key={slideActual.idContenido}
              src={slideActual.imagen}
              alt={slideActual.titulo || "Imagen del lobby"}
              className={styles.carruselImagen}
            />

            <div className={styles.carruselTexto}>
              <h1>{slideActual.titulo}</h1>
              <p>{slideActual.contenido}</p>
            </div>

            <div className={styles.carruselControles}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.punto} ${i === index ? styles.activo : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        )}

        {/* ⭐ Si NO hay slides */}
        {!cargando && slides.length === 0 && (
          <div className={styles.carruselPlaceholder}>
            <h1 className={styles.placeholderTitulo}>Bienvenido a NexUNET</h1>
            <p className={styles.placeholderTexto}>
              La plataforma institucional de la UNET.
            </p>
          </div>
        )}
      </section>

      {/* ⭐ AUTORIDADES UNIVERSITARIAS */}
      <section className={styles.autoridades}>
        <h2>Autoridades Universitarias</h2>

        <div className={styles.gridAutoridades}>
          <div className={styles.cardAutoridad}>
            <h3>Rector</h3>
            <p>Dr. Nombre del Rector</p>
          </div>

          <div className={styles.cardAutoridad}>
            <h3>Vicerrector Académico</h3>
            <p>Dr. Nombre del Vicerrector</p>
          </div>

          <div className={styles.cardAutoridad}>
            <h3>Vicerrector Administrativo</h3>
            <p>Lic. Nombre del Vicerrector</p>
          </div>

          <div className={styles.cardAutoridad}>
            <h3>Secretario</h3>
            <p>Ing. Nombre del Secretario</p>
          </div>
        </div>
      </section>

      {/* ⭐ INFORMACIÓN DE CONTACTO */}
      <section className={styles.contacto}>
        <h2>Información de contacto</h2>

        <div className={styles.gridContacto}>
          <div>
            <h3>Dirección</h3>
            <p>Avenida Universidad, Sector Paramillo, San Cristóbal, Táchira.</p>
          </div>

          <div>
            <h3>Teléfonos</h3>
            <p>+58 276-1234567</p>
            <p>+58 276-7654321</p>
          </div>

          <div>
            <h3>Correo institucional</h3>
            <p>contacto@unet.edu.ve</p>
          </div>

          <div>
            <h3>Horario de atención</h3>
            <p>Lunes a Viernes — 8:00 AM a 4:00 PM</p>
          </div>
        </div>
      </section>

      {/* ⭐ MISIÓN Y VISIÓN */}
      <section className={styles.misionVision}>
        <h2>Misión y Visión</h2>

        <div className={styles.gridMV}>
          <div className={styles.mvCard}>
            <h3>Misión</h3>
            <p>
              Formar profesionales íntegros, con excelencia académica y compromiso social,
              promoviendo el desarrollo científico y tecnológico del país.
            </p>
          </div>

          <div className={styles.mvCard}>
            <h3>Visión</h3>
            <p>
              Ser una institución líder en educación superior, reconocida por su innovación,
              calidad y aporte al desarrollo nacional.
            </p>
          </div>
        </div>
      </section>

      {/* ⭐ ENLACES INSTITUCIONALES */}
      <section className={styles.enlaces}>
        <h2>Enlaces institucionales</h2>

        <div className={styles.gridEnlaces}>
          <Link href="https://unet.edu.ve" className={styles.enlaceCard}>
            Sitio oficial UNET
          </Link>

          <Link href="/login" className={styles.enlaceCard}>
            Acceso a NexUNET
          </Link>

          <Link href="/dashboard/noticias" className={styles.enlaceCard}>
            Noticias institucionales
          </Link>

          <Link href="/dashboard/perfil/lista-usuarios" className={styles.enlaceCard}>
            Directorio de usuarios
          </Link>
        </div>
      </section>

      {/* ⭐ FOOTER */}
      <footer className={styles.footer}>
        <p>© 2026 NexUNET — Universidad Nacional Experimental del Táchira</p>
      </footer>

    </div>
  );
}
