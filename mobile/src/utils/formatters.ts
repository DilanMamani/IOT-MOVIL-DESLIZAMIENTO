export function formatNumber(value: unknown, decimals = 1): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "--";
  return num.toFixed(decimals);
}

export function formatTime(value: string | null): string {
  if (!value) return "--:--:--";
  const date = new Date(value);
  return date.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  return date.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(value: string | null): string {
  if (!value) return "Nunca";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  return `Hace ${Math.floor(diffH / 24)} d`;
}

export const METRIC_UNIT_LABEL: Record<string, string> = {
  soilPercent: "%",
  soilRaw: "adc",
  vibrationCount: "ev",
  vibrationDurationMs: "ms",
  accelMagnitude: "g",
  gyroMagnitude: "°/s",
};
