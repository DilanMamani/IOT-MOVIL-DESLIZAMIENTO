import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SensorCard } from "../../components/SensorCard";
import { EmptyState } from "../../components/EmptyState";
import { useDevices } from "../../hooks/useDevices";

export function SensorsScreen() {
  const { devices, isLoading, error, refresh } = useDevices();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScreenHeader title="Estado de Sensores" />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#ffb693" />
        }
      >
        {error ? (
          <Text className="font-sans text-error text-center">{error}</Text>
        ) : null}

        <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase">
          Nodos registrados ({devices.length})
        </Text>

        {devices.length === 0 && !isLoading ? (
          <EmptyState
            icon="settings-input-component"
            title="Sin nodos"
            description="Aún no hay dispositivos registrados en la red."
          />
        ) : (
          <View className="space-y-md">
            {devices.map((device) => (
              <SensorCard key={device.id} device={device} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
