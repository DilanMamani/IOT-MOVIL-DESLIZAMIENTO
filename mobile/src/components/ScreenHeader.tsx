import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export function ScreenHeader({
  title,
  liveLabel,
}: {
  title: string;
  liveLabel?: string;
}) {
  return (
    <View className="h-14 px-margin-mobile flex-row items-center justify-between border-b border-outline-variant/40">
      <View className="flex-row items-center gap-sm">
        <MaterialIcons name="sensors" size={20} color="#ffb693" />
        <Text className="font-sans-bold text-headline-md text-primary">
          {title}
        </Text>
      </View>
      {liveLabel ? (
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-primary-container" />
          <Text className="font-mono-bold text-[11px] text-primary uppercase">
            {liveLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
