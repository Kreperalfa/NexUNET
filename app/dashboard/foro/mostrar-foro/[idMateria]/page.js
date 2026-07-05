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
      .eq("idMateria", idMateria)
      .order("tipo", { ascending: true });

    if (error) {
      console.error("Error cargando foros:", error);
    } else {
      setForos(data);
    }

    setCargando(false);
  };

  useEffect(() => {
    cargarForos();
  }, [idMateria]);

  // Cargar contenido de cada foro (ejemplo: publicaciones o hilos)
  const cargarContenidoForo = async (idForo) => {
    const { data, error } = await supabase
      .from("PublicacionForo") // 👈 ajusta al nombre real de tu tabla de publicaciones/hilos
      .select("idPublicacion, contenido, created_at, idUsuario")
      .eq("idForo", idForo)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando contenido del foro:", error);
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

          {/* Contenido del foro */}
          <ForoContenido idForo={foro.idForo} cargarContenido={cargarContenidoForo} />
        </div>
      ))}
    </div>
  );
}

// Componente para mostrar contenido de un foro
function ForoContenido({ idForo, cargarContenido }) {
  const [contenido, setContenido] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchContenido = async () => {
      const data = await cargarContenido(idForo);
      setContenido(data);
      setCargando(false);
    };
    fetchContenido();
  }, [idForo, cargarContenido]);

  if (cargando) return <p>Cargando contenido...</p>;

  if (contenido.length === 0) return <p>Este foro aún no tiene publicaciones.</p>;

  return (
    <ul>
      {contenido.map((pub) => (
        <li key={pub.idPublicacion} style={{ marginBottom: "1rem" }}>
          <strong>Usuario {pub.idUsuario}</strong>
          <br />
          {pub.contenido}
          <br />
          <small>{new Date(pub.created_at).toLocaleString()}</small>
        </li>
      ))}
    </ul>
  );
}
