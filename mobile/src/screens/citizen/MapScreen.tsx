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
  Image,
} from "react-native";
import { createElement } from "react";
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
  if (u === "critica") return { label: "CRÍTICA", bg: "#FDEAEA", text: "#D94F4F", hex: "#D94F4F" };
  if (u === "alta")   return { label: "ALTA",    bg: "#FFF0EA", text: "#C4622D", hex: "#C4622D" };
  if (u === "media")  return { label: "MEDIA",   bg: "#FFF3E0", text: "#E8A020", hex: "#E8A020" };
  return                     { label: "BAJA",    bg: "#F0F0F0", text: "#8C8C8C", hex: "#8C8C8C" };
}

function statusConfig(s: string) {
  if (s === "pendiente")   return { label: "Pendiente",   bg: "#FFF3E0", text: "#E8A020" };
  if (s === "en_revision") return { label: "En revisión", bg: "#E3F2FD", text: "#1976D2" };
  if (s === "atendido")    return { label: "Atendido",    bg: "#E8F5E9", text: "#388E3C" };
  if (s === "descartado")  return { label: "Descartado",  bg: "#F0F0F0", text: "#8C8C8C" };
  return                          { label: s,             bg: "#F0F0F0", text: "#8C8C8C" };
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

function openMaps(lat: number | string, lon: number | string) {
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
}

// ── Leaflet map (iframe on web, placeholder on native) ────────────────────────
function LeafletMap({ reports, alerts }: { reports: MapReport[]; alerts: Alert[] }) {
  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body,#map{margin:0;padding:0;height:100%;width:100%;font-family:sans-serif}
.popup-photo{width:100%;max-height:120px;object-fit:cover;border-radius:6px;margin-top:6px}
.popup-title{font-weight:700;font-size:13px;margin:0 0 2px}
.popup-urg{display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;margin-bottom:4px}
.popup-status{font-size:11px;color:#555;margin:0}
.popup-meta{font-size:11px;color:#888;margin-top:4px}
</style>
</head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:true}).setView([-16.5,-68.15],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OSM'}).addTo(map);
${reports.map((r, i) => {
  const uc = urgencyConfig(r.urgency_level);
  const sc = statusConfig(r.status);
  const label = TYPE_LABELS[r.incident_type] ?? r.incident_type;
  const photoTag = r.photo_url
    ? `<img class='popup-photo' src='${r.photo_url}' alt='foto'/>`
    : "";
  const popup = `
<p class='popup-title'>${label}</p>
<span class='popup-urg' style='background:${uc.bg};color:${uc.text}'>${uc.label}</span>
&nbsp;<span class='popup-urg' style='background:${sc.bg};color:${sc.text}'>${sc.label}</span>
<p class='popup-meta'>${r.location_name ?? ""}</p>
${photoTag}`.replace(/`/g, "\\`").replace(/\n/g, "");

  return `
var ic${i}=L.divIcon({className:'',html:'<div style="background:${uc.hex};width:16px;height:16px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>',iconSize:[16,16],iconAnchor:[8,8]});
L.marker([${Number(r.latitude)},${Number(r.longitude)}],{icon:ic${i}}).addTo(map).bindPopup(\`${popup}\`,{maxWidth:200});`;
}).join("")}
</script>
</body></html>`;

  if (Platform.OS === "web") {
    return createElement("iframe", {
      srcDoc: html,
      style: { width: "100%", height: 320, border: "none", borderRadius: 16 },
      sandbox: "allow-scripts allow-same-origin",
    } as any);
  }

  return (
    <TouchableOpacity style={s.nativeMapPlaceholder} onPress={() => openMaps(-16.5, -68.15)} activeOpacity={0.85}>
      <MaterialIcons name="map" size={40} color="rgba(255,255,255,0.5)" />
      <Text style={s.nativeMapText}>Ver en Google Maps</Text>
      <Text style={s.nativeMapSub}>{reports.length} reportes · La Paz, Bolivia</Text>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
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
      else setError("No se pudieron cargar los reportes");
      if (aData.status === "fulfilled") setAlerts(Array.isArray(aData.value) ? aData.value : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = useMemo(() => reports.filter((r) => {
    if (filter === "Todos")   return true;
    if (filter === "Activos") return r.status === "pendiente" || r.status === "en_revision";
    if (filter === "Crítica") return r.urgency_level === "critica";
    if (filter === "Alta")    return r.urgency_level === "alta";
    if (filter === "Media")   return r.urgency_level === "media";
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
            <View style={[s.hdBadge, { backgroundColor: "#FDEAEA" }]}>
              <View style={[s.dot, { backgroundColor: "#D94F4F" }]} />
              <Text style={[s.hdBadgeTxt, { color: "#D94F4F" }]}>{critCount}</Text>
            </View>
          )}
          {warnCount > 0 && (
            <View style={[s.hdBadge, { backgroundColor: "#FFF3E0" }]}>
              <View style={[s.dot, { backgroundColor: "#E8A020" }]} />
              <Text style={[s.hdBadgeTxt, { color: "#E8A020" }]}>{warnCount}</Text>
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
            <TouchableOpacity key={m} style={[s.toggleBtn, viewMode === m && s.toggleBtnActive]} onPress={() => setViewMode(m)}>
              <MaterialIcons name={icon as any} size={16} color={viewMode === m ? "#fff" : TEXT_SECONDARY} />
              <Text style={[s.toggleTxt, viewMode === m && s.toggleTxtActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersScroll} contentContainerStyle={s.filtersContent}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.chipTxt, filter === f && s.chipTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* IoT alerts banner */}
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
          <Text style={s.errorTxt}>{error}</Text>
          <TouchableOpacity onPress={load}><Text style={s.retryTxt}>Reintentar</Text></TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={TERRACOTA} /></View>
      ) : (
        <ScrollView
          style={s.list}
          contentContainerStyle={s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TERRACOTA} />}
          showsVerticalScrollIndicator={false}
        >
          {/* ── MAPA ── */}
          {viewMode === "mapa" && (
            <>
              <LeafletMap reports={filtered} alerts={alerts} />
              <AlertsList alerts={alerts} />
            </>
          )}

          {/* ── TABLA ── */}
          {viewMode === "tabla" && (
            <>
              <View style={s.tableWrap}>
                <View style={[s.tableRow, s.tableHead]}>
                  <Text style={[s.tCell, s.tHead, { flex: 1.8 }]}>Tipo</Text>
                  <Text style={[s.tCell, s.tHead, { flex: 1.1 }]}>Urgencia</Text>
                  <Text style={[s.tCell, s.tHead, { flex: 1.1 }]}>Estado</Text>
                  <Text style={[s.tCell, s.tHead, { flex: 1.4 }]}>Fecha</Text>
                  <Text style={[s.tCell, s.tHead, { flex: 0.5 }]}>Foto</Text>
                </View>
                {filtered.length === 0 ? (
                  <View style={s.empty}>
                    <MaterialIcons name="table-rows" size={36} color={TEXT_SECONDARY} />
                    <Text style={s.emptyTxt}>Sin reportes con este filtro</Text>
                  </View>
                ) : filtered.map((r, i) => {
                  const uc = urgencyConfig(r.urgency_level);
                  const sc = statusConfig(r.status);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[s.tableRow, i % 2 === 1 && { backgroundColor: CREAM_DEEP }]}
                      onPress={() => openMaps(r.latitude, r.longitude)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.tCell, { flex: 1.8 }]} numberOfLines={2}>
                        {TYPE_LABELS[r.incident_type] ?? r.incident_type}
                      </Text>
                      <View style={[s.tCell, { flex: 1.1 }]}>
                        <View style={[s.miniBadge, { backgroundColor: uc.bg }]}>
                          <Text style={[s.miniBadgeTxt, { color: uc.text }]}>{uc.label}</Text>
                        </View>
                      </View>
                      <View style={[s.tCell, { flex: 1.1 }]}>
                        <View style={[s.miniBadge, { backgroundColor: sc.bg }]}>
                          <Text style={[s.miniBadgeTxt, { color: sc.text }]}>{sc.label}</Text>
                        </View>
                      </View>
                      <Text style={[s.tCell, s.tMono, { flex: 1.4 }]} numberOfLines={2}>
                        {formatDate(r.reported_at)}
                      </Text>
                      <View style={[s.tCell, { flex: 0.5, alignItems: "center" }]}>
                        {r.photo_url ? (
                          <Image source={{ uri: r.photo_url }} style={s.tableThumb} />
                        ) : (
                          <MaterialIcons name="hide-image" size={16} color={TEXT_SECONDARY} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <AlertsList alerts={alerts} />
            </>
          )}

          {/* ── LISTA ── */}
          {viewMode === "lista" && (
            <>
              {filtered.length === 0 ? (
                <View style={s.empty}>
                  <MaterialIcons name="location-off" size={40} color={TEXT_SECONDARY} />
                  <Text style={s.emptyTxt}>
                    {reports.length === 0 ? "No hay reportes en esta zona." : "No hay reportes con este filtro."}
                  </Text>
                </View>
              ) : filtered.map((r) => {
                const uc = urgencyConfig(r.urgency_level);
                const sc = statusConfig(r.status);
                return (
                  <View key={r.id} style={s.card}>
                    {/* Photo banner */}
                    {r.photo_url && (
                      <Image source={{ uri: r.photo_url }} style={s.cardPhoto} resizeMode="cover" />
                    )}

                    <View style={s.cardBody}>
                      {/* Top row */}
                      <View style={s.cardTop}>
                        <View style={[s.pinIcon, { backgroundColor: uc.bg }]}>
                          <MaterialIcons name="location-pin" size={18} color={uc.text} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.cardType}>{TYPE_LABELS[r.incident_type] ?? r.incident_type}</Text>
                          <Text style={s.cardMeta}>
                            {r.user_name ? `${r.user_name} · ` : ""}{timeAgo(r.reported_at)}
                          </Text>
                        </View>
                        {/* Urgency + Status badges */}
                        <View style={s.badgeCol}>
                          <View style={[s.miniBadge, { backgroundColor: uc.bg }]}>
                            <Text style={[s.miniBadgeTxt, { color: uc.text }]}>{uc.label}</Text>
                          </View>
                          <View style={[s.miniBadge, { backgroundColor: sc.bg, marginTop: 4 }]}>
                            <Text style={[s.miniBadgeTxt, { color: sc.text }]}>{sc.label}</Text>
                          </View>
                        </View>
                      </View>

                      {r.description ? (
                        <Text style={s.cardDesc} numberOfLines={2}>{r.description}</Text>
                      ) : null}

                      {r.location_name ? (
                        <View style={s.addrRow}>
                          <MaterialIcons name="place" size={13} color={TEXT_SECONDARY} />
                          <Text style={s.addrTxt} numberOfLines={1}>{r.location_name}</Text>
                        </View>
                      ) : null}

                      <View style={s.cardFooter}>
                        <Text style={s.coordsTxt}>
                          {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
                        </Text>
                        <TouchableOpacity style={s.mapsBtn} onPress={() => openMaps(r.latitude, r.longitude)}>
                          <MaterialIcons name="open-in-new" size={13} color={TERRACOTA} />
                          <Text style={s.mapsBtnTxt}>Abrir mapa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
              <AlertsList alerts={alerts} />
            </>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Reusable alerts list ──────────────────────────────────────────────────────
function AlertsList({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <View style={s.alertsSection}>
      <Text style={s.alertsSectionTitle}>Alertas del sensor IoT</Text>
      {alerts.map((a) => {
        const isDanger = a.level === "danger";
        return (
          <View key={a.id} style={[s.alertCard, { borderLeftColor: isDanger ? "#D94F4F" : "#E8A020" }]}>
            <MaterialIcons name={isDanger ? "warning" : "info-outline"} size={18} color={isDanger ? "#D94F4F" : "#E8A020"} />
            <View style={{ flex: 1 }}>
              <Text style={s.alertCardTitle}>{a.title}</Text>
              <Text style={s.alertCardMsg} numberOfLines={2}>{a.message}</Text>
              <Text style={s.alertCardMeta}>{a.device_name} · {formatDate(a.created_at)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 22, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  headerRight: { flexDirection: "row", gap: 8 },
  hdBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  hdBadgeTxt: { fontSize: 12, fontFamily: "DMSans_700Bold" },
  dot: { width: 6, height: 6, borderRadius: 3 },

  toggleRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: CREAM_DEEP, borderWidth: 1, borderColor: BORDER },
  toggleBtnActive: { backgroundColor: DARK_PANEL, borderColor: DARK_PANEL },
  toggleTxt: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_500Medium" },
  toggleTxtActive: { color: "#fff" },

  filtersScroll: { maxHeight: 46 },
  filtersContent: { paddingHorizontal: 16, paddingVertical: 4, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: CREAM_DEEP, borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: TERRACOTA, borderColor: TERRACOTA },
  chipTxt: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_500Medium" },
  chipTxtActive: { color: "#fff" },

  alertsBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginVertical: 6, padding: 10, backgroundColor: "#FDEAEA", borderRadius: 10 },
  alertsBannerTxt: { flex: 1, fontSize: 13, color: "#D94F4F", fontFamily: "DMSans_500Medium" },

  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 8, padding: 12, backgroundColor: "#FDEAEA", borderRadius: 10 },
  errorTxt: { flex: 1, fontSize: 13, color: "#D94F4F", fontFamily: "DMSans_400Regular" },
  retryTxt: { fontSize: 13, color: TERRACOTA, fontFamily: "DMSans_700Bold" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 10 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTxt: { fontSize: 14, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", textAlign: "center" },

  // List cards
  card: { backgroundColor: "#fff", borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  cardPhoto: { width: "100%", height: 160 },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  pinIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  cardType: { fontSize: 14, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  cardMeta: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 2 },
  badgeCol: { alignItems: "flex-end" },
  cardDesc: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginBottom: 8, lineHeight: 19 },
  addrRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  addrTxt: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", flex: 1 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 1, borderTopColor: CREAM_DEEP },
  coordsTxt: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMMono_400Regular" },
  mapsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  mapsBtnTxt: { fontSize: 12, color: TERRACOTA, fontFamily: "DMSans_500Medium" },

  miniBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  miniBadgeTxt: { fontSize: 10, fontFamily: "DMSans_700Bold", letterSpacing: 0.2 },

  // Table
  tableWrap: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: BORDER, backgroundColor: "#fff", marginBottom: 16 },
  tableHead: { backgroundColor: DARK_PANEL },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  tCell: { fontSize: 12, color: TEXT_PRIMARY, fontFamily: "DMSans_400Regular", paddingHorizontal: 3 },
  tHead: { color: "#C4AD8C", fontFamily: "DMSans_700Bold", fontSize: 10, textTransform: "uppercase" },
  tMono: { fontFamily: "DMMono_400Regular", fontSize: 11 },
  tableThumb: { width: 32, height: 32, borderRadius: 6 },

  // Map
  nativeMapPlaceholder: { height: 220, backgroundColor: DARK_PANEL, borderRadius: 16, justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 16 },
  nativeMapText: { fontSize: 16, color: "#fff", fontFamily: "DMSans_700Bold" },
  nativeMapSub: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },

  // Alerts
  alertsSection: { marginTop: 20 },
  alertsSectionTitle: { fontSize: 16, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginBottom: 10 },
  alertCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 4, marginBottom: 8 },
  alertCardTitle: { fontSize: 13, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginBottom: 2 },
  alertCardMsg: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  alertCardMeta: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 4 },
});
