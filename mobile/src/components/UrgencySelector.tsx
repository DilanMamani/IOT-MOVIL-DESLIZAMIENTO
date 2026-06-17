import { Pressable, Text, View } from "react-native";

export type UrgencyLevel = "baja" | "media" | "alta" | "critica";

const OPTIONS: { value: UrgencyLevel; label: string; color: string }[] = [
  { value: "baja", label: "BAJA", color: "#4edea3" },
  { value: "media", label: "MEDIA", color: "#ffb3ad" },
  { value: "alta", label: "ALTA", color: "#ffb693" },
  { value: "critica", label: "CRIT", color: "#ffb4ab" },
];

interface UrgencySelectorProps {
  value: UrgencyLevel;
  onChange: (value: UrgencyLevel) => void;
}

export function UrgencySelector({ value, onChange }: UrgencySelectorProps) {
  return (
    <View className="flex-row bg-level2-input rounded-full p-1">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-1 h-9 rounded-full items-center justify-center"
            style={selected ? { backgroundColor: option.color } : undefined}
          >
            <Text
              className="font-sans-bold text-[11px]"
              style={{ color: selected ? "#0f131c" : "#a98a7d" }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function urgencyToSeverity(level: UrgencyLevel): "warning" | "danger" {
  return level === "alta" || level === "critica" ? "danger" : "warning";
}
