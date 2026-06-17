import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import * as dashboardApi from "../../api/dashboard";
import { useLstmPrediction } from "../../hooks/useLstmPrediction";
import { LstmPredictionCard } from "../../components/LstmPredictionCard";
import type { DashboardSnapshot, RiskLevel } from "../../types";
import { useRiskHistory } from "../../hooks/useRiskHistory";
import { CriticalAlertsCard } from "../../components/CriticalAlertsCard";
import { RecentMonitoringList } from "../../components/RecentMonitoringList";

const ACCENT = "#C4622D"; // TERRACOTA
const BG = "#FAF7F2"; // CREAM
const CARD_BG = "#FFFFFF"; // Blanco limpio para las tarjetas del admin
const BORDER = "#E8E0D5";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";

function riskConfig(level: RiskLevel | string) {
  if (level === "danger") return { label: "CRÍTICA", bg: "#3a1f1f", text: "#ff8a8a" };
  if (level === "warning") return { label: "ADVERTENCIA", bg: "#3a2f12", text: "#ffcf7a" };
  return { label: "NORMAL", bg: "#1c3318", text: "#9fe082" };
}

export function AdminHomeScreen() {
  const { user, logout } = useAuth();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  //const { rows: riskHistory } = useRiskHistory();
    const { rows: riskHistory } = useRiskHistory("esp32-node-001", "30d");
console.log("RISK HISTORY:", riskHistory.length, riskHistory[0]);
  const { result: lstmResult, loading: lstmLoading, error: lstmError, refresh: refreshLstm } = useLstmPrediction();

  const load = useCallback(async () => {
    try {
      const snap = await dashboardApi.getSnapshot();
      setSnapshot(snap as DashboardSnapshot);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
    refreshLstm();
  };

  const riskLevel = (snapshot?.risk_level ?? "normal") as RiskLevel;
  const risk = riskConfig(riskLevel);
  const firstName = user?.full_name?.split(" ")[0] ?? "Admin";

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View>
            <Text style={s.headerGreet}>Hola,</Text>
            <Text style={s.headerName}>{firstName}</Text>
          </View>
          <TouchableOpacity style={s.iconBtn} onPress={logout}>
            <MaterialIcons name="logout" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Zona monitorizada — igual estructura que el Home de ciudadano */}
        <View style={s.card}>
          <View style={s.cardTopRow}>
            <View>
              <Text style={s.cardEyebrow}>Zona monitorizada</Text>
              <Text style={s.cardTitle}>{snapshot?.device_name ?? "TerraGuard — Sensor IoT"}</Text>
              <Text style={s.cardSubtitle}>{snapshot?.location_name ?? "La Paz, Bolivia"}</Text>
            </View>
            <View style={[s.riskBadge, { backgroundColor: risk.bg }]}>
              <Text style={[s.riskBadgeText, { color: risk.text }]}>{risk.label}</Text>
            </View>
          </View>
          <View style={s.cardDivider} />
          <View style={s.cardStat}>
            <Text style={s.cardStatVal}>{snapshot?.risk_score ? Number(snapshot.risk_score).toFixed(1) : "—"}</Text>
            <Text style={s.cardStatLabel}>Score de riesgo actual</Text>
          </View>
        </View>

        {/* LSTM */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Predicción del modelo</Text>
          <LstmPredictionCard result={lstmResult} loading={lstmLoading} error={lstmError} onRefresh={refreshLstm} />
        </View>

        <View style={s.section}>
            <CriticalAlertsCard rows={riskHistory} limit={5} />
        </View>

        <View style={s.section}>
            <RecentMonitoringList rows={riskHistory} limit={10} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerGreet: { fontSize: 14, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular" },
  headerName: { fontSize: 24, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginTop: 2 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD_BG, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BORDER },

  card: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD_BG },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardEyebrow: { fontSize: 11, color: TEXT_SECONDARY, textTransform: "uppercase", letterSpacing: 1, fontFamily: "DMSans_400Regular" },
  cardTitle: { fontSize: 17, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginTop: 4 },
  cardSubtitle: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: BORDER, marginVertical: 16 },
  cardStat: { alignItems: "flex-start" },
  cardStatVal: { fontSize: 24, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  cardStatLabel: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },

  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  riskBadgeText: { fontSize: 11, fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginBottom: 12 },
});