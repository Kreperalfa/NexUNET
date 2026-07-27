"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./candyChat.module.css";

// 🔹 Importamos los módulos de Candy
import { detectarIntencion } from "../../../lib/candy/intencion";
import { extraerContexto } from "../../../lib/candy/contexto";

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

    // 🔹 Detectar intención
    const intencion = detectarIntencion(input);

    // 🔹 Detectar contexto (async porque consulta Supabase)
    const contexto = await extraerContexto(input);

    // Respuesta temporal del bot mostrando intención + contexto
    setTimeout(() => {
      const botReply = {
        sender: "bot",
        text: `He detectado que tu consulta es de tipo: ${intencion.intencionesDetectadas.join(", ")}\n\nContexto detectado: ${JSON.stringify(contexto)}`
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);

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
