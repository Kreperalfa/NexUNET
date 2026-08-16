"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./candyChat.module.css";

// 🔹 Importamos el orquestador y el formateador
import { procesarConsulta } from "../../../lib/candy";
import { formatearRespuesta } from "../../../lib/candy/formateador";

// 🔹 Importamos la imagen o GIF/video de Candy
// Si quieres usar el GIF/video animado, cambia esta línea:
import candyIcon from "@/resources/candy-hablando.jpeg";
// import candyIconAnimado from "@/resources/candy-animado.mp4";

export default function CandyChatPage() {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: `🐶 ¡Guau guau! Hola humano unetense, soy Candy, tu perrita académica de la UNET 🐾.<br>
            Escríbeme el nombre de una materia o tema (ejemplo: "Primer parcial de Matemática 4").<br>
            Yo olfatearé 🐕 entre los hilos y te mostraré los que coincidan.<br>
            Si no encuentro nada, te lo diré con un ladrido triste 😢.<br>
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
      const { resultados } = await procesarConsulta(input);

      // 🔹 Formatear resultados para mostrar en el chat (HTML listo)
      const resultadosTexto = formatearRespuesta(resultados);

      const botReply = {
        sender: "bot",
        text: resultadosTexto
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
            className={
              msg.sender === "user"
                ? styles.userMessage
                : styles.botMessage
            }
          >
            {/* ⭐ Avatar del bot */}
            {msg.sender === "bot" && (
              <div className={styles.botAvatarWrapper}>

                {/* ⭐ Si quieres usar el GIF/video animado, reemplaza este bloque: */}
                {/* 
                <video
                  src={candyIconAnimado}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={styles.botAvatar}
                />
                */}

                {/* ⭐ Imagen estática */}
                <Image
                  src={candyIcon}
                  alt="Candy"
                  fill
                  sizes="40px"
                  loading="eager"
                  className={styles.botAvatar}
                />
              </div>
            )}

            {/* ⭐ Burbuja del mensaje con HTML ya formateado */}
            <div
              className={styles.messageBubble}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
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
