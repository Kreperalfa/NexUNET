'use client';

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

import styles from "./page.module.css";

// Componentes reutilizables
import SectionCard from "@/components/cards/SectionCard";
import FormField from "@/components/form/FormField";
import SubmitButton from "@/components/ui/SubmitButton";

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

  /* ============================================================
     CARGAR TODAS LAS MATERIAS DE LA CUENTA ACTUAL
     ============================================================ */
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

  /* ============================================================
     CARGAR TODAS LAS CARRERAS
     ============================================================ */
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

  /* ============================================================
     CREAR O ACTUALIZAR MATERIA
     ============================================================ */
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

  /* ============================================================
     PREPARAR EDICIÓN
     ============================================================ */
  const manejarEditar = async (materia) => {
    setNombreMateria(materia.nombreMateria);
    setUnidadCredito(materia.unidadCredito);
    setEditandoId(materia.idMateria);

    const vinculadas = await obtenerCarrerasMateria(materia.idMateria);
    setCarrerasSeleccionadas(vinculadas);
  };

  /* ============================================================
     SELECCIONAR CARRERA
     ============================================================ */
  const toggleCarrera = (idCarrera) => {
    setCarrerasSeleccionadas((prev) =>
      prev.includes(idCarrera)
        ? prev.filter((id) => id !== idCarrera)
        : [...prev, idCarrera]
    );
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Gestión de Materias</h1>

      <SectionCard titulo={editandoId ? "Editar materia" : "Crear nueva materia"}>
        <form onSubmit={manejarSubmit} className={styles.formulario}>
          <FormField
            label="Nombre de la materia"
            value={nombreMateria}
            onChange={(e) => setNombreMateria(e.target.value)}
          />

          <FormField
            label="Unidad de crédito"
            type="number"
            value={unidadCredito}
            onChange={(e) => setUnidadCredito(e.target.value)}
          />

          <h3 className={styles.subtitulo}>Seleccionar carreras vinculadas</h3>

          <div className={styles.carrerasGrid}>
            {carreras.map((carrera) => (
              <button
                type="button"
                key={carrera.idCarrera}
                onClick={() => toggleCarrera(carrera.idCarrera)}
                className={`${styles.carreraItem} ${
                  carrerasSeleccionadas.includes(carrera.idCarrera)
                    ? styles.carreraActiva
                    : ""
                }`}
              >
                {carrera.nombreCarrera}
              </button>
            ))}
          </div>

          <SubmitButton
            texto={editandoId ? "Actualizar materia" : "Crear materia"}
          />

          {editandoId && (
            <button
              type="button"
              className={styles.botonCancelar}
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
      </SectionCard>

      {mensaje && <p className={styles.mensaje}>{mensaje}</p>}

      <h2 className={styles.subtitulo}>Materias registradas</h2>

      {materias.length === 0 ? (
        <p>No hay materias creadas en esta cuenta.</p>
      ) : (
        <ul className={styles.listaMaterias}>
          {materias.map((materia) => (
            <li key={materia.idMateria} className={styles.materiaItem}>
              <strong>{materia.nombreMateria}</strong>
              <div>Créditos: {materia.unidadCredito}</div>
              <div>Departamento: {materia.idDepartamento}</div>
              <div>Creada por usuario: {materia.idUsuarioCreado}</div>
              <div>Fecha: {new Date(materia.created_at).toLocaleString()}</div>

              <button
                className={styles.botonEditar}
                onClick={() => manejarEditar(materia)}
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
