"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./candyChat.module.css";

// 🔹 Importamos los módulos de Candy
import { detectarIntencion } from "../../../lib/candy/intencion";
import { extraerContexto } from "../../../lib/candy/contexto";
import { ejecutarConsulta } from "../../../lib/candy/consulta"; // módulo con banderas

export default function CandyChatPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "¡Hola! Soy Candy 🤖, tu asistente académico. ¿Qué deseas buscar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Mensaje del usuario
    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      // 🔹 Detectar intención (async porque consulta BD)
      const intencion = await detectarIntencion(input);

      // 🔹 Detectar contexto (async porque consulta Supabase)
      const contexto = await extraerContexto(input);

      // 🔹 Ejecutar consulta con intención + contexto + detalles
      const { resultados, banderas } = await ejecutarConsulta(
        intencion.intencionesDetectadas,
        contexto,
        intencion.detalles
      );

      // 🔹 Formatear resultados para mostrarlos en el chat
      let resultadosTexto = "";

      if (resultados.noticias?.length) {
        resultadosTexto += `📰 Noticias encontradas:\n${resultados.noticias.map(n => `- ${n.titulo} (por ${n.autor || "desconocido"})`).join("\n")}\n\n`;
      }

      if (resultados.hilos?.length) {
        resultadosTexto += `🧵 Hilos encontrados:\n${resultados.hilos.map(h => `- ${h.titulo} (Materia: ${h.nombreMateria || "desconocida"})`).join("\n")}\n\n`;
      }

      if (!resultadosTexto) {
        resultadosTexto = resultados.mensaje || "❌ No encontré coincidencias relevantes.";
      }

      // 🔹 Formatear banderas de depuración
      let banderasTexto = "";
      if (banderas?.length) {
        banderasTexto = `🏳️ Banderas de depuración:\n${banderas.join("\n")}`;
      }

      // 🔹 Mostrar materia detectada en intención
      let materiaTexto = "";
      if (intencion.detalles?.materia?.length) {
        materiaTexto = `📚 Materia detectada: ${intencion.detalles.materia.join(", ")}`;
      }

      // 🔹 Respuesta del bot mostrando intención + contexto + resultados + banderas + materia
      const botReply = {
        sender: "bot",
        text: `He detectado que tu consulta es de tipo: ${intencion.intencionesDetectadas.join(", ")}\n\n${materiaTexto ? materiaTexto + "\n\n" : ""}Contexto detectado: ${JSON.stringify(contexto)}\n\n${resultadosTexto}${banderasTexto ? "\n\n" + banderasTexto : ""}`
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      // Manejo de errores para evitar que se rompa el chat
      const botReply = {
        sender: "bot",
        text: `❌ Ocurrió un error al procesar tu consulta: ${error.message}`
      };
      setMessages((prev) => [...prev, botReply]);
    }

    setInput("");
  };

  return (
    <div className={styles.chatContainer}>
      <h1 className={styles.chatTitle}>Candy Chat</h1>

      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "user" ? styles.userMessage : styles.botMessage}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className={styles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          Enviar
        </button>
      </div>
    </div>
  );
}
