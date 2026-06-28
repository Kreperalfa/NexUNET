"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";

export default function PerfilPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams(); // ← AQUÍ SE OBTIENEN LOS PARAMS EN CLIENT COMPONENT
  const id = params.id;       // ← AHORA SÍ ES UN STRING NORMAL

  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      const { data, error } = await supabase
        .from("Usuario")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setPerfil(data);
    }

    if (id) cargarDatos();
  }, [id, supabase]);

  if (!perfil) return <div>Cargando perfil...</div>;

  return (
    <div className="p-6">
      <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
        <img src={perfil.imagenFondo} className="w-full h-full object-cover" />
      </div>

      <div className="flex items-center gap-4">
        <img
          src={perfil.imagenPerfil}
          className="w-24 h-24 rounded-full object-cover border-4 border-white"
        />
        <div>
          <h1 className="text-2xl font-bold">{perfil.nombre}</h1>
          <p className="text-gray-500">{perfil.correoInstitucional}</p>
        </div>
      </div>

      <p className="mt-4 text-gray-700">{perfil.descripcion}</p>
    </div>
  );
}
