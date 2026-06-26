import { getSupabaseBrowserClient } from "./supabase";
import { subirImagenPerfil } from "./storage";

export async function crearPerfilUsuario({ nombre, descripcion, imagenPerfil, imagenFondo }) {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { ok: false, error: "No hay usuario autenticado" };

  // Nuevo campo: correo institucional
  const correoInstitucional = user.email;

  // Imágenes por defecto
  const imagenPerfilDefault =
    "https://fdegweacfliuxqqecceg.supabase.co/storage/v1/object/public/perfiles/imagenPerfil-porfecto.png";

  const imagenFondoDefault =
    "https://fdegweacfliuxqqecceg.supabase.co/storage/v1/object/public/perfiles/imagenFondo-pordefecto.jpg";

  let urlPerfil = imagenPerfilDefault;
  let urlFondo = imagenFondoDefault;

  // Subir imagen de perfil si existe
  if (imagenPerfil) {
    const { ok, url } = await subirImagenPerfil(imagenPerfil, user.id, "perfil");
    if (ok) urlPerfil = url;
  }

  // Subir imagen de fondo si existe
  if (imagenFondo) {
    const { ok, url } = await subirImagenPerfil(imagenFondo, user.id, "fondo");
    if (ok) urlFondo = url;
  }

  console.log("URL PERFIL FINAL:", urlPerfil);
  console.log("URL FONDO FINAL:", urlFondo);

  // Insertar perfil en la tabla Usuario
  const { error } = await supabase.from("Usuario").insert({
    id: user.id,
    nombre,
    descripcion,
    imagenPerfil: urlPerfil,
    imagenFondo: urlFondo,
    correoInstitucional, // ← NUEVO CAMPO
    ultimaSesion: new Date(),
    estado: "activo"
  });

  return { ok: !error, error };
}

export async function actualizarUltimaSesion() {
  const supabase = getSupabaseBrowserClient();

  // Obtener usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { ok: false, error: "No hay usuario autenticado" };
  }

  // Actualizar la última sesión
  const { error } = await supabase
    .from("Usuario")
    .update({ ultimaSesion: new Date() })
    .eq("id", user.id);

  return { ok: !error, error };
}