import { apiRequest } from "./http";
import type { ChatbotResponse, ChatHistoryItem } from "../types";

export function sendChatMessage(mensaje: string, historial: ChatHistoryItem[]) {
  return apiRequest<ChatbotResponse>("/api/chatbot/mensaje", {
    method: "POST",
    auth: true,
    body: { mensaje, historial },
  });
}