import { getSupabaseBrowserClient } from "./supabase";
import { crearNotificacion } from "./notificacion";

/* ============================================================
   SEGUIR CUENTA
   ============================================================ */
export async function seguirCuenta(idUsuario, idCuenta) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("SeguimientoCuenta")
    .insert({
      idUsuario,
      idCuenta,
      created_at: new Date()
    });

  if (error) {
    console.error("ERROR SEGUIR CUENTA:", error);
    throw new Error(error.message);
  }

  // 🔔 Crear notificación para la cuenta seguida
  try {
    await crearNotificacion({
      idCuentaDestino: idCuenta,          // la cuenta que recibe la notificación
      idUsuarioAccion: idUsuario,         // el usuario que siguió
      idCuenta: idCuenta,                 // cuenta objeto de la acción
      tipo: "seguimiento",
      mensaje: "Un usuario comenzó a seguir tu cuenta",
      leido: false
    });
  } catch (err) {
    console.error("ERROR CREAR NOTIFICACION SEGUIMIENTO:", err);
  }

  return true;
}

/* ============================================================
   DEJAR DE SEGUIR CUENTA
   ============================================================ */
export async function dejarDeSeguirCuenta(idUsuario, idCuenta) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("SeguimientoCuenta")
    .delete()
    .eq("idUsuario", idUsuario)
    .eq("idCuenta", idCuenta);

  if (error) {
    console.error("ERROR DEJAR DE SEGUIR:", error);
    throw new Error(error.message);
  }

  return true;
}

/* ============================================================
   VERIFICAR SI YA SIGUE
   ============================================================ */
export async function verificarSeguimiento(idUsuario, idCuenta) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("SeguimientoCuenta")
    .select("idSeguido")
    .eq("idUsuario", idUsuario)
    .eq("idCuenta", idCuenta)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("ERROR VERIFICAR SEGUIMIENTO:", error);
    throw new Error(error.message);
  }

  return !!data;
}

/* ============================================================
   LISTAR CUENTAS QUE SIGUE UN USUARIO
   ============================================================ */
export async function obtenerCuentasSeguidas(idUsuario) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("SeguimientoCuenta")
    .select(
      `
      idCuenta,
      created_at,
      Cuenta(idCuenta, nombre, imagenPerfil)
    `
    )
    .eq("idUsuario", idUsuario)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ERROR OBTENER CUENTAS SEGUIDAS:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/* ============================================================
   LISTAR SEGUIDORES DE UNA CUENTA
   ============================================================ */
export async function obtenerSeguidoresCuenta(idCuenta) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("SeguimientoCuenta")
    .select(
      `
      idUsuario,
      created_at,
      Usuario(id, nombre, imagenPerfil)
    `
    )
    .eq("idCuenta", idCuenta)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ERROR OBTENER SEGUIDORES:", error);
    throw new Error(error.message);
  }

  return data || [];
}
