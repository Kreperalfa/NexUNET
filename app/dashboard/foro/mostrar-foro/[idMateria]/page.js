"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../../lib/supabase";

export default function MostrarForoPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const idMateria = params.idMateria;

  const [foros, setForos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar foros de la materia
  const cargarForos = async () => {
    const { data, error } = await supabase
      .from("Foro")
      .select("idForo, tipo, created_at")
      .eq("idMateria", idMateria);

    if (error) {
      console.error("Error cargando foros:", error);
    } else {
      // Ordenar manualmente: primero OFICIAL, luego NO_OFICIAL
      const ordenados = data.sort((a, b) => {
        if (a.tipo === "OFICIAL" && b.tipo !== "OFICIAL") return -1;
        if (a.tipo !== "OFICIAL" && b.tipo === "OFICIAL") return 1;
        return 0;
      });
      setForos(ordenados);
    }

    setCargando(false);
  };

  useEffect(() => {
    cargarForos();
  }, [idMateria]);

  // Cargar hilos de cada foro
  const cargarHilosForo = async (idForo) => {
    const { data, error } = await supabase
      .from("Hilo")
      .select("idHilo, titulo, contenido, created_at, idUsuarioCreador, idCuentaCreador")
      .eq("idForoFuente", idForo)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando hilos del foro:", error);
      return [];
    }
    return data;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Foros de la Materia</h1>

      {cargando && <p>Cargando foros...</p>}

      {!cargando && foros.length === 0 && (
        <p>No hay foros registrados para esta materia.</p>
      )}

      {foros.map((foro) => (
        <div
          key={foro.idForo}
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h2>
            {foro.tipo === "OFICIAL" ? "Foro Oficial" : "Foro No Oficial"}
          </h2>
          <p>Creado: {new Date(foro.created_at).toLocaleString()}</p>

          {/* Hilos del foro */}
          <ForoContenido idForo={foro.idForo} cargarHilos={cargarHilosForo} />
        </div>
      ))}
    </div>
  );
}

// Componente para mostrar hilos de un foro
function ForoContenido({ idForo, cargarHilos }) {
  const [hilos, setHilos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchHilos = async () => {
      const data = await cargarHilos(idForo);
      setHilos(data);
      setCargando(false);
    };
    fetchHilos();
  }, [idForo, cargarHilos]);

  if (cargando) return <p>Cargando hilos...</p>;

  if (hilos.length === 0) return <p>Este foro aún no tiene hilos.</p>;

  return (
    <ul>
      {hilos.map((hilo) => (
        <li key={hilo.idHilo} style={{ marginBottom: "1rem" }}>
          <strong>{hilo.titulo}</strong>
          <br />
          {hilo.contenido}
          <br />
          <small>
            Creado por usuario {hilo.idUsuarioCreador}
            {hilo.idCuentaCreador && ` (Cuenta ${hilo.idCuentaCreador})`}
            {" - "}
            {new Date(hilo.created_at).toLocaleString()}
          </small>
        </li>
      ))}
    </ul>
  );
}
