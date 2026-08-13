import { getSupabaseBrowserClient } from "../supabase";

const supabase = getSupabaseBrowserClient();

/**
 * Ejecuta una consulta en Supabase según intención y contexto,
 * devolviendo coincidencias filtradas por materia y banderas de depuración.
 * Noticias fuera de Candy.
 */
export async function ejecutarConsulta(intenciones, contexto, detalles) {
  const resultados = {};
  const banderas = [];

  // 🔹 Hilos (filtrados por materia detectada en intención con join Foro → Materia)
  if ((intenciones.includes("materia") || intenciones.includes("archivo") || intenciones.includes("hilo")) && contexto.hilos?.length) {
    banderas.push("➡️ Entré a búsqueda de hilos");

    const coincidencias = [];

    for (const hilo of contexto.hilos) {
      banderas.push(`🔍 Buscando coincidencias de hilo: "${hilo}"`);

      let query = supabase
        .from("Hilo")
        .select(`
          idHilo,
          titulo,
          contenido,
          created_at,
          Foro (
            idMateria,
            Materia (
              idMateria,
              nombreMateria
            )
          )
        `)
        .ilike("titulo", `%${hilo}%`);

      const { data, error } = await query;

      if (error) {
        banderas.push(`⚠️ Error en consulta de hilos: ${error.message}`);
      } else if (data?.length) {
        // 🔹 Filtrar manualmente en JS si hay materia detectada
        let filtrados = data;
        if (detalles?.materia?.length) {
          const materiaDetectada = detalles.materia[0];
          banderas.push(`➡️ Aplicando filtro manual por nombreMateria = "${materiaDetectada}"`);
          filtrados = data.filter(d => d.Foro?.Materia?.nombreMateria === materiaDetectada);
        }

        if (filtrados.length) {
          banderas.push(`✅ Encontré ${filtrados.length} coincidencias en hilos`);
          coincidencias.push(...filtrados);
        } else {
          banderas.push("❌ No encontré coincidencias en hilos tras filtrar por materia");
        }
      }
    }

    if (coincidencias.length > 0) {
      resultados.hilos = coincidencias;
    }
  }

  // 🔹 Si no hay resultados
  if (Object.keys(resultados).length === 0) {
    resultados.mensaje = "❌ No encontré coincidencias relevantes.";
    banderas.push("🚫 No se encontraron resultados en ninguna categoría");
  }

  return { resultados, banderas };
}
