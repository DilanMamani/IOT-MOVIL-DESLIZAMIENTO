import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import { getMapReports } from "../../api/map";
import type { MapReport, ReportUrgency } from "../../types";

const TERRACOTA = "#C4622D";
const DARK_PANEL = "#2C1A0E";
const CREAM = "#FAF7F2";
const CREAM_DEEP = "#F0EBE3";
const BORDER = "#E8E0D5";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";

const FILTERS = ["Todos", "Activos", "Crítica", "Alta", "Media"] as const;
type Filter = (typeof FILTERS)[number];

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

function urgencyConfig(u: ReportUrgency | string) {
  if (u === "critica") return { label: "CRÍTICA", bg: "#FDEAEA", text: "#D94F4F", dot: "#D94F4F" };
  if (u === "alta") return { label: "ALTA", bg: "#FFF0EA", text: "#C4622D", dot: "#C4622D" };
  if (u === "media") return { label: "MEDIA", bg: "#FFF3E0", text: "#E8A020", dot: "#E8A020" };
  return { label: "BAJA", bg: "#F0F0F0", text: "#8C8C8C", dot: "#8C8C8C" };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function openMaps(lat: number | string, lon: number | string) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  Linking.openURL(url);
}

export function MapScreen() {
  const [reports, setReports] = useState<MapReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("Todos");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getMapReports("7d");
      setReports(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar el mapa");
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = reports.filter((r) => {
    if (filter === "Todos") return true;
    if (filter === "Activos") return r.status === "pendiente" || r.status === "en_revision";
    if (filter === "Crítica") return r.urgency_level === "critica";
    if (filter === "Alta") return r.urgency_level === "alta";
    if (filter === "Media") return r.urgency_level === "media";
    return true;
  });

  const dangerCount = reports.filter((r) => r.urgency_level === "critica" || r.urgency_level === "alta").length;
  const warningCount = reports.filter((r) => r.urgency_level === "media").length;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Mapa de riesgo</Text>
        <View style={s.headerBadges}>
          {dangerCount > 0 && (
            <View style={[s.headerBadge, { backgroundColor: "#FDEAEA" }]}>
              <View style={[s.dot, { backgroundColor: "#D94F4F" }]} />
              <Text style={[s.headerBadgeText, { color: "#D94F4F" }]}>{dangerCount}</Text>
            </View>
          )}
          {warningCount > 0 && (
            <View style={[s.headerBadge, { backgroundColor: "#FFF3E0" }]}>
              <View style={[s.dot, { backgroundColor: "#E8A020" }]} />
              <Text style={[s.headerBadgeText, { color: "#E8A020" }]}>{warningCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={s.mapPlaceholder}>
        <View style={s.mapOverlay}>
          <MaterialIcons name="map" size={48} color="rgba(255,255,255,0.4)" />
          <Text style={s.mapPlaceholderText}>
            {loading ? "Cargando..." : `${reports.length} reporte${reports.length !== 1 ? "s" : ""} en el área`}
          </Text>
          <Text style={s.mapPlaceholderSub}>La Paz, Bolivia · Radio 25 km</Text>
        </View>
        {/* Pins based on loaded reports */}
        {reports.slice(0, 6).map((r, i) => {
          const uc = urgencyConfig(r.urgency_level);
          return (
            <View
              key={r.id}
              style={[
                s.fakePin,
                { left: 30 + (i * 52) % 270, top: 20 + (i * 41) % 110, backgroundColor: uc.dot },
              ]}
            >
              <MaterialIcons name="person-pin" size={16} color="#fff" />
            </View>
          );
        })}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersScroll} contentContainerStyle={s.filtersContent}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.chip, filter === f && s.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error banner */}
      {error && (
        <View style={s.errorBanner}>
          <MaterialIcons name="error-outline" size={16} color="#D94F4F" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={s.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reports List */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={TERRACOTA} />
        </View>
      ) : (
        <ScrollView
          style={s.list}
          contentContainerStyle={s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TERRACOTA} />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <MaterialIcons name="location-off" size={40} color={TEXT_SECONDARY} />
              <Text style={s.emptyText}>
                {reports.length === 0
                  ? "No hay reportes en esta zona."
                  : "No hay reportes con este filtro."}
              </Text>
            </View>
          ) : (
            filtered.map((r) => {
              const uc = urgencyConfig(r.urgency_level);
              return (
                <View key={r.id} style={s.reportCard}>
                  <View style={s.reportTop}>
                    <View style={s.reportLeft}>
                      <View style={[s.pinIcon, { backgroundColor: uc.bg }]}>
                        <MaterialIcons name="location-pin" size={18} color={uc.text} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.reportType}>{REPORT_TYPE_LABELS[r.incident_type] ?? r.incident_type}</Text>
                        <Text style={s.reportUser}>por {r.user_name} · {timeAgo(r.created_at)}</Text>
                      </View>
                    </View>
                    <View style={[s.badge, { backgroundColor: uc.bg }]}>
                      <Text style={[s.badgeText, { color: uc.text }]}>{uc.label}</Text>
                    </View>
                  </View>

                  {r.description ? (
                    <Text style={s.reportDesc} numberOfLines={2}>{r.description}</Text>
                  ) : null}

                  {r.location_name ? (
                    <View style={s.addressRow}>
                      <MaterialIcons name="place" size={13} color={TEXT_SECONDARY} />
                      <Text style={s.addressText} numberOfLines={1}>{r.location_name}</Text>
                    </View>
                  ) : null}

                  <View style={s.reportActions}>
                    <Text style={s.coordsText}>
                      {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
                    </Text>
                    <TouchableOpacity
                      style={s.mapsBtn}
                      onPress={() => openMaps(r.latitude, r.longitude)}
                    >
                      <MaterialIcons name="open-in-new" size={13} color={TERRACOTA} />
                      <Text style={s.mapsBtnText}>Ver en mapa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  headerBadges: { flexDirection: "row", gap: 8 },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  headerBadgeText: { fontSize: 12, fontFamily: "DMSans_700Bold" },
  dot: { width: 6, height: 6, borderRadius: 3 },

  mapPlaceholder: {
    height: 200, backgroundColor: DARK_PANEL, marginHorizontal: 16,
    borderRadius: 20, overflow: "hidden", marginBottom: 12, position: "relative",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center", alignItems: "center", gap: 6,
    backgroundColor: "rgba(44,26,14,0.7)",
  },
  mapPlaceholderText: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: "DMSans_500Medium", textAlign: "center" },
  mapPlaceholderSub: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },
  fakePin: { position: "absolute", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff" },

  filtersScroll: { maxHeight: 48 },
  filtersContent: { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: CREAM_DEEP, borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: DARK_PANEL, borderColor: DARK_PANEL },
  chipText: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_500Medium" },
  chipTextActive: { color: "#fff" },

  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 8, padding: 12,
    backgroundColor: "#FDEAEA", borderRadius: 10,
  },
  errorText: { flex: 1, fontSize: 13, color: "#D94F4F", fontFamily: "DMSans_400Regular" },
  retryText: { fontSize: 13, color: TERRACOTA, fontFamily: "DMSans_700Bold" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 8 },

  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", textAlign: "center" },

  reportCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: BORDER,
  },
  reportTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  reportLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1, marginRight: 10 },
  pinIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  reportType: { fontSize: 14, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  reportUser: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
  reportDesc: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginBottom: 8, lineHeight: 19 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  addressText: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", flex: 1 },
  reportActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTopWidth: 1, borderTopColor: CREAM_DEEP },
  coordsText: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMMono_400Regular" },
  mapsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  mapsBtnText: { fontSize: 12, color: TERRACOTA, fontFamily: "DMSans_500Medium" },
});
