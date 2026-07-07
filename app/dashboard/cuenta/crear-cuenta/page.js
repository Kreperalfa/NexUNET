'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";
import { obtenerNivel } from "../../../../lib/perfil";

export default function CrearCuenta() {
  const redirigir = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [nombreCuenta, setNombreCuenta] = useState("");
  const [claveTemporal, setClaveTemporal] = useState("");
  const [cuentaDepartamento, setCuentaDepartamento] = useState(false); // ← NUEVO
  const [mensaje, setMensaje] = useState("");

  const manejarCreacion = async () => {
    setMensaje("");

    // Obtener usuario autenticado
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setMensaje("No hay usuario autenticado.");
      return;
    }

    // Verificar nivel
    const nivel = await obtenerNivel(user.id);

    if (nivel !== 7 && nivel !== 8) {
      setMensaje("No tienes permiso para crear cuentas.");
      return;
    }

    // Validar campos
    if (!nombreCuenta.trim() || !claveTemporal.trim()) {
      setMensaje("Debes completar todos los campos.");
      return;
    }

    // Crear cuenta con valores iniciales correctos
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
        "https://fdegweacfliuxqqecceg.supabase.co/storage/v1/object/public/perfiles/imagenPerfil-porfecto.png",
      imagenFondoCuenta:
        "https://fdegweacfliuxqqecceg.supabase.co/storage/v1/object/public/perfiles/imagenFondo-pordefecto.jpg",
      cuentaDepartamento: cuentaDepartamento // ← NUEVO
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
    <div style={{ padding: "20px" }}>
      <h1>Crear cuenta</h1>

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
        <label>Clave temporal</label>
        <input
          type="password"
          value={claveTemporal}
          onChange={(e) => setClaveTemporal(e.target.value)}
          placeholder="Clave temporal"
        />
      </div>

      {/* ================= CUENTA DEPARTAMENTAL ================= */}
      <div style={{ marginTop: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          ¿La cuenta es de un departamento oficial?
        </label>

        <select
          value={cuentaDepartamento ? "true" : "false"}
          onChange={(e) => setCuentaDepartamento(e.target.value === "true")}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        >
          <option value="true">SI</option>
          <option value="false">NO</option>
        </select>
      </div>

      <button
        onClick={manejarCreacion}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Crear cuenta
      </button>

      {mensaje && (
        <p style={{ marginTop: "20px", color: "blue" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
