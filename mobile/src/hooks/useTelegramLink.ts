import { useCallback, useEffect, useState } from "react";
import {
  getTelegramStatus,
  linkTelegramChatId,
  unlinkTelegramChatId,
} from "../api/telegram";

export function useTelegramLink() {
  const [linked, setLinked] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTelegramStatus();
      setLinked(data.linked);
      setChatId(data.chat_id);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estado de Telegram");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const link = useCallback(async (newChatId: number) => {
    const result = await linkTelegramChatId(newChatId);
    setLinked(true);
    setChatId(result.telegram_chat_id);
    return result;
  }, []);

  const unlink = useCallback(async () => {
    await unlinkTelegramChatId();
    setLinked(false);
    setChatId(null);
  }, []);

  return { linked, chatId, isLoading, error, link, unlink, refresh: fetchStatus };
}