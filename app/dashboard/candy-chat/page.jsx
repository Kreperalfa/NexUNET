"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./candyChat.module.css";

// 🔹 Importamos el orquestador y el formateador
import { procesarConsulta } from "../../../lib/candy";
import { formatearRespuesta } from "../../../lib/candy/formateador";

export default function CandyChatPage() {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: `🐶 ¡Guau guau! Hola humano unetense, soy Candy, tu perrita académica de la UNET 🐾.
            Escríbeme el nombre de una materia o tema (ejemplo: "Primer parcial de Matemática 4").
            Yo olfatearé 🐕 entre los hilos y te mostraré los que coincidan.
            Si no encuentro nada, te lo diré con un ladrido triste 😢. 
            ¡Vamos humano, dime qué quieres buscar y Candy irá a husmear por ti!`
    }
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
      // 🔹 Procesar consulta con Candy
      const { resultados, intencion, contexto } = await procesarConsulta(input);

      // 🔹 Formatear resultados para mostrar en el chat
      const resultadosTexto = formatearRespuesta(resultados);

      // 🔹 Opcional: mostrar entidad detectada (pero NO banderas)
      let debugTexto = "";
/*
      if (intencion.detalles?.materia?.length) {
        debugTexto += `📚 Materia detectada: ${intencion.detalles.materia.join(", ")}\n`;
      }
      if (intencion.detalles?.entidadFinal) {
        debugTexto += `🏢 Entidad detectada: ${intencion.detalles.entidadFinal.tipo} → ${intencion.detalles.entidadFinal.nombre}\n`;
      }
*/
      // 🔹 Respuesta del bot
      const botReply = {
        sender: "bot",
        text: `${resultadosTexto}${debugTexto ? "\n\n" + debugTexto : ""}`
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
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
            {/* 🔹 Renderizamos texto con links */}
            <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, "<br/>") }} />
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
