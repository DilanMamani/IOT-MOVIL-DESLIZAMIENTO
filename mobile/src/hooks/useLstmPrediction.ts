import { useCallback, useEffect, useState } from "react";
import { getLstmPrediction } from "../api/lstm";
import type { LstmPrediction } from "../types";

export function useLstmPrediction(deviceCode = "esp32-node-001") {
  const [result, setResult] = useState<LstmPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLstmPrediction(deviceCode);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener predicción");
    } finally {
      setLoading(false);
    }
  }, [deviceCode]);

  useEffect(() => { refresh(); }, [refresh]);

  return { result, loading, error, refresh };
}