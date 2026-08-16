"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabase";
import styles from "./admin.module.css";

/* ⭐ Opciones del panel según el nivel */
const OPCIONES_POR_NIVEL = {
  4: [
    { etiqueta: "Materias del departamento", href: "/dashboard/admin/materias" },
    { etiqueta: "Cuentas del departamento", href: "/dashboard/admin/cuentas" },
  ],
  5: [
    { etiqueta: "Gestionar profesores", href: "/dashboard/admin/usuarios" },
    { etiqueta: "Materias del departamento", href: "/dashboard/admin/materias" },
    { etiqueta: "Aprobar contenido", href: "/dashboard/admin/contenido" },
  ],
  6: [
    { etiqueta: "Carreras", href: "/dashboard/admin/carreras" },
    { etiqueta: "Departamentos", href: "/dashboard/admin/departamentos" },
    { etiqueta: "Cuentas institucionales", href: "/dashboard/admin/cuentas" },
  ],
  7: [
    { etiqueta: "Crear cuenta", href: "/dashboard/cuenta/crear-cuenta" },
    { etiqueta: "Crear carrera", href: "/dashboard/carrera/crear-carrera" },
    { etiqueta: "Gestionar usuarios", href: "/dashboard/admin/usuarios" },
    { etiqueta: "Gestionar entidades", href: "/dashboard/admin/entidades" },
  ],
  8: [
    { etiqueta: "Panel de desarrolladores", href: "/dashboard/admin/dev" },
    { etiqueta: "Logs del sistema", href: "/dashboard/admin/logs" },
    { etiqueta: "Mantenimiento", href: "/dashboard/admin/mantenimiento" },
    { etiqueta: "Gestionar usuarios", href: "/dashboard/admin/usuarios" },
    { etiqueta: "Gestionar carreras", href: "/dashboard/admin/carreras" },
    { etiqueta: "Gestionar departamentos", href: "/dashboard/admin/departamentos" },
  ],
};

export default function AdminPanelPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.push("/dashboard");
        return;
      }

      // ⭐ CORRECCIÓN: tu tabla usa "id", NO "idUsuario"
      const { data } = await supabase
        .from("Usuario")
        .select("id, nombre, nivel")
        .eq("id", auth.user.id)
        .single();

      setUsuario(data);
      setCargando(false);
    };

    cargarUsuario();
  }, []);

  if (cargando) return <p className={styles.cargando}>Cargando panel...</p>;

  if (!usuario || usuario.nivel < 4)
    return (
      <p className={styles.denegado}>
        ❌ No tienes permisos para acceder al panel administrativo.
      </p>
    );

  const opciones = OPCIONES_POR_NIVEL[usuario.nivel] ?? [];

  return (
    <div className={styles.panel}>
      <h1 className={styles.titulo}>Panel Administrativo</h1>
      <p className={styles.subtitulo}>
        Bienvenido, {usuario.nombre}. Rol: Nivel {usuario.nivel}
      </p>

      <div className={styles.grid}>
        {opciones.map((opcion, index) => (
          <div
            key={index}
            className={styles.card}
            onClick={() => router.push(opcion.href)}
          >
            <h3>{opcion.etiqueta}</h3>
            <p>Acceder a módulo administrativo</p>
          </div>
        ))}
      </div>
    </div>
  );
}
