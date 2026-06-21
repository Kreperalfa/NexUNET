/* Archivo encargado de realizar las validaciones contine:
    - Validacion para que los correos ingresados sean de la universidad
    - Validacion de expcepciones de correos, correos de los dev en caso de fallo del sistema de correo universitario
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
