import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ScreenHeader";
import { EmptyState } from "../../components/EmptyState";
import { useRiskHistory } from "../../hooks/useRiskHistory";
import type { RiskHistoryPoint, RiskLevel } from "../../types";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LevelFilter = "all" | RiskLevel;

const FILTERS: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "danger", label: "Peligro" },
  { value: "warning", label: "Advertencia" },
  { value: "normal", label: "Normal" },
];

const LEVEL_META: Record<RiskLevel, { label: string; color: string; bg: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  danger:  { label: "Peligro",     color: "#D94F4F", bg: "#FDEAEA", icon: "warning" },
  warning: { label: "Advertencia", color: "#E8A020", bg: "#FFF3E0", icon: "info-outline" },
  normal:  { label: "Normal",      color: "#3B6D11", bg: "#EAF3DE", icon: "check-circle-outline" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-BO", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export function MonitorScreen() {
  const { rows: riskRows, loading, refresh } = useRiskHistory("esp32-node-001", "30d");
  const [expanded, setExpanded] = useState(true);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  const filtered = useMemo(() => {
    if (levelFilter === "all") return riskRows;
    return riskRows.filter((r) => r.risk_level === levelFilter);
  }, [riskRows, levelFilter]);

  const avgScore = riskRows.length > 0
    ? riskRows.reduce((sum, r) => sum + Number(r.risk_score || 0), 0) / riskRows.length
    : 0;
  const currentLevel: RiskLevel = riskRows[0]?.risk_level ?? "normal";
  const currentMeta = LEVEL_META[currentLevel];

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScreenHeader
        title="Monitor de alertas"
        liveLabel="En vivo"
        subtitle={`Score combinado: ${avgScore.toFixed(1)} · últimos 30 días`}
      />

      <View className="flex-row gap-sm px-margin-mobile pt-md">
        {FILTERS.map((f) => {
          const selected = f.value === levelFilter;
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => setLevelFilter(f.value)}
              className={`px-md h-9 rounded-full items-center justify-center ${
                selected ? "bg-primary-container" : "bg-level2-input"
              }`}
            >
              <Text
                className={`font-sans-bold text-[12px] ${
                  selected ? "text-white" : "text-on-surface-variant"
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#84592B" />
        }
      >
        <View className="bg-surface-container-low border border-outline-variant rounded-lg p-md">
          <TouchableOpacity
            onPress={toggle}
            activeOpacity={0.7}
            className="flex-row items-center justify-between"
          >
            <View>
              <Text className="font-sans-bold text-[15px] text-on-surface">
                Historial de muestras ({filtered.length})
              </Text>
              <Text className="font-sans text-[12px] mt-1" style={{ color: currentMeta.color }}>
                Estado actual: {currentMeta.label}
              </Text>
            </View>
            <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={22} color="#7A6B52" />
          </TouchableOpacity>

          {expanded && (
            <View style={{ gap: 10, marginTop: 12 }}>
              {filtered.length === 0 && !loading ? (
                <EmptyState
                  icon="check-circle"
                  title="Sin muestras"
                  description="No hay registros para este filtro en los últimos 30 días."
                />
              ) : (
                filtered.map((sample, i) => {
                  const meta = LEVEL_META[sample.risk_level];
                  return (
                    <View key={sample.sample_id ?? i} className="flex-row items-start gap-sm">
                      <View
                        className="w-8 h-8 rounded-md items-center justify-center"
                        style={{ backgroundColor: meta.bg }}
                      >
                        <MaterialIcons name={meta.icon} size={16} color={meta.color} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row justify-between">
                          <Text className="font-sans-bold text-[13px] text-on-surface">
                            {meta.label}
                          </Text>
                          <Text className="font-mono text-[11px] text-on-surface-variant">
                            {formatDateTime(sample.sampled_at)}
                          </Text>
                        </View>
                        <Text className="font-sans text-[12px] text-on-surface-variant mt-1">
                          Score: {Number(sample.risk_score).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}