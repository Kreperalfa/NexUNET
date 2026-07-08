"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { cargarPerfilUsuario, actualizarPerfilUsuario } from "@/lib/perfil";
import { getSupabaseBrowserClient } from "@/lib/supabase";

import PageTitle from "@/components/ui/PageTitle";
import SectionCard from "@/components/cards/SectionCard";
import FormField from "@/components/form/FormField";
import TextareaField from "@/components/form/TextareaField";
import UploadBox from "@/components/form/UploadBox";
import SubmitButton from "@/components/ui/SubmitButton";

import styles from "./page.module.css";

export default function EditarUsuario() {
  const params = useParams();
  const idUsuario = params.id;
  const redirigir = useRouter();

  const [perfil, setPerfil] = useState(null);
  const [user, setUser] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [imagenPerfilFile, setImagenPerfilFile] = useState(null);
  const [imagenFondoFile, setImagenFondoFile] = useState(null);

  const [restaurarPerfil, setRestaurarPerfil] = useState(false);
  const [restaurarFondo, setRestaurarFondo] = useState(false);

  const [mensaje, setMensaje] = useState("");

  /* ================= CARGAR USUARIO ================= */
  useEffect(() => {
    async function cargarUsuario() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    cargarUsuario();
  }, []);

  /* ================= CARGAR PERFIL ================= */
  useEffect(() => {
    async function cargarPerfil() {
      const resultado = await cargarPerfilUsuario();

      if (!resultado.ok) {
        setMensaje(resultado.error);
        return;
      }

      const p = resultado.perfil;

      setPerfil(p);
      setNombre(p.nombre);
      setDescripcion(p.descripcion || "");
    }

    cargarPerfil();
  }, []);

  if (!perfil || !user) return <p className={styles.cargando}>Cargando...</p>;

  /* ================= PERMISOS ================= */
  const esPropietario = user.id === perfil.id;

  if (!esPropietario)
    return <p className={styles.errorPermisos}>No tienes permisos para editar este usuario.</p>;

  /* ================= VALIDACIÓN ================= */
  function validarArchivo(file) {
    if (!file) return true;

    const formatos = ["image/jpeg", "image/png"];
    const maxMB = 3;

    if (!formatos.includes(file.type)) {
      setMensaje("Solo se permiten JPG y PNG.");
      return false;
    }

    if (file.size > maxMB * 1024 * 1024) {
      setMensaje(`La imagen supera los ${maxMB} MB.`);
      return false;
    }

    return true;
  }

  /* ================= GUARDAR ================= */
  async function guardarCambios() {
    setMensaje("Guardando cambios...");

    if (!validarArchivo(imagenPerfilFile)) return;
    if (!validarArchivo(imagenFondoFile)) return;

    const datos = {
      nombre,
      descripcion,
      imagenPerfil: imagenPerfilFile,
      imagenFondo: imagenFondoFile,
      restaurarPerfil,
      restaurarFondo,
    };

    const respuesta = await actualizarPerfilUsuario(datos);

    if (!respuesta.ok) {
      setMensaje(respuesta.error);
      return;
    }

    setMensaje("Cambios guardados correctamente.");

    setTimeout(() => {
      redirigir.push(`/dashboard/perfil/${perfil.id}`);
    }, 1200);
  }

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Editar usuario</h1>

      {mensaje && <p className={styles.mensaje}>{mensaje}</p>}

      {/* Información general */}
      <SectionCard titulo="Información del usuario">
        <div className={styles.subtitulo}>Datos básicos</div>

        <FormField
          label="Nombre"
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
      <SectionCard titulo="Imágenes del usuario">
        <div className={styles.subtitulo}>Imagen de perfil</div>

        <UploadBox
          label="Seleccionar nueva imagen"
          onFileSelect={(file) => {
            setImagenPerfilFile(file);
            setRestaurarPerfil(false);
          }}
          preview={
            imagenPerfilFile
              ? URL.createObjectURL(imagenPerfilFile)
              : perfil.imagenPerfil
          }
        />

        <button
          className={styles.botonRestaurar}
          onClick={() => {
            setImagenPerfilFile(null);
            setRestaurarPerfil(true);
          }}
        >
          Restaurar imagen por defecto
        </button>

        <div className={styles.separador}></div>

        <div className={styles.subtitulo}>Imagen de fondo</div>

        <UploadBox
          label="Seleccionar nueva imagen"
          onFileSelect={(file) => {
            setImagenFondoFile(file);
            setRestaurarFondo(false);
          }}
          preview={
            imagenFondoFile
              ? URL.createObjectURL(imagenFondoFile)
              : perfil.imagenFondo
          }
        />

        <button
          className={styles.botonRestaurar}
          onClick={() => {
            setImagenFondoFile(null);
            setRestaurarFondo(true);
          }}
        >
          Restaurar imagen por defecto
        </button>
      </SectionCard>

      <SubmitButton texto="Guardar cambios" onClick={guardarCambios} />
    </div>
  );
}
