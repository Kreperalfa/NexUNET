"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";
import { crearHilo } from "../../../../../../lib/hilo";

export default function PublicarEnForo() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const idCuenta = params.idCuenta; // 👈 ahora usamos idCuenta desde la URL

  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar materias vinculadas al departamento de la cuenta
const cargarMaterias = async () => {
  console.log("➡️ idCuenta recibido:", idCuenta);

  // Paso 1: buscar el departamento vinculado a la cuenta
  const { data: departamento, error: depError } = await supabase
    .from("Departamento")
    .select("idDepartamento")
    .eq("idCuentaDepartamento", idCuenta)
    .single();

  if (depError || !departamento) {
    console.error("❌ Error obteniendo departamento:", depError);
    return;
  }

  const idDepartamento = departamento.idDepartamento;
  console.log("✅ idDepartamento obtenido:", idDepartamento);

  // Paso 2: cargar materias del departamento
  const { data, error } = await supabase
    .from("Materia")
    .select("idMateria, nombreMateria")
    .eq("idDepartamento", idDepartamento)
    .order("nombreMateria", { ascending: true });

  console.log("➡️ Resultado consulta Materia:", { data, error });

  if (error) {
    console.error("❌ Error cargando materias:", error);
  } else {
    console.log("✅ Materias cargadas:", data);
    setMaterias(data);
  }
};


  useEffect(() => {
    cargarMaterias();
  }, [idCuenta]);

  // Crear hilo en foro oficial de la materia seleccionada
  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!materiaSeleccionada) {
      setMensaje("Debes seleccionar una materia.");
      return;
    }

    console.log("➡️ Materia seleccionada:", materiaSeleccionada);

    // Buscar foro oficial de la materia
    const { data: foros, error } = await supabase
      .from("Foro")
      .select("idForo")
      .eq("idMateria", materiaSeleccionada)
      .eq("tipo", "OFICIAL")
      .single();

    console.log("➡️ Resultado consulta Foro oficial:", { foros, error });

    if (error || !foros) {
      setMensaje("No se encontró el foro oficial de la materia.");
      return;
    }

    const idForoOficial = foros.idForo;
    console.log("✅ idForoOficial encontrado:", idForoOficial);

    // Crear hilo
    const { data: userData } = await supabase.auth.getUser();
    console.log("➡️ Usuario autenticado:", userData);

    const resultado = await crearHilo({
      titulo,
      contenido,
      idUsuarioCreador: userData?.user?.id, // usuario actual
      idCuentaCreador: idCuenta,      // 👈 pasamos idCuenta, backend resuelve idDepartamento
      idForoFuente: idForoOficial,
    });

    console.log("➡️ Resultado creación hilo:", resultado);

    setMensaje(resultado.mensaje);

    if (resultado.ok) {
      setTitulo("");
      setContenido("");
      setMateriaSeleccionada(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
        Foro Oficial
      </h1>

      <p style={{ fontSize: "18px", color: "#555" }}>
        Aquí podrás publicar contenido en el foro oficial de tu departamento.
      </p>

      {/* Selección de materia */}
      <h3 style={{ marginTop: "20px" }}>Seleccionar materia:</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {materias.map((m) => (
          <button
            type="button"
            key={m.idMateria}
            onClick={() => setMateriaSeleccionada(m.idMateria)}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor:
                materiaSeleccionada === m.idMateria ? "#4caf50" : "#f0f0f0",
              color: materiaSeleccionada === m.idMateria ? "#fff" : "#000",
            }}
          >
            {m.nombreMateria}
          </button>
        ))}
      </div>

      {/* Formulario de publicación */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "10px",
          border: "1px solid #ddd",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Publicar en Foro Oficial</h2>
        <form onSubmit={manejarSubmit}>
          <input
            type="text"
            placeholder="Título del hilo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          <textarea
            placeholder="Contenido del hilo"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
            rows={5}
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          <button type="submit">Publicar Hilo</button>
        </form>
        {mensaje && <p style={{ marginTop: "10px" }}>{mensaje}</p>}
      </div>
    </div>
  );
}
