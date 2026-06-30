'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerCuentaCompleta, actualizarCuenta } from "../../../../../../lib/cuenta";
import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";

export default function EditarCuenta() {
  const params = useParams();
  const idCuenta = params.idCuenta;
  const redirigir = useRouter();

  const [cuenta, setCuenta] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [user, setUser] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [imagenPerfilFile, setImagenPerfilFile] = useState(null);
  const [imagenFondoFile, setImagenFondoFile] = useState(null);

  const [restaurarPerfil, setRestaurarPerfil] = useState(false);
  const [restaurarFondo, setRestaurarFondo] = useState(false);

  const [mensaje, setMensaje] = useState("");

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

      setNombre(respuesta.cuenta.nombre);
      setDescripcion(respuesta.cuenta.descripcion || "");
    };

    cargar();
  }, [idCuenta]);

  if (!cuenta || !user) {
    return <p style={{ padding: "20px" }}>Cargando...</p>;
  }

  /* ============================================================
     VERIFICAR SI ES ADMIN
     ============================================================ */
  const esAdmin = miembros.some(
    (m) => m.idUsuario === user.id && m.rol === "Admin"
  );

  if (!esAdmin) {
    return (
      <p style={{ padding: "20px", color: "red" }}>
        No tienes permisos para editar esta cuenta.
      </p>
    );
  }

  /* ============================================================
     GUARDAR CAMBIOS
     ============================================================ */
  const guardarCambios = async () => {
    setMensaje("Guardando cambios...");

    const datos = {
      nombre,
      descripcion,
      imagenPerfilFile,
      imagenFondoFile,
      restaurarPerfil,
      restaurarFondo
    };

    const respuesta = await actualizarCuenta(idCuenta, datos);

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje);
      return;
    }

    setMensaje("Cambios guardados correctamente.");

    setTimeout(() => {
      redirigir.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}/principal-cuenta`);
    }, 1200);
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Editar cuenta</h1>

      {mensaje && (
        <p style={{ marginTop: "10px", color: mensaje.includes("error") ? "red" : "green" }}>
          {mensaje}
        </p>
      )}

      <label style={{ display: "block", marginTop: "20px" }}>
        Nombre de la cuenta:
      </label>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "5px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />

      <label style={{ display: "block", marginTop: "20px" }}>
        Descripción:
      </label>
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "5px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />

      {/* Imagen de perfil */}
      <label style={{ display: "block", marginTop: "20px" }}>
        Imagen de perfil:
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagenPerfilFile(e.target.files[0])}
      />
      <button
        onClick={() => setRestaurarPerfil(true)}
        style={{
          marginTop: "10px",
          padding: "8px 15px",
          background: "#555",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Restaurar imagen por defecto
      </button>

      {/* Imagen de fondo */}
      <label style={{ display: "block", marginTop: "20px" }}>
        Imagen de fondo:
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagenFondoFile(e.target.files[0])}
      />
      <button
        onClick={() => setRestaurarFondo(true)}
        style={{
          marginTop: "10px",
          padding: "8px 15px",
          background: "#555",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Restaurar imagen por defecto
      </button>

      <button
        onClick={guardarCambios}
        style={{
          marginTop: "30px",
          padding: "12px 20px",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        Guardar cambios
      </button>
    </div>
  );
}
