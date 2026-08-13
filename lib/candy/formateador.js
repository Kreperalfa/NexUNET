/**
 * Convierte resultados crudos en mensajes bonitos con links para el chat
 * Solo se formatean hilos (noticias fuera de Candy)
 */
export function formatearRespuesta(resultados) {
  let mensaje = "";

  // Hilos
  if (resultados.hilos?.length) {
    mensaje += "💬 Hilos encontrados:\n";
    resultados.hilos.forEach(h => {
      const idMateria = h.Foro?.Materia?.idMateria || "desconocido";
      const idHilo = h.idHilo;
      const link = `/dashboard/foro/mostrar-foro/${idMateria}/hilo/${idHilo}`;
      mensaje += `- ${h.titulo} (Materia: ${h.Foro?.Materia?.nombreMateria || "Sin materia"}) 👉 [Abrir hilo](${link})\n`;
    });
    mensaje += "\n";
  }

  // Mensaje vacío
  if (!resultados.hilos && resultados.mensaje) {
    mensaje += resultados.mensaje + "\n";
  }

  return mensaje.trim();
}
