"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";
import { obtenerNivel } from "../../../../lib/perfil";

// Componentes reutilizables
import Card from "@/components/cards/Card.jsx";
import Input from "@/components/ui/Input.jsx";
import Button from "@/components/buttons/Button.jsx";

import styles from "./page.module.css";

export default function CrearCuenta() {
  const redirigir = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [nombreCuenta, setNombreCuenta] = useState("");
  const [claveTemporal, setClaveTemporal] = useState("");
  const [cuentaDepartamento, setCuentaDepartamento] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const manejarCreacion = async () => {
    setMensaje("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setMensaje("No hay usuario autenticado.");
      return;
    }

    const nivel = await obtenerNivel(user.id);

    if (nivel !== 7 && nivel !== 8) {
      setMensaje("No tienes permiso para crear cuentas.");
      return;
    }

    if (!nombreCuenta.trim() || !claveTemporal.trim()) {
      setMensaje("Debes completar todos los campos.");
      return;
    }

    const { error } = await supabase.from("Cuenta").insert({
      nombre: nombreCuenta.trim(),
      claveTemporal: claveTemporal.trim(),
      clave: null,
      estado: "pendiente",
      fechaCreacion: new Date(),
      fechaActivacion: null,
      idAdmin: null,
      idCreador: user.id,
      descripcion: "",
      imagenCuenta:
        "${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/perfiles/imagenPerfil-porfecto.png",
      imagenFondoCuenta:
        "${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/perfiles/imagenFondo-pordefecto.jpg",
      cuentaDepartamento: cuentaDepartamento
    });

    if (error) {
      console.error(error);
      setMensaje("Error al crear la cuenta.");
      return;
    }

    setMensaje("Cuenta creada correctamente.");
    setTimeout(() => {
      redirigir.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="pantalla-centrada">
      <Card>
        <h1 className={styles.titulo}>Crear cuenta</h1>

        <Input
          label="Nombre de la cuenta"
          placeholder="Ej: Departamento de Matemática"
          value={nombreCuenta}
          onChange={(e) => setNombreCuenta(e.target.value)}
        />

        <Input
          label="Clave temporal"
          type="password"
          placeholder="Clave temporal"
          value={claveTemporal}
          onChange={(e) => setClaveTemporal(e.target.value)}
        />

        <div className={styles.campo}>
          <label className={styles.label}>
            ¿La cuenta es de un departamento oficial?
          </label>

          <select
            value={cuentaDepartamento ? "true" : "false"}
            onChange={(e) => setCuentaDepartamento(e.target.value === "true")}
            className={styles.select}
          >
            <option value="true">SI</option>
            <option value="false">NO</option>
          </select>
        </div>

        <Button variante="primario" onClick={manejarCreacion}>
          Crear cuenta
        </Button>

        {mensaje && <p className={styles.mensaje}>{mensaje}</p>}
      </Card>
    </div>
  );
}
