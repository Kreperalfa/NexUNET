"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Importar componentes reutilizables
import PageTitle from "@/components/ui/PageTitle";
import Input from "@/components/ui/Input";
import Button from "@/components/buttons/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SuccessMessage from "@/components/ui/SuccessMessage";
import Loader from "@/components/ui/Loader";
import SectionCard from "@/components/cards/SectionCard";
import EmptyState from "@/components/info/EmptyState";

// Importar componente nuevo
import CarreraCard from "@/components/cards/CarreraCard";

// Importar servicios
import { crearCarrera, actualizarCarrera } from "@/lib/carrera";
import { getSupabaseBrowserClient } from "@/lib/supabase";

import styles from "./page.module.css";

export default function GestionCarreras() {
  const router = useRouter();

  // Estado del formulario
  const [nombreCarrera, setNombreCarrera] = useState("");
  const [idCarreraEditar, setIdCarreraEditar] = useState(null);

  // Estado de datos
  const [carreras, setCarreras] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);

  // Estado de UI
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(null); // 'error' | 'success'

  /* ============================================================
     CARGAR USUARIO AUTENTICADO
     ============================================================ */
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        setUsuarioActual(userData?.user || null);
      } catch (error) {
        console.error("Error cargando usuario:", error);
      }
    };
    cargarUsuario();
  }, []);

  /* ============================================================
     CARGAR CARRERAS
     ============================================================ */
  const cargarCarreras = async () => {
    try {
      setCargando(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("Carrera")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error de Supabase:", error.message);
        setMensaje("Error al cargar las carreras");
        setTipoMensaje("error");
        return;
      }

      setCarreras(data || []);
      setMensaje("");
      setTipoMensaje(null);
    } catch (error) {
      console.error("Error cargando carreras:", error?.message || error);
      setMensaje("Error al cargar las carreras");
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

  /* ============================================================
     LIMPIAR FORMULARIO
     ============================================================ */
  const limpiarFormulario = () => {
    setNombreCarrera("");
    setIdCarreraEditar(null);
    setMensaje("");
    setTipoMensaje(null);
  };

  /* ============================================================
     GUARDAR CARRERA (crear o actualizar)
     ============================================================ */
  const guardarCarrera = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!nombreCarrera.trim()) {
      setMensaje("El nombre de la carrera es requerido");
      setTipoMensaje("error");
      return;
    }

    try {
      setGuardando(true);

      if (idCarreraEditar) {
        // Actualizar carrera existente
        const respuesta = await actualizarCarrera(idCarreraEditar, {
          nombreCarrera: nombreCarrera.trim(),
        });

        if (!respuesta.ok) {
          setMensaje(respuesta.mensaje || "Error al actualizar la carrera");
          setTipoMensaje("error");
          return;
        }

        setMensaje("Carrera actualizada correctamente");
      } else {
        // Crear nueva carrera
        const respuesta = await crearCarrera(nombreCarrera.trim());

        if (!respuesta.ok) {
          setMensaje(respuesta.mensaje || "Error al crear la carrera");
          setTipoMensaje("error");
          return;
        }

        setMensaje("Carrera creada correctamente");
      }

      setTipoMensaje("success");
      limpiarFormulario();
      await cargarCarreras();
    } catch (error) {
      console.error("Error guardando carrera:", error);
      setMensaje("Error procesando la solicitud");
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  /* ============================================================
     EDITAR CARRERA
     ============================================================ */
  const editarCarrera = (carrera) => {
    setNombreCarrera(carrera.nombreCarrera);
    setIdCarreraEditar(carrera.idCarrera);
    setMensaje("");
    setTipoMensaje(null);
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ============================================================
     RENDERIZADO
     ============================================================ */
  if (cargando) {
    return <Loader texto="Cargando carreras..." />;
  }

  return (
    <div className={styles.contenedor}>
      {/* Título de la página */}
      <PageTitle>Gestión de Carreras</PageTitle>

      {/* Mensajes de retroalimentación */}
      {mensaje && tipoMensaje === "success" && (
        <SuccessMessage mensaje={mensaje} />
      )}
      {mensaje && tipoMensaje === "error" && (
        <ErrorMessage mensaje={mensaje} />
      )}

      {/* Formulario */}
      <SectionCard titulo={idCarreraEditar ? "Editar Carrera" : "Crear Nueva Carrera"}>
        <form onSubmit={guardarCarrera} className={styles.formulario}>
          {/* Campo de nombre */}
          <div className={styles.grupoFormulario}>
            <label htmlFor="nombreCarrera" className={styles.etiqueta}>
              Nombre de la Carrera *
            </label>
            <Input
              id="nombreCarrera"
              type="text"
              placeholder="Ej: Ingeniería en Sistemas"
              value={nombreCarrera}
              onChange={(e) => setNombreCarrera(e.target.value)}
              disabled={guardando}
              aria-label="Nombre de la carrera"
              required
            />
          </div>

          {/* Botones de acción */}
          <div className={styles.botones}>
            <Button
              type="submit"
              disabled={guardando || !nombreCarrera.trim()}
              aria-label={idCarreraEditar ? "Actualizar carrera" : "Crear carrera"}
            >
              {guardando ? "Procesando..." : idCarreraEditar ? "Actualizar" : "Crear"}
            </Button>

            {idCarreraEditar && (
              <Button
                type="button"
                variant="enlace"
                onClick={limpiarFormulario}
                disabled={guardando}
                aria-label="Cancelar edición"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </SectionCard>

      {/* Lista de carreras */}
      <SectionCard titulo="Carreras Disponibles">
        {carreras.length === 0 ? (
          <EmptyState
            titulo="Sin carreras"
            descripcion="No hay carreras creadas aún. Crea una nueva para comenzar."
            icono="🎓"
          />
        ) : (
          <div
            className={styles.listaCarreras}
            role="region"
            aria-label="Lista de carreras disponibles"
          >
            {carreras.map((carrera) => (
              <CarreraCard
                key={carrera.idCarrera}
                carrera={carrera}
                onEdit={editarCarrera}
                nombreCreador={carrera.idUsuarioCreador}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}