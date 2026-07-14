"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@lib/supabase";
import SubhiloCard from "@cards/SubhiloCard";
import ArchivoAdjunto from "@cards/ArchivoAdjunto";
import styles from "./page.module.css";

export default function HiloDetallePage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const searchParams = useSearchParams();
  const redirigir = useRouter();

  const idHilo = params.idHilo;
  const idMateriaURL = params.idMateria;
  const idForo = searchParams.get("idForo");
  const tipoForoURL = searchParams.get("tipoForo");

  const [hilo, setHilo] = useState(null);
  const [subhilos, setSubhilos] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ⭐ Cargar Hilo + Foro + Materia REAL
  const cargarHilo = async () => {
    // 1️⃣ Obtener el hilo
    const { data: hiloData } = await supabase
      .from("Hilo")
      .select("idHilo, titulo, contenido, created_at, idUsuarioCreador, idForoFuente")
      .eq("idHilo", idHilo)
      .single();

    if (!hiloData) return;

    // 2️⃣ Obtener el foro del hilo
    const { data: foroData } = await supabase
      .from("Foro")
      .select("idMateria, tipo")
      .eq("idForo", hiloData.idForoFuente)
      .single();

    // 3️⃣ Obtener la materia del foro
    const { data: materiaData } = await supabase
      .from("Materia")
      .select("nombreMateria")
      .eq("idMateria", foroData.idMateria)
      .single();

    setHilo({
      ...hiloData,
      nombreMateria: materiaData?.nombreMateria || "sin_materia",
      tipoForo: foroData?.tipo || tipoForoURL || "sin_foro",
    });
  };

  const cargarArchivos = async () => {
    const { data } = await supabase
      .from("ArchivoHilo")
      .select("nombreArchivo, tipoArchivo")
      .eq("idHilo", idHilo);

    if (data) setArchivos(data);
  };

  const cargarSubHilos = async () => {
    const { data } = await supabase
      .from("SubHilo")
      .select("idSubHilo, contenido, created_at, idUsuarioCreador, idRespuestaPadre")
      .eq("idHilo", idHilo)
      .order("created_at", { ascending: true });

    if (data) setSubhilos(data);
  };

  useEffect(() => {
    const fetchAll = async () => {
      await cargarHilo();
      await cargarArchivos();
      await cargarSubHilos();
      setCargando(false);
    };
    fetchAll();
  }, [idHilo]);

  if (cargando) return <div className={styles.hiloPageContainer}>Cargando hilo...</div>;
  if (!hilo) return <div className={styles.hiloPageContainer}>Hilo no encontrado.</div>;

  function construirArbol(subhilos, idHilo) {
    const mapa = {};
    subhilos.forEach((s) => (mapa[s.idSubHilo] = { ...s, hijos: [] }));

    const raiz = [];
    subhilos.forEach((s) => {
      if (s.idRespuestaPadre === idHilo) raiz.push(mapa[s.idSubHilo]);
      else if (mapa[s.idRespuestaPadre]) mapa[s.idRespuestaPadre].hijos.push(mapa[s.idSubHilo]);
      else raiz.push(mapa[s.idSubHilo]);
    });

    return raiz;
  }

  const arbolRespuestas = construirArbol(subhilos, hilo.idHilo);

  return (
    <div className={styles.hiloPageContainer}>
      <button
        className={styles.hiloBackBtn}
        onClick={() =>
          redirigir.push(`/dashboard/foro/mostrar-foro/${idMateriaURL}`)
        }
      >
        Volver al foro
      </button>

      <div className={styles.hiloMainCard}>
        <div className={styles.hiloHeader}>
          <h1 className={styles.hiloTitle}>{hilo.titulo}</h1>

          <div className={styles.hiloMeta}>
            <span className={styles.hiloAutor}>Autor: {hilo.idUsuarioCreador}</span>
            <span className={styles.hiloFecha}>
              {new Date(hilo.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <p className={styles.hiloContenido}>{hilo.contenido}</p>

        {archivos.length > 0 && (
          <div className={styles.hiloArchivosSection}>
            <h2>Archivos adjuntos</h2>
            <div className={styles.hiloArchivosList}>
              {archivos.map((a) => (
                <ArchivoAdjunto archivo={a} hilo={hilo} key={a.nombreArchivo} />
              ))}
            </div>
          </div>
        )}

        <button
          className={styles.hiloResponderBtn}
          onClick={() =>
            redirigir.push(
              `/dashboard/foro/mostrar-foro/${idMateriaURL}/responder-hilo?idHiloOrigen=${hilo.idHilo}&idRespuesta=${hilo.idHilo}`
            )
          }
        >
          Responder al hilo
        </button>
      </div>

      <div className={styles.hiloSubhilosSection}>
        <h2>Respuestas</h2>

        {arbolRespuestas.length === 0 ? (
          <p className={styles.hiloNoRespuestas}>Este hilo aún no tiene respuestas.</p>
        ) : (
          <div className={styles.hiloSubhilosList}>
            {arbolRespuestas.map((sub) => (
              <SubhiloCard
                key={sub.idSubHilo}
                subhilo={sub}
                nivel={0}
                hilo={hilo}
                idMateria={idMateriaURL}
                redirigir={redirigir}
                hijos={sub.hijos}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}





