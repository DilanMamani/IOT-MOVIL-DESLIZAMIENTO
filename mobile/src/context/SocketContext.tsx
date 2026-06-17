import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { showLocalAlertNotification } from "../lib/notifications";
import type { Alert } from "../types";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

interface SocketContextValue {
  isConnected: boolean;
  liveAlerts: Alert[];
  resolvedAlertIds: Set<string>;
  clearLiveAlerts: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(
  undefined
);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [resolvedAlertIds, setResolvedAlertIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("map:alert_new", (alert: Alert) => {
      setLiveAlerts((prev) => [alert, ...prev]);
      showLocalAlertNotification(alert).catch(() => {});
    });

    socket.on("map:alert_resolved", (data: { id: string }) => {
      setResolvedAlertIds((prev) => new Set(prev).add(data.id));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const clearLiveAlerts = () => setLiveAlerts([]);

  return (
    <SocketContext.Provider
      value={{ isConnected, liveAlerts, resolvedAlertIds, clearLiveAlerts }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket debe usarse dentro de SocketProvider");
  return ctx;
}
