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