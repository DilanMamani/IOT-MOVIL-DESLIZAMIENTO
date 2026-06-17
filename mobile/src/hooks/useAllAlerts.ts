import { useCallback, useEffect, useState } from "react";
import { getAllAlerts } from "../api/alerts";
import type { Alert } from "../types";

export function useAllAlerts(range = "30d") {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllAlerts(undefined, range);
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial");
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, isLoading, error, refresh: fetchAlerts };
}
