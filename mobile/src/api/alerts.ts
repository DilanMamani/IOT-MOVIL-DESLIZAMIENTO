import { apiRequest } from "./http";
import type { Alert } from "../types";

export function getOpenAlerts(deviceCode?: string, range = "30d") {
  return apiRequest<Alert[]>("/api/alerts/open", {
    query: { deviceCode, range },
  });
}

export function getAllAlerts(deviceCode?: string, range = "30d") {
  return apiRequest<Alert[]>("/api/alerts", {
    query: { deviceCode, range },
  });
}

export function resolveAlert(alertId: string) {
  return apiRequest<Alert>(`/api/alerts/${alertId}/resolve`, {
    method: "PATCH",
    auth: true,
  });
}
