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
