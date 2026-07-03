import { getSupabaseBrowserClient } from "./supabase";
import {obtenerNivel} from "./perfil";

export async function crearCarrera(nombreCarrera) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { ok: false, mensaje: "No hay usuario autenticado." };
  }

  /* ============================================================
     1. Verificar nivel del usuario (solo nivel 7 u 8)
     ============================================================ */
  const nivel = await obtenerNivel(user.id);
  if (nivel !== 7 && nivel !== 8) {
    return { ok: false, mensaje: "No tienes permiso para crear carreras." };
  }

  /* ============================================================
     2. Validar campos
     ============================================================ */
  if (!nombreCarrera.trim()) {
    return { ok: false, mensaje: "Debes ingresar un nombre de carrera." };
  }

  /* ============================================================
     3. Insertar carrera
     ============================================================ */
  const { error } = await supabase.from("Carrera").insert({
    nombreCarrera: nombreCarrera.trim(),
    idUsuarioCreador: user.id,
    created_at: new Date()
  });

  if (error) {
    console.error(error);
    return { ok: false, mensaje: "Error creando la carrera." };
  }

  return { ok: true, mensaje: "Carrera creada correctamente." };
}

export async function actualizarCarrera(idCarrera, datos) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { ok: false, mensaje: "No hay usuario autenticado." };
  }

  /* ============================================================
     1. Verificar nivel del usuario (solo nivel 7 u 8)
     ============================================================ */
  const nivel = await obtenerNivel(user.id);
  if (nivel !== 7 && nivel !== 8) {
    return { ok: false, mensaje: "No tienes permiso para actualizar carreras." };
  }

  /* ============================================================
     2. Verificar que la carrera exista
     ============================================================ */
  const { data: carrera } = await supabase
    .from("Carrera")
    .select("*")
    .eq("idCarrera", idCarrera)
    .single();

  if (!carrera) {
    return { ok: false, mensaje: "La carrera no existe." };
  }

  /* ============================================================
     3. Actualizar datos
     ============================================================ */
  const { error } = await supabase
    .from("Carrera")
    .update({
      nombreCarrera: datos.nombreCarrera
    })
    .eq("idCarrera", idCarrera);

  if (error) {
    console.error(error);
    return { ok: false, mensaje: "Error actualizando la carrera." };
  }

  return { ok: true, mensaje: "Carrera actualizada correctamente." };
}
