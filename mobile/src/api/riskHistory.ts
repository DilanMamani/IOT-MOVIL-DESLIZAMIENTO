import { apiRequest } from "./http";
import type { RiskHistoryPoint } from "../types";

export function getRiskHistory(deviceCode?: string, range = "24h") {
  return apiRequest<RiskHistoryPoint[]>("/api/risk-history", {
    query: { deviceCode, range },
  });
}
