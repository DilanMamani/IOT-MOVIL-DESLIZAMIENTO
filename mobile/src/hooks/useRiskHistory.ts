import { useCallback, useEffect, useState } from "react";
import { getRiskHistory } from "../api/riskHistory"; // antes: getRiskHistoryByRange
import type { RiskHistoryPoint } from "../types";

export function useRiskHistory(deviceCode = "esp32-node-001", range = "24h") {
  const [rows, setRows] = useState<RiskHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRiskHistory(deviceCode, range); // antes: getRiskHistoryByRange(...)
      setRows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial de riesgo");
    } finally {
      setLoading(false);
    }
  }, [deviceCode, range]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { rows, loading, error, refresh: fetchHistory };
}