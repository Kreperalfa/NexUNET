/* Carpeta encargada de tener toda la logica necesaria para las autentificaciones del usuario, contiene:
    - Logeo de usuario con verificacion de correo valido y verificacion de existencia en supabase
    - Cerrar sesion de los usuarios
    - Registramos el usuario haciendo la verificacion de correo universitario
*/
import { getSupabaseBrowserClient } from "./supabase";
import { esCorreoUNET, esCorreoPermitido } from "./validators";

// Logica para el logeo directo, recibe como parametro el email y la contraseña, verifica si es un correo institucional o si es un correo permitido, en caso de que pase la verificacion se autentifica la existencia en supabase
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
// Se cierra la sesion del usuario, en caso de error se regresa false y la excepcion
export async function logoutUser() {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        return { ok: false, error: "Error al cerrar sesión" };
    }
    return { ok: true };
}
// Registramos a un usario, primeramente se verifica si el correo ingresado es permitido y luego enviamos los datos para supabase para poder enviar el otp al correo
export async function registerUser(email) {
    const supabase = getSupabaseBrowserClient();
    if (!esCorreoUNET(email)) {
        return { ok: false, error: "Correo no permitido" };
    }
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true
        }
    });
    if (error) {
        return { ok: false, error: "Error enviando OTP: " + error.message };
    }
    return { ok: true };
}