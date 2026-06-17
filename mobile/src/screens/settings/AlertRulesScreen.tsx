import { useEffect, useState } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { storageGet, storageSet } from "../../api/storage";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PillButton } from "../../components/PillButton";
import { ToggleSwitch } from "../../components/ToggleSwitch";
import {
  UrgencySelector,
  urgencyToSeverity,
  type UrgencyLevel,
} from "../../components/UrgencySelector";
import { useAuth } from "../../context/AuthContext";
import { useMetricTypes } from "../../hooks/useMetricTypes";
import { useThresholds } from "../../hooks/useThresholds";
import type { ThresholdOperator } from "../../types";

const CHANNEL_PREFS_KEY = "terraguard_channel_prefs";

const CHANNELS: { key: string; label: string; description: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: "soil", label: "Humedad de Suelo", description: "Sensores capacitivos", icon: "water-drop" },
  { key: "vibration", label: "Vibración", description: "Detección de impacto perimetral", icon: "vibration" },
  { key: "motion", label: "Movimiento (Accel/Gyro)", description: "MPU6050 - inclinación y desplazamiento", icon: "screen-rotation" },
];

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

export function AlertRulesScreen() {
  const { logout, user } = useAuth();
  const { metricTypes } = useMetricTypes();
  const { thresholds, create, remove } = useThresholds();

  const [channelPrefs, setChannelPrefs] = useState<Record<string, boolean>>({
    soil: true,
    vibration: true,
    motion: true,
  });

  const [metricTypeId, setMetricTypeId] = useState<string | null>(null);
  const [operator, setOperator] = useState<ThresholdOperator>("gt");
  const [value1, setValue1] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("alta");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    storageGet(CHANNEL_PREFS_KEY).then((raw) => {
      if (raw) setChannelPrefs(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    if (!metricTypeId && metricTypes.length > 0) {
      setMetricTypeId(metricTypes[0].id);
    }
  }, [metricTypes, metricTypeId]);

  const toggleChannel = (key: string) => {
    const next = { ...channelPrefs, [key]: !channelPrefs[key] };
    setChannelPrefs(next);
    storageSet(CHANNEL_PREFS_KEY, JSON.stringify(next));
  };

  const onSaveRule = async () => {
    if (!metricTypeId || !value1) {
      RNAlert.alert("Datos incompletos", "Selecciona una métrica e ingresa un umbral.");
      return;
    }
    setSaving(true);
    try {
      await create({
        metricTypeId,
        operator,
        value1: Number(value1),
        severity: urgencyToSeverity(urgency),
        messageTemplate: `[${URGENCY_LABEL[urgency]}] Notificación push`,
      });
      setValue1("");
    } catch (err) {
      RNAlert.alert(
        "Error",
        err instanceof Error ? err.message : "No se pudo crear la regla"
      );
    } finally {
      setSaving(false);
    }
  };

  const onDeleteRule = (id: string) => {
    RNAlert.alert("Eliminar regla", "¿Seguro que deseas eliminar esta regla?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => remove(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScreenHeader title="Configuración" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <View className="space-y-1">
          <Text className="font-sans-bold text-display-lg text-on-surface">
            Configuración
          </Text>
          <Text className="font-sans text-body-base text-on-surface-variant">
            Configure disparadores de umbral y alertas de telemetría.
          </Text>
        </View>

        <View className="space-y-sm">
          <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase tracking-widest">
            Canales Activos
          </Text>
          {CHANNELS.map((channel) => (
            <View
              key={channel.key}
              className="flex-row items-center justify-between bg-surface-container rounded-lg border border-outline-variant p-md"
            >
              <View className="flex-row items-center gap-sm flex-1">
                <View className="w-9 h-9 rounded-md bg-level2-input items-center justify-center">
                  <MaterialIcons name={channel.icon} size={18} color="#ffb693" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-bold text-on-surface">{channel.label}</Text>
                  <Text className="font-sans text-[11px] text-on-surface-variant">
                    {channel.description}
                  </Text>
                </View>
              </View>
              <ToggleSwitch
                value={channelPrefs[channel.key] ?? true}
                onValueChange={() => toggleChannel(channel.key)}
              />
            </View>
          ))}
        </View>

        <View className="bg-surface-container rounded-lg border border-outline-variant p-md space-y-md">
          <View className="flex-row items-center gap-sm">
            <MaterialIcons name="add-alert" size={18} color="#ffb693" />
            <Text className="font-sans-bold text-on-surface">Crear Regla de Alerta</Text>
          </View>

          <View className="space-y-1">
            <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase">
              Tipo de Telemetría
            </Text>
            <View className="flex-row flex-wrap gap-sm">
              {metricTypes.map((metric) => {
                const selected = metric.id === metricTypeId;
                return (
                  <Pressable
                    key={metric.id}
                    onPress={() => setMetricTypeId(metric.id)}
                    className={`px-sm h-9 rounded-full items-center justify-center border ${
                      selected
                        ? "bg-primary-container border-primary-container"
                        : "bg-level2-input border-outline-variant"
                    }`}
                  >
                    <Text
                      className={`font-sans-bold text-[11px] ${
                        selected ? "text-white" : "text-on-surface-variant"
                      }`}
                    >
                      {metric.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="flex-row gap-md">
            <View className="flex-1 space-y-1">
              <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase">
                Umbral
              </Text>
              <TextInput
                value={value1}
                onChangeText={setValue1}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor="#5a4136"
                className="bg-level2-input rounded-md border border-outline-variant px-md h-[44px] font-sans text-on-surface"
              />
            </View>
            <View className="flex-1 space-y-1">
              <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase">
                Lógica
              </Text>
              <View className="flex-row gap-sm">
                <Pressable
                  onPress={() => setOperator("gt")}
                  className={`flex-1 h-[44px] rounded-md border items-center justify-center ${
                    operator === "gt"
                      ? "bg-primary-container border-primary-container"
                      : "bg-level2-input border-outline-variant"
                  }`}
                >
                  <Text
                    className={`font-sans-bold text-[12px] ${
                      operator === "gt" ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    Mayor (&gt;)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setOperator("lt")}
                  className={`flex-1 h-[44px] rounded-md border items-center justify-center ${
                    operator === "lt"
                      ? "bg-primary-container border-primary-container"
                      : "bg-level2-input border-outline-variant"
                  }`}
                >
                  <Text
                    className={`font-sans-bold text-[12px] ${
                      operator === "lt" ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    Menor (&lt;)
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="space-y-1">
            <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase">
              Nivel de Urgencia
            </Text>
            <UrgencySelector value={urgency} onChange={setUrgency} />
          </View>

          <PillButton label="GUARDAR REGLA" onPress={onSaveRule} loading={saving} />
        </View>

        <View className="space-y-sm">
          <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase tracking-widest">
            Reglas Actuales ({thresholds.length})
          </Text>
          {thresholds.map((rule) => (
            <View
              key={rule.id}
              className="flex-row items-center justify-between bg-surface-container rounded-lg border border-outline-variant p-md"
            >
              <View className="flex-1">
                <Text className="font-sans-bold text-on-surface">
                  Si {rule.metric_name} {rule.operator === "gt" || rule.operator === "gte" ? ">" : "<"} {rule.value_1}
                </Text>
                <Text className="font-sans text-[11px] text-on-surface-variant">
                  {rule.message_template ?? "Notificación push"} · Urgencia{" "}
                  {rule.severity === "danger" ? "Alta" : "Media"}
                </Text>
              </View>
              <Pressable onPress={() => onDeleteRule(rule.id)} className="p-2">
                <MaterialIcons name="delete-outline" size={20} color="#a98a7d" />
              </Pressable>
            </View>
          ))}
        </View>

        <View className="items-center pb-lg">
          <Text className="font-sans text-[12px] text-on-surface-variant mb-sm">
            Sesión: {user?.email}
          </Text>
          <PillButton label="CERRAR SESIÓN" variant="ghost" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
