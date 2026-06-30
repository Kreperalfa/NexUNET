'use client';

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { establecerClavePermanente } from "../../../../../../lib/cuenta";
import { esPasswordSegura } from "../../../../../../lib/validators";

export default function EstablecerClave() {
  const redirigir = useRouter();
  const params = useParams();
  const idCuenta = params.idCuenta;

  const [clave, setClave] = useState("");
  const [claveConfirmar, setClaveConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarEstablecerClave = async () => {
    setMensaje("");

    /* ============================================================
       VALIDACIONES
       ============================================================ */

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

    /* ============================================================
       ESTABLECER CLAVE PERMANENTE
       ============================================================ */

    const respuesta = await establecerClavePermanente(idCuenta, clave.trim());

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje || "Error desconocido.");
      return;
    }

    setMensaje("Clave establecida correctamente.");
    setTimeout(() => {
      redirigir.push(`/dashboard/cuenta/${idCuenta}`);
    }, 1000);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Establecer clave permanente</h1>

      <p>Esta será la clave oficial de la cuenta.</p>

      <div style={{ marginTop: "20px" }}>
        <label>Nueva clave</label>
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Nueva clave permanente"
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
        onClick={manejarEstablecerClave}
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
