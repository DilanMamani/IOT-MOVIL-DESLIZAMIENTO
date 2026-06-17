import { useCallback, useEffect, useState } from "react";
import {
  createThreshold as createThresholdApi,
  deleteThreshold as deleteThresholdApi,
  getThresholds,
  type CreateThresholdPayload,
} from "../api/thresholds";
import type { Threshold } from "../types";

export function useThresholds() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThresholds = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getThresholds();
      setThresholds(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reglas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  const create = useCallback(async (payload: CreateThresholdPayload) => {
    const created = await createThresholdApi(payload);
    setThresholds((prev) => [created, ...prev]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteThresholdApi(id);
    setThresholds((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { thresholds, isLoading, error, refresh: fetchThresholds, create, remove };
}
