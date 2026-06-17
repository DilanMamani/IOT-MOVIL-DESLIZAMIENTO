export type StatusType = "low" | "med" | "high";

export interface StatusInfo {
  label: string;
  type: StatusType;
}

export function getSoilStatus(value: number): StatusInfo {
  if (value >= 80) return { label: "Crítico", type: "high" };
  if (value >= 60) return { label: "Alerta", type: "med" };
  return { label: "Normal", type: "low" };
}

export function getVibrationStatus(value: number): StatusInfo {
  if (value >= 8) return { label: "Crítico", type: "high" };
  if (value >= 3) return { label: "Alerta", type: "med" };
  return { label: "Normal", type: "low" };
}

export function getAccelStatus(value: number): StatusInfo {
  if (value >= 2.2) return { label: "Crítico", type: "high" };
  if (value >= 1.3) return { label: "Alerta", type: "med" };
  return { label: "Normal", type: "low" };
}

export function getGyroStatus(value: number): StatusInfo {
  if (value >= 1.5) return { label: "Crítico", type: "high" };
  if (value >= 0.8) return { label: "Alerta", type: "med" };
  return { label: "Normal", type: "low" };
}

export function getRiskStatus(riskLevel: string): StatusInfo {
  switch (riskLevel) {
    case "danger":
      return { label: "Crítico", type: "high" };
    case "warning":
      return { label: "Alerta", type: "med" };
    default:
      return { label: "Normal", type: "low" };
  }
}

export function getMetricStatus(metricGroup: string, value: number): StatusInfo {
  switch (metricGroup) {
    case "soil":
      return getSoilStatus(value);
    case "vibration":
      return getVibrationStatus(value);
    case "accel":
      return getAccelStatus(value);
    case "gyro":
      return getGyroStatus(value);
    default:
      return { label: "Normal", type: "low" };
  }
}

export function statusColor(type: StatusType) {
  switch (type) {
    case "high":
      return { text: "#ffb4ab", bg: "rgba(255,180,171,0.15)" };
    case "med":
      return { text: "#ffb693", bg: "rgba(255,182,147,0.15)" };
    default:
      return { text: "#4edea3", bg: "rgba(78,222,163,0.15)" };
  }
}

export function isDeviceOffline(lastSeenAt: string | null, thresholdMinutes = 15) {
  if (!lastSeenAt) return true;
  const last = new Date(lastSeenAt).getTime();
  return Date.now() - last > thresholdMinutes * 60 * 1000;
}
