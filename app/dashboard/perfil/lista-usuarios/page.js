"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";
export default function ListaUsuariosPage() {
  const supabase = getSupabaseBrowserClient();
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    async function cargarUsuarios() {
      const { data, error } = await supabase
        .from("Usuario")
        .select("id, nombre, imagenPerfil, correoInstitucional")
        .order("nombre", { ascending: true });

      if (!error) setUsuarios(data);
    }

    cargarUsuarios();
  }, [supabase]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

      <div className="flex flex-col gap-4">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-4 p-3 border rounded-lg bg-white shadow-sm"
          >
            {/* Imagen de perfil */}
            <img
              src={u.imagenPerfil}
              className="w-14 h-14 rounded-full object-cover border"
            />

            {/* Nombre + correo */}
            <div className="flex flex-col">
              {/* CLICK EN EL NOMBRE → IR AL PERFIL */}
              <Link
                href={`/dashboard/perfil/${u.id}`}
                className="font-semibold text-lg hover:underline"
              >
                {u.nombre}
              </Link>

              {/* Mostrar correo correctamente */}
              <span className="text-gray-600 text-sm">
                {u.correoInstitucional}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
