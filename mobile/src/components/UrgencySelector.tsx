import { Pressable, Text, View } from "react-native";

export type UrgencyLevel = "baja" | "media" | "alta" | "critica";

const OPTIONS: { value: UrgencyLevel; label: string; color: string }[] = [
  { value: "baja", label: "Baja", color: "#9D9167" },
  { value: "media", label: "Media", color: "#B5824A" },
  { value: "alta", label: "Alta", color: "#84592B" },
  { value: "critica", label: "Crítica", color: "#743014" },
];

interface UrgencySelectorProps {
  value: UrgencyLevel;
  onChange: (value: UrgencyLevel) => void;
}

export function UrgencySelector({ value, onChange }: UrgencySelectorProps) {
  return (
    <View
      style={{ borderRadius: 14, backgroundColor: "#F3E9D4" }}
      className="flex-row p-1"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              borderRadius: 11,
              backgroundColor: selected ? option.color : "transparent",
            }}
            className="flex-1 h-9 items-center justify-center"
          >
            <Text
              className="font-sans-bold text-[11px]"
              style={{ color: selected ? "#FFFFFF" : "#7A6B52" }}
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