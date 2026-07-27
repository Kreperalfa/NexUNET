import stringSimilarity from "string-similarity";

/**
 * Detectar intención de la consulta con tolerancia a errores ortográficos
 * y soporte para múltiples intenciones.
 * @param {string} consulta - Texto ingresado por el usuario
 * @returns {object} - Objeto con la consulta y las intenciones detectadas
 */
export function detectarIntencion(consulta) {
  // Normalizamos: minúsculas y sin acentos
  const texto = consulta
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const intenciones = [];

const categorias = {
  publicacion: [
    "publicacion", "publicaciones",
    "post", "posts",
    "noticia", "noticias",
    "anuncio", "anuncios",
    "historia", "historias"
  ],

  hilo: [
    "hilo", "hilos",
    "foro", "foros"
  ],

  archivo: [
    "archivo", "archivos",
    "pdf", "pdfs",
    "documento", "documentos",
    "parcial", "parciales",
    "practica", "practicas",
    "ejercicio", "ejercicios",
    "guia", "guias",
    "examen", "examenes",
    "video", "videos",
    "tutorial", "tutoriales"
  ],

  materia: [
    "materia", "materias",
    "curso", "cursos",
    "clase", "clases"
  ],

  carrera: [
    "carrera", "carreras",
    "ingenieria", "ingeniería",
    "licenciatura", "licenciaturas",
    "tecnicatura", "tecnicaturas"
  ],

  departamento: [
    "departamento", "departamentos",
    "facultad", "facultades",
    "division", "división",
    "area", "área", "areas", "áreas"
  ]
};

  // Dividimos la consulta en palabras
  const tokens = texto.split(/\s+/);

  // Función para verificar coincidencia difusa
  const esCoincidencia = (token, palabra) => {
    const similitud = stringSimilarity.compareTwoStrings(token, palabra);
    return similitud >= 0.7 || token.includes(palabra);
  };

  // Recorremos categorías y acumulamos todas las coincidencias
  for (const [categoria, palabras] of Object.entries(categorias)) {
    const coincidencia = tokens.some(token =>
      palabras.some(p => esCoincidencia(token, p))
    );
    if (coincidencia && !intenciones.includes(categoria)) {
      intenciones.push(categoria);
    }
  }

  // Si no encontró nada, devolvemos "general"
  if (intenciones.length === 0) {
    intenciones.push("general");
  }

  return { consulta: texto, intencionesDetectadas: intenciones };
}
