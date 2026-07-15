"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ForoCard.module.css";
import HiloCard from "./HiloCard";

export default function ForoCard({
  foro,
  nivel,
  idMateria,
  cargarHilos,
  cargarArchivos,
  cargarSubHilos,
}) {
  const redirigir = useRouter();

  const puedePublicar =
    foro.tipo === "NO_OFICIAL" ||
    (foro.tipo === "OFICIAL" && (nivel === 2 || nivel === 3));

  return (
    <div className={styles.foroCard}>
      <div className={styles.foroHeader}>
        <div>
          <h2 className={styles.foroTitle}>
            {foro.tipo === "OFICIAL" ? "Foro Oficial" : "Foro No Oficial"}
          </h2>
          <p className={styles.foroFecha}>
            Creado: {new Date(foro.created_at).toLocaleString()}
          </p>
        </div>

        <span
          className={
            foro.tipo === "OFICIAL"
              ? styles.badgeOficial
              : styles.badgeNoOficial
          }
        >
          {foro.tipo}
        </span>
      </div>

      {puedePublicar && (
        <button
          className={styles.publicarBtn}
          onClick={() =>
            redirigir.push(
              `/dashboard/foro/mostrar-foro/${idMateria}/crear-hilo?tipo=${foro.tipo}&idForo=${foro.idForo}`
            )
          }
        >
          Publicar Hilo
        </button>
      )}

      <ForoContenido
        idForo={foro.idForo}
        tipoForo={foro.tipo}
        idMateria={idMateria}
        cargarHilos={cargarHilos}
        cargarArchivos={cargarArchivos}
        cargarSubHilos={cargarSubHilos}
      />
    </div>
  );
}

function ForoContenido({
  idForo,
  tipoForo,
  idMateria,
  cargarHilos,
  cargarArchivos,
  cargarSubHilos,
}) {
  const [hilos, setHilos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const redirigir = useRouter();

  useEffect(() => {
    const fetchHilos = async () => {
      const data = await cargarHilos(idForo);

      const hilosConExtras = await Promise.all(
        data.map(async (hilo) => {
          const archivos = await cargarArchivos(hilo.idHilo);
          const subhilos = await cargarSubHilos(hilo.idHilo);
          return { ...hilo, archivos, subhilos, tipoForo };
        })
      );

      setHilos(hilosConExtras);
      setCargando(false);
    };

    fetchHilos();
  }, [idForo, cargarHilos, cargarArchivos, cargarSubHilos]);

  if (cargando) return <p className={styles.estadoTexto}>Cargando hilos...</p>;
  if (hilos.length === 0)
    return (
      <p className={styles.estadoTexto}>Este foro aún no tiene hilos.</p>
    );

  return (
    <div className={styles.hilosList}>
      {hilos.map((hilo) => (
        <HiloCard
          key={hilo.idHilo}
          hilo={hilo}
          tipoForo={tipoForo}
          idMateria={idMateria}
          idForo={idForo}
          redirigir={redirigir}
        />
      ))}
    </div>
  );
}

