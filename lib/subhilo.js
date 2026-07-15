import { getSupabaseBrowserClient } from "./supabase";

// Crear un nuevo subhilo con archivos y links externos
export async function crearSubHilo({
  contenido,
  idUsuarioCreador,
  idHilo,              // hilo raíz al que pertenece
  idRespuestaPadre = null, // puede ser el hilo o un subhilo
  nombreMateria,
  tipoForo,
  archivos = [],
  linksExternos = []
}) {
  const supabase = getSupabaseBrowserClient();

  // 1. Crear el subhilo
  const { data: subhilo, error } = await supabase
    .from("SubHilo")
    .insert([
      {
        contenido,
        idUsuarioCreador,
        idHilo,
        idRespuestaPadre: idRespuestaPadre || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creando subhilo:", error);
    return { ok: false, mensaje: "Error al crear subhilo", error };
  }

  const idSubHilo = subhilo.idSubHilo;

  // 2. Subir archivos al bucket con la misma estructura que los hilos
  for (const archivo of archivos) {
    if (!archivo) continue;

    let safeName = archivo.name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    safeName = safeName.replace(/[_\.]+$/, "");

    const materiaFolder = nombreMateria?.replace(/\s+/g, "_").toLowerCase() || "sin_materia";
    const foroFolder = tipoForo?.replace(/\s+/g, "_").toLowerCase() || "sin_foro";
    const ruta = `hilo/${materiaFolder}/${foroFolder}/${idSubHilo}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("hilo")
      .upload(ruta, archivo, { upsert: true });

    if (uploadError) {
      console.error("❌ Error subiendo archivo:", uploadError);
      continue;
    }

    // ⭐ INSERT CORREGIDO: ahora sí guarda en la BD
    const { error: insertError } = await supabase.from("ArchivoHilo").insert([
      {
        idHilo: null,          // ⭐ ya no se usa para subhilos
        idSubHilo: idSubHilo,  // ⭐ nueva columna correcta
        nombreArchivo: safeName,
        tipoArchivo: archivo.type,
      },
    ]);

    if (insertError) {
      console.error("❌ Error guardando archivo en BD:", insertError);
    }
  }

  // 3. Registrar links externos
  for (const link of linksExternos) {
    const { error: linkError } = await supabase.from("ArchivoHilo").insert([
      {
        idHilo: null,
        idSubHilo: idSubHilo,
        nombreArchivo: link,
        tipoArchivo: "link",
      },
    ]);

    if (linkError) {
      console.error("❌ Error guardando link en BD:", linkError);
    }
  }

  return { ok: true, mensaje: "Subhilo creado exitosamente", subhilo };
}

// Obtener todos los subhilos de un hilo
export async function obtenerSubHilos(idHilo) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("SubHilo")
    .select("idSubHilo, contenido, created_at, idUsuarioCreador, idRespuestaPadre")
    .eq("idHilo", idHilo)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error obteniendo subhilos:", error);
    return [];
  }

  return data;
}

