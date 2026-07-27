import { getSupabaseBrowserClient } from "../supabase";

const supabase = getSupabaseBrowserClient();

/**
 * Registrar una búsqueda en CandyHistorial
 */
export async function registrarBusqueda({
  idUsuario,
  consulta,
  intencionDetectada,
  contexto = {},
  resultadoObtenido = 0,
  estado = "pendiente"
}) {
  const { error } = await supabase
    .from("CandyHistorial")
    .insert({
      idUsuario,
      consulta,
      intencionDetectada,
      contexto,
      resultadoObtenido,
      estado,
      created_at: new Date()
    });

  if (error) {
    console.error("ERROR REGISTRAR BUSQUEDA:", error);
    throw new Error(error.message);
  }

  return true;
}

/**
 * Obtener historial completo de un usuario
 */
export async function obtenerHistorialUsuario(idUsuario) {
  const { data, error } = await supabase
    .from("CandyHistorial")
    .select("*")
    .eq("idUsuario", idUsuario)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ERROR OBTENER HISTORIAL:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Obtener la última búsqueda de un usuario
 */
export async function obtenerUltimaBusqueda(idUsuario) {
  const { data, error } = await supabase
    .from("CandyHistorial")
    .select("*")
    .eq("idUsuario", idUsuario)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("ERROR OBTENER ULTIMA BUSQUEDA:", error);
    throw new Error(error.message);
  }

  return data || null;
}
