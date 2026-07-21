import { getSupabaseBrowserClient } from "./supabase";

const ENTIDADES_VALIDAS = ["PUBLICACION", "HILO", "SUBHILO"];

/* ============================================================
   DAR LIKE
   ============================================================ */
export async function darLike(idUsuario, idEntidad, tipoEntidad) {
  if (!ENTIDADES_VALIDAS.includes(tipoEntidad)) {
    throw new Error(`Tipo de entidad inválido: ${tipoEntidad}`);
  }

  const supabase = getSupabaseBrowserClient();

  const { data: existente, error: errorExistente } = await supabase
    .from("Reaccion")
    .select("idReaccion")
    .eq("idUsuario", idUsuario)
    .eq("idEntidad", idEntidad)
    .eq("tipoEntidad", tipoEntidad)
    .maybeSingle();

  if (errorExistente) {
    console.error("ERROR VERIFICANDO EXISTENTE:", errorExistente);
    throw new Error(errorExistente.message);
  }

  if (existente) return true;

  const { error } = await supabase
    .from("Reaccion")
    .insert({
      idUsuario,
      idEntidad,
      tipoEntidad
    });

  if (error) {
    console.error("ERROR DAR LIKE:", error);
    throw new Error(error.message);
  }

  return true;
}

/* ============================================================
   QUITAR LIKE
   ============================================================ */
export async function quitarLike(idUsuario, idEntidad, tipoEntidad) {
  if (!ENTIDADES_VALIDAS.includes(tipoEntidad)) {
    throw new Error(`Tipo de entidad inválido: ${tipoEntidad}`);
  }

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("Reaccion")
    .delete()
    .eq("idUsuario", idUsuario)
    .eq("idEntidad", idEntidad)
    .eq("tipoEntidad", tipoEntidad);

  if (error) {
    console.error("ERROR QUITAR LIKE:", error);
    throw new Error(error.message);
  }

  return true;
}

/* ============================================================
   VERIFICAR SI YA TIENE LIKE
   ============================================================ */
export async function tieneLike(idUsuario, idEntidad, tipoEntidad) {
  if (!ENTIDADES_VALIDAS.includes(tipoEntidad)) {
    throw new Error(`Tipo de entidad inválido: ${tipoEntidad}`);
  }

  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("Reaccion")
    .select("idReaccion")
    .eq("idUsuario", idUsuario)
    .eq("idEntidad", idEntidad)
    .eq("tipoEntidad", tipoEntidad)
    .maybeSingle();

  if (error) {
    console.error("ERROR VERIFICANDO LIKE:", error);
    throw new Error(error.message);
  }

  return !!data;
}

/* ============================================================
   CONTAR LIKES
   ============================================================ */
export async function contarLikes(idEntidad, tipoEntidad) {
  if (!ENTIDADES_VALIDAS.includes(tipoEntidad)) {
    throw new Error(`Tipo de entidad inválido: ${tipoEntidad}`);
  }

  const supabase = getSupabaseBrowserClient();

  const { count, error } = await supabase
    .from("Reaccion")
    .select("*", { count: "exact", head: true })
    .eq("idEntidad", idEntidad)
    .eq("tipoEntidad", tipoEntidad);

  if (error) {
    console.error("ERROR CONTANDO LIKES:", error);
    throw new Error(error.message);
  }

  return count;
}
