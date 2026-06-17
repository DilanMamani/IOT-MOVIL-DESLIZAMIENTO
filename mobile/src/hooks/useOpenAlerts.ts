import { useCallback, useEffect, useMemo, useState } from "react";
import { getOpenAlerts, resolveAlert as resolveAlertApi } from "../api/alerts";
import { useSocket } from "../context/SocketContext";
import type { Alert } from "../types";

const POLL_INTERVAL_MS = 30000;

export function useOpenAlerts() {
  const { liveAlerts, resolvedAlertIds } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getOpenAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar alertas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const merged = useMemo(() => {
    const byId = new Map<string, Alert>();
    for (const alert of alerts) byId.set(alert.id, alert);
    for (const alert of liveAlerts) byId.set(alert.id, alert);

    return Array.from(byId.values())
      .filter((a) => !a.is_resolved)
      .filter((a) => !resolvedAlertIds.has(a.id))
      .filter((a) => !dismissedIds.has(a.id))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [alerts, liveAlerts, resolvedAlertIds, dismissedIds]);

  const resolve = useCallback(async (alertId: string) => {
    await resolveAlertApi(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const dismiss = useCallback((alertId: string) => {
    setDismissedIds((prev) => new Set(prev).add(alertId));
  }, []);

  return { alerts: merged, isLoading, error, refresh: fetchAlerts, resolve, dismiss };
}
