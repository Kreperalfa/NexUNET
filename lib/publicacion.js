import { getSupabaseBrowserClient } from "./supabase";

export async function crearPublicacion({ contenido, idCuenta }) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuario no autenticado");
  }

  // Insertar publicación
  const { data, error } = await supabase
    .from("Publicacion")
    .insert({
      idUsuarioAutor: user.id,
      idCuenta,
      contenido,
      estado: "activo"
    })
    .select("idPublicacion")
    .single();

  if (error) {
    console.error("ERROR SUPABASE PUBLICACION:", error);
    throw new Error("Error creando publicación");
  }

  return data.idPublicacion;
}

export async function obtenerPublicaciones(idCuenta) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuario no autenticado");
  }

  // Obtener publicaciones de la cuenta
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

  // data = [{ idHashtag, Hashtag: { ... } }]
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
