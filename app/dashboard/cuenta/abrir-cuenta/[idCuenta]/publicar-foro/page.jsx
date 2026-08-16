"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { crearHilo } from "@/lib/hilo";

import styles from "./page.module.css";

export default function Page() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const router = useRouter();
  const idCuenta = params.idCuenta;

  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [linksExternos, setLinksExternos] = useState([]);
  const [nuevoLink, setNuevoLink] = useState("");
  const [publicando, setPublicando] = useState(false); // 👈 bloqueo anti-spam

  const cargarMaterias = async () => {
    const { data: departamento } = await supabase
      .from("Departamento")
      .select("idDepartamento")
      .eq("idCuentaDepartamento", idCuenta)
      .single();

    if (!departamento) return;

    const idDepartamento = departamento.idDepartamento;

    const { data } = await supabase
      .from("Materia")
      .select("idMateria, nombreMateria")
      .eq("idDepartamento", idDepartamento)
      .order("nombreMateria", { ascending: true });

    setMaterias(data || []);
  };

  useEffect(() => {
    cargarMaterias();
  }, [idCuenta]);

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (publicando) return; // 👈 evita spam

    if (!materiaSeleccionada) {
      setMensaje("Debes seleccionar una materia.");
      return;
    }

    setPublicando(true); // 👈 bloquea el botón

    const { data: foros } = await supabase
      .from("Foro")
      .select("idForo, tipo")
      .eq("idMateria", materiaSeleccionada)
      .eq("tipo", "OFICIAL")
      .single();

    if (!foros) {
      setMensaje("No se encontró el foro oficial de la materia.");
      setPublicando(false);
      return;
    }

    const idForoOficial = foros.idForo;
    const tipoForo = foros.tipo;

    const { data: userData } = await supabase.auth.getUser();

    const resultado = await crearHilo({
      titulo,
      contenido,
      idUsuarioCreador: userData?.user?.id,
      idCuentaCreador: idCuenta,
      idForoFuente: idForoOficial,
      nombreMateria:
        materias.find((m) => m.idMateria === materiaSeleccionada)
          ?.nombreMateria,
      tipoForo,
      archivos,
      linksExternos,
    });

    setMensaje(resultado.mensaje);

    if (resultado.ok) {
      setTitulo("");
      setContenido("");
      setMateriaSeleccionada(null);
      setArchivos([]);
      setLinksExternos([]);
      setNuevoLink("");
    }

    setPublicando(false); // 👈 desbloquea después
  };

  return (
    <main className={styles.contenedor}>
      <h1 className={styles.tituloPrincipal}>Foro Oficial</h1>
      <p className={styles.descripcion}>
        Aquí podrás publicar contenido en el foro oficial de tu departamento.
      </p>

      <h3 className={styles.subtitulo}>Seleccionar materia</h3>

      <div className={styles.listaMaterias}>
        {materias.map((m) => (
          <button
            key={m.idMateria}
            type="button"
            className={
              materiaSeleccionada === m.idMateria
                ? styles.materiaActiva
                : styles.materiaBoton
            }
            onClick={() => setMateriaSeleccionada(m.idMateria)}
          >
            {m.nombreMateria}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <h2 className={styles.tituloCard}>Publicar en Foro Oficial</h2>

        {mensaje && <p className={styles.mensaje}>{mensaje}</p>}

        <form onSubmit={manejarSubmit} className={styles.formulario}>
          <input
            type="text"
            placeholder="Título del hilo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className={styles.input}
          />

          <textarea
            placeholder="Contenido del hilo"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
            rows={5}
            className={styles.textarea}
          />

          <label className={styles.label}>Archivos adjuntos</label>

          <div className={styles.fileDrop}>
            <input
              type="file"
              multiple
              className={styles.fileInput}
              onChange={(e) => setArchivos(Array.from(e.target.files))}
            />
            <p className={styles.fileText}>Haz clic o arrastra archivos aquí</p>
          </div>

          {archivos.length > 0 && (
            <ul className={styles.fileList}>
              {archivos.map((file, idx) => (
                <li key={idx} className={styles.fileItem}>
                  {file.name}
                </li>
              ))}
            </ul>
          )}

          <label className={styles.label}>Agregar link externo</label>

          <div className={styles.agregarLink}>
            <input
              type="text"
              placeholder="https://ejemplo.com"
              value={nuevoLink}
              onChange={(e) => setNuevoLink(e.target.value)}
              className={styles.input}
            />

            <button
              type="button"
              className={styles.botonPrimario}
              onClick={() => {
                if (nuevoLink.trim()) {
                  setLinksExternos([...linksExternos, nuevoLink.trim()]);
                  setNuevoLink("");
                }
              }}
            >
              Añadir link
            </button>
          </div>

          {linksExternos.length > 0 && (
            <ul className={styles.listaLinks}>
              {linksExternos.map((link, idx) => (
                <li key={idx}>{link}</li>
              ))}
            </ul>
          )}

          <div className={styles.botonesFinales}>
            <button
              type="button"
              className={styles.botonCancelar}
              onClick={() => router.back()}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={publicando}
              className={
                publicando
                  ? styles.botonDeshabilitado
                  : styles.botonPrimario
              }
            >
              {publicando ? "Publicando..." : "Publicar Hilo"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

