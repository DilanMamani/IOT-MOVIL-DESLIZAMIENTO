import { apiRequest } from "./http";
import type { DashboardSnapshot } from "../types";

export function getSnapshot(deviceCode?: string) {
  return apiRequest<DashboardSnapshot>("/api/dashboard/snapshot", {
    query: { deviceCode },
  });
}
