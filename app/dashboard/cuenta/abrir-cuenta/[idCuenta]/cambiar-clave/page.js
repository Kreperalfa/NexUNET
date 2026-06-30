'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { obtenerCuentaCompleta, establecerClavePermanente } from "../../../../../../lib/cuenta";
import { esPasswordSegura } from "../../../../../../lib/validators";
import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";

export default function CambiarClave() {
  const redirigir = useRouter();
  const params = useParams();
  const idCuenta = params.idCuenta;

  const [cuenta, setCuenta] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [user, setUser] = useState(null);

  const [clave, setClave] = useState("");
  const [claveConfirmar, setClaveConfirmar] = useState("");
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
        No tienes permisos para cambiar la clave de esta cuenta.
      </p>
    );
  }

  /* ============================================================
     MANEJAR CAMBIO DE CLAVE
     ============================================================ */
  const manejarCambioClave = async () => {
    setMensaje("");

    if (!clave.trim() || !claveConfirmar.trim()) {
      setMensaje("Debes completar todos los campos.");
      return;
    }

    if (clave !== claveConfirmar) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    if (!esPasswordSegura(clave)) {
      setMensaje(
        "La contraseña debe tener al menos una mayúscula, un número, un caracter especial y mínimo 6 caracteres."
      );
      return;
    }

    const respuesta = await establecerClavePermanente(idCuenta, clave.trim());

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje || "Error desconocido.");
      return;
    }

    setMensaje("Clave actualizada correctamente.");

    setTimeout(() => {
      redirigir.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}/principal-cuenta`);
    }, 1200);
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div style={{ padding: "20px" }}>
      <h1>Cambiar clave de la cuenta</h1>

      <p>Esta será la nueva clave oficial de la cuenta.</p>

      <div style={{ marginTop: "20px" }}>
        <label>Nueva clave</label>
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Nueva clave"
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Confirmar clave</label>
        <input
          type="password"
          value={claveConfirmar}
          onChange={(e) => setClaveConfirmar(e.target.value)}
          placeholder="Confirmar clave"
        />
      </div>

      <button
        onClick={manejarCambioClave}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Guardar clave
      </button>

      {mensaje && (
        <p style={{ marginTop: "20px", color: "blue" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
