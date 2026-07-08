"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";

import PageTitle from "@/components/ui/PageTitle";
import SectionCard from "@/components/cards/SectionCard";
import EmptyState from "@/components/info/EmptyState";
import UserListItem from "@/components/users/UserListItem";

import styles from "./page.module.css";

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
  }, []);

  return (
    <div className={styles.contenedor}>
      <PageTitle>Usuarios</PageTitle>

      <SectionCard titulo="Listado de usuarios">
        {usuarios.length === 0 ? (
          <EmptyState
            titulo="No hay usuarios"
            descripcion="No se encontraron usuarios registrados."
            icono="👤"
          />
        ) : (
          <div className={styles.lista}>
            {usuarios.map((u) => (
              <UserListItem
                key={u.id}
                id={u.id}
                nombre={u.nombre}
                imagenPerfil={u.imagenPerfil}
                correo={u.correoInstitucional}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
