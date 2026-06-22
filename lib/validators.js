/* Archivo encargado de realizar las validaciones contine:
    - Validacion para que los correos ingresados sean de la universidad
    - Validacion de expcepciones de correos, correos de los dev en caso de fallo del sistema de correo universitario
    - Validacion de la seguridad de la contraseña
*/
export function esCorreoUNET(email) {
    return email.toLowerCase().endsWith("@unet.edu.ve");
}
export function esCorreoPermitido(email) {
    const correosPermitidos = [
        "milangelloomar@gmail.com",
        "mjaimesmoncada@gmail.com",
    ];
    return correosPermitidos.includes(email.toLowerCase());
}
// Validación para contraseñas seguras, verifica que tenga:
// - Al menos una mayúscula
// - Al menos un número
// - Al menos un caracter especial
// - Mínimo 6 caracteres
export function esPasswordSegura(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    return regex.test(password);
}