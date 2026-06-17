import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import type { LstmPrediction, RiskPredictionLevel } from "../types";

const LEVEL_STYLE: Record<RiskPredictionLevel, { bg: string; text: string; label: string }> = {
  danger:  { bg: "#3a1f1f", text: "#ff8a8a", label: "Peligro" },
  warning: { bg: "#3a2f12", text: "#ffcf7a", label: "Advertencia" },
  normal:  { bg: "#1c3318", text: "#9fe082", label: "Normal" },
};

const CARD_BG = "#161b27";
const BORDER = "#262d3d";
const TEXT_PRIMARY = "#dfe2ef";
const TEXT_SECONDARY = "#7d8190";
const ACCENT = "#ffb693";

function ProbBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)));
  const color = pct >= 70 ? "#e25c5c" : pct >= 30 ? "#e2a23a" : "#5fbf4a";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.barPct, { color }]}>{pct}%</Text>
    </View>
  );
}

type Props = {
  result: LstmPrediction | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function LstmPredictionCard({ result, loading, error, onRefresh }: Props) {
  const nivel = result?.nivel_predicho ?? "normal";
  const st = LEVEL_STYLE[nivel];

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.title}>Predicción LSTM</Text>
        {loading ? (
          <View style={[s.pill, { backgroundColor: "#1c2230" }]}>
            <Text style={[s.pillText, { color: TEXT_SECONDARY }]}>Calculando…</Text>
          </View>
        ) : result?.disponible ? (
          <View style={[s.pill, { backgroundColor: st.bg }]}>
            <Text style={[s.pillText, { color: st.text }]}>{st.label}</Text>
          </View>
        ) : (
          <View style={[s.pill, { backgroundColor: "#1c2230" }]}>
            <Text style={[s.pillText, { color: TEXT_SECONDARY }]}>Sin datos</Text>
          </View>
        )}
      </View>

      {loading && (
        <View style={s.row}>
          <ActivityIndicator color={ACCENT} size="small" />
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>Ejecutando modelo…</Text>
            <Text style={s.rowDesc}>Procesando las últimas lecturas</Text>
          </View>
        </View>
      )}

      {!loading && error && (
        <View style={s.row}>
          <Text style={[s.rowTitle, { color: "#ff8a8a" }]}>Error al predecir</Text>
          <Text style={s.rowDesc}>{error}</Text>
        </View>
      )}

      {!loading && !error && result && !result.disponible && (
        <View style={s.row}>
          <Text style={s.rowTitle}>Datos insuficientes</Text>
          <Text style={s.rowDesc}>{result.mensaje}</Text>
        </View>
      )}

      {!loading && !error && result?.disponible && (
        <View style={{ gap: 12 }}>
          <View>
            <Text style={s.label}>Probabilidad de riesgo futuro</Text>
            <ProbBar value={result.proba_riesgo_futuro ?? 0} />
          </View>

          <View style={{ gap: 6 }}>
            <View style={s.statRow}>
              <Text style={s.label}>Horizonte</Text>
              <Text style={s.statValue}>
                {result.horizonte_segundos}s ({result.horizonte_lecturas} lecturas)
              </Text>
            </View>
            <View style={s.statRow}>
              <Text style={s.label}>Lecturas usadas</Text>
              <Text style={s.statValue}>{result.lecturas_usadas}</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity onPress={onRefresh} disabled={loading} style={s.refreshBtn}>
        <Text style={s.refreshBtnText}>
          {loading ? "Calculando…" : "Actualizar predicción"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: CARD_BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER, gap: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 15, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { fontSize: 11, fontFamily: "DMSans_700Bold" },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  rowTitle: { fontSize: 13, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  rowDesc: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  label: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginBottom: 4 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statValue: { fontSize: 12, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "#252b3a", overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  barPct: { fontSize: 13, fontFamily: "DMSans_700Bold", minWidth: 36, textAlign: "right" },
  refreshBtn: { alignSelf: "flex-end", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#1c2230" },
  refreshBtnText: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_700Bold" },
});