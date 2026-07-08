"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";
import styles from "./page.module.css";

export default function ListadoMateriasPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [materias, setMaterias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarDepartamentos = async () => {
    const { data } = await supabase
      .from("Departamento")
      .select("idDepartamento, nombreDepartamento")
      .order("nombreDepartamento", { ascending: true });

    setDepartamentos(data || []);
  };

  const cargarCarreras = async () => {
    const { data } = await supabase
      .from("Carrera")
      .select("idCarrera, nombreCarrera")
      .order("nombreCarrera", { ascending: true });

    setCarreras(data || []);
  };

  const cargarMaterias = async () => {
    let query = supabase
      .from("Materia")
      .select("idMateria, nombreMateria, idDepartamento");

    if (departamentoSeleccionado) {
      query = query.eq("idDepartamento", departamentoSeleccionado);
    }

    if (carreraSeleccionada) {
      const { data: materiasCarrera } = await supabase
        .from("Carrera_Materia")
        .select("idMateria")
        .eq("idCarrera", carreraSeleccionada);

      const idsMaterias = materiasCarrera?.map((m) => m.idMateria) || [];

      if (idsMaterias.length > 0) {
        query = query.in("idMateria", idsMaterias);
      } else {
        setMaterias([]);
        setCargando(false);
        return;
      }
    }

    const { data } = await query.order("nombreMateria", { ascending: true });
    setMaterias(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarCarreras();
    cargarMaterias();
  }, []);

  useEffect(() => {
    cargarMaterias();
  }, [departamentoSeleccionado, carreraSeleccionada]);

  const irAForos = (idMateria) => {
    router.push(`/dashboard/foro/mostrar-foro/${idMateria}`);
  };

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Listado de Materias</h1>

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles.filtroBloque}>
          <label className={styles.label}>Seleccionar carrera</label>
          <select
            value={carreraSeleccionada || ""}
            onChange={(e) => setCarreraSeleccionada(e.target.value || null)}
            className={styles.select}
          >
            <option value="">Todas</option>
            {carreras.map((car) => (
              <option key={car.idCarrera} value={car.idCarrera}>
                {car.nombreCarrera}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filtroBloque}>
          <label className={styles.label}>Seleccionar departamento</label>
          <select
            value={departamentoSeleccionado || ""}
            onChange={(e) => setDepartamentoSeleccionado(e.target.value || null)}
            className={styles.select}
          >
            <option value="">Todos</option>
            {departamentos.map((dep) => (
              <option key={dep.idDepartamento} value={dep.idDepartamento}>
                {dep.nombreDepartamento}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Información del departamento */}
      <div className={styles.bloqueInfo}>
        <h2 className={styles.subtitulo}>Información del departamento</h2>
        {departamentoSeleccionado ? (
          <p className={styles.textoInfo}>
            Mostrando materias del departamento seleccionado.
          </p>
        ) : (
          <p className={styles.textoInfo}>
            Selecciona un departamento para ver más detalles.
          </p>
        )}
      </div>

      {/* Lista de materias */}
      <div className={styles.listaMaterias}>
        {materias.map((materia) => (
          <div
            key={materia.idMateria}
            className={styles.tarjetaMateria}
            onClick={() => irAForos(materia.idMateria)}
          >
            <span className={styles.nombreMateria}>{materia.nombreMateria}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
