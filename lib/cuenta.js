import { getSupabaseBrowserClient } from "./supabase";

/* ============================================================
   ABRIR CUENTA
   ============================================================ */
export async function abrirCuenta(nombreCuenta, claveIngresada) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { ok: false, tipo: "error", mensaje: "No hay usuario autenticado." };
  }

  /* ============================================================
     1. Buscar la cuenta por nombre
     ============================================================ */
  const { data: cuenta, error: cuentaError } = await supabase
    .from("Cuenta")
    .select("*")
    .eq("nombre", nombreCuenta)
    .single();

  if (cuentaError || !cuenta) {
    return { ok: false, tipo: "error", mensaje: "La cuenta no existe." };
  }

  /* ============================================================
     2. Verificar si el usuario ya es miembro activo
     ============================================================ */
  const { data: registroUsuario } = await supabase
    .from("Usuario_Cuenta")
    .select("*")
    .eq("idUsuario", user.id)
    .eq("idCuenta", cuenta.idCuenta)
    .single();

  if (registroUsuario && registroUsuario.estado === "activo") {
    return { ok: true, tipo: "ingreso-directo", cuenta };
  }

  /* ============================================================
     3. La cuenta está en estado "pendiente"
     ============================================================ */
  if (cuenta.estado === "pendiente") {
    // Clave temporal correcta → activar cuenta
    if (claveIngresada === cuenta.claveTemporal) {
      // Activación inicial
      const { error: activarError } = await supabase
        .from("Cuenta")
        .update({
          idAdmin: user.id,
          fechaActivacion: new Date(),
          estado: "activando",
          claveTemporal: null,
          clave: null
        })
        .eq("idCuenta", cuenta.idCuenta);

      if (activarError) {
        return { ok: false, tipo: "error", mensaje: "Error activando la cuenta." };
      }

      // Registrar al usuario como Admin
      await supabase.from("Usuario_Cuenta").insert({
        idUsuario: user.id,
        idCuenta: cuenta.idCuenta,
        rol: "Admin",
        estado: "activo"
      });

      return { ok: true, tipo: "establecer-clave", cuenta };
    }

    // Clave temporal incorrecta
    return { ok: false, tipo: "error", mensaje: "Clave temporal incorrecta." };
  }

  /* ============================================================
     4. La cuenta está en estado "activando"
     ============================================================ */
  if (cuenta.estado === "activando") {
    // Solo el Admin puede establecer la clave permanente
    if (user.id === cuenta.idAdmin) {
      return { ok: true, tipo: "establecer-clave", cuenta };
    }

    return {
      ok: false,
      tipo: "error",
      mensaje: "La cuenta está siendo activada por el administrador."
    };
  }

  /* ============================================================
     5. La cuenta está en estado "activa"
     ============================================================ */
  if (cuenta.estado === "activa") {
    // Validar clave permanente
    if (claveIngresada !== cuenta.clave) {
      return { ok: false, tipo: "error", mensaje: "Clave incorrecta." };
    }

    // Si el usuario ya tiene registro
    if (registroUsuario) {
      if (registroUsuario.estado === "activo") {
        return { ok: true, tipo: "ingreso-directo", cuenta };
      }

      if (registroUsuario.estado === "pendiente") {
        return { ok: true, tipo: "solicitud-ya-enviada", cuenta };
      }

      if (registroUsuario.estado === "rechazado") {
        // Cambiar a pendiente nuevamente
        await supabase
          .from("Usuario_Cuenta")
          .update({ estado: "pendiente" })
          .eq("idUsuario", user.id)
          .eq("idCuenta", cuenta.idCuenta);

        return { ok: true, tipo: "solicitud-enviada", cuenta };
      }
    }

    // Si NO existe registro → crear solicitud
    await supabase.from("Usuario_Cuenta").insert({
      idUsuario: user.id,
      idCuenta: cuenta.idCuenta,
      rol: "SubAdmin",
      estado: "pendiente"
    });

    return { ok: true, tipo: "solicitud-enviada", cuenta };
  }

  /* ============================================================
     Estado desconocido
     ============================================================ */
  return { ok: false, tipo: "error", mensaje: "Estado de cuenta inválido." };
}
/* ============================================================
   ESTABLECER CLAVE PERMANENTE
   ============================================================ */
export async function establecerClavePermanente(idCuenta, nuevaClave) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { ok: false, mensaje: "No hay usuario autenticado." };
  }

  // Verificar que el usuario sea el Admin
  const { data: cuenta } = await supabase
    .from("Cuenta")
    .select("*")
    .eq("idCuenta", idCuenta)
    .single();

  if (!cuenta) {
    return { ok: false, mensaje: "La cuenta no existe." };
  }

  if (cuenta.idAdmin !== user.id) {
    return { ok: false, mensaje: "Solo el administrador puede establecer la clave." };
  }

  // Actualizar clave permanente
  const { error } = await supabase
    .from("Cuenta")
    .update({
      clave: nuevaClave,
      estado: "activa"
    })
    .eq("idCuenta", idCuenta);

  if (error) {
    return { ok: false, mensaje: "Error estableciendo la clave." };
  }

  return { ok: true };
}