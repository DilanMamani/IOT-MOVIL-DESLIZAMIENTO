import { apiRequest } from "./http";
import type { Threshold, ThresholdOperator, ThresholdSeverity } from "../types";

export function getThresholds(deviceCode?: string) {
  return apiRequest<Threshold[]>("/api/thresholds", {
    query: { deviceCode },
  });
}

export interface CreateThresholdPayload {
  metricTypeId: string;
  severity: ThresholdSeverity;
  operator: ThresholdOperator;
  value1: number;
  value2?: number;
  deviceCode?: string;
  messageTemplate?: string;
}

export function createThreshold(payload: CreateThresholdPayload) {
  return apiRequest<Threshold>("/api/thresholds", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function deleteThreshold(id: string) {
  return apiRequest<{ id: string }>(`/api/thresholds/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
