import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { createReport } from "../../api/reports";
import type { ReportType, ReportUrgency } from "../../types";

const TERRACOTA = "#C4622D";
const CREAM = "#FAF7F2";
const CREAM_DEEP = "#F0EBE3";
const BORDER = "#E8E0D5";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";

const INCIDENT_TYPES: { value: ReportType; label: string; icon: string }[] = [
  { value: "grieta_suelo", label: "Grieta en el suelo", icon: "warning" },
  { value: "grieta_vivienda", label: "Grieta en vivienda", icon: "home" },
  { value: "deslizamiento", label: "Deslizamiento activo", icon: "landslide" },
  { value: "hundimiento", label: "Hundimiento", icon: "arrow-downward" },
  { value: "filtracion_agua", label: "Filtración de agua", icon: "water" },
  { value: "caida_muro", label: "Caída de muro", icon: "fence" },
  { value: "derrumbe", label: "Derrumbe", icon: "apartment" },
  { value: "otro", label: "Otro incidente", icon: "report-problem" },
];

const URGENCY_OPTIONS: { value: ReportUrgency; label: string; bg: string; text: string }[] = [
  { value: "baja", label: "Baja", bg: "#F0F0F0", text: "#8C8C8C" },
  { value: "media", label: "Media", bg: "#FFF3E0", text: "#E8A020" },
  { value: "alta", label: "Alta", bg: "#FFF0EA", text: "#C4622D" },
  { value: "critica", label: "Crítica", bg: "#FDEAEA", text: "#D94F4F" },
];

// La Paz fallback coords if GPS unavailable
const FALLBACK_LAT = -16.5;
const FALLBACK_LON = -68.15;

export function ReportScreen() {
  const navigation = useNavigation<any>();

  const [incidentType, setIncidentType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<ReportUrgency>("baja");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState<number>(FALLBACK_LAT);
  const [lon, setLon] = useState<number>(FALLBACK_LON);
  const [locLoading, setLocLoading] = useState(false);
  const [locOk, setLocOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const selectedType = INCIDENT_TYPES.find((t) => t.value === incidentType);

  // Request location as soon as screen mounts
  useEffect(() => {
    (async () => {
      setLocLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        setLocOk(true);

        // Reverse geocode for address suggestion
        const [addr] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (addr) {
          const parts = [addr.street, addr.district, addr.city].filter(Boolean);
          setLocationName(parts.join(", "));
        }
      } catch {
        // GPS error — keep fallback coords
      } finally {
        setLocLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!incidentType) {
      Alert.alert("Campo requerido", "Selecciona el tipo de incidente.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Campo requerido", "Agrega una descripción del incidente.");
      return;
    }

    setLoading(true);
    try {
      await createReport({
        incident_type: incidentType,
        description: description.trim(),
        urgency_level: urgency,
        latitude: lat,
        longitude: lon,
        location_name: locationName.trim() || undefined,
      });
      Alert.alert(
        "Reporte enviado",
        "Tu reporte fue enviado con éxito. Gracias por contribuir a la seguridad de tu comunidad.",
        [{ text: "Aceptar", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo enviar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nuevo reporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Photo Placeholder */}
        <TouchableOpacity style={s.photoArea} activeOpacity={0.8}>
          <MaterialIcons name="photo-camera" size={40} color={TEXT_SECONDARY} />
          <Text style={s.photoTitle}>Fotografiar el incidente</Text>
          <Text style={s.photoSub}>Toca para agregar una foto (opcional)</Text>
        </TouchableOpacity>

        {/* Tipo de incidente */}
        <Text style={s.label}>Tipo de incidente *</Text>
        <TouchableOpacity style={s.selector} onPress={() => setShowTypePicker(true)} activeOpacity={0.8}>
          {selectedType ? (
            <View style={s.selectorInner}>
              <MaterialIcons name={selectedType.icon as any} size={20} color={TERRACOTA} />
              <Text style={[s.selectorText, { color: TEXT_PRIMARY }]}>{selectedType.label}</Text>
            </View>
          ) : (
            <Text style={[s.selectorText, { color: TEXT_SECONDARY }]}>Seleccionar tipo...</Text>
          )}
          <MaterialIcons name="keyboard-arrow-down" size={22} color={TEXT_SECONDARY} />
        </TouchableOpacity>

        {/* Descripción */}
        <Text style={s.label}>Descripción *</Text>
        <TextInput
          style={s.textarea}
          placeholder="Describe lo que observas: grietas, movimiento, ruidos, etc."
          placeholderTextColor={TEXT_SECONDARY}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* Ubicación GPS */}
        <Text style={s.label}>Ubicación GPS</Text>
        <View style={[s.locationCard, locOk && { borderColor: "#4CAF50" }]}>
          {locLoading ? (
            <ActivityIndicator size="small" color={TERRACOTA} />
          ) : (
            <MaterialIcons
              name={locOk ? "gps-fixed" : "gps-not-fixed"}
              size={20}
              color={locOk ? "#4CAF50" : TEXT_SECONDARY}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[s.coordsText, locOk && { color: "#4CAF50" }]}>
              {locOk
                ? `${lat.toFixed(5)}, ${lon.toFixed(5)}`
                : locLoading
                  ? "Obteniendo ubicación..."
                  : "Ubicación aproximada (GPS no disponible)"}
            </Text>
          </View>
        </View>

        {/* Dirección / referencia */}
        <Text style={[s.label, { marginTop: 12 }]}>Dirección o referencia</Text>
        <View style={s.locationCard}>
          <MaterialIcons name="location-pin" size={20} color={TERRACOTA} />
          <TextInput
            style={s.locationInput}
            placeholder="Ej: Av. Arce, entre calles 12 y 14"
            placeholderTextColor={TEXT_SECONDARY}
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        {/* Urgencia */}
        <Text style={[s.label, { marginTop: 16 }]}>Nivel de urgencia</Text>
        <View style={s.urgencyRow}>
          {URGENCY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                s.urgencyChip,
                urgency === opt.value && { backgroundColor: opt.bg, borderColor: opt.text },
              ]}
              onPress={() => setUrgency(opt.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  s.urgencyLabel,
                  { color: urgency === opt.value ? opt.text : TEXT_SECONDARY },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="#fff" />
              <Text style={s.submitText}>Enviar reporte</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Type Picker Modal */}
      <Modal visible={showTypePicker} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} onPress={() => setShowTypePicker(false)} activeOpacity={1}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Tipo de incidente</Text>
            <FlatList
              data={INCIDENT_TYPES}
              keyExtractor={(i) => i.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.modalItem, incidentType === item.value && s.modalItemActive]}
                  onPress={() => { setIncidentType(item.value); setShowTypePicker(false); }}
                >
                  <View style={[s.modalItemIcon, incidentType === item.value && { backgroundColor: TERRACOTA }]}>
                    <MaterialIcons name={item.icon as any} size={20} color={incidentType === item.value ? "#fff" : TERRACOTA} />
                  </View>
                  <Text style={[s.modalItemText, incidentType === item.value && { color: TERRACOTA }]}>
                    {item.label}
                  </Text>
                  {incidentType === item.value && <MaterialIcons name="check" size={18} color={TERRACOTA} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: CREAM,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },

  photoArea: {
    borderWidth: 2, borderColor: BORDER, borderStyle: "dashed", borderRadius: 16,
    paddingVertical: 36, alignItems: "center", gap: 8, marginBottom: 24,
    backgroundColor: CREAM_DEEP,
  },
  photoTitle: { fontSize: 15, color: TEXT_PRIMARY, fontFamily: "DMSans_500Medium" },
  photoSub: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular" },

  label: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_500Medium", marginBottom: 8, marginTop: 4 },

  selector: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 20,
  },
  selectorInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  selectorText: { fontSize: 15, fontFamily: "DMSans_400Regular" },

  textarea: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER, borderRadius: 10,
    padding: 14, fontSize: 15, fontFamily: "DMSans_400Regular", color: TEXT_PRIMARY,
    minHeight: 110, marginBottom: 20,
  },

  locationCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6,
  },
  coordsText: { fontSize: 13, fontFamily: "DMMono_400Regular", color: TEXT_SECONDARY },
  locationInput: { flex: 1, fontSize: 15, fontFamily: "DMSans_400Regular", color: TEXT_PRIMARY },

  urgencyRow: { flexDirection: "row", gap: 10, marginBottom: 32 },
  urgencyChip: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: BORDER, alignItems: "center",
    backgroundColor: "#fff",
  },
  urgencyLabel: { fontSize: 13, fontFamily: "DMSans_700Bold" },

  submitBtn: {
    backgroundColor: TERRACOTA, borderRadius: 12, height: 52,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  submitText: { fontSize: 16, color: "#fff", fontFamily: "DMSans_700Bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, backgroundColor: BORDER, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 17, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold", marginBottom: 16 },
  modalItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: CREAM_DEEP },
  modalItemActive: { backgroundColor: "transparent" },
  modalItemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: CREAM_DEEP, justifyContent: "center", alignItems: "center" },
  modalItemText: { flex: 1, fontSize: 15, color: TEXT_PRIMARY, fontFamily: "DMSans_400Regular" },
});
