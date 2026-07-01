import { getSupabaseBrowserClient } from "./supabase";
export async function obtenerPublicacionesConMultimedia(idCuenta) {
  const supabase = getSupabaseBrowserClient();

  // 1) Obtener publicaciones
  const { data: publicaciones, error: pubError } = await supabase
    .from("Publicacion")
    .select("*")
    .eq("idCuenta", idCuenta)
    .order("fechaCreacion", { ascending: false });

  if (pubError) throw pubError;

  // 2) Obtener multimedia de cada publicación
  const publicacionesConMultimedia = [];

  for (const pub of publicaciones) {
    const { data: multimedia } = await supabase
      .from("MultimediaPublicacion")
      .select("*")
      .eq("idPublicacion", pub.idPublicacion)
      .order("orden", { ascending: true });

    publicacionesConMultimedia.push({
      ...pub,
      multimedia
    });
  }

  return publicacionesConMultimedia;
}

/* ============================================================
   SUBIR MULTIMEDIA (IMAGENES / VIDEOS)
   ============================================================ */
export async function subirMultimediaPublicacion(file, idPublicacion, nombreCuenta, orden = 1) {
  const supabase = getSupabaseBrowserClient();

  const tipo = file.type.startsWith("image") ? "imagen" : "video";
  const extension = file.name.split(".").pop();

  const nombreArchivo = `publicaciones/${nombreCuenta}/${idPublicacion}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("publicaciones")
    .upload(nombreArchivo, file);

  if (uploadError) {
    console.error("ERROR SUBIENDO MULTIMEDIA:", uploadError);
    throw new Error("Error subiendo archivo multimedia");
  }

  const { data } = supabase.storage
    .from("publicaciones")
    .getPublicUrl(nombreArchivo);

  const urlPublica = data.publicUrl;

  const { error: insertError } = await supabase
    .from("MultimediaPublicacion")
    .insert({
      idPublicacion,
      tipoArchivo: tipo,
      url: urlPublica,
      miniatura: null,
      orden
    });

  if (insertError) {
    console.error("ERROR INSERTANDO MULTIMEDIA:", insertError);
    throw new Error("Error guardando multimedia en la base de datos");
  }

  return urlPublica;
}

/* ============================================================
   CREAR PUBLICACION
   ============================================================ */
export async function crearPublicacion({ contenido, idCuenta, archivos, nombreCuenta }) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("Publicacion")
    .insert({
      contenido,
      idCuenta,
      estado: "activo",
      idUsuarioAutor: user.id   // ← IMPORTANTE
    })
    .select("idPublicacion")
    .single();

  if (error) throw new Error("Error creando publicación");

  const idPublicacion = data.idPublicacion;

  // Subir multimedia
  if (archivos && archivos.length > 0) {
    let orden = 1;

    for (const file of archivos) {
      await subirMultimediaPublicacion(file, idPublicacion, nombreCuenta, orden);
      orden++;
    }
  }

  return idPublicacion;
}


/* ============================================================
   OBTENER PUBLICACIONES
   ============================================================ */
export async function obtenerPublicaciones(idCuenta) {
  const supabase = getSupabaseBrowserClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from("Publicacion")
    .select(`
      idPublicacion,
      idUsuarioAutor,
      idCuenta,
      contenido,
      estado,
      fechaCreacion
    `)
    .eq("idCuenta", idCuenta)
    .order("fechaCreacion", { ascending: false });

  if (error) {
    console.error("ERROR SUPABASE OBTENER PUBLICACIONES:", error);
    throw new Error("Error obteniendo publicaciones");
  }

  return data;
}

/* ============================================================
   HASHTAGS
   ============================================================ */
export async function obtenerTodosLosHashtags() {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("Hashtag")
    .select("idHashtag, nombre, descripcion")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("ERROR SUPABASE OBTENER HASHTAGS:", error);
    throw new Error("Error obteniendo hashtags");
  }

  return data;
}

export async function obtenerHashtagsPublicacion(idPublicacion) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("Publicacion_Hashtags")
    .select(`
      idHashtag,
      Hashtag (
        idHashtag,
        nombre,
        descripcion
      )
    `)
    .eq("idPublicacion", idPublicacion);

  if (error) {
    console.error("ERROR SUPABASE OBTENER HASHTAGS PUBLICACION:", error);
    throw new Error("Error obteniendo hashtags de la publicación");
  }

  return data.map((h) => h.Hashtag);
}

export async function asignarHashtagsPublicacion(idPublicacion, idsHashtags) {
  const supabase = getSupabaseBrowserClient();

  if (!idPublicacion || !Array.isArray(idsHashtags) || idsHashtags.length === 0) {
    throw new Error("Datos de hashtags incompletos");
  }

  const registros = idsHashtags.map((idHashtag) => ({
    idPublicacion,
    idHashtag
  }));

  const { error } = await supabase
    .from("Publicacion_Hashtags")
    .insert(registros);

  if (error) {
    console.error("ERROR SUPABASE ASIGNAR HASHTAGS:", error);
    throw new Error("Error asignando hashtags");
  }

  return true;
}
