import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ScreenHeaderProps {
  title: string;
  liveLabel?: string;
  subtitle?: string;
}

export function ScreenHeader({ title, liveLabel, subtitle }: ScreenHeaderProps) {
  return (
    <View className="bg-dark px-margin-mobile pt-4 pb-5">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center">
            <MaterialIcons name="sensors" size={18} color="#FFFFFF" />
          </View>
          <Text className="font-sans-bold text-[19px] text-on-dark">
            {title}
          </Text>
        </View>

        {liveLabel ? (
          <View className="flex-row items-center bg-tertiary-container/20 px-2.5 py-1 rounded-full gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <Text className="font-mono-bold text-[10px] text-on-dark uppercase tracking-wider">
              {liveLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {subtitle ? (
        <Text className="font-sans text-[12px] text-dark-muted ml-11">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}