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
      contenido,
      estado: "ACTIVO"   // ⭐ Estado inicial
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

  // En vez de borrar físicamente, marcamos como ELIMINADO
  const { error } = await supabase
    .from("ComentarioPublicacion")
    .update({ estado: "ELIMINADO" })
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
      estado,
      Usuario(id, nombre, imagenPerfil)
    `
    )
    .eq("idPublicacion", idPublicacion)
    .not("estado", "eq", "ELIMINADO")   // ⭐ Mostrar ACTIVO y REPORTADO
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
    .eq("idPublicacion", idPublicacion)
    .not("estado", "eq", "ELIMINADO");   // ⭐ Contar ACTIVO y REPORTADO

  if (error) {
    console.error("ERROR CONTAR COMENTARIOS:", error);
    throw new Error(error.message);
  }

  return count;
}
