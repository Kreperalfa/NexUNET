import { getSupabaseBrowserClient } from "./supabase";


export async function crearPerfilUsuario({ nombre, descripcion, imagenPerfil, imagenFondo }) {
  const supabase = getSupabaseBrowserClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { ok: false, error: "No hay usuario autenticado" };

  const { error } = await supabase.from("Usuario").insert({
    id: user.id,
    nombre,
    descripcion,
    imagenPerfil,
    imagenFondo
  });

  return { ok: !error, error };
}
