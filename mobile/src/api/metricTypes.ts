import { apiRequest } from "./http";
import type { MetricType } from "../types";

export function getMetricTypes() {
  return apiRequest<MetricType[]>("/api/metric-types");
}
