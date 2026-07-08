'use client';

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { establecerClavePermanente } from "../../../../../../lib/cuenta";
import { esPasswordSegura } from "../../../../../../lib/validators";

import styles from "./page.module.css";

// Componentes reutilizables
import SectionCard from "@/components/cards/SectionCard";
import FormField from "@/components/form/FormField";
import SubmitButton from "@/components/ui/SubmitButton";

export default function EstablecerClave() {
  const redirigir = useRouter();
  const params = useParams();
  const idCuenta = params.idCuenta;

  const [clave, setClave] = useState("");
  const [claveConfirmar, setClaveConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");

  /* ============================================================
     MANEJAR ESTABLECER CLAVE PERMANENTE
     ============================================================ */
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
      redirigir.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}/principal-cuenta`);
    }, 1000);
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Establecer clave permanente</h1>

      <p className={styles.descripcion}>
        Esta será la clave oficial de la cuenta. Asegúrate de que cumpla con los requisitos de seguridad.
      </p>

      {mensaje && (
        <p className={styles.mensaje}>{mensaje}</p>
      )}

      <SectionCard titulo="Nueva clave permanente">
        <FormField
          label="Nueva clave"
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        <FormField
          label="Confirmar clave"
          type="password"
          value={claveConfirmar}
          onChange={(e) => setClaveConfirmar(e.target.value)}
        />
      </SectionCard>

      <SubmitButton texto="Guardar clave" onClick={manejarEstablecerClave} />
    </div>
  );
}
