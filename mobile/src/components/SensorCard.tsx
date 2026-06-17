import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Badge } from "./Badge";
import { getMetricStatus } from "../utils/statusHelpers";
import { METRIC_UNIT_LABEL, formatNumber, timeAgo } from "../utils/formatters";
import type { DeviceWithDetail } from "../hooks/useDevices";

const METRIC_LABELS: { code: string; label: string; group: string }[] = [
  { code: "soilPercent", label: "Humedad de suelo", group: "soil" },
  { code: "vibrationCount", label: "Vibración (eventos)", group: "vibration" },
  { code: "accelMagnitude", label: "Aceleración", group: "accel" },
  { code: "gyroMagnitude", label: "Rotación", group: "gyro" },
];

export function SensorCard({ device }: { device: DeviceWithDetail }) {
  const isOnline = device.status === "active";
  const statusBadge = isOnline
    ? { label: "ONLINE", type: "low" as const }
    : { label: "OFFLINE", type: "high" as const };

  return (
    <View className="bg-surface-container rounded-lg border border-outline-variant p-md space-y-md">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-sm">
          <View className="w-9 h-9 rounded-md bg-level2-input items-center justify-center">
            <MaterialIcons name="developer-board" size={18} color="#ffb693" />
          </View>
          <View>
            <Text className="font-sans-bold text-on-surface">{device.name}</Text>
            <Text className="font-mono text-[10px] text-on-surface-variant">
              {device.code} · {device.location_name ?? "Sin ubicación"}
            </Text>
          </View>
        </View>
        <Badge label={statusBadge.label} type={statusBadge.type} />
      </View>

      <Text className="font-sans text-[10px] text-on-surface-variant">
        Última señal: {timeAgo(device.last_seen_at)}
      </Text>

      <View className="flex-row flex-wrap gap-sm">
        {METRIC_LABELS.map(({ code, label, group }) => {
          const raw = device.snapshot?.[code];
          if (raw === undefined || raw === null) return null;
          const value = Number(raw);
          const status = getMetricStatus(group, value);
          return (
            <View
              key={code}
              className="w-[47%] bg-level2-input rounded-md p-sm space-y-1"
            >
              <Text className="font-sans text-[10px] text-on-surface-variant uppercase">
                {label}
              </Text>
              <View className="flex-row items-end justify-between">
                <Text className="font-mono-bold text-[18px] text-on-surface">
                  {formatNumber(value)}
                  <Text className="text-[11px] text-on-surface-variant">
                    {METRIC_UNIT_LABEL[code] ?? ""}
                  </Text>
                </Text>
                <Badge label={status.label} type={status.type} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
