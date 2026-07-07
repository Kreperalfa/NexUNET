"use client";
import { useState, useEffect } from "react";
import { crearCarrera, actualizarCarrera } from "../../../../lib/carrera";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";

export default function CarreraPage() {
  const supabase = getSupabaseBrowserClient();
  const [nombreCarrera, setNombreCarrera] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [carreras, setCarreras] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  // Cargar todas las carreras
  const cargarCarreras = async () => {
    const { data, error } = await supabase
      .from("Carrera")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setCarreras(data);
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

  // Crear o actualizar carrera
  const manejarSubmit = async (e) => {
    e.preventDefault();
    let resultado;

    if (editandoId) {
      resultado = await actualizarCarrera(editandoId, { nombreCarrera });
    } else {
      resultado = await crearCarrera(nombreCarrera);
    }

    setMensaje(resultado.mensaje);

    if (resultado.ok) {
      await cargarCarreras();
      setNombreCarrera("");
      setEditandoId(null);
    }
  };

  // Preparar edición
  const manejarEditar = (carrera) => {
    setNombreCarrera(carrera.nombreCarrera);
    setEditandoId(carrera.idCarrera);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestión de Carreras</h1>

      {/* Formulario */}
      <form onSubmit={manejarSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Nombre de la carrera"
          value={nombreCarrera}
          onChange={(e) => setNombreCarrera(e.target.value)}
          required
        />
        <button type="submit">
          {editandoId ? "Actualizar Carrera" : "Crear Carrera"}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={() => {
              setEditandoId(null);
              setNombreCarrera("");
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {mensaje && <p>{mensaje}</p>}

      {/* Lista de carreras */}
      <h2>Carreras creadas</h2>
      <ul>
        {carreras.map((carrera) => (
          <li key={carrera.idCarrera} style={{ marginBottom: "1rem" }}>
            <strong>{carrera.nombreCarrera}</strong>
            <br />
            Creada por usuario: {carrera.idUsuarioCreador}
            <br />
            Fecha: {new Date(carrera.created_at).toLocaleString()}
            <br />
            <button onClick={() => manejarEditar(carrera)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
