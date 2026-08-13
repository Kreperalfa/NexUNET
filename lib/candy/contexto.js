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

async function buscarCoincidenciasTabla(tokens, tabla, columna) {
  const { data, error } = await supabase.from(tabla).select(columna);
  if (error || !data) return [];

  const coincidencias = [];

  for (const item of data) {
    const nombreOriginal = item[columna];
    if (!nombreOriginal || typeof nombreOriginal !== "string" || nombreOriginal.trim() === "") {
      continue;
    }

    const nombreNormalizado = normalizar(nombreOriginal);
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

export async function extraerContexto(consulta) {
  const texto = normalizar(consulta);
  const tokens = texto.split(/\s+/);

  const contexto = {};

  // 🔹 Solo Hilos
  const hilos = await buscarCoincidenciasTabla(tokens, "Hilo", "titulo");
  if (hilos.length > 0) contexto.hilos = hilos;

  return contexto;
}
