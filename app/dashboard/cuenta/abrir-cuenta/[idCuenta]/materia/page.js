"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  crearMateria,
  actualizarMateria,
  obtenerCarrerasMateria,
  actualizarCarrerasMateria,
  vincularCarrerasMateria,
} from "../../../../../../lib/materia";
import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";

export default function MateriaPage() {
  const supabase = getSupabaseBrowserClient();
  const [nombreMateria, setNombreMateria] = useState("");
  const [unidadCredito, setUnidadCredito] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [carrerasSeleccionadas, setCarrerasSeleccionadas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const params = useParams();
  const idCuentaActual = params.idCuenta;

  // Cargar todas las materias de la cuenta actual
  const cargarMaterias = async () => {
    // 1. Buscar el departamento vinculado a la cuenta
    const { data: dep, error: depError } = await supabase
      .from("Departamento")
      .select("idDepartamento")
      .eq("idCuentaDepartamento", idCuentaActual)
      .single();

    if (depError || !dep) {
      console.error("No se encontró departamento para la cuenta:", depError);
      setMaterias([]);
      return;
    }

    // 2. Buscar materias de ese departamento
    const { data, error } = await supabase
      .from("Materia")
      .select("*")
      .eq("idDepartamento", dep.idDepartamento)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMaterias([]);
    } else {
      setMaterias(data);
    }
  };



  // Cargar todas las carreras
  const cargarCarreras = async () => {
    const { data, error } = await supabase
      .from("Carrera")
      .select("idCarrera, nombreCarrera")
      .order("nombreCarrera", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setCarreras(data);
    }
  };

  useEffect(() => {
    cargarMaterias();
    cargarCarreras();
  }, []);

  // Crear o actualizar materia
  const manejarSubmit = async (e) => {
    e.preventDefault();
    let resultado;

    if (editandoId) {
      resultado = await actualizarMateria(editandoId, {
        nombreMateria,
        unidadCredito: parseInt(unidadCredito, 10),
      });

      if (resultado.ok) {
        await actualizarCarrerasMateria(editandoId, carrerasSeleccionadas);
      }
    } else {
      resultado = await crearMateria(
        nombreMateria,
        parseInt(unidadCredito, 10),
        idCuentaActual
      );

      if (resultado.ok && resultado.materia) {
        await vincularCarrerasMateria(resultado.materia.idMateria, carrerasSeleccionadas);
      }
    }

    setMensaje(resultado.mensaje);

    if (resultado.ok) {
      await cargarMaterias();
      setNombreMateria("");
      setUnidadCredito("");
      setCarrerasSeleccionadas([]);
      setEditandoId(null);
    }
  };

  // Preparar edición
  const manejarEditar = async (materia) => {
    setNombreMateria(materia.nombreMateria);
    setUnidadCredito(materia.unidadCredito);
    setEditandoId(materia.idMateria);

    const vinculadas = await obtenerCarrerasMateria(materia.idMateria);
    setCarrerasSeleccionadas(vinculadas);
  };

  const toggleCarrera = (idCarrera) => {
    setCarrerasSeleccionadas((prev) =>
      prev.includes(idCarrera)
        ? prev.filter((id) => id !== idCarrera)
        : [...prev, idCarrera]
    );
  };

  return (
    <div style={{ padding: "2rem" }}>
      <input
        type="text"
        value={idCuentaActual}
        readOnly
        style={{ marginTop: "1rem", backgroundColor: "#eee" }}
      />
      <h1>Gestión de Materias</h1>

      {/* Formulario */}
      <form onSubmit={manejarSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Nombre de la materia"
          value={nombreMateria}
          onChange={(e) => setNombreMateria(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Unidad de crédito"
          value={unidadCredito}
          onChange={(e) => setUnidadCredito(e.target.value)}
          required
        />

        <h3>Seleccionar carreras vinculadas:</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {carreras.map((carrera) => (
            <button
              type="button"
              key={carrera.idCarrera}
              onClick={() => toggleCarrera(carrera.idCarrera)}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: carrerasSeleccionadas.includes(carrera.idCarrera)
                  ? "#4caf50"
                  : "#f0f0f0",
                color: carrerasSeleccionadas.includes(carrera.idCarrera)
                  ? "#fff"
                  : "#000",
              }}
            >
              {carrera.nombreCarrera}
            </button>
          ))}
        </div>

        <button type="submit" style={{ marginTop: "1rem" }}>
          {editandoId ? "Actualizar Materia" : "Crear Materia"}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={() => {
              setEditandoId(null);
              setNombreMateria("");
              setUnidadCredito("");
              setCarrerasSeleccionadas([]);
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {mensaje && <p>{mensaje}</p>}

      {/* Lista de materias */}
      <h2>Materias registradas</h2>
      {materias.length === 0 ? (
        <p>No hay materias creadas en esta cuenta.</p>
      ) : (
        <ul>
          {materias.map((materia) => (
            <li key={materia.idMateria} style={{ marginBottom: "1rem" }}>
              <strong>{materia.nombreMateria}</strong>
              <br />
              Créditos: {materia.unidadCredito}
              <br />
              Departamento: {materia.idDepartamento}
              <br />
              Creada por usuario: {materia.idUsuarioCreado}
              <br />
              Fecha: {new Date(materia.created_at).toLocaleString()}
              <br />
              <button onClick={() => manejarEditar(materia)}>Editar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
