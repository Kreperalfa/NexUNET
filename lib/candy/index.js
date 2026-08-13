// lib/candy/index.js

import { detectarIntencion } from "./intencion";
import { extraerContexto } from "./contexto";
import { ejecutarConsulta } from "./consulta";

/**
 * Orquesta todo el flujo de Candy Bot:
 * - Detecta intención
 * - Extrae contexto
 * - Ejecuta consulta en Supabase
 * - Devuelve resultados estructurados
 */
export async function procesarConsulta(consultaUsuario) {
  try {
    // 1. Detectar intención
    const intencion = await detectarIntencion(consultaUsuario);

    // 2. Detectar contexto
    const contexto = await extraerContexto(consultaUsuario);

    // 3. Ejecutar consulta
    const { resultados, banderas } = await ejecutarConsulta(
      intencion.intencionesDetectadas,
      contexto,
      intencion.detalles
    );

    // 4. Construir respuesta estructurada
    return {
      intencion,
      contexto,
      resultados,
      banderas
    };
  } catch (error) {
    return {
      error: `❌ Ocurrió un error al procesar la consulta: ${error.message}`
    };
  }
}
