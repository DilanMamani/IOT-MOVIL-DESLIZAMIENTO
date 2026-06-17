import { Text, View } from "react-native";
import type { StatusType } from "../utils/statusHelpers";

const STYLES: Record<StatusType, { bg: string; text: string }> = {
  high: { bg: "bg-error-container/15", text: "text-error" },
  med: { bg: "bg-tertiary-container/15", text: "text-tertiary" },
  low: { bg: "bg-secondary-container/15", text: "text-secondary" },
};

export function Badge({ label, type }: { label: string; type: StatusType }) {
  const style = STYLES[type];
  return (
    <View className={`px-sm py-1 rounded-full ${style.bg} self-start`}>
      <Text className={`font-sans-bold text-[11px] ${style.text}`}>
        {label}
      </Text>
    </View>
  );
}
