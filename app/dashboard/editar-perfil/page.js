"use client";

import { useState, useEffect } from "react";
import { cargarPerfilUsuario, actualizarPerfilUsuario } from "../../../lib/perfil";

export default function EditarPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [imagenFondo, setImagenFondo] = useState(null);

  // Cargar perfil al iniciar
  useEffect(() => {
    async function fetchPerfil() {
      const resultado = await cargarPerfilUsuario();

      if (!resultado.ok) {
        console.error("Error cargando perfil:", resultado.error);
        return;
      }

      const p = resultado.perfil;
      setPerfil(p);
      setNombre(p.nombre);
      setDescripcion(p.descripcion);
    }

    fetchPerfil();
  }, []);

  // Actualizar perfil usando la función modularizada
  async function handleActualizarPerfil() {
    const resultado = await actualizarPerfilUsuario({
      nombre,
      descripcion,
      imagenPerfil,
      imagenFondo,
    });

    if (!resultado.ok) {
      alert("Error actualizando el perfil: " + resultado.error);
      return;
    }

    alert("Perfil actualizado correctamente");
  }

  if (!perfil) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Editar Perfil</h2>

      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <label>Imagen de Perfil</label>
      <input type="file" onChange={(e) => setImagenPerfil(e.target.files[0])} />

      <label>Imagen de Fondo</label>
      <input type="file" onChange={(e) => setImagenFondo(e.target.files[0])} />

      <button onClick={handleActualizarPerfil}>Guardar Cambios</button>
    </div>
  );
}
