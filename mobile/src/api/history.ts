import { apiRequest } from "./http";
import type { HistorySeries } from "../types";

export function getHistory(deviceCode?: string, range = "24h") {
  return apiRequest<HistorySeries>("/api/history", {
    query: { deviceCode, range },
  });
}
