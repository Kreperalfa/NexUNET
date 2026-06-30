import { getSupabaseBrowserClient } from "./supabase";

export async function subirImagenPerfil(file, userId, tipo) {

    console.log("BACKEND → FILE RECIBIDO:", file);
    console.log("BACKEND → USER ID:", userId);
    console.log("BACKEND → TIPO:", tipo);
    
    const supabase = getSupabaseBrowserClient();

  // tipo puede ser: "perfil" o "fondo"
  const filePath = `usuarios/${userId}/${tipo}.png`;

  const { error: uploadError } = await supabase.storage
    .from("perfiles")
    .upload(filePath, file, {
      upsert: true, // reemplaza si ya existe
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  // Obtener URL pública
  const { data } = supabase.storage
    .from("perfiles")
    .getPublicUrl(filePath);

  return { ok: true, url: data.publicUrl };
}

export async function subirImagenCuenta(file, idCuenta, tipo) {

  console.log("BACKEND → FILE RECIBIDO:", file);
  console.log("BACKEND → ID CUENTA:", idCuenta);
  console.log("BACKEND → TIPO:", tipo);

  const supabase = getSupabaseBrowserClient();

  // tipo puede ser: "perfil" o "fondo"
  const filePath = `cuentas/${idCuenta}/${tipo}.png`;

  const { error: uploadError } = await supabase.storage
    .from("perfiles")
    .upload(filePath, file, {
      upsert: true, // reemplaza si ya existe
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  // Obtener URL pública
  const { data } = supabase.storage
    .from("perfiles")
    .getPublicUrl(filePath);

  return { ok: true, url: data.publicUrl };
}

