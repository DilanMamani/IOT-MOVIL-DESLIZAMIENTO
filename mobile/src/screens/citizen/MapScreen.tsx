import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import React, { createElement } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getMapReports } from "../../api/map";
import { apiRequest } from "../../api/http";
import type { MapReport, Alert } from "../../types";

const TERRACOTA = "#C4622D";
const DARK_PANEL = "#2C1A0E";
const CREAM = "#FAF7F2";
const CREAM_DEEP = "#F0EBE3";
const BORDER = "#E8E0D5";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";

type ViewMode = "lista" | "tabla" | "mapa";
const FILTERS = ["Todos", "Activos", "Crítica", "Alta", "Media"] as const;
type Filter = (typeof FILTERS)[number];

const TYPE_LABELS: Record<string, string> = {
  grieta_suelo: "Grieta suelo",
  grieta_vivienda: "Grieta vivienda",
  deslizamiento: "Deslizamiento",
  hundimiento: "Hundimiento",
  filtracion_agua: "Filtración agua",
  caida_muro: "Caída muro",
  derrumbe: "Derrumbe",
  otro: "Otro",
};

function urgencyConfig(u: string) {
  if (u === "critica") return { label: "CRÍTICA", bg: "#FDEAEA", text: "#D94F4F", dot: "#D94F4F", hex: "#D94F4F" };
  if (u === "alta") return { label: "ALTA", bg: "#FFF0EA", text: "#C4622D", dot: "#C4622D", hex: "#C4622D" };
  if (u === "media") return { label: "MEDIA", bg: "#FFF3E0", text: "#E8A020", dot: "#E8A020", hex: "#E8A020" };
  return { label: "BAJA", bg: "#F0F0F0", text: "#8C8C8C", dot: "#8C8C8C", hex: "#8C8C8C" };
}

function timeAgo(iso: string | undefined | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function formatDate(iso: string | undefined | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function openMaps(lat: number | string, lon: number | string, label: string) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  Linking.openURL(url);
}

// Renders a Leaflet map embedded as an iframe (web) or placeholder (native without WebView)
function LeafletMap({ reports, alerts }: { reports: MapReport[]; alerts: Alert[] }) {
  const markers = reports.map((r) => {
    const uc = urgencyConfig(r.urgency_level);
    return { lat: Number(r.latitude), lon: Number(r.longitude), color: uc.hex, popup: `${TYPE_LABELS[r.incident_type] ?? r.incident_type}<br/><b>${uc.label}</b>` };
  });
  const alertMarkers = alerts.map((a) => ({
    lat: null as number | null,
    lon: null as number | null,
    label: a.title,
    level: a.level,
  }));

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%}body{background:#2C1A0E}</style>
</head><body>
<div id="map"></div>
<script>
var map = L.map('map',{zoomControl:true}).setView([-16.5,-68.15],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OSM'}).addTo(map);
${markers.map((m, i) => `
var ic${i}=L.divIcon({className:'',html:'<div style="background:${m.color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',iconSize:[14,14],iconAnchor:[7,7]});
L.marker([${m.lat},${m.lon}],{icon:ic${i}}).addTo(map).bindPopup('${m.popup.replace(/'/g, "\\'")}');
`).join("")}
</script>
</body></html>`;

  if (Platform.OS === "web") {
    // React Native Web supports native DOM elements via createElement
    return createElement("iframe", {
      srcDoc: html,
      style: { width: "100%", height: 300, border: "none", borderRadius: 16 },
      sandbox: "allow-scripts allow-same-origin",
    } as any);
  }

  // Native without WebView: show a "open in browser" placeholder
  return (
    <TouchableOpacity
      style={s.nativeMapPlaceholder}
      onPress={() => openMaps(-16.5, -68.15, "La Paz")}
      activeOpacity={0.85}
    >
      <MaterialIcons name="map" size={40} color="rgba(255,255,255,0.5)" />
      <Text style={s.nativeMapText}>Ver en Google Maps</Text>
      <Text style={s.nativeMapSub}>{reports.length} reportes · La Paz, Bolivia</Text>
    </TouchableOpacity>
  );
}

export function MapScreen() {
  const [reports, setReports] = useState<MapReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("Todos");
  const [viewMode, setViewMode] = useState<ViewMode>("lista");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [rData, aData] = await Promise.allSettled([
        getMapReports("7d"),
        apiRequest<Alert[]>("/api/alerts/open"),
      ]);
      if (rData.status === "fulfilled") setReports(Array.isArray(rData.value) ? rData.value : []);
      if (aData.status === "fulfilled") setAlerts(Array.isArray(aData.value) ? aData.value : []);
      if (rData.status === "rejected") setError("No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = useMemo(() => reports.filter((r) => {
    if (filter === "Todos") return true;
    if (filter === "Activos") return r.status === "pendiente" || r.status === "en_revision";
    if (filter === "Crítica") return r.urgency_level === "critica";
    if (filter === "Alta") return r.urgency_level === "alta";
    if (filter === "Media") return r.urgency_level === "media";
    return true;
  }), [reports, filter]);

  const critCount = reports.filter((r) => r.urgency_level === "critica" || r.urgency_level === "alta").length;
  const warnCount = reports.filter((r) => r.urgency_level === "media").length;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Mapa de riesgo</Text>
        <View style={s.headerRight}>
          {critCount > 0 && (
            <View style={[s.badge, { backgroundColor: "#FDEAEA" }]}>
              <View style={[s.dot, { backgroundColor: "#D94F4F" }]} />
              <Text style={[s.badgeTxt, { color: "#D94F4F" }]}>{critCount}</Text>
            </View>
          )}
          {warnCount > 0 && (
            <View style={[s.badge, { backgroundColor: "#FFF3E0" }]}>
              <View style={[s.dot, { backgroundColor: "#E8A020" }]} />
              <Text style={[s.badgeTxt, { color: "#E8A020" }]}>{warnCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={s.toggleRow}>
        {(["lista", "tabla", "mapa"] as ViewMode[]).map((m) => {
          const icon = m === "lista" ? "list" : m === "tabla" ? "table-rows" : "map";
          const label = m === "lista" ? "Lista" : m === "tabla" ? "Tabla" : "Mapa";
          return (
            <TouchableOpacity
              key={m}
              style={[s.toggleBtn, viewMode === m && s.toggleBtnActive]}
              onPress={() => setViewMode(m)}
            >
              <MaterialIcons name={icon as any} size={16} color={viewMode === m ? "#fff" : TEXT_SECONDARY} />
              <Text style={[s.toggleTxt, viewMode === m && s.toggleTxtActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filtersScroll}
        contentContainerStyle={s.filtersContent}
      >
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

      {/* Alerts banner from IoT sensors */}
      {alerts.length > 0 && (
        <View style={s.alertsBanner}>
          <MaterialIcons name="sensors" size={16} color="#D94F4F" />
          <Text style={s.alertsBannerTxt}>
            {alerts.length} alerta{alerts.length !== 1 ? "s" : ""} activa{alerts.length !== 1 ? "s" : ""} del sensor IoT
          </Text>
          <View style={[s.dot, { backgroundColor: "#D94F4F" }]} />
        </View>
      )}

      {error && (
        <View style={s.errorBanner}>
          <MaterialIcons name="error-outline" size={16} color="#D94F4F" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={s.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

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
          {/* MAP VIEW */}
          {viewMode === "mapa" && (
            <>
              <LeafletMap reports={filtered} alerts={alerts} />
              {/* Sensor alerts below map */}
              {alerts.length > 0 && (
                <View style={s.alertsSection}>
                  <Text style={s.alertsSectionTitle}>Alertas del sensor IoT</Text>
                  {alerts.map((a) => (
                    <View key={a.id} style={[s.alertCard, { borderLeftColor: a.level === "danger" ? "#D94F4F" : "#E8A020" }]}>
                      <MaterialIcons
                        name={a.level === "danger" ? "warning" : "info-outline"}
                        size={18}
                        color={a.level === "danger" ? "#D94F4F" : "#E8A020"}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={s.alertCardTitle}>{a.title}</Text>
                        <Text style={s.alertCardMsg} numberOfLines={2}>{a.message}</Text>
                        <Text style={s.alertCardMeta}>{a.device_name} · {formatDate(a.created_at)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* TABLA VIEW */}
          {viewMode === "tabla" && (
            <View style={s.tableWrap}>
              {/* Header row */}
              <View style={[s.tableRow, s.tableHead]}>
                <Text style={[s.tableCell, s.tableCellHead, { flex: 2 }]}>Tipo</Text>
                <Text style={[s.tableCell, s.tableCellHead, { flex: 1.2 }]}>Urgencia</Text>
                <Text style={[s.tableCell, s.tableCellHead, { flex: 1.5 }]}>Fecha</Text>
                <Text style={[s.tableCell, s.tableCellHead, { flex: 1 }]}>Estado</Text>
              </View>
              {filtered.length === 0 ? (
                <View style={s.empty}>
                  <MaterialIcons name="table-rows" size={36} color={TEXT_SECONDARY} />
                  <Text style={s.emptyText}>Sin reportes con este filtro</Text>
                </View>
              ) : (
                filtered.map((r, i) => {
                  const uc = urgencyConfig(r.urgency_level);
                  return (
                    <View key={r.id} style={[s.tableRow, i % 2 === 1 && { backgroundColor: CREAM_DEEP }]}>
                      <Text style={[s.tableCell, { flex: 2 }]} numberOfLines={2}>
                        {TYPE_LABELS[r.incident_type] ?? r.incident_type}
                      </Text>
                      <View style={[s.tableCell, { flex: 1.2 }]}>
                        <View style={[s.urgBadge, { backgroundColor: uc.bg }]}>
                          <Text style={[s.urgBadgeTxt, { color: uc.text }]}>{uc.label}</Text>
                        </View>
                      </View>
                      <Text style={[s.tableCell, s.tableCellMono, { flex: 1.5 }]} numberOfLines={2}>
                        {formatDate(r.reported_at)}
                      </Text>
                      <Text style={[s.tableCell, { flex: 1, textTransform: "capitalize", fontSize: 11 }]} numberOfLines={1}>
                        {r.status.replace("_", " ")}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* LISTA VIEW */}
          {viewMode === "lista" && (
            <>
              {filtered.length === 0 ? (
                <View style={s.empty}>
                  <MaterialIcons name="location-off" size={40} color={TEXT_SECONDARY} />
                  <Text style={s.emptyText}>
                    {reports.length === 0 ? "No hay reportes en esta zona." : "No hay reportes con este filtro."}
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
                            <Text style={s.reportType}>{TYPE_LABELS[r.incident_type] ?? r.incident_type}</Text>
                            <Text style={s.reportMeta}>
                              {r.user_name ? `por ${r.user_name} · ` : ""}{timeAgo(r.reported_at)}
                            </Text>
                          </View>
                        </View>
                        <View style={[s.urgBadge, { backgroundColor: uc.bg }]}>
                          <Text style={[s.urgBadgeTxt, { color: uc.text }]}>{uc.label}</Text>
                        </View>
                      </View>

                      {r.description ? (
                        <Text style={s.reportDesc} numberOfLines={2}>{r.description}</Text>
                      ) : null}

                      {r.location_name ? (
                        <View style={s.addrRow}>
                          <MaterialIcons name="place" size={13} color={TEXT_SECONDARY} />
                          <Text style={s.addrText} numberOfLines={1}>{r.location_name}</Text>
                        </View>
                      ) : null}

                      <View style={s.reportFooter}>
                        <Text style={s.coordsTxt}>
                          {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
                        </Text>
                        <TouchableOpacity
                          style={s.mapsBtn}
                          onPress={() => openMaps(r.latitude, r.longitude, TYPE_LABELS[r.incident_type])}
                        >
                          <MaterialIcons name="open-in-new" size={13} color={TERRACOTA} />
                          <Text style={s.mapsBtnTxt}>Abrir mapa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}

              {/* Sensor alerts at bottom of list */}
              {alerts.length > 0 && (
                <View style={s.alertsSection}>
                  <Text style={s.alertsSectionTitle}>Alertas del sensor IoT</Text>
                  {alerts.map((a) => (
                    <View key={a.id} style={[s.alertCard, { borderLeftColor: a.level === "danger" ? "#D94F4F" : "#E8A020" }]}>
                      <MaterialIcons
                        name={a.level === "danger" ? "warning" : "info-outline"}
                        size={18}
                        color={a.level === "danger" ? "#D94F4F" : "#E8A020"}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={s.alertCardTitle}>{a.title}</Text>
                        <Text style={s.alertCardMsg} numberOfLines={2}>{a.message}</Text>
                        <Text style={s.alertCardMeta}>{a.device_name} · {formatDate(a.created_at)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
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
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
  },
  headerTitle: { fontSize: 22, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  headerRight: { flexDirection: "row", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt: { fontSize: 12, fontFamily: "DMSans_700Bold" },
  dot: { width: 6, height: 6, borderRadius: 3 },

  toggleRow: {
    flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 10,
  },
  toggleBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: CREAM_DEEP, borderWidth: 1, borderColor: BORDER,
  },
  toggleBtnActive: { backgroundColor: DARK_PANEL, borderColor: DARK_PANEL },
  toggleTxt: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_500Medium" },
  toggleTxtActive: { color: "#fff" },

  filtersScroll: { maxHeight: 46 },
  filtersContent: { paddingHorizontal: 16, paddingVertical: 4, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: CREAM_DEEP, borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: TERRACOTA, borderColor: TERRACOTA },
  chipText: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_500Medium" },
  chipTextActive: { color: "#fff" },

  alertsBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginTop: 8, padding: 10,
    backgroundColor: "#FDEAEA", borderRadius: 10,
  },
  alertsBannerTxt: { flex: 1, fontSize: 13, color: "#D94F4F", fontFamily: "DMSans_500Medium" },

  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 8, padding: 12,
    backgroundColor: "#FDEAEA", borderRadius: 10,
  },
  errorText: { flex: 1, fontSize: 13, color: "#D94F4F", fontFamily: "DMSans_400Regular" },
  retryText: { fontSize: 13, color: TERRACOTA, fontFamily: "DMSans_700Bold" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 10 },

  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", textAlign: "center" },

  // List cards
  reportCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: BORDER,
  },
  reportTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  reportLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1, marginRight: 10 },
  pinIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  reportType: { fontSize: 14, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  reportMeta: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  reportDesc: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginBottom: 8, lineHeight: 19 },
  addrRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  addrText: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", flex: 1 },
  reportFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 1, borderTopColor: CREAM_DEEP },
  coordsTxt: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMMono_400Regular" },
  mapsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  mapsBtnTxt: { fontSize: 12, color: TERRACOTA, fontFamily: "DMSans_500Medium" },

  urgBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  urgBadgeTxt: { fontSize: 10, fontFamily: "DMSans_700Bold", letterSpacing: 0.3 },

  // Table
  tableWrap: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: BORDER, backgroundColor: "#fff" },
  tableHead: { backgroundColor: DARK_PANEL },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableCell: { fontSize: 12, color: TEXT_PRIMARY, fontFamily: "DMSans_400Regular", paddingHorizontal: 4 },
  tableCellHead: { color: "#C4AD8C", fontFamily: "DMSans_700Bold", fontSize: 11 },
  tableCellMono: { fontFamily: "DMMono_400Regular", fontSize: 11 },

  // Map
  nativeMapPlaceholder: {
    height: 220, backgroundColor: DARK_PANEL, borderRadius: 16,
    justifyContent: "center", alignItems: "center", gap: 8,
  },
  nativeMapText: { fontSize: 16, color: "#fff", fontFamily: "DMSans_700Bold" },
  nativeMapSub: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },

  // Alerts section
  alertsSection: { marginTop: 20 },
  alertsSectionTitle: { fontSize: 16, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginBottom: 10 },
  alertCard: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: BORDER, borderLeftWidth: 4,
    marginBottom: 8,
  },
  alertCardTitle: { fontSize: 13, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginBottom: 2 },
  alertCardMsg: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  alertCardMeta: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 4 },
});
