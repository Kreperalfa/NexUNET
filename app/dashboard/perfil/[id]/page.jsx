"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";

import PageTitle from "@/components/ui/PageTitle";
import SectionCard from "@/components/cards/SectionCard";
import UserProfileHeader from "@/components/users/UserProfileHeader";

import styles from "./page.module.css";

export default function PerfilPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const redirigir = useRouter();

  const id = params.id;

  const [perfil, setPerfil] = useState(null);
  const [user, setUser] = useState(null);

  /* ================= CARGAR USUARIO AUTENTICADO ================= */
  useEffect(() => {
    async function cargarUsuario() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    cargarUsuario();
  }, []);

  /* ================= CARGAR PERFIL ================= */
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
  }, [id]);

  if (!perfil) return <p className={styles.cargando}>Cargando perfil...</p>;

  const esPropietario = user?.id === perfil.id;

  return (
    <div className={styles.contenedor}>
      <UserProfileHeader
        fondo={perfil.imagenFondo}
        foto={perfil.imagenPerfil}
        nombre={perfil.nombre}
        correo={perfil.correoInstitucional}
      />

      {/* ⭐ Aquí ahora se muestra el nombre del usuario */}
      <PageTitle>{perfil.correoInstitucional}</PageTitle>

      {/* ================= BOTÓN EDITAR PERFIL ================= */}
      {esPropietario && (
        <button
          className={styles.botonEditar}
          onClick={() => redirigir.push(`/dashboard/editar-perfil`)}
        >
          Editar perfil
        </button>
      )}

      <SectionCard titulo="Descripción">
        <p className={styles.descripcion}>
          {perfil.descripcion || "Este usuario ha decidido no describirse."}
        </p>
      </SectionCard>
    </div>
  );
}

