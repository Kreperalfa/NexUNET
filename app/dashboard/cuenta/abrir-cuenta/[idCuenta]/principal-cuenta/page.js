'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerCuentaCompleta } from "../../../../../../lib/cuenta";
import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";

export default function PrincipalCuenta() {
  const params = useParams();
  const idCuenta = params.idCuenta;
  const redirigir = useRouter();

  const [cuenta, setCuenta] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [user, setUser] = useState(null);

  /* ============================================================
     CARGAR USUARIO AUTENTICADO
     ============================================================ */
  useEffect(() => {
    const cargarUsuario = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);
    };

    cargarUsuario();
  }, []);

  /* ============================================================
     CARGAR INFORMACIÓN DE LA CUENTA
     ============================================================ */
  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerCuentaCompleta(idCuenta);

      if (!respuesta.ok) {
        setMensaje(respuesta.mensaje);
        return;
      }

      setCuenta(respuesta.cuenta);
      setMiembros(respuesta.miembros);
    };

    cargar();
  }, [idCuenta]);

  /* ============================================================
     ERRORES Y CARGA
     ============================================================ */
  if (mensaje) {
    return <p style={{ padding: "20px", color: "red" }}>{mensaje}</p>;
  }

  if (!cuenta || !user) {
    return <p style={{ padding: "20px" }}>Cargando cuenta...</p>;
  }

  /* ============================================================
     DETERMINAR SI EL USUARIO ES ADMIN
     ============================================================ */
  const esAdmin = miembros.some(
    (m) => m.idUsuario === user.id && m.rol === "Admin"
  );

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div style={{ padding: "20px" }}>
      {/* Imagen de fondo */}
      <div
        style={{
          width: "100%",
          height: "200px",
          backgroundImage: `url(${cuenta.imagenFondoCuenta})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "10px"
        }}
      />

      {/* Imagen de perfil */}
      <div style={{ marginTop: "-60px", marginLeft: "20px" }}>
        <img
          src={cuenta.imagenCuenta}
          alt="Imagen de la cuenta"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: "4px solid white",
            objectFit: "cover"
          }}
        />
      </div>

      {/* Información de la cuenta */}
      <h1 style={{ marginTop: "20px" }}>{cuenta.nombre}</h1>
      <p>{cuenta.descripcion || "Sin descripción."}</p>

      {/* Botón de editar (solo Admin) */}
      {esAdmin && (
        <button
          onClick={() =>
            redirigir.push(`/dashboard/cuenta/abrir-cuenta/${cuenta.idCuenta}/editar-cuenta`)
          }
          style={{
            padding: "10px 20px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Editar cuenta
        </button>
      )}
    {/* Botón de cambiar clave (solo Admin) */}
    {esAdmin && (
      <button
        onClick={() =>
          redirigir.push(`/dashboard/cuenta/abrir-cuenta/${cuenta.idCuenta}/cambiar-clave`)
        }
        style={{
          padding: "10px 20px",
          background: "#ff9800",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "10px",
          display: "block"
        }}
      >
        Cambiar clave
      </button>
    )}
      <hr style={{ margin: "20px 0" }} />

      {/* Miembros */}
      <h2>Miembros de la cuenta</h2>

      {miembros.length === 0 && <p>No hay miembros registrados.</p>}

      {miembros.map((m) => (
        <div
          key={m.idUsuario}
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "15px",
            padding: "10px",
            borderRadius: "8px",
            background: "#f0f0f0"
          }}
        >
          <img
            src={m.perfil?.imagenPerfil || "/default-user.png"}
            alt="Perfil"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: "15px"
            }}
          />

          <div>
            <p><strong>{m.perfil?.nombre || "Usuario sin nombre"}</strong></p>
            <p>{m.perfil?.correoInstitucional || "Correo no disponible"}</p>
            <p>Rol: {m.rol}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
