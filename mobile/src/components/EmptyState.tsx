import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="w-full p-lg rounded-xl bg-secondary-container/10 border border-secondary/20 items-center justify-center space-y-sm">
      <View className="w-16 h-16 rounded-full bg-secondary/20 items-center justify-center">
        <MaterialIcons name={icon} size={32} color="#4edea3" />
      </View>
      <Text className="font-sans-bold text-[20px] text-secondary text-center">
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
