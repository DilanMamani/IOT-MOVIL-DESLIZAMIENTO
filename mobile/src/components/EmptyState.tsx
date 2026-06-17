import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="w-full p-lg rounded-xl bg-secondary-container border border-secondary/25 items-center">
      <View
        style={{ backgroundColor: "#E8E2CC" }}
        className="w-16 h-16 rounded-full items-center justify-center mb-3"
      >
        <MaterialIcons name={icon} size={32} color="#84592B" />
      </View>
      <Text className="font-sans-bold text-[18px] text-on-surface text-center mb-1">
        {title}
      </Text>
      {description ? (
        <Text className="font-sans text-body-base text-on-surface-variant text-center max-w-[280px]">
          {description}
        </Text>
      ) : null}
    </View>
  );
}