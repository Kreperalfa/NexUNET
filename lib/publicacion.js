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
   SUBIR MULTIMEDIA (IMAGENES / VIDEOS / LINKS)
   ============================================================ */
export async function subirMultimediaPublicacion(fileOrLink, idPublicacion, nombreCuenta, orden = 1) {
  const supabase = getSupabaseBrowserClient();

  // Caso especial: si recibimos un string → es un link (ej: YouTube)
  if (typeof fileOrLink === "string") {
    const { error: insertError } = await supabase
      .from("MultimediaPublicacion")
      .insert({
        idPublicacion,
        tipoArchivo: "link",   // ⭐ nuevo tipo
        url: fileOrLink,       // ⭐ guardamos el link
        miniatura: null,
        orden
      });

    if (insertError) {
      console.error("ERROR INSERTANDO LINK:", insertError);
      throw new Error("Error guardando link en la base de datos");
    }

    return fileOrLink;
  }

  // Caso normal: archivo imagen/video
  const tipo = fileOrLink.type.startsWith("image") ? "imagen" : "video";
  const extension = fileOrLink.name.split(".").pop();

  const nombreArchivo = `publicaciones/${nombreCuenta}/${idPublicacion}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("publicaciones")
    .upload(nombreArchivo, fileOrLink);

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
export async function crearPublicacion({ titulo, contenido, idCuenta, archivos, nombreCuenta, youtubeURL }) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("Publicacion")
    .insert({
      titulo,
      contenido,
      idCuenta,
      estado: "activo",
      idUsuarioAutor: user.id
    })
    .select("idPublicacion")
    .single();

  if (error) throw new Error("Error creando publicación");

  const idPublicacion = data.idPublicacion;

  // Subir multimedia (archivos)
  if (archivos && archivos.length > 0) {
    let orden = 1;
    for (const file of archivos) {
      await subirMultimediaPublicacion(file, idPublicacion, nombreCuenta, orden);
      orden++;
    }
  }

  // Subir link de YouTube si existe
  if (youtubeURL) {
    let orden = (archivos?.length || 0) + 1;
    await subirMultimediaPublicacion(youtubeURL, idPublicacion, nombreCuenta, orden);
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
      titulo,
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
/* ============================================================
   BORRAR PUBLICACION
   ============================================================ */
export async function borrarPublicacion(idPublicacion) {
  const supabase = getSupabaseBrowserClient();

  try {
    // 1) Borrar multimedia asociada
    const { error: multimediaError } = await supabase
      .from("MultimediaPublicacion")
      .delete()
      .eq("idPublicacion", idPublicacion);

    if (multimediaError) {
      console.error("ERROR BORRANDO MULTIMEDIA:", multimediaError);
      throw new Error("Error borrando multimedia de la publicación");
    }

    // 2) Borrar hashtags asociados
    const { error: hashtagsError } = await supabase
      .from("Publicacion_Hashtags")
      .delete()
      .eq("idPublicacion", idPublicacion);

    if (hashtagsError) {
      console.error("ERROR BORRANDO HASHTAGS:", hashtagsError);
      throw new Error("Error borrando hashtags de la publicación");
    }

    // 3) Borrar la publicación
    const { error: pubError } = await supabase
      .from("Publicacion")
      .delete()
      .eq("idPublicacion", idPublicacion);

    if (pubError) {
      console.error("ERROR BORRANDO PUBLICACION:", pubError);
      throw new Error("Error borrando la publicación");
    }

    return true;
  } catch (err) {
    console.error("ERROR GENERAL BORRANDO PUBLICACION:", err);
    throw err;
  }
}


export async function obtenerPublicacionesCompletas() {
  const supabase = getSupabaseBrowserClient();

  try {
    const { data: publicaciones, error } = await supabase
      .from("Publicacion")
      .select("idPublicacion, titulo, contenido, fechaCreacion, idCuenta, idUsuarioAutor")
      .order("fechaCreacion", { ascending: false }); // ⭐ nuevas primero

    if (error) throw error;

    const completas = await Promise.all(
      publicaciones.map(async (pub) => {
        // Cuenta
        const { data: cuenta } = await supabase
          .from("Cuenta")
          .select("idCuenta, nombre, imagenCuenta")
          .eq("idCuenta", pub.idCuenta)
          .single();

        // Autor directo desde Usuario
        const { data: autor } = await supabase
          .from("Usuario")
          .select("id, nombre, imagenPerfil, correoInstitucional")
          .eq("id", pub.idUsuarioAutor)
          .single();

        // Multimedia
        const { data: multimedia } = await supabase
          .from("MultimediaPublicacion")
          .select("idMultimedia, tipoArchivo, url, miniatura, orden, fechaSubida")
          .eq("idPublicacion", pub.idPublicacion);

        // Hashtags
        const { data: hashtagsRel } = await supabase
          .from("Publicacion_Hashtag") // ✅ nombre correcto
          .select("Hashtag(idHashtag, nombre)")
          .eq("idPublicacion", pub.idPublicacion);

        return {
          ...pub,
          cuenta: cuenta || null,
          autor: autor || null, // ⭐ ahora es el objeto Usuario directo
          multimedia: multimedia || [],
          hashtags: hashtagsRel?.map((h) => h.Hashtag) || []
        };
      })
    );

    return { ok: true, publicaciones: completas };
  } catch (error) {
    console.error("Error obteniendo publicaciones completas:", error);
    return { ok: false, mensaje: "Error cargando publicaciones" };
  }
}
