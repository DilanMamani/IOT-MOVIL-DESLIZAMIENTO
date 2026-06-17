import { useCallback, useState } from "react";
import { sendChatMessage } from "../api/chatbot";
import type { ChatHistoryItem, Report } from "../types"; // antes: CitizenReport

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  time: string;
  reportCard?: Report; // antes: CitizenReport
};

function now() {
  return new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const WELCOME: ChatMessage = {
  id: newId(),
  role: "bot",
  time: now(),
  text: "Hola, soy el asistente de SlideWatch. 👋\n\nPuedo ayudarte en emergencias, guiarte para reportar incidentes o consultar el estado de tus reportes.\n\n¿En qué te ayudo hoy?",
};

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const userMsg: ChatMessage = { id: newId(), role: "user", text: trimmed, time: now() };

      // Construyo el historial ANTES de meter el mensaje nuevo del usuario,
      // porque el backend espera el historial previo + el mensaje actual aparte.
      const historial: ChatHistoryItem[] = messages
        .filter((m) => m.id !== WELCOME.id) // el saludo no es parte del historial real
        .map((m) => ({
          role: m.role === "bot" ? "model" : "user",
          content: m.text,
        }));

      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);
      setError(null);

      try {
        const res = await sendChatMessage(trimmed, historial);

        const botMsg: ChatMessage = {
          id: newId(),
          role: "bot",
          time: now(),
          text: res.mensaje,
          reportCard: res.tipo_respuesta === "ui_card_reporte" ? res.datos : undefined,
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.log("ERROR CHATBOT:", err); // 👈 agrega esto temporalmente
        const errMsg = err instanceof Error ? err.message : "No se pudo enviar el mensaje";
        setError(errMsg);
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "bot",
            time: now(),
            text: "⚠️ Tuve un problema para responder. Intenta de nuevo en un momento, o llama al 117 si es una emergencia.",
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [messages, isSending]
  );

  return { messages, isSending, error, sendMessage };
}