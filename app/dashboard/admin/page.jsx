"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabase";
import styles from "./admin.module.css";

/* ⭐ Roles por nivel */
const ROLES = {
  1: "Usuario normal",
  2: "Subadministrador",
  3: "Administrador total",
  4: "Coordinador de departamento",
  5: "Jefe de departamento",
  6: "Administrador institucional",
  7: "Superadministrador",
  8: "Desarrollador",
};

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
    { etiqueta: "Crear carrera", href: "/dashboard/carrera/crear-carrera" },
    { etiqueta: "Crear cuentas", href: "/dashboard/cuenta/crear-cuenta" },
    { etiqueta: "Cuentas institucionales", href: "/dashboard/admin/cuentas" },
  ],
  7: [
    { etiqueta: "Crear cuenta", href: "/dashboard/cuenta/crear-cuenta" },
    { etiqueta: "Crear carrera", href: "/dashboard/carrera/crear-carrera" },
    { etiqueta: "Gestionar usuarios", href: "/dashboard/admin/usuarios" },
    { etiqueta: "Gestionar entidades", href: "/dashboard/admin/entidades" },
  ],
  8: [
    { etiqueta: "Crear carrera", href: "/dashboard/carrera/crear-carrera" },
    { etiqueta: "Crear cuentas", href: "/dashboard/cuenta/crear-cuenta" },
    { etiqueta: "Gestionar usuarios", href: "/dashboard/admin/usuarios" },
    { etiqueta: "Gestionar departamentos", href: "/dashboard/admin/departamentos" },
  ],
};

export default function AdminPanelPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [stats, setStats] = useState({
    activos: 0,
    inactivos: 0,
    cuentas: 0,
  });

  useEffect(() => {
    const cargarUsuario = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.push("/dashboard");
        return;
      }

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

  /* ⭐ Cargar estadísticas */
  useEffect(() => {
    const cargarStats = async () => {
      const { count: activos } = await supabase
        .from("Usuario")
        .select("*", { count: "exact", head: true })
        .eq("estado", "activo");

      const { count: inactivos } = await supabase
        .from("Usuario")
        .select("*", { count: "exact", head: true })
        .eq("estado", "inactivo");

      const { count: cuentas } = await supabase
        .from("Cuenta")
        .select("*", { count: "exact", head: true });

      setStats({ activos, inactivos, cuentas });
    };

    cargarStats();
  }, []);

  if (cargando) return <p className={styles.cargando}>Cargando panel...</p>;

  if (!usuario || usuario.nivel < 4)
    return (
      <p className={styles.denegado}>
        ❌ No tienes permisos para acceder al panel administrativo.
      </p>
    );

  const opciones = OPCIONES_POR_NIVEL[usuario.nivel] ?? [];
  const rol = ROLES[usuario.nivel] ?? "Rol desconocido";

  /* ⭐ Escala automática para las barras */
  const maxValor = Math.max(stats.activos, stats.inactivos, stats.cuentas) || 1;

  return (
    <div className={styles.panel}>
      <h1 className={styles.titulo}>Panel Administrativo</h1>

      {/* ⭐ Ahora muestra el rol real */}
      <p className={styles.subtitulo}>
        Bienvenido, {usuario.nombre}. Rol: {rol} (Nivel {usuario.nivel})
      </p>

      {/* ⭐ Gráfica profesional */}
      <div className={styles.grafica}>
        <h3 className={styles.graficaTitulo}>Estadísticas del sistema</h3>

        <div className={styles.barras}>
          {/* Activos */}
          <div className={styles.barraItem}>
            <div
              className={styles.barraActivos}
              style={{
                height: `${(stats.activos / maxValor) * 140}px`,
              }}
            ></div>
            <span className={styles.barraLabel}>
              Activos: {stats.activos}
            </span>
          </div>

          {/* Inactivos */}
          <div className={styles.barraItem}>
            <div
              className={styles.barraInactivos}
              style={{
                height: `${(stats.inactivos / maxValor) * 140}px`,
              }}
            ></div>
            <span className={styles.barraLabel}>
              Inactivos: {stats.inactivos}
            </span>
          </div>

          {/* Cuentas */}
          <div className={styles.barraItem}>
            <div
              className={styles.barraCuentas}
              style={{
                height: `${(stats.cuentas / maxValor) * 140}px`,
              }}
            ></div>
            <span className={styles.barraLabel}>
              Cuentas: {stats.cuentas}
            </span>
          </div>
        </div>
      </div>

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
