import { mensajesCandy } from "./mensajes";

function mensajeAleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Convierte Markdown simple a HTML sin usar regex
 * - Links: [texto](url)
 * - Saltos de línea: \n → <br>
 */
function markdownToHtml(texto) {
  let html = texto;

  // 🔹 Convertir links tipo [texto](url)
  while (true) {
    const startText = html.indexOf("[");
    const endText = html.indexOf("](", startText);
    const endUrl = html.indexOf(")", endText);

    if (startText === -1 || endText === -1 || endUrl === -1) break;

    const textoLink = html.substring(startText + 1, endText);
    const urlLink = html.substring(endText + 2, endUrl);

    const markdown = html.substring(startText, endUrl + 1);
    const htmlLink = `<a href="${urlLink}" class="candy-link">${textoLink}</a>`;

    html = html.replace(markdown, htmlLink);
  }

  // 🔹 Saltos de línea
  html = html.replace(/\n/g, "<br>");

  return html;
}

/**
 * Convierte resultados crudos en mensajes bonitos con links HTML
 */
export function formatearRespuesta(resultados) {
  let mensaje = "";

  if (resultados.hilos?.length) {
    mensaje += mensajeAleatorio(mensajesCandy.exito) + "\n\n";
    mensaje += "🧵 Hilos encontrados:\n";

    resultados.hilos.forEach((h) => {
      const idMateria = h.Foro?.Materia?.idMateria || "desconocido";
      const idHilo = h.idHilo;
      const link = `/dashboard/foro/mostrar-foro/${idMateria}/hilo/${idHilo}`;

      mensaje += `- 🐶 ${h.titulo} (Materia: ${
        h.Foro?.Materia?.nombreMateria || "Sin materia"
      }) 👉 [Abrir hilo](${link})\n`;
    });

    mensaje += "\n" + mensajeAleatorio(mensajesCandy.cierre);
  } else {
    mensaje += mensajeAleatorio(mensajesCandy.fracaso);
    if (resultados.mensaje) {
      mensaje += ` (${resultados.mensaje})`;
    }
  }

  return markdownToHtml(mensaje.trim());
}
