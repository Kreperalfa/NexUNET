import { getSupabaseBrowserClient } from "./supabase";

/* ============================================================
   ⭐ SUBIR IMAGEN DE PERFIL DE USUARIO
   ============================================================ */
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

/* ============================================================
   ⭐ SUBIR IMAGEN DE CUENTA
   ============================================================ */
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

/* ============================================================
   ⭐ SUBIR IMAGEN PARA EL CARRUSEL DEL LOBBY
   ============================================================ */
export async function subirImagenLobby(file, tipo = "slide") {

  console.log("BACKEND → FILE RECIBIDO:", file);
  console.log("BACKEND → TIPO:", tipo);

  const supabase = getSupabaseBrowserClient();

  // ⭐ Ruta dentro del bucket "lobby"
  const filePath = `lobby/${tipo}-${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("lobby")
    .upload(filePath, file, {
      upsert: false, // no reemplazar
    });

  if (uploadError) {
    console.log("ERROR SUBIENDO IMAGEN:", uploadError.message);
    return { ok: false, error: uploadError.message };
  }

  // ⭐ Obtener URL pública
  const { data } = supabase.storage
    .from("lobby")
    .getPublicUrl(filePath);

  console.log("BACKEND → URL GENERADA:", data.publicUrl);

  return { ok: true, url: data.publicUrl };
}

