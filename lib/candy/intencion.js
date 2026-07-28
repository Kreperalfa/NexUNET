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

// 🔹 Lista de stopwords a ignorar
const stopwords = [
  "de", "la", "las", "los", "el", "en", "un", "una", "unos", "unas",
  "y", "o", "por", "para", "con", "del", "al", "a", "que", "su", "sus"
];

/**
 * Detectar intención de la consulta con soporte a BD
 * @param {string} consulta - Texto ingresado por el usuario
 * @returns {object} - Objeto con la consulta y las intenciones detectadas
 */
export async function detectarIntencion(consulta) {
  const texto = normalizar(consulta);

  // 🔹 Tokenizamos y filtramos stopwords
  const tokens = texto.split(/\s+/).filter(t => !stopwords.includes(t));

  const intenciones = [];

  // 🔹 Diccionario fijo para categorías generales
  const categoriasFijas = {
    publicacion: ["publicacion", "publicaciones", "post", "posts", "noticia", "noticias", "anuncio", "anuncios", "historia", "historias"],
    hilo: ["hilo", "hilos", "foro", "foros"],
    archivo: ["archivo", "archivos", "pdf", "pdfs", "documento", "documentos", "parcial", "parciales", "practica", "practicas", "ejercicio", "ejercicios", "guia", "guias", "examen", "examenes", "video", "videos", "tutorial", "tutoriales"]
  };

  // 🔹 Detectar coincidencias en categorías fijas
  for (const [categoria, palabras] of Object.entries(categoriasFijas)) {
    const coincidencia = tokens.some(token =>
      palabras.some(p => esCoincidencia(token, p))
    );
    if (coincidencia && !intenciones.includes(categoria)) {
      intenciones.push(categoria);
    }
  }

  // 🔹 Detectar coincidencias en BD dinámicas
  const tablasBD = [
    { nombre: "Materia", columna: "nombreMateria", categoria: "materia" },
    { nombre: "Carrera", columna: "nombreCarrera", categoria: "carrera" },
    { nombre: "Cuenta", columna: "nombre", categoria: "cuenta" },
    { nombre: "Departamento", columna: "nombreDepartamento", categoria: "departamento" }
  ];

  for (const { nombre, columna, categoria } of tablasBD) {
    const { data, error } = await supabase.from(nombre).select(columna);
    if (error || !data) continue;

    for (const item of data) {
      const valor = item[columna];
      if (!valor) continue;

      const valorNormalizado = normalizar(valor);
      const valorTokens = valorNormalizado.split(/\s+/);

      const coincidencia = tokens.some(token =>
        valorTokens.some(vt => esCoincidencia(token, vt))
      );

      if (coincidencia && !intenciones.includes(categoria)) {
        intenciones.push(categoria);
      }
    }
  }

  // 🔹 Si no encontró nada, devolvemos "general"
  if (intenciones.length === 0) {
    intenciones.push("general");
  }

  return { consulta: texto, intencionesDetectadas: intenciones };
}
