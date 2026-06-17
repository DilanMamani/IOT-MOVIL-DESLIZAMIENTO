import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Badge } from "../../components/Badge";
import { EmptyState } from "../../components/EmptyState";
import { useAllAlerts } from "../../hooks/useAllAlerts";
import { formatDateTime } from "../../utils/formatters";

type Category = "todos" | "criticos" | "sensores";

const TABS: { value: Category; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "criticos", label: "Críticos" },
  { value: "sensores", label: "Sensores" },
];

export function HistoryScreen() {
  const { alerts, isLoading, error, refresh } = useAllAlerts("30d");
  const [category, setCategory] = useState<Category>("todos");

  const filtered = useMemo(() => {
    if (category === "todos") return alerts;
    if (category === "criticos") return alerts.filter((a) => a.level === "danger");
    return alerts.filter((a) => a.level === "warning");
  }, [alerts, category]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScreenHeader title="Historial de Alertas" />
      <View className="flex-row gap-sm px-margin-mobile pt-md">
        {TABS.map((tab) => {
          const selected = tab.value === category;
          return (
            <Pressable
              key={tab.value}
              onPress={() => setCategory(tab.value)}
              className={`px-md h-9 rounded-full items-center justify-center ${
                selected ? "bg-primary-container" : "bg-level2-input"
              }`}
            >
              <Text
                className={`font-sans-bold text-[12px] ${
                  selected ? "text-white" : "text-on-surface-variant"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#ffb693" />
        }
      >
        {error ? (
          <Text className="font-sans text-error text-center">{error}</Text>
        ) : null}

        {filtered.length === 0 && !isLoading ? (
          <EmptyState
            icon="history"
            title="Sin registros"
            description="No hay eventos en esta categoría durante los últimos 30 días."
          />
        ) : (
          filtered.map((alert) => {
            const isCritical = alert.level === "danger";
            return (
              <View
                key={alert.id}
                className="flex-row items-start gap-sm bg-surface-container rounded-lg border border-outline-variant p-md"
              >
                <View
                  className={`w-8 h-8 rounded-md items-center justify-center ${
                    isCritical ? "bg-primary-container/20" : "bg-tertiary-container/20"
                  }`}
                >
                  <MaterialIcons
                    name={isCritical ? "report" : "info"}
                    size={16}
                    color={isCritical ? "#ff6b00" : "#ff6762"}
                  />
                </View>
                <View className="flex-1 space-y-1">
                  <View className="flex-row justify-between">
                    <Text className="font-sans-bold text-on-surface">{alert.title}</Text>
                    <Text className="font-mono text-[11px] text-on-surface-variant">
                      {formatDateTime(alert.created_at)}
                    </Text>
                  </View>
                  <Text className="font-sans text-[13px] text-on-surface-variant">
                    {alert.device_name} · {alert.message}
                  </Text>
                  <Badge
                    label={alert.is_resolved ? "Resuelto" : "Pendiente"}
                    type={alert.is_resolved ? "low" : isCritical ? "high" : "med"}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
