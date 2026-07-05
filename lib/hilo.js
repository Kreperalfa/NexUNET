"use client";
import { getSupabaseBrowserClient } from "./supabase"; // 👈 solo browser client

// Crear un nuevo hilo con archivos y links externos
export async function crearHilo({
  titulo,
  contenido,
  idUsuarioCreador,
  idCuentaCreador = null,
  idForoFuente,
  nombreMateria,
  tipoForo,
  archivos = [],     // array de File/Blob
  linksExternos = [] // array de strings (URLs)
}) {
  const supabase = getSupabaseBrowserClient();

  // 1. Crear el hilo
  const { data: hilo, error } = await supabase
    .from("Hilo")
    .insert([
      {
        titulo,
        contenido,
        idUsuarioCreador,
        idCuentaCreador,
        idForoFuente,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creando hilo:", error);
    return { ok: false, mensaje: "Error al crear el hilo", error };
  }

  const idHilo = hilo.idHilo;

  // 2. Subir archivos al bucket y registrar en ArchivoHilo
  for (const archivo of archivos) {
    if (!archivo) continue;

    // Normalizar nombre de archivo
    let safeName = archivo.name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    safeName = safeName.replace(/[_\.]+$/, "");

    const materiaFolder = nombreMateria?.replace(/\s+/g, "_").toLowerCase() || "sin_materia";
    const foroFolder = tipoForo?.replace(/\s+/g, "_").toLowerCase() || "sin_foro";
    const ruta = `hilo/${materiaFolder}/${foroFolder}/${idHilo}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("hilo")
      .upload(ruta, archivo, { upsert: true });

    if (uploadError) {
      console.error("❌ Error subiendo archivo:", uploadError);
      continue;
    }

    await supabase.from("ArchivoHilo").insert([
      {
        idHilo,
        nombreArchivo: safeName,
        tipoArchivo: archivo.type,
      },
    ]);
  }

  // 3. Registrar links externos
  for (const link of linksExternos) {
    await supabase.from("ArchivoHilo").insert([
      {
        idHilo,
        nombreArchivo: link,
        tipoArchivo: "link",
      },
    ]);
  }

  return { ok: true, mensaje: "Hilo creado exitosamente con archivos y links", hilo };
}

// Editar un hilo existente
export async function actualizarHilo(idHilo, { titulo, contenido }) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("Hilo")
    .update({ titulo, contenido })
    .eq("idHilo", idHilo)
    .select()
    .single();

  if (error) {
    console.error("❌ Error actualizando hilo:", error);
    return { ok: false, mensaje: "Error al actualizar el hilo", error };
  }

  return { ok: true, mensaje: "Hilo actualizado exitosamente", hilo: data };
}

// Eliminar un hilo existente
export async function eliminarHilo(idHilo) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("Hilo")
    .delete()
    .eq("idHilo", idHilo);

  if (error) {
    console.error("❌ Error eliminando hilo:", error);
    return { ok: false, mensaje: "Error al eliminar el hilo", error };
  }

  return { ok: true, mensaje: "Hilo eliminado exitosamente" };
}
