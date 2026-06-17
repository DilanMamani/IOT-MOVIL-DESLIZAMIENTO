import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { RiskHistoryPoint, RiskLevel } from "../types";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CARD_BG = "#161b27";
const BORDER = "#262d3d";
const TEXT_PRIMARY = "#dfe2ef";
const TEXT_SECONDARY = "#7d8190";

const LEVEL_META: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  danger:  { label: "Peligro",     color: "#ff8a8a", bg: "#3a1f1f" },
  warning: { label: "Advertencia", color: "#ffcf7a", bg: "#3a2f12" },
  normal:  { label: "Normal",      color: "#9fe082", bg: "#1c3318" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

type Props = {
  rows: RiskHistoryPoint[];
  limit?: number;
};

export function CriticalAlertsCard({ rows, limit = 5 }: Props) {
  const [expanded, setExpanded] = useState(true);

  const criticalSamples = rows.filter((r) => r.risk_level === "danger").slice(0, limit);
  const currentLevel: RiskLevel = rows[0]?.risk_level ?? "normal";
  const isRecoveredNow = currentLevel !== "danger" && criticalSamples.length > 0;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={s.card}>
      <TouchableOpacity style={s.headerRow} onPress={toggle} activeOpacity={0.7}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Alertas críticas recientes</Text>
          {isRecoveredNow && (
            <Text style={s.recoveredNote}>Estado actual: {LEVEL_META[currentLevel].label.toLowerCase()}</Text>
          )}
        </View>
        <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={22} color={TEXT_SECONDARY} />
      </TouchableOpacity>

      {expanded && (
        <View style={{ gap: 10, marginTop: 8 }}>
          {criticalSamples.length === 0 ? (
            <View style={s.row}>
              <View style={[s.iconWrap, { backgroundColor: LEVEL_META.normal.bg }]}>
                <MaterialIcons name="check-circle-outline" size={18} color={LEVEL_META.normal.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Sin alertas críticas recientes</Text>
                <Text style={s.rowDesc}>El terreno se mantiene estable</Text>
              </View>
            </View>
          ) : (
            criticalSamples.map((sample, i) => (
              <View key={sample.sample_id ?? i} style={s.row}>
                <View style={[s.iconWrap, { backgroundColor: LEVEL_META.danger.bg }]}>
                  <MaterialIcons name="warning" size={18} color={LEVEL_META.danger.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.rowTitle, { color: LEVEL_META.danger.color }]}>Riesgo crítico detectado</Text>
                  <Text style={s.rowDesc}>{formatTime(sample.sampled_at)}</Text>
                  <Text style={s.scoreText}>Score: {Number(sample.risk_score).toFixed(2)}</Text>
                </View>
                {i === 0 && isRecoveredNow && (
                  <View style={s.recoveredBadge}>
                    <Text style={s.recoveredBadgeText}>Ya en {LEVEL_META[currentLevel].label.toLowerCase()}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 15, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  recoveredNote: { fontSize: 11, color: "#9fe082", fontFamily: "DMSans_400Regular", marginTop: 2 },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  iconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  rowTitle: { fontSize: 13, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  rowDesc: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  scoreText: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMMono_400Regular", marginTop: 2 },
  recoveredBadge: { backgroundColor: "#1c3318", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  recoveredBadgeText: { fontSize: 9, color: "#9fe082", fontFamily: "DMSans_700Bold" },
});