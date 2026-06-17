import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PillButton } from "./PillButton";
import { formatNumber, formatTime } from "../utils/formatters";
import type { Alert } from "../types";

const GROUP_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  soilPercent: "water-drop",
  soilRaw: "water-drop",
  vibrationCount: "vibration",
  vibrationDurationMs: "vibration",
  vibrationDetected: "vibration",
  accelMagnitude: "open-in-full",
  accelX: "open-in-full",
  accelY: "open-in-full",
  accelZ: "open-in-full",
  gyroMagnitude: "screen-rotation",
  gyroX: "screen-rotation",
  gyroY: "screen-rotation",
  gyroZ: "screen-rotation",
};

interface AlertCardProps {
  alert: Alert;
  onDismiss: () => void;
  onMute: () => void;
  busy?: boolean;
}

export function AlertCard({ alert, onDismiss, onMute, busy }: AlertCardProps) {
  const isCritical = alert.level === "danger";
  const ribbon = isCritical ? "bg-primary-container" : "bg-tertiary-container";
  const iconBg = isCritical ? "bg-primary-container/20" : "bg-tertiary-container/20";
  const icon = GROUP_ICON[alert.metric_code ?? ""] ?? "warning";

  return (
    <View className="relative bg-surface-container rounded-lg border border-outline-variant overflow-hidden">
      <View className={`absolute left-0 top-0 bottom-0 w-1 ${ribbon}`} />
      <View className="p-md space-y-md ml-1">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center gap-sm">
            <View className={`w-8 h-8 rounded-md items-center justify-center ${iconBg}`}>
              <MaterialIcons name={icon} size={18} color={isCritical ? "#ff6b00" : "#ff6762"} />
            </View>
            <View>
              <Text className="font-sans-bold text-on-surface">{alert.title}</Text>
              <Text className="font-mono text-[10px] text-on-surface-variant">
                NODO: {alert.device_code}
              </Text>
            </View>
          </View>
          <Text
            className={`font-mono-bold text-[12px] ${
              isCritical ? "text-primary-container" : "text-tertiary-container"
            }`}
          >
            {formatTime(alert.created_at)}
          </Text>
        </View>

        <View className="flex-row justify-between py-sm border-t border-b border-outline-variant/30">
          <View>
            <Text className="font-sans-bold text-[10px] text-on-surface-variant uppercase">
              Ubicación
            </Text>
            <Text className="font-sans text-body-base text-on-surface">
              {alert.device_name}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-sans-bold text-[10px] text-on-surface-variant uppercase">
              {alert.metric_name ?? "Lectura"}
            </Text>
            <Text
              className={`font-mono-bold text-[20px] ${
                isCritical ? "text-primary-container" : "text-tertiary-container"
              }`}
            >
              {formatNumber(alert.current_value)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-sm">
          <PillButton
            label="DESCARTAR"
            variant={isCritical ? "primary" : "ghost"}
            onPress={onDismiss}
            loading={busy}
            flex
          />
          <PillButton label="SILENCIAR" variant="ghost" onPress={onMute} flex />
        </View>
      </View>
    </View>
  );
}
