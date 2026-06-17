import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import { fetchWeather } from "../../api/weather";
import { useRiskHistory } from "../../hooks/useRiskHistory";
import { getOpenAlerts } from "../../api/alerts";
import type { WeatherData } from "../../api/weather";
import type { RiskHistoryPoint, RiskLevel, Alert } from "../../types";
import { RiskAlertsCard } from "../../components/RiskAlertsCard";
import { useAuth } from "../../context/AuthContext";
const TERRACOTA = "#C4622D";
const DARK_PANEL = "#2C1A0E";
const CREAM = "#FAF7F2";
const CREAM_DEEP = "#F0EBE3";
const BORDER = "#E8E0D5";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";

function riskConfig(level: RiskLevel) {
  if (level === "danger") return { label: "PELIGRO", color: "#D94F4F", bg: "#FDEAEA", bar: "#D94F4F", barWidth: 1 };
  if (level === "warning") return { label: "ADVERTENCIA", color: "#E8A020", bg: "#FFF3E0", bar: "#E8A020", barWidth: 0.6 };
  return { label: "NORMAL", color: "#8C8C8C", bg: "#F0F0F0", bar: "#4CAF50", barWidth: 0.2 };
}

function formatHour(isoOrTime: string) {
  const t = new Date(isoOrTime);
  if (isNaN(t.getTime())) return isoOrTime;
  return t.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatAlertTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-BO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //const { rows: riskHistory, loading: riskLoading, refresh: refreshRisk } = useRiskHistory();
  const { rows: riskHistory, loading: riskLoading, refresh: refreshRisk } = useRiskHistory();
  const load = useCallback(async () => {
    try {
      const [wx, al] = await Promise.allSettled([
        fetchWeather(),
        getOpenAlerts(undefined, "24h"),
      ]);
      if (wx.status === "fulfilled") setWeather(wx.value);
      if (al.status === "fulfilled") setAlerts(Array.isArray(al.value) ? al.value : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshRisk();
    load();
  };
  const latestRisk: RiskLevel = riskHistory.length > 0 ? riskHistory[riskHistory.length - 1].risk_level : "normal";
  const risk = riskConfig(latestRisk);

  const avgScore =
    riskHistory.length > 0
      ? riskHistory.reduce((s, p) => s + p.risk_score, 0) / riskHistory.length
      : 0;

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={TERRACOTA} />
      </SafeAreaView>
    );
  }

  const cx = weather?.current;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TERRACOTA} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={s.pageTitle}>Clima y alertas</Text>

        {/* Main Weather Card */}
        <View style={[s.mainCard, { backgroundColor: DARK_PANEL }]}>
          <Text style={s.cityLabel}>La Paz, Bolivia</Text>
          <View style={s.mainRow}>
            <View style={s.tempBlock}>
              <MaterialIcons
                name={(cx?.icon ?? "cloud") as any}
                size={38}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={s.tempBig}>{cx?.temperature ?? "—"}°</Text>
            </View>
            <View style={s.mainRight}>
              <Text style={s.condition}>{cx?.description ?? "Sin datos"}</Text>
              <View style={s.mainStats}>
                <View style={s.mainStat}>
                  <MaterialIcons name="water-drop" size={14} color="#C4AD8C" />
                  <Text style={s.mainStatTxt}>{cx?.humidity ?? "—"}%</Text>
                </View>
                <View style={s.mainStat}>
                  <MaterialIcons name="air" size={14} color="#C4AD8C" />
                  <Text style={s.mainStatTxt}>{cx?.windSpeed ?? "—"} km/h</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={s.cardDivider} />
          <Text style={s.updatedTxt}>Actualizado ahora · Open-Meteo</Text>
        </View>

        {/* Rain Alert (weather-based) */}
        {weather?.isRainAlert && (
          <View style={s.alertCard}>
            <View style={[s.alertIcon, { backgroundColor: "#FFF3CD" }]}>
              <MaterialIcons name="umbrella" size={22} color="#E8A020" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>Condiciones de lluvia activas</Text>
              <Text style={s.alertBody}>
                La precipitación puede incrementar el riesgo de deslizamiento. Mantente alerta y evita zonas de ladera.
              </Text>
            </View>
          </View>
        )}

        {/* Active backend alerts */}
        {alerts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              Alertas activas
              <Text style={s.alertsCount}> ({alerts.length})</Text>
            </Text>
            {alerts.map((a) => {
              const isDanger = a.level === "danger";
              return (
                <View
                  key={a.id}
                  style={[s.alertCard, { borderLeftWidth: 4, borderLeftColor: isDanger ? "#D94F4F" : "#E8A020" }]}
                >
                  <View style={[s.alertIcon, { backgroundColor: isDanger ? "#FDEAEA" : "#FFF3CD" }]}>
                    <MaterialIcons
                      name={isDanger ? "warning" : "info-outline"}
                      size={20}
                      color={isDanger ? "#D94F4F" : "#E8A020"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.alertTitle, { color: isDanger ? "#D94F4F" : "#7A5800" }]}>
                      {a.title}
                    </Text>
                    <Text style={s.alertBody}>{a.message}</Text>
                    <Text style={s.alertMeta}>
                      {a.device_name} · {formatAlertTime(a.created_at)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Hourly Forecast */}
        {weather?.hourly && weather.hourly.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Próximas horas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hourlyRow}>
              {weather.hourly.map((h, i) => (
                <View key={i} style={s.hourCard}>
                  <Text style={s.hourTime}>{formatHour(h.time)}</Text>
                  <MaterialIcons name={h.icon as any} size={24} color={TERRACOTA} />
                  <Text style={s.hourTemp}>{h.temperature}°</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Combined Risk Level */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Nivel de riesgo combinado</Text>
          <View style={[s.riskCard, { borderColor: risk.bg }]}>
            <View style={s.riskTop}>
              <View style={[s.riskBadge, { backgroundColor: risk.bg }]}>
                <Text style={[s.riskBadgeText, { color: risk.color }]}>{risk.label}</Text>
              </View>
              <Text style={s.riskScore}>Score: {avgScore.toFixed(1)}</Text>
            </View>

            <Text style={s.riskDesc}>
              Combinación de datos IoT, condiciones climáticas y reportes ciudadanos de las últimas 24h.
            </Text>

            {/* Bar */}
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${Math.min(risk.barWidth * 100, 100)}%`, backgroundColor: risk.bar }]} />
              <View style={[s.barMarker, { left: `${Math.min(risk.barWidth * 100, 100)}%` as any }]} />
            </View>
            <View style={s.barLabels}>
              <Text style={s.barLabel}>Normal</Text>
              <Text style={s.barLabel}>Advertencia</Text>
              <Text style={s.barLabel}>Peligro</Text>
            </View>
          </View>
        </View>

        {/* Risk History mini chart */}
        {riskHistory.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Historial de riesgo — 24h</Text>
            <View style={s.miniChart}>
              {riskHistory.slice(-20).map((p, i) => {
                const h = p.risk_level === "danger" ? 60 : p.risk_level === "warning" ? 35 : 12;
                const c = p.risk_level === "danger" ? "#D94F4F" : p.risk_level === "warning" ? "#E8A020" : "#4CAF50";
                return <View key={i} style={[s.bar, { height: h, backgroundColor: c }]} />;
              })}
            </View>
            <View style={s.chartLegend}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#4CAF50" }]} />
                <Text style={s.legendLabel}>Normal</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#E8A020" }]} />
                <Text style={s.legendLabel}>Advertencia</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#D94F4F" }]} />
                <Text style={s.legendLabel}>Peligro</Text>
              </View>
            </View>
          </View>
        )}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Últimas alertas de riesgo</Text>
          <RiskAlertsCard riskHistory={riskHistory} isAdmin={true} />
        </View>


        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  pageTitle: { fontSize: 26, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginBottom: 20 },

  mainCard: { borderRadius: 20, padding: 24, marginBottom: 16 },
  cityLabel: { fontSize: 13, color: "#C4AD8C", fontFamily: "DMSans_400Regular", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  mainRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tempBlock: { flexDirection: "row", alignItems: "center", gap: 8 },
  tempBig: { fontSize: 52, color: "#fff", fontFamily: "DMSans_700Bold" },
  mainRight: { alignItems: "flex-end" },
  condition: { fontSize: 15, color: "rgba(255,255,255,0.8)", fontFamily: "DMSans_500Medium", textAlign: "right" },
  mainStats: { flexDirection: "row", gap: 12, marginTop: 8 },
  mainStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  mainStatTxt: { fontSize: 13, color: "#C4AD8C", fontFamily: "DMSans_400Regular" },
  cardDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 16 },
  updatedTxt: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "DMSans_400Regular" },

  alertCard: {
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    backgroundColor: "#FFF8E8", borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#F0D080",
  },
  alertIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  alertTitle: { fontSize: 14, color: "#7A5800", fontFamily: "DMSans_700Bold", marginBottom: 4 },
  alertBody: { fontSize: 13, color: "#7A5800", fontFamily: "DMSans_400Regular", lineHeight: 19 },
  alertMeta: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 4 },
  alertsCount: { fontSize: 14, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular" },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginBottom: 14 },

  hourlyRow: { gap: 10, paddingRight: 8 },
  hourCard: {
    width: 68, backgroundColor: "#fff", borderRadius: 14, padding: 12,
    alignItems: "center", gap: 6, borderWidth: 1, borderColor: BORDER,
  },
  hourTime: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_500Medium" },
  hourTemp: { fontSize: 15, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },

  riskCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20,
    borderWidth: 2,
  },
  riskTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  riskBadgeText: { fontSize: 12, fontFamily: "DMSans_700Bold" },
  riskScore: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMMono_400Regular" },
  riskDesc: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", lineHeight: 20, marginBottom: 16 },

  barTrack: { height: 8, backgroundColor: CREAM_DEEP, borderRadius: 4, marginBottom: 6, position: "relative" },
  barFill: { height: 8, borderRadius: 4, position: "absolute", left: 0, top: 0 },
  barMarker: { position: "absolute", top: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff", borderWidth: 2, borderColor: TEXT_SECONDARY, marginLeft: -8 },
  barLabels: { flexDirection: "row", justifyContent: "space-between" },
  barLabel: { fontSize: 10, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular" },

  miniChart: {
    flexDirection: "row", alignItems: "flex-end", gap: 3,
    height: 70, backgroundColor: CREAM_DEEP, borderRadius: 12, padding: 8,
  },
  bar: { flex: 1, borderRadius: 3, minHeight: 4 },
  chartLegend: { flexDirection: "row", gap: 16, marginTop: 10, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular" },
});
