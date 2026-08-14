import { mensajesCandy } from "./mensajes";

function mensajeAleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Convierte resultados crudos en mensajes bonitos con links para el chat
 * Solo se formatean hilos (noticias fuera de Candy)
 * Estilo: Candy Bot 🐶, una perrita unetense
 */
export function formatearRespuesta(resultados) {
  let mensaje = "";

  if (resultados.hilos?.length) {
    // Mensaje de éxito
    mensaje += mensajeAleatorio(mensajesCandy.exito) + "\n\n";
    mensaje += "🧵 Hilos encontrados:\n";
    resultados.hilos.forEach(h => {
      const idMateria = h.Foro?.Materia?.idMateria || "desconocido";
      const idHilo = h.idHilo;
      const link = `/dashboard/foro/mostrar-foro/${idMateria}/hilo/${idHilo}`;
      mensaje += `- 🐶 ${h.titulo} (Materia: ${h.Foro?.Materia?.nombreMateria || "Sin materia"}) 👉 [Abrir hilo](${link})\n`;
    });
    mensaje += "\n" + mensajeAleatorio(mensajesCandy.cierre);
  } else {
    // Mensaje de fracaso
    mensaje += mensajeAleatorio(mensajesCandy.fracaso);
    if (resultados.mensaje) {
      mensaje += ` (${resultados.mensaje})`;
    }
  }

  return mensaje.trim();
}
