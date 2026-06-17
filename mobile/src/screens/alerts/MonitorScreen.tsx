import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { AlertCard } from "../../components/AlertCard";
import { EmptyState } from "../../components/EmptyState";
import { useOpenAlerts } from "../../hooks/useOpenAlerts";

export function MonitorScreen() {
  const { alerts, isLoading, error, refresh, resolve, dismiss } = useOpenAlerts();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleDismiss = async (id: string) => {
    setBusyId(id);
    try {
      await resolve(id);
    } catch {
      // keep the alert visible if the resolve call fails
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScreenHeader
        title="Monitor de alertas"
        liveLabel="En vivo"
        subtitle={
          alerts.length > 0
            ? `${alerts.length} alerta${alerts.length === 1 ? "" : "s"} activa${alerts.length === 1 ? "" : "s"}`
            : "Sin actividad reciente"
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#84592B" />
        }
      >
        {error ? (
          <Text className="font-sans text-error text-center">{error}</Text>
        ) : null}

        {alerts.length === 0 && !isLoading ? (
          <EmptyState
            icon="check-circle"
            title="Todo en orden"
            description="No se detectaron amenazas activas en los nodos monitoreados."
          />
        ) : (
          <View className="space-y-md">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                busy={busyId === alert.id}
                onDismiss={() => handleDismiss(alert.id)}
                onMute={() => dismiss(alert.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}