import { getSupabaseBrowserClient } from "./supabase";

const supabase = getSupabaseBrowserClient();

/**
 * Crear una notificación
 */
export async function crearNotificacion({
  idUsuarioDestino = null,
  idCuentaDestino = null,
  idUsuarioAccion,
  idPublicacion = null,
  idComentario = null,
  idCuenta = null,
  tipo,
  mensaje
}) {
  const { error } = await supabase
    .from("Notificacion")
    .insert({
      idUsuarioDestino,
      idCuentaDestino,
      idUsuarioAccion,
      idPublicacion,
      idComentario,
      idCuenta,
      tipo,
      mensaje
    });

  if (error) {
    console.error("Error creando notificación:", error);
    throw new Error(error.message);
  }
  return true;
}

/**
 * Obtener notificaciones de un usuario o cuenta
 */
export async function obtenerNotificaciones({ idUsuario = null, idCuenta = null }) {
  let query = supabase.from("Notificacion").select(`
    idNotificacion,
    created_at,
    idUsuarioDestino,
    idCuentaDestino,
    idUsuarioAccion,
    idPublicacion,
    idComentario,
    idCuenta,
    tipo,
    mensaje,
    leido
  `).order("created_at", { ascending: false });

  if (idUsuario) query = query.eq("idUsuarioDestino", idUsuario);
  if (idCuenta) query = query.eq("idCuentaDestino", idCuenta);

  const { data, error } = await query;
  if (error) {
    console.error("Error obteniendo notificaciones:", error);
    throw new Error(error.message);
  }
  return data;
}

/**
 * Marcar una notificación como leída
 */
export async function marcarNotificacionLeida(idNotificacion) {
  const { error } = await supabase
    .from("Notificacion")
    .update({ leido: true })
    .eq("idNotificacion", idNotificacion);

  if (error) {
    console.error("Error marcando notificación como leída:", error);
    throw new Error(error.message);
  }
  return true;
}

/**
 * Contar notificaciones no leídas
 */
export async function contarNoLeidas({ idUsuario = null, idCuenta = null }) {
  let query = supabase.from("Notificacion").select("idNotificacion", { count: "exact" }).eq("leido", false);

  if (idUsuario) query = query.eq("idUsuarioDestino", idUsuario);
  if (idCuenta) query = query.eq("idCuentaDestino", idCuenta);

  const { count, error } = await query;
  if (error) {
    console.error("Error contando notificaciones:", error);
    throw new Error(error.message);
  }
  return count;
}
