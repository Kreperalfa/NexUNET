import { getSupabaseBrowserClient } from "./supabase";
import { esCorreoUNET, esCorreoPermitido } from "./validators";

export async function loginUser(email, password) {
    const supabase = getSupabaseBrowserClient();

    if (!esCorreoUNET(email) && !esCorreoPermitido(email)) {
        return { ok: false, error: "Correo no permitido" };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { ok: false, error: "Error al iniciar sesión" };
    }

    return { ok: true };
}
