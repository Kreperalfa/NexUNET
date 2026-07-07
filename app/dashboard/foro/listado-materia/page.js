"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabase";

export default function ListadoMateriasPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [materias, setMaterias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar departamentos
  const cargarDepartamentos = async () => {
    const { data, error } = await supabase
      .from("Departamento")
      .select("idDepartamento, nombreDepartamento")
      .order("nombreDepartamento", { ascending: true });

    if (error) {
      console.error("Error cargando departamentos:", error);
    } else {
      setDepartamentos(data);
    }
  };

  // Cargar carreras
  const cargarCarreras = async () => {
    const { data, error } = await supabase
      .from("Carrera")
      .select("idCarrera, nombreCarrera")
      .order("nombreCarrera", { ascending: true });

    if (error) {
      console.error("Error cargando carreras:", error);
    } else {
      setCarreras(data);
    }
  };

  // Cargar materias con filtros
  const cargarMaterias = async () => {
    let query = supabase.from("Materia").select("idMateria, nombreMateria, idDepartamento");

    if (departamentoSeleccionado) {
      query = query.eq("idDepartamento", departamentoSeleccionado);
    }

    if (carreraSeleccionada) {
      // 1. Buscar las materias vinculadas a la carrera seleccionada
      const { data: materiasCarrera, error: errorCarrera } = await supabase
        .from("Carrera_Materia")
        .select("idMateria")
        .eq("idCarrera", carreraSeleccionada);

      if (errorCarrera) {
        console.error("Error cargando materias de la carrera:", errorCarrera);
      } else {
        const idsMaterias = materiasCarrera.map((m) => m.idMateria);

        // 2. Filtrar las materias por esos IDs
        if (idsMaterias.length > 0) {
          query = query.in("idMateria", idsMaterias);
        } else {
          // Si no hay materias vinculadas, devolver vacío
          setMaterias([]);
          setCargando(false);
          return;
        }
      }
    }

    const { data, error } = await query.order("nombreMateria", { ascending: true });

    if (error) {
      console.error("Error cargando materias:", error);
    } else {
      setMaterias(data);
    }

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

  // Redirigir a la página de foros de la materia seleccionada
  const irAForos = (idMateria) => {
    router.push(`/dashboard/foro/mostrar-foro/${idMateria}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Seleccionar Materia</h1>

      {/* Barra de filtro por Departamento */}
      <label>
        Departamento:
        <select
          value={departamentoSeleccionado || ""}
          onChange={(e) => setDepartamentoSeleccionado(e.target.value || null)}
          style={{ marginLeft: "1rem" }}
        >
          <option value="">Todos</option>
          {departamentos.map((dep) => (
            <option key={dep.idDepartamento} value={dep.idDepartamento}>
              {dep.nombreDepartamento}
            </option>
          ))}
        </select>
      </label>

      {/* Barra de filtro por Carrera */}
      <label style={{ marginLeft: "2rem" }}>
        Carrera:
        <select
          value={carreraSeleccionada || ""}
          onChange={(e) => setCarreraSeleccionada(e.target.value || null)}
          style={{ marginLeft: "1rem" }}
        >
          <option value="">Todas</option>
          {carreras.map((car) => (
            <option key={car.idCarrera} value={car.idCarrera}>
              {car.nombreCarrera}
            </option>
          ))}
        </select>
      </label>

      {cargando && <p>Cargando materias...</p>}

      {!cargando && materias.length === 0 && (
        <p>No hay materias registradas con los filtros seleccionados.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
        {materias.map((materia) => (
          <button
            key={materia.idMateria}
            onClick={() => irAForos(materia.idMateria)}
            style={{
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
              textAlign: "left",
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            {materia.nombreMateria}
          </button>
        ))}
      </div>
    </div>
  );
}
