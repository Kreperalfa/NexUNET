import { getSupabaseBrowserClient } from "./supabase";
import { subirImagenPerfil } from "./storage";

/* ============================================================
   CREAR PERFIL DE USUARIO
   ============================================================ */
export async function crearPerfilUsuario({ nombre, descripcion, imagenPerfil, imagenFondo }) {
  const supabase = getSupabaseBrowserClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { ok: false, error: "No hay usuario autenticado" };

  const correoInstitucional = user.email;

  const imagenPerfilDefault =
    "https://fdegweacfliuxqqecceg.supabase.co/storage/v1/object/public/perfiles/imagenPerfil-porfecto.png";

  const imagenFondoDefault =
    "https://fdegweacfliuxqqecceg.supabase.co/storage/v1/object/public/perfiles/imagenFondo-pordefecto.jpg";

  let urlPerfil = imagenPerfilDefault;
  let urlFondo = imagenFondoDefault;

  if (imagenPerfil) {
    const { ok, url } = await subirImagenPerfil(imagenPerfil, user.id, "perfil");
    if (ok) urlPerfil = url;
  }

  if (imagenFondo) {
    const { ok, url } = await subirImagenPerfil(imagenFondo, user.id, "fondo");
    if (ok) urlFondo = url;
  }

  const { error } = await supabase.from("Usuario").insert({
    id: user.id,
    nombre,
    descripcion,
    imagenPerfil: urlPerfil,
    imagenFondo: urlFondo,
    correoInstitucional,
    ultimaSesion: new Date(),
    estado: "activo"
  });

  return { ok: !error, error };
}

/* ============================================================
   CARGAR PERFIL DE USUARIO
   ============================================================ */
export async function cargarPerfilUsuario() {
  const supabase = getSupabaseBrowserClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return { ok: false, error: "No hay usuario autenticado" };
  }

  const { data, error } = await supabase
    .from("Usuario")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, perfil: data, user };
}

/* ============================================================
   ACTUALIZAR PERFIL DE USUARIO
   ============================================================ */
export async function actualizarPerfilUsuario({ nombre, descripcion, imagenPerfil, imagenFondo }) {
  const supabase = getSupabaseBrowserClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { ok: false, error: "No hay usuario autenticado" };

  const { data: perfilActual } = await supabase
    .from("Usuario")
    .select("*")
    .eq("id", user.id)
    .single();

  let urlPerfil = perfilActual.imagenPerfil;
  let urlFondo = perfilActual.imagenFondo;

  if (imagenPerfil) {
    const subida = await subirImagenPerfil(imagenPerfil, user.id, "perfil");
    if (subida.ok) urlPerfil = subida.url;
  }

  if (imagenFondo) {
    const subida = await subirImagenPerfil(imagenFondo, user.id, "fondo");
    if (subida.ok) urlFondo = subida.url;
  }

  const nuevaDescripcion =
    descripcion.trim() === ""
      ? "El usuario ha decidido no describirse."
      : descripcion;

  const { error } = await supabase
    .from("Usuario")
    .update({
      nombre,
      descripcion: nuevaDescripcion,
      imagenPerfil: urlPerfil,
      imagenFondo: urlFondo
    })
    .eq("id", user.id);

  return { ok: !error, error };
}

/* ============================================================
   ACTUALIZAR ÚLTIMA SESIÓN
   ============================================================ */
export async function actualizarUltimaSesion() {
  const supabase = getSupabaseBrowserClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { ok: false, error: "No hay usuario autenticado" };
  }

  const { error } = await supabase
    .from("Usuario")
    .update({ ultimaSesion: new Date() })
    .eq("id", user.id);

  return { ok: !error, error };
}

/* ============================================================
   OBTENER NIVEL DEL USUARIO
   ============================================================ */
export async function obtenerNivel(idUsuario) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("Usuario")
    .select("nivel")
    .eq("id", idUsuario)
    .single();

  if (error) {
    console.error("Error obteniendo nivel:", error);
    return null;
  }

  return data?.nivel ?? null;
}