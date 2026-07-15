"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../../lib/supabase";
import ForoCard from "@/components/cards/ForoCard";

export default function MostrarForoPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const idMateria = params.idMateria;

  const [foros, setForos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nivel, setNivel] = useState(null);

  const cargarNivelUsuario = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from("Usuario")
      .select("nivel")
      .eq("id", userId)
      .single();

    if (!error && data) setNivel(Number(data.nivel));
  };

  const cargarForos = async () => {
    const { data, error } = await supabase
      .from("Foro")
      .select("idForo, tipo, created_at")
      .eq("idMateria", idMateria);

    if (!error && data) {
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
    cargarNivelUsuario();
  }, [idMateria]);

  const cargarHilosForo = async (idForo) => {
    const { data, error } = await supabase
      .from("Hilo")
      .select(
        "idHilo, titulo, contenido, created_at, idUsuarioCreador, idCuentaCreador"
      )
      .eq("idForoFuente", idForo)
      .order("created_at", { ascending: false });

    return error ? [] : data;
  };

  const cargarArchivos = async (idHilo) => {
    const { data, error } = await supabase
      .from("ArchivoHilo")
      .select("nombreArchivo, tipoArchivo")
      .eq("idHilo", idHilo);

    return error ? [] : data;
  };

  const cargarSubHilos = async (idHilo) => {
    const { data, error } = await supabase
      .from("SubHilo")
      .select(
        "idSubHilo, contenido, created_at, idUsuarioCreador, idRespuestaPadre"
      )
      .eq("idHilo", idHilo)
      .order("created_at", { ascending: true });

    return error ? [] : data;
  };

  return (
    <div className="foroPageContainer">
      <h1 className="foroPageTitle">Foros de la Materia</h1>

      {cargando && <p>Cargando foros...</p>}
      {!cargando && foros.length === 0 && (
        <p>No hay foros registrados para esta materia.</p>
      )}

      <div className="forosGrid">
        {foros.map((foro) => (
          <ForoCard
            key={foro.idForo}
            foro={foro}
            nivel={nivel}
            idMateria={idMateria}
            cargarHilos={cargarHilosForo}
            cargarArchivos={cargarArchivos}
            cargarSubHilos={cargarSubHilos}
          />
        ))}
      </div>
    </div>
  );
}
