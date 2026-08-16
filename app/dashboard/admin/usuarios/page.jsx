"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";
import styles from "./usuarios.module.css";

const ROLES = [
  { nivel: 1, nombre: "Estudiante / Personal" },
  { nivel: 2, nombre: "Preparador" },
  { nivel: 3, nombre: "Profesor" },
  { nivel: 4, nombre: "Departamento" },
  { nivel: 5, nombre: "Jefe de Departamento" },
  { nivel: 6, nombre: "Entidad" },
  { nivel: 7, nombre: "Rectorado" },
  { nivel: 8, nombre: "Desarrollador" },
];

export default function GestionUsuariosPage() {
  const supabase = getSupabaseBrowserClient();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState(""); // ⭐ búsqueda
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarUsuarios = async () => {
      const { data, error } = await supabase
        .from("Usuario")
        .select("id, nombre, correoInstitucional, nivel, estado")
        .order("nombre", { ascending: true });

      if (!error) {
        setUsuarios(data || []);
      }

      setCargando(false);
    };

    cargarUsuarios();
  }, []);

  const cambiarNivel = async (id, nuevoNivel) => {
    await supabase.from("Usuario").update({ nivel: nuevoNivel }).eq("id", id);

    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, nivel: nuevoNivel } : u))
    );
  };

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";

    await supabase.from("Usuario").update({ estado: nuevoEstado }).eq("id", id);

    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, estado: nuevoEstado } : u))
    );
  };

  if (cargando) return <p className={styles.cargando}>Cargando usuarios...</p>;

  // ⭐ FILTRO DE BÚSQUEDA
  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = filtro.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(texto) ||
      u.correoInstitucional?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className={styles.panel}>
      <h1 className={styles.titulo}>Gestión de Usuarios</h1>

      {/* ⭐ Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        className={styles.buscador}
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <div className={styles.tabla}>
        <div className={styles.encabezado}>
          <span>Nombre</span>
          <span>Correo</span>
          <span>Rol</span>
          <span>Acciones</span>
        </div>

        {usuariosFiltrados.map((u) => (
          <div key={u.id} className={styles.fila}>
            <span>{u.nombre}</span>
            <span>{u.correoInstitucional}</span>

            <select
              className={styles.selectRol}
              value={u.nivel}
              onChange={(e) => cambiarNivel(u.id, Number(e.target.value))}
            >
              {ROLES.map((rol) => (
                <option key={rol.nivel} value={rol.nivel}>
                  {rol.nombre}
                </option>
              ))}
            </select>

            <div className={styles.acciones}>
              <button
                className={styles.btnBloqueo}
                onClick={() => toggleEstado(u.id, u.estado)}
              >
                {u.estado === "activo" ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
