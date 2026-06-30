'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerCuentaCompleta, actualizarEstadoMiembro } from "../../../../../../lib/cuenta";
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
  const cargarCuenta = async () => {
    const respuesta = await obtenerCuentaCompleta(idCuenta);

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje);
      return;
    }

    const miembrosConDecision = respuesta.miembros.map((m) => ({
      ...m,
      decision: null
    }));

    setCuenta(respuesta.cuenta);
    setMiembros(miembrosConDecision);
  };

  useEffect(() => {
    cargarCuenta();
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
     FILTRAR MIEMBROS NEGADOS
     ============================================================ */
  const miembrosFiltrados = miembros.filter(m => m.estado !== "negado");

  /* ============================================================
     ORDENAR MIEMBROS
     ============================================================ */
  const miembrosOrdenados = [...miembrosFiltrados].sort((a, b) => {
    if (a.rol === "Admin" && a.estado === "activo") return -1;
    if (b.rol === "Admin" && b.estado === "activo") return 1;

    if (a.rol === "SubAdmin" && a.estado === "activo") return -1;
    if (b.rol === "SubAdmin" && b.estado === "activo") return 1;

    if (a.rol === "SubAdmin" && a.estado === "pendiente") return -1;
    if (b.rol === "SubAdmin" && b.estado === "pendiente") return 1;

    return 0;
  });

  /* ============================================================
     MANEJO REAL DE ACEPTAR / RECHAZAR
     ============================================================ */
  const procesarDecision = async (idUsuarioMiembro, decision) => {
    const nuevoEstado = decision === "aceptado" ? "activo" : "negado";

    const respuesta = await actualizarEstadoMiembro(
      cuenta.idCuenta,
      idUsuarioMiembro,
      nuevoEstado
    );

    if (!respuesta.ok) {
      alert(respuesta.mensaje);
      return;
    }

    setMiembros((prev) =>
      prev.map((m) =>
        m.idUsuario === idUsuarioMiembro ? { ...m, decision } : m
      )
    );

    cargarCuenta();
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div style={{ padding: "20px" }}>
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

      <h1 style={{ marginTop: "20px" }}>{cuenta.nombre}</h1>
      <p>{cuenta.descripcion || "Sin descripción."}</p>

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

      <h2>Miembros de la cuenta</h2>

      {miembrosOrdenados.length === 0 && <p>No hay miembros registrados.</p>}

      {miembrosOrdenados.map((m) => (
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

          <div style={{ flex: 1 }}>
            <p><strong>{m.perfil?.nombre || "Usuario sin nombre"}</strong></p>
            <p>{m.perfil?.correoInstitucional || "Correo no disponible"}</p>
            <p>Rol: {m.rol}</p>
            <p>Estado: {m.estado}</p>

            {m.estado === "pendiente" && m.decision === null && (
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => procesarDecision(m.idUsuario, "aceptado")}
                  style={{
                    padding: "6px 12px",
                    background: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginRight: "10px"
                  }}
                >
                  Aceptar
                </button>

                <button
                  onClick={() => procesarDecision(m.idUsuario, "rechazado")}
                  style={{
                    padding: "6px 12px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Rechazar
                </button>
              </div>
            )}

            {m.decision === "aceptado" && (
              <p style={{ marginTop: "10px", color: "green" }}>
                ✔ Aceptado
              </p>
            )}

            {m.decision === "rechazado" && (
              <p style={{ marginTop: "10px", color: "red" }}>
                ✘ Rechazado
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


