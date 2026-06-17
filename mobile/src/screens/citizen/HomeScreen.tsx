import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import * as dashboardApi from "../../api/dashboard";
import * as reportsApi from "../../api/reports";
import { fetchWeather } from "../../api/weather";
import type { DashboardSnapshot, Report, WeatherCurrent, RiskLevel } from "../../types";
import { useRiskHistory } from "../../hooks/useRiskHistory";
import { RiskAlertsCard } from "../../components/RiskAlertsCard";

const TERRACOTA = "#C4622D";
const DARK_PANEL = "#2C1A0E";
const CREAM = "#FAF7F2";
const CREAM_DEEP = "#F0EBE3";
const BORDER = "#E8E0D5";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";

function riskConfig(level: RiskLevel | string) {
  if (level === "danger" || level === "critica") return { label: "CRÍTICA", bg: "#FDEAEA", text: "#D94F4F" };
  if (level === "alta") return { label: "ALTA", bg: "#FFF0EA", text: "#C4622D" };
  if (level === "warning" || level === "media") return { label: "MEDIA", bg: "#FFF3E0", text: "#E8A020" };
  return { label: "BAJA", bg: "#F0F0F0", text: "#8C8C8C" };
}

function formatDate(iso: string | undefined | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  grieta_suelo: "Grieta en suelo",
  grieta_vivienda: "Grieta en vivienda",
  deslizamiento: "Deslizamiento activo",
  hundimiento: "Hundimiento",
  filtracion_agua: "Filtración de agua",
  caida_muro: "Caída de muro",
  derrumbe: "Derrumbe",
  otro: "Otro incidente",
};

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const isAdmin = user?.role === "admin";
  const { rows: riskHistory } = useRiskHistory();

  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [snap, reps, wx] = await Promise.allSettled([
        dashboardApi.getSnapshot(),
        reportsApi.getMyReports(),
        fetchWeather(),
      ]);
      if (snap.status === "fulfilled") setSnapshot(snap.value as DashboardSnapshot);
      if (reps.status === "fulfilled") setReports((reps.value as Report[]).slice(0, 3));
      if (wx.status === "fulfilled") setWeather(wx.value.current);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const riskLevel = (snapshot?.risk_level ?? "normal") as RiskLevel;
  const risk = riskConfig(riskLevel);

  const firstName = user?.full_name?.split(" ")[0] ?? "Usuario";

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={TERRACOTA} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TERRACOTA} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerGreet}>Hola,</Text>
            <Text style={s.headerName}>{firstName}</Text>
          </View>
          <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate("Alertas")}>
            <MaterialIcons name="notifications-none" size={26} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Risk + Weather Card */}
        <View style={[s.card, { backgroundColor: DARK_PANEL, borderWidth: 0 }]}>
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

          <View style={s.cardRow}>
            <View style={s.cardStat}>
              <Text style={s.cardStatVal}>{snapshot?.risk_score ? Number(snapshot.risk_score).toFixed(1) : "—"}</Text>
              <Text style={s.cardStatLabel}>Riesgo</Text>
            </View>
            {weather && (
              <>
                <View style={s.cardStatDivider} />
                <View style={s.cardStat}>
                  <View style={s.weatherRow}>
                    <MaterialIcons name={weather.icon as any} size={20} color="#fff" />
                    <Text style={s.cardStatVal}>{weather.temperature}°C</Text>
                  </View>
                  <Text style={s.cardStatLabel}>{weather.description}</Text>
                </View>
                <View style={s.cardStatDivider} />
                <View style={s.cardStat}>
                  <Text style={s.cardStatVal}>{weather.humidity}%</Text>
                  <Text style={s.cardStatLabel}>Humedad</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.quickRow}>
          <TouchableOpacity
            style={[s.quickCard, { backgroundColor: TERRACOTA }]}
            onPress={() => navigation.navigate("Reportar")}
            activeOpacity={0.85}
          >
            <MaterialIcons name="add-circle-outline" size={28} color="#fff" />
            <Text style={s.quickCardTextLight}>Nuevo reporte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.quickCard, { backgroundColor: CREAM_DEEP, borderWidth: 1, borderColor: BORDER }]}
            onPress={() => navigation.navigate("Mapa")}
            activeOpacity={0.85}
          >
            <MaterialIcons name="map" size={28} color={TERRACOTA} />
            <Text style={[s.quickCardText, { color: TEXT_PRIMARY }]}>Ver mapa</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Reports */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Mis reportes recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Mapa")}>
              <Text style={s.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {reports.length === 0 ? (
            <View style={[s.card, s.emptyCard]}>
              <MaterialIcons name="assignment" size={36} color={TEXT_SECONDARY} />
              <Text style={s.emptyText}>Aún no tienes reportes.{"\n"}¡Sé el primero en reportar!</Text>
            </View>
          ) : (
            reports.map((r) => {
              const rc = riskConfig(r.urgency_level as RiskLevel);
              return (
                <View key={r.id} style={[s.reportCard]}>
                  <View style={s.reportRow}>
                    <View style={s.reportInfo}>
                      <Text style={s.reportType}>{REPORT_TYPE_LABELS[r.incident_type] ?? r.incident_type}</Text>
                      <Text style={s.reportDate}>{formatDate(r.reported_at)}</Text>
                      {r.location_name ? (
                        <Text style={s.reportAddress} numberOfLines={1}>{r.location_name}</Text>
                      ) : null}
                    </View>
                    <View style={[s.urgencyBadge, { backgroundColor: rc.bg }]}>
                      <Text style={[s.urgencyText, { color: rc.text }]}>{rc.label}</Text>
                    </View>
                  </View>
                  {r.description ? (
                    <Text style={s.reportDesc} numberOfLines={2}>{r.description}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Últimas alertas de riesgo</Text>
          <RiskAlertsCard riskHistory={riskHistory} isAdmin={false} />
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate("Reportar")}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerGreet: { fontSize: 14, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular" },
  headerName: { fontSize: 24, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginTop: 2 },
  bellBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: CREAM_DEEP, justifyContent: "center", alignItems: "center" },

  card: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: CREAM_DEEP },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardEyebrow: { fontSize: 11, color: "#9D8870", textTransform: "uppercase", letterSpacing: 1, fontFamily: "DMSans_400Regular" },
  cardTitle: { fontSize: 17, color: "#fff", fontFamily: "DMSans_700Bold", marginTop: 4 },
  cardSubtitle: { fontSize: 13, color: "#C4AD8C", fontFamily: "DMSans_400Regular", marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 16 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  cardStat: { flex: 1, alignItems: "center" },
  cardStatVal: { fontSize: 18, color: "#fff", fontFamily: "DMSans_700Bold" },
  cardStatLabel: { fontSize: 11, color: "#C4AD8C", fontFamily: "DMSans_400Regular", marginTop: 2, textAlign: "center" },
  cardStatDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.1)" },
  weatherRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  riskBadgeText: { fontSize: 11, fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },

  quickRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  quickCard: { flex: 1, borderRadius: 16, padding: 20, alignItems: "center", gap: 8 },
  quickCardText: { fontSize: 14, fontFamily: "DMSans_500Medium" },
  quickCardTextLight: { fontSize: 14, fontFamily: "DMSans_500Medium", color: "#fff" },

  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  sectionLink: { fontSize: 13, color: TERRACOTA, fontFamily: "DMSans_500Medium" },

  emptyCard: { alignItems: "center", paddingVertical: 32, gap: 12 },
  emptyText: { fontSize: 14, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", textAlign: "center", lineHeight: 22 },

  reportCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  reportRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  reportInfo: { flex: 1, marginRight: 12 },
  reportType: { fontSize: 15, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  reportDate: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  reportAddress: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  reportDesc: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 8, lineHeight: 19 },

  urgencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  urgencyText: { fontSize: 11, fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },

  fab: {
    position: "absolute", right: 20, bottom: 28,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: TERRACOTA, justifyContent: "center", alignItems: "center",
    shadowColor: TERRACOTA, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});
