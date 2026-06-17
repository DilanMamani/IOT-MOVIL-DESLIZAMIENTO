import { View, Text, StyleSheet } from "react-native";
import type { RiskHistoryPoint, RiskLevel } from "../types";

// --- PALETA TEMA CLARO ---
const CARD_BG = "#FFFFFF";
const BORDER = "#E8E0D5";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";

// Colores más intensos para que los puntos destaquen sobre blanco
const DOT_COLOR: Record<RiskLevel, string> = {
  danger: "#D94F4F",  // Rojo
  warning: "#E8A020", // Naranja
  normal: "#2E7D32",  // Verde
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
}

type Props = {
  rows: RiskHistoryPoint[];
  limit?: number;
};

export function RecentMonitoringList({ rows, limit = 10 }: Props) {
  const recent = rows.slice(0, limit);

  return (
    <View style={s.card}>
      <Text style={s.title}>Monitoreo reciente</Text>
      <View style={{ gap: 8, marginTop: 10 }}>
        {recent.map((sample, i) => (
          <View key={sample.sample_id ?? i} style={s.row}>
            <View style={[s.dot, { backgroundColor: DOT_COLOR[sample.risk_level] }]} />
            <Text style={s.scoreText}>{Number(sample.risk_score).toFixed(1)}</Text>
            <Text style={s.timeText}>{formatTime(sample.sampled_at)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  title: { fontSize: 15, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scoreText: { fontSize: 13, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", width: 40 },
  timeText: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular" },
});