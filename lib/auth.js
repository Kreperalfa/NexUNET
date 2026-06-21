/* Carpeta encargada de tener toda la logica necesaria para las autentificaciones del usuario, contiene:
    - Logeo de usuario con verificacion de correo valido y verificacion de existencia en supabase
    - Cerrar sesion de los usuarios
    - Registramos el usuario haciendo la verificacion de correo universitario
    - Verificamos el otp enviado al email
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
// Verificamos el código OTP enviado al correo del usuario. Recibe como parámetros el email almacenado temporalmente y el código OTP ingresado por el usuario. Esta función se encarga de validar el token con Supabase y confirmar que el usuario realmente es dueño del correo. En caso de error, se retorna un objeto con ok:false y el mensaje correspondiente.
export async function verifyOtpCode(email, otp) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
    });
    if (error) {
        return { ok: false, error: "Código incorrecto" };
    }
    return { ok: true };
}
// Logica para el envio del OTP para cambio de contraseña, recibe como parametro el correo del usuario. Primero verifica que sea un correo institucional valido, luego solicita a Supabase el envio del OTP. A diferencia del registro, aqui no se crea un usuario nuevo, solo se valida que exista en la base de datos. Si el usuario no existe o ocurre un error en el envio, se retorna la excepcion correspondiente. Si todo sale bien, se retorna ok:true para continuar con el flujo de verificacion.
export async function sendOtpForPasswordChange(email) {
    const supabase = getSupabaseBrowserClient();
    if (!esCorreoUNET(email)) {
        return { ok: false, error: "Correo no permitido" };
    }
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
        },
    });
    if (error) {
        if (error.message.includes("User not found")) {
            return { ok: false, error: "Este correo no está registrado" };
        }
        return { ok: false, error: "Error enviando OTP: " + error.message };
    }
    return { ok: true };
}