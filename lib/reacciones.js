import { getSupabaseBrowserClient } from "./supabase";

/* ============================================================
   VERIFICAR SI YA TIENE LIKE
============================================================ */
export async function tieneLike(idUsuario, idEntidad, tipoEntidad) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("Reaccion")
    .select("idReaccion")
    .eq("idUsuario", idUsuario)
    .eq("idEntidad", idEntidad)
    .eq("tipoEntidad", tipoEntidad);

  if (error && error.message) {
    console.error("ERROR VERIFICANDO LIKE:", error);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

/* ============================================================
   DAR LIKE — sin duplicados
============================================================ */
export async function darLike(idUsuario, idEntidad, tipoEntidad) {
  const supabase = getSupabaseBrowserClient();

  const { data: existentes, error: errorExistente } = await supabase
    .from("Reaccion")
    .select("idReaccion")
    .eq("idUsuario", idUsuario)
    .eq("idEntidad", idEntidad)
    .eq("tipoEntidad", tipoEntidad);

  if (errorExistente && errorExistente.message) {
    console.error("ERROR VERIFICANDO EXISTENTE:", errorExistente);
    return false;
  }

  if (Array.isArray(existentes) && existentes.length > 0) {
    return true;
  }

  const { error } = await supabase
    .from("Reaccion")
    .insert({
      idUsuario,
      idEntidad,
      tipoEntidad
    });

  if (error && error.message) {
    console.error("ERROR INSERTANDO LIKE:", error);
    return false;
  }

  return true;
}

/* ============================================================
   QUITAR LIKE — elimina duplicados
============================================================ */
export async function quitarLike(idUsuario, idEntidad, tipoEntidad) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("Reaccion")
    .delete()
    .eq("idUsuario", idUsuario)
    .eq("idEntidad", idEntidad)
    .eq("tipoEntidad", tipoEntidad);

  if (error && error.message) {
    console.error("ERROR QUITANDO LIKE:", error);
    return false;
  }

  return true;
}

/* ============================================================
   CONTAR LIKES
============================================================ */
export async function contarLikes(idEntidad, tipoEntidad) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("Reaccion")
    .select("idReaccion")
    .eq("idEntidad", idEntidad)
    .eq("tipoEntidad", tipoEntidad);

  if (error && error.message) {
    console.error("ERROR CONTANDO LIKES:", error);
    return 0;
  }

  return data.length;
}
