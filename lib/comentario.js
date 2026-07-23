import { getSupabaseBrowserClient } from "./supabase";

/* ============================================================
   CREAR COMENTARIO
   ============================================================ */
export async function crearComentario(idUsuario, idPublicacion, contenido) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("ComentarioPublicacion")
    .insert({
      idUsuario,
      idPublicacion,
      contenido
    });

  if (error) {
    console.error("ERROR CREAR COMENTARIO:", error);
    throw new Error(error.message);
  }

  return true;
}

/* ============================================================
   BORRAR COMENTARIO
   ============================================================ */
export async function borrarComentario(idComentario, idUsuario) {
  const supabase = getSupabaseBrowserClient();

  // Solo permite borrar si el comentario pertenece al usuario
  const { error } = await supabase
    .from("ComentarioPublicacion")
    .delete()
    .eq("idComentario", idComentario)
    .eq("idUsuario", idUsuario);

  if (error) {
    console.error("ERROR BORRAR COMENTARIO:", error);
    throw new Error(error.message);
  }

  return true;
}

/* ============================================================
   OBTENER COMENTARIOS DE UNA PUBLICACION
   ============================================================ */
export async function obtenerComentariosPublicacion(idPublicacion) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("ComentarioPublicacion")
    .select(
      `
      idComentario,
      contenido,
      created_at,
      Usuario(id, nombre, imagenPerfil)
    `
    )
    .eq("idPublicacion", idPublicacion)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("ERROR OBTENER COMENTARIOS:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/* ============================================================
   CONTAR COMENTARIOS
   ============================================================ */
export async function contarComentarios(idPublicacion) {
  const supabase = getSupabaseBrowserClient();

  const { count, error } = await supabase
    .from("ComentarioPublicacion")
    .select("*", { count: "exact", head: true })
    .eq("idPublicacion", idPublicacion);

  if (error) {
    console.error("ERROR CONTAR COMENTARIOS:", error);
    throw new Error(error.message);
  }

  return count;
}
