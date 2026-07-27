import stringSimilarity from "string-similarity";
import { getSupabaseBrowserClient } from "../supabase";

const supabase = getSupabaseBrowserClient();

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    function esCoincidencia(token, palabra) {
    const similitud = stringSimilarity.compareTwoStrings(token, palabra);
    return similitud >= 0.7 || token.includes(palabra);
    }

    /**
     * Busca TODAS las coincidencias en una tabla de Supabase
     */
async function buscarCoincidenciasTabla(tokens, tabla, columna) {
    const { data, error } = await supabase.from(tabla).select(columna);

    if (error || !data) return [];

    const coincidencias = [];

    for (const item of data) {
        const nombreOriginal = item[columna];

        // 🔹 Validamos que no sea null ni vacío
        if (!nombreOriginal || typeof nombreOriginal !== "string" || nombreOriginal.trim() === "") {
        continue; // saltamos esta fila
        }

        const nombreNormalizado = normalizar(nombreOriginal);

        // 🔹 Tokenizamos también el nombre de la BD
        const nombreTokens = nombreNormalizado.split(/\s+/);

        for (const token of tokens) {
        for (const nombreToken of nombreTokens) {
            if (esCoincidencia(token, nombreToken)) {
            if (!coincidencias.includes(nombreOriginal)) {
                coincidencias.push(nombreOriginal);
            }
            }
        }
        }
    }

    return coincidencias;
}

/**
 * Extrae contexto desde la consulta del usuario
 * Devuelve múltiples coincidencias por categoría
 */
export async function extraerContexto(consulta) {
    const texto = normalizar(consulta);
    const tokens = texto.split(/\s+/);

    const contexto = {};

    // Departamentos
    const departamentos = await buscarCoincidenciasTabla(tokens, "Departamento", "nombreDepartamento");
    if (departamentos.length > 0) contexto.departamentos = departamentos;
    // Materias (puede haber varias)
    const materias = await buscarCoincidenciasTabla(tokens, "Materia", "nombreMateria");
    if (materias.length > 0) contexto.materias = materias;
    // Carreras
    const carreras = await buscarCoincidenciasTabla(tokens, "Carrera", "nombreCarrera");
    if (carreras.length > 0) contexto.carreras = carreras;
    // Cuentas
    const cuentas = await buscarCoincidenciasTabla(tokens, "Cuenta", "nombre");
    if (cuentas.length > 0) contexto.cuentas = cuentas;
    // Noticias
    const noticias = await buscarCoincidenciasTabla(tokens, "Publicacion", "titulo");
    if (noticias.length > 0) contexto.noticias = noticias;
    // Hilos
    const hilos = await buscarCoincidenciasTabla(tokens, "Hilo", "titulo");
    if (hilos.length > 0) contexto.hilos = hilos;

    return contexto;
}
