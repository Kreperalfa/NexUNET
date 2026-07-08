'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { abrirCuenta } from "@/lib/cuenta";

import Card from "@/components/cards/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/buttons/Button";
import PageTitle from "@/components/ui/PageTitle";
import ErrorMessage from "@/components/ui/ErrorMessage";

import styles from "./page.module.css";

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

    switch (respuesta.tipo) {
      case "ingreso-directo":
        setMensaje("Ingreso exitoso.");
        setTimeout(() => {
          redirigir.push(
            `/dashboard/cuenta/abrir-cuenta/${respuesta.cuenta.idCuenta}/principal-cuenta`
          );
        }, 1000);
        break;

      case "establecer-clave":
        setMensaje("Debes establecer la clave permanente.");
        setTimeout(() => {
          redirigir.push(
            `/dashboard/cuenta/abrir-cuenta/${respuesta.cuenta.idCuenta}/establecer-clave`
          );
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
    <div className={styles.contenedor}>
      <Card>

        <PageTitle>Abrir cuenta</PageTitle>

        <Input
          label="Nombre de la cuenta"
          placeholder="Ej: Departamento de Matemática"
          value={nombreCuenta}
          onChange={(e) => setNombreCuenta(e.target.value)}
        />

        <Input
          label="Clave"
          type="password"
          placeholder="Clave temporal o clave permanente"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        <Button variante="primario" onClick={manejarAbrirCuenta}>
          Abrir cuenta
        </Button>

        <ErrorMessage mensaje={mensaje} />

      </Card>
    </div>
  );
}


