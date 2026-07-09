import { getSupabaseBrowserClient } from "./supabase";
import { subirImagenCuenta } from "./storage";
/* ============================================================
   ABRIR CUENTA (versión corregida y segura)
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
     2. Verificar si el usuario ya tiene registro en Usuario_Cuenta
     ============================================================ */
  const { data: registroUsuario } = await supabase
    .from("Usuario_Cuenta")
    .select("*")
    .eq("idUsuario", user.id)
    .eq("idCuenta", cuenta.idCuenta)
    .single();

  /* ============================================================
     3. ESTADO: pendiente
     ============================================================ */
  if (cuenta.estado === "pendiente") {
    // Validar clave temporal
    if (claveIngresada !== cuenta.claveTemporal) {
      return { ok: false, tipo: "error", mensaje: "Clave temporal incorrecta." };
    }

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
    if (cuenta.cuentaDepartamento) {
      const { error: deptoError } = await supabase.from("Departamento").insert({
        created_at: new Date(),
        idCuentaDepartamento: cuenta.idCuenta,
        nombreDepartamento: cuenta.nombre
      });
    
      if (deptoError) {
        console.error("Error creando departamento:", deptoError);
        // No bloquea la activación, pero puedes devolver un warning si quieres
      }
    }

    return { ok: true, tipo: "establecer-clave", cuenta };
  }

  /* ============================================================
     4. ESTADO: activando
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
     5. ESTADO: activa
     ============================================================ */

  // VALIDAR CLAVE PERMANENTE SIEMPRE
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
    console.log("registroUsuario:", registroUsuario);

    if (registroUsuario.estado === "rechazado") {
      // Cambiar a pendiente nuevamente
      const { data, error } = await supabase
        .from("Usuario_Cuenta")
        .update({ estado: "pendiente" })
        .eq("idUsuario", user.id)
        .eq("idCuenta", cuenta.idCuenta);

      console.log("Resultado update:", { data, error });

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
/* ============================================================
   OBTENER INFORMACIÓN COMPLETA DE UNA CUENTA
   ============================================================ */
export async function obtenerCuentaCompleta(idCuenta) {
  const supabase = getSupabaseBrowserClient();

  /* ============================================================
     1. Obtener datos de la cuenta
     ============================================================ */
  const { data: cuenta, error: cuentaError } = await supabase
    .from("Cuenta")
    .select("*")
    .eq("idCuenta", idCuenta)
    .single();

  if (cuentaError || !cuenta) {
    return { ok: false, mensaje: "No se pudo obtener la cuenta." };
  }

  /* ============================================================
     2. Obtener miembros de la cuenta
     ============================================================ */
  const { data: miembros, error: miembrosError } = await supabase
    .from("Usuario_Cuenta")
    .select("*")
    .eq("idCuenta", idCuenta);

  if (miembrosError) {
    return { ok: false, mensaje: "No se pudieron obtener los miembros." };
  }

  /* ============================================================
     3. Obtener perfil de cada miembro desde la tabla Usuario
     ============================================================ */
  const miembrosConPerfil = [];

  for (const miembro of miembros) {
    const { data: perfil } = await supabase
      .from("Usuario")
      .select("id, nombre, correoInstitucional, imagenPerfil")
      .eq("id", miembro.idUsuario)
      .single();

    miembrosConPerfil.push({
      ...miembro,
      perfil
    });
  }

  return {
    ok: true,
    cuenta,
    miembros: miembrosConPerfil
  };
}
/* ============================================================
   ACTUALIZAR CUENTA (solo Admin)
   ============================================================ */
export async function actualizarCuenta(idCuenta, datos) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { ok: false, mensaje: "No hay usuario autenticado." };
  }

  /* ============================================================
     1. Verificar que la cuenta exista
     ============================================================ */
  const { data: cuenta } = await supabase
    .from("Cuenta")
    .select("*")
    .eq("idCuenta", idCuenta)
    .single();

  if (!cuenta) {
    return { ok: false, mensaje: "La cuenta no existe." };
  }

  /* ============================================================
     2. Verificar que el usuario sea Admin
     ============================================================ */
  if (cuenta.idAdmin !== user.id) {
    return { ok: false, mensaje: "Solo el administrador puede editar la cuenta." };
  }

  /* ============================================================
     3. Manejo de imágenes
     ============================================================ */
  let nuevaImagenPerfil = cuenta.imagenCuenta;
  let nuevaImagenFondo = cuenta.imagenFondoCuenta;

  if (datos.imagenPerfilFile) {
    const subida = await subirImagenCuenta(datos.imagenPerfilFile, idCuenta, "perfil");
    if (!subida.ok) {
      return { ok: false, mensaje: "Error subiendo imagen de perfil." };
    }
    nuevaImagenPerfil = subida.url;
  }

  if (datos.restaurarPerfil) {
    const { data } = supabase.storage
      .from("perfiles")
      .getPublicUrl("imagenPerfil-pordefecto.png");
    nuevaImagenPerfil = data.publicUrl;
  }

  if (datos.imagenFondoFile) {
    const subida = await subirImagenCuenta(datos.imagenFondoFile, idCuenta, "fondo");
    if (!subida.ok) {
      return { ok: false, mensaje: "Error subiendo imagen de fondo." };
    }
    nuevaImagenFondo = subida.url;
  }

  if (datos.restaurarFondo) {
    const { data } = supabase.storage
      .from("perfiles")
      .getPublicUrl("imagenFondo-pordefecto.jpg");
    nuevaImagenFondo = data.publicUrl;
  }

  /* ============================================================
     4. Actualizar datos de la cuenta
     ============================================================ */
  const { error } = await supabase
    .from("Cuenta")
    .update({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      imagenCuenta: nuevaImagenPerfil,
      imagenFondoCuenta: nuevaImagenFondo
    })
    .eq("idCuenta", idCuenta);

  if (error) {
    return { ok: false, mensaje: "Error actualizando la cuenta." };
  }

  /* ============================================================
     5. Actualizar nombre en Departamento si corresponde
     ============================================================ */
  if (cuenta.cuentaDepartamento) {
    const { error: deptoError } = await supabase
      .from("Departamento")
      .update({
        nombreDepartamento: datos.nombre
      })
      .eq("idCuentaDepartamento", idCuenta);

    if (deptoError) {
      console.error("Error actualizando nombre en Departamento:", deptoError);
      // No bloquea la actualización de Cuenta, pero puedes devolver un warning si quieres
    }
  }

  return { ok: true };
}

/* ============================================================
   ACTUALIZAR ESTADO DE UN MIEMBRO (Aceptar / Rechazar)
   ============================================================ */
export async function actualizarEstadoMiembro(idCuenta, idUsuarioMiembro, nuevoEstado) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { ok: false, mensaje: "No hay usuario autenticado." };
  }

  // 1. Verificar que la cuenta exista
  const { data: cuenta } = await supabase
    .from("Cuenta")
    .select("*")
    .eq("idCuenta", idCuenta)
    .single();

  if (!cuenta) {
    return { ok: false, mensaje: "La cuenta no existe." };
  }

  // 2. Verificar que el usuario autenticado sea Admin
  if (cuenta.idAdmin !== user.id) {
    return { ok: false, mensaje: "Solo el administrador puede gestionar miembros." };
  }

  // 3. Verificar que el miembro exista
  const { data: miembro } = await supabase
    .from("Usuario_Cuenta")
    .select("*")
    .eq("idCuenta", idCuenta)
    .eq("idUsuario", idUsuarioMiembro)
    .single();

  if (!miembro) {
    return { ok: false, mensaje: "El miembro no existe en esta cuenta." };
  }

  // 4. Si el nuevo estado es "rechazado", eliminar el registro
  if (nuevoEstado === "rechazado") {
    const { error: deleteError } = await supabase
      .from("Usuario_Cuenta")
      .delete()
      .eq("idCuenta", idCuenta)
      .eq("idUsuario", idUsuarioMiembro);

    if (deleteError) {
      return { ok: false, mensaje: "Error eliminando al miembro." };
    }

    return { ok: true, mensaje: "Miembro eliminado correctamente." };
  }

  // 5. Si no es rechazado, actualizar normalmente
  const { error } = await supabase
    .from("Usuario_Cuenta")
    .update({ estado: nuevoEstado })
    .eq("idCuenta", idCuenta)
    .eq("idUsuario", idUsuarioMiembro);

  if (error) {
    return { ok: false, mensaje: "Error actualizando el estado del miembro." };
  }

  return { ok: true, mensaje: "Estado actualizado correctamente." };
}

