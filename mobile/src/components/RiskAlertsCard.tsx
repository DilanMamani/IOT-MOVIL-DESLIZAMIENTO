import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { RiskHistoryPoint, RiskLevel } from "../types";

const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";
const BORDER = "#E8E0D5";

function levelConfig(level: RiskLevel) {
  if (level === "danger") return { label: "Peligro", color: "#791F1F", bg: "#FDEAEA", icon: "warning" as const };
  if (level === "warning") return { label: "Advertencia", color: "#633806", bg: "#FFF3E0", icon: "info-outline" as const };
  return { label: "Normal", color: "#27500A", bg: "#E8F5E9", icon: "check-circle-outline" as const };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

type Props = {
  riskHistory: RiskHistoryPoint[];
  isAdmin: boolean;
  limit?: number;
};

export function RiskAlertsCard({ riskHistory, isAdmin, limit = 3 }: Props) {
  const dangerSamples = riskHistory.filter((r) => r.risk_level === "danger").slice(0, limit);

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.title}>Últimas alertas de riesgo</Text>
        {!isAdmin && (
          <View style={s.demoBadge}>
            <Text style={s.demoBadgeText}>Vista resumida</Text>
          </View>
        )}
      </View>

      {dangerSamples.length === 0 ? (
        <View style={s.row}>
          <View style={[s.iconWrap, { backgroundColor: "#E8F5E9" }]}>
            <MaterialIcons name="check-circle-outline" size={18} color="#27500A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>Sin peligro en las últimas 24h</Text>
            <Text style={s.rowDesc}>El terreno se mantiene estable</Text>
          </View>
        </View>
      ) : (
        dangerSamples.map((sample, i) => {
          const cfg = levelConfig(sample.risk_level);
          return (
            <View key={sample.sample_id ?? i} style={s.row}>
              <View style={[s.iconWrap, { backgroundColor: cfg.bg }]}>
                <MaterialIcons name={cfg.icon} size={18} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.rowTitle, { color: cfg.color }]}>Riesgo {cfg.label.toLowerCase()} detectado</Text>
                <Text style={s.rowDesc}>{formatTime(sample.sampled_at)}</Text>
                {isAdmin && <Text style={s.scoreText}>Score: {Number(sample.risk_score).toFixed(1)}</Text>}
              </View>
            </View>
          );
        })
      )}

      {!isAdmin && (
        <Text style={s.footerNote}>
          Para más detalle técnico sobre estas mediciones, consulta con el administrador del sistema.
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER, gap: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 15, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  demoBadge: { backgroundColor: "#F0EBE3", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  demoBadgeText: { fontSize: 10, color: TEXT_SECONDARY, fontFamily: "DMSans_700Bold" },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  iconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  rowTitle: { fontSize: 13, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  rowDesc: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  scoreText: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMMono_400Regular", marginTop: 2 },
  footerNote: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", fontStyle: "italic", marginTop: 4 },
});