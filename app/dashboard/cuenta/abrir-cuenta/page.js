'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { abrirCuenta } from "../../../../lib/cuenta";

export default function AbrirCuenta() {
  const redirigir = useRouter();

  const [nombreCuenta, setNombreCuenta] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarAbrirCuenta = async () => {
    setMensaje("");

    if (!nombreCuenta.trim() || !clave.trim()) {
      setMensaje("Debes completar todos los campos.");
      return;
    }

    const respuesta = await abrirCuenta(nombreCuenta.trim(), clave.trim());

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje || "Error desconocido.");
      return;
    }

    /* ============================================================
       MANEJO DE RESPUESTAS SEGÚN LA LÓGICA DEL BACKEND
       ============================================================ */

    switch (respuesta.tipo) {
      case "ingreso-directo":
        setMensaje("Ingreso exitoso.");
        setTimeout(() => {
          redirigir.push(`/dashboard/cuenta/${respuesta.cuenta.idCuenta}`);
        }, 1000);
        break;

      case "establecer-clave":
        setMensaje("Debes establecer la clave permanente.");
        setTimeout(() => {
          redirigir.push(`/dashboard/cuenta/abrir-cuenta/${respuesta.cuenta.idCuenta}/establecer-clave`);
        }, 1000);
        break;

      case "solicitud-enviada":
        setMensaje("Solicitud enviada. Espera aprobación del administrador.");
        break;

      case "solicitud-ya-enviada":
        setMensaje("Ya tienes una solicitud pendiente.");
        break;

      default:
        setMensaje("Ocurrió un error inesperado.");
        break;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Abrir cuenta</h1>

      <div style={{ marginTop: "20px" }}>
        <label>Nombre de la cuenta</label>
        <input
          type="text"
          value={nombreCuenta}
          onChange={(e) => setNombreCuenta(e.target.value)}
          placeholder="Ej: Departamento de Matemática"
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Clave</label>
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Clave temporal o clave permanente"
        />
      </div>

      <button
        onClick={manejarAbrirCuenta}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Abrir cuenta
      </button>

      {mensaje && (
        <p style={{ marginTop: "20px", color: "blue" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
