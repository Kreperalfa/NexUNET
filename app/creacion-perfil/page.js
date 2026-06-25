"use client";

import { useState } from "react";
import { crearPerfilUsuario } from "../../lib/perfil";
import { useRouter } from 'next/navigation'

export default function CrearPerfilPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [imagenFondo, setImagenFondo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const redirigir = useRouter()

  async function handleSubmit(e) {
    e.preventDefault();

    const descFinal =
      descripcion.trim() === ""
        ? "El usuario ha decidido no describirse."
        : descripcion;

    const { ok, error } = await crearPerfilUsuario({
      nombre,
      descripcion: descFinal,
      imagenPerfil,
      imagenFondo,
    });

    if (!ok) {
      setMensaje("Error creando el perfil: " + error?.message);
      return;
    }

    setMensaje("Perfil creado correctamente.");
    redirigir.push('/dashboard')
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Crear Perfil</h1>

      <form onSubmit={handleSubmit}>
        {/* Nombre obligatorio */}
        <div>
          <label>Nombre (obligatorio)</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* Descripción opcional */}
        <div>
          <label>Descripción (opcional)</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {/* Imagen de perfil opcional */}
        <div>
          <label>Imagen de Perfil (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagenPerfil(e.target.files[0] || null)}
          />
        </div>

        {/* Imagen de fondo opcional */}
        <div>
          <label>Imagen de Fondo (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagenFondo(e.target.files[0] || null)}
          />
        </div>

        <button type="submit">Crear Perfil</button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
