'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerCuentaCompleta, actualizarCuenta } from "../../../../../../lib/cuenta";
import { getSupabaseBrowserClient } from "../../../../../../lib/supabase";

import styles from "./page.module.css";

// Componentes reutilizables
import SectionCard from "@/components/cards/SectionCard";
import FormField from "@/components/form/FormField";
import TextareaField from "@/components/form/TextareaField";
import UploadBox from "@/components/form/UploadBox";
import SubmitButton from "@/components/ui/SubmitButton";

export default function EditarCuenta() {
  const params = useParams();
  const idCuenta = params.idCuenta;
  const redirigir = useRouter();

  const [cuenta, setCuenta] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [user, setUser] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [imagenPerfilFile, setImagenPerfilFile] = useState(null);
  const [imagenFondoFile, setImagenFondoFile] = useState(null);

  const [restaurarPerfil, setRestaurarPerfil] = useState(false);
  const [restaurarFondo, setRestaurarFondo] = useState(false);

  const [mensaje, setMensaje] = useState("");

  /* Cargar usuario */
  useEffect(() => {
    const cargarUsuario = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);
    };
    cargarUsuario();
  }, []);

  /* Cargar cuenta */
  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerCuentaCompleta(idCuenta);

      if (!respuesta.ok) {
        setMensaje(respuesta.mensaje);
        return;
      }

      setCuenta(respuesta.cuenta);
      setMiembros(respuesta.miembros);

      setNombre(respuesta.cuenta.nombre);
      setDescripcion(respuesta.cuenta.descripcion || "");
    };

    cargar();
  }, [idCuenta]);

  if (!cuenta || !user) {
    return <p className={styles.cargando}>Cargando...</p>;
  }

  /* Verificar admin */
  const esAdmin = miembros.some(
    (m) => m.idUsuario === user.id && m.rol === "Admin"
  );

  if (!esAdmin) {
    return <p className={styles.errorPermisos}>No tienes permisos para editar esta cuenta.</p>;
  }

  /* Guardar cambios */
  const guardarCambios = async () => {
    setMensaje("Guardando cambios...");

    const datos = {
      nombre,
      descripcion,
      imagenPerfilFile,
      imagenFondoFile,
      restaurarPerfil,
      restaurarFondo
    };

    const respuesta = await actualizarCuenta(idCuenta, datos);

    if (!respuesta.ok) {
      setMensaje(respuesta.mensaje);
      return;
    }

    setMensaje("Cambios guardados correctamente.");

    setTimeout(() => {
      redirigir.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}/principal-cuenta`);
    }, 1200);
  };

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Editar cuenta</h1>

      {mensaje && (
        <p className={styles.mensaje}>{mensaje}</p>
      )}

      {/* Información general */}
      <SectionCard titulo="Información general">
        <div className={styles.subtitulo}>Datos básicos</div>

        <FormField
          label="Nombre de la cuenta"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <TextareaField
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
        />
      </SectionCard>

      {/* Imágenes */}
      <SectionCard titulo="Imágenes de la cuenta">
        <div className={styles.subtitulo}>Imagen de perfil</div>

        <UploadBox
          label="Seleccionar nueva imagen"
          onFileSelect={setImagenPerfilFile}
        />

        <button
          className={styles.botonRestaurar}
          onClick={() => setRestaurarPerfil(true)}
        >
          Restaurar imagen por defecto
        </button>

        <div className={styles.separador}></div>

        <div className={styles.subtitulo}>Imagen de fondo</div>

        <UploadBox
          label="Seleccionar nueva imagen"
          onFileSelect={setImagenFondoFile}
        />

        <button
          className={styles.botonRestaurar}
          onClick={() => setRestaurarFondo(true)}
        >
          Restaurar imagen por defecto
        </button>
      </SectionCard>

      <SubmitButton texto="Guardar cambios" onClick={guardarCambios} />
    </div>
  );
}
