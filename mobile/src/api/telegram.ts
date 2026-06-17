import { apiRequest } from "./http";

export type TelegramStatus = {
  linked: boolean;
  chat_id: number | null;
};

export function getTelegramStatus() {
  return apiRequest<TelegramStatus>("/api/telegram/status", {
    auth: true,
  });
}

export function linkTelegramChatId(chatId: number) {
  return apiRequest<{ telegram_chat_id: number }>("/api/telegram/link", {
    method: "POST",
    auth: true,
    body: { chat_id: chatId },
  });
}

export function unlinkTelegramChatId() {
  return apiRequest<null>("/api/telegram/link", {
    method: "DELETE",
    auth: true,
  });
}