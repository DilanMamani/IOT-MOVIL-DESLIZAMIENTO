import { apiRequest } from "./http";
import type { LstmPrediction } from "../types";

export function getLstmPrediction(deviceCode = "esp32-node-001") {
  return apiRequest<LstmPrediction>(`/api/lstm/predict/${deviceCode}`, {
    auth: true,
  });
}