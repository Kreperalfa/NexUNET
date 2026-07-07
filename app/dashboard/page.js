'use client'

import { logoutUser } from "../../lib/auth";
import { obtenerNivel } from "../../lib/perfil";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const redirigir = useRouter();
  const [puedeCrearCuenta, setPuedeCrearCuenta] = useState(false);
  const [puedeCrearCarrera, setPuedeCrearCarrera] = useState(false);

  // Cargar nivel del usuario al entrar al Dashboard
  useEffect(() => {
    const cargarNivel = async () => {
      const supabase = await import("../../lib/supabase");
      const { getSupabaseBrowserClient } = supabase;
      const client = getSupabaseBrowserClient();

      const { data: userData } = await client.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const nivel = await obtenerNivel(user.id);

      if (nivel === 7 || nivel === 8) {
        setPuedeCrearCuenta(true);
        setPuedeCrearCarrera(true);
      }
    };

    cargarNivel();
  }, []);

  const listaUsuarios = async () => {
    redirigir.push("/dashboard/perfil/lista-usuarios");
  };

  const manejoLogout = async () => {
    const { ok, error } = await logoutUser();

    if (!ok) {
      alert(error);
      return;
    }

    redirigir.push("/login");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>pagina*</p>

      {/* Botón temporal */}
      <button onClick={manejoLogout}>Cerrar sesión</button>
      <button onClick={listaUsuarios}>Lista Usuarios</button>
      <button
        onClick={() =>
          redirigir.push(`/dashboard/noticias`)
        }
        style={{
          padding: "10px 20px",
          background: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "10px",
          display: "block"
        }}
      >
        ver noticia
      </button>

      {/* Botón visible solo para nivel 7 u 8 */}
      {puedeCrearCuenta && (
        <button onClick={() => redirigir.push("/dashboard/cuenta/crear-cuenta")}>
          Crear cuenta
        </button>
      )}
      {puedeCrearCuenta && (
        <button onClick={() => redirigir.push("/dashboard/carrera/crear-carrera")}>
          Crear carrera
        </button>
      )}
      <button onClick={() => redirigir.push("/dashboard/cuenta/abrir-cuenta")}>
        Abrir cuenta
      </button>
      <button onClick={() => redirigir.push("/dashboard/foro/listado-materia")}>
        Abrir foro
      </button>
    </div>
  );
}