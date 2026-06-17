import { apiRequest } from "./http";
import type { MapReport, MapDevice } from "../types";

export async function getMapReports(range?: string): Promise<MapReport[]> {
  return apiRequest<MapReport[]>("/api/map/reports", {
    auth: true,
    query: range ? { range } : undefined,
  });
}

export async function getMapDevices(): Promise<MapDevice[]> {
  return apiRequest<MapDevice[]>("/api/map/devices", { auth: true });
}

export async function getMapAlerts(range?: string) {
  return apiRequest("/api/map/alerts", {
    auth: true,
    query: range ? { range } : undefined,
  });
}
