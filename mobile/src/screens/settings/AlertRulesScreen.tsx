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
import { useTelegramLink } from "../../hooks/useTelegramLink";

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
  
  const { linked, chatId, isLoading: telegramLoading, link, unlink } = useTelegramLink();
  const [chatIdInput, setChatIdInput] = useState("");
  const [linkingTelegram, setLinkingTelegram] = useState(false);

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

  const onLinkTelegram = async () => {
    if (!chatIdInput || isNaN(Number(chatIdInput))) {
      RNAlert.alert("Dato inválido", "Ingresa el chat_id numérico que te dio el bot.");
      return;
    }
    setLinkingTelegram(true);
    try {
      await link(Number(chatIdInput));
      setChatIdInput("");
      RNAlert.alert("Listo", "Telegram vinculado correctamente.");
    } catch (err) {
      RNAlert.alert("Error", err instanceof Error ? err.message : "No se pudo vincular");
    } finally {
      setLinkingTelegram(false);
    }
  };

  const onUnlinkTelegram = () => {
    RNAlert.alert("Desvincular Telegram", "¿Seguro que deseas desvincular tu cuenta de Telegram?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Desvincular", style: "destructive", onPress: () => unlink() },
    ]);
  };

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
      <ScreenHeader
        title="Ajustes"
        subtitle="Reglas de alerta y canales de notificación"
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 20 }}>
        <View>
          <Text className="font-sans-bold text-[11px] text-on-surface-variant uppercase tracking-wider mb-2.5">
            Canales activos
          </Text>
          <View className="gap-2.5">
            {CHANNELS.map((channel) => (
              <View
                key={channel.key}
                style={{ borderRadius: 16 }}
                className="flex-row items-center justify-between bg-surface-container-low border border-outline-variant p-3.5"
              >
                <View className="flex-row items-center gap-2.5 flex-1">
                  <View
                    style={{ backgroundColor: "#E8E2CC", borderRadius: 12 }}
                    className="w-9 h-9 items-center justify-center"
                  >
                    <MaterialIcons name={channel.icon} size={17} color="#84592B" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-bold text-[13px] text-on-surface">{channel.label}</Text>
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
        </View>
        
        <View
          style={{ borderRadius: 18 }}
          className="bg-surface-container-low border border-outline-variant p-4 gap-4"
        >
          <View className="flex-row items-center gap-2">
            <View
              style={{ backgroundColor: "#D6E4F5", borderRadius: 10 }}
              className="w-8 h-8 items-center justify-center"
            >
              <MaterialIcons name="send" size={16} color="#1A5FB4" />
            </View>
            <Text className="font-sans-bold text-[15px] text-on-surface">
              Notificaciones por Telegram
            </Text>
          </View>

          {telegramLoading ? (
            <Text className="font-sans text-[12px] text-on-surface-variant">Cargando...</Text>
          ) : linked ? (
            <>
              <Text className="font-sans text-[12px] text-on-surface-variant">
                Vinculado con chat_id: {chatId}
              </Text>
              <PillButton label="Desvincular" onPress={onUnlinkTelegram} />
            </>
          ) : (
            <>
              <Text className="font-sans text-[12px] text-on-surface-variant">
                Abre el bot en Telegram, obtén tu chat_id y pégalo aquí para recibir alertas.
              </Text>
              <TextInput
                value={chatIdInput}
                onChangeText={setChatIdInput}
                keyboardType="numeric"
                placeholder="Ej: 123456789"
                placeholderTextColor="#9D9167"
                style={{ borderRadius: 12 }}
                className="bg-level2-input border border-outline-variant px-3 h-[44px] font-sans text-[14px] text-on-surface"
              />
              <PillButton label="Vincular Telegram" onPress={onLinkTelegram} loading={linkingTelegram} />
            </>
          )}
        </View>

        <View
          style={{ borderRadius: 18 }}
          className="bg-surface-container-low border border-outline-variant p-4 gap-4"
        >
          <View className="flex-row items-center gap-2">
            <View
              style={{ backgroundColor: "#F5E0D6", borderRadius: 10 }}
              className="w-8 h-8 items-center justify-center"
            >
              <MaterialIcons name="add-alert" size={16} color="#743014" />
            </View>
            <Text className="font-sans-bold text-[15px] text-on-surface">Crear regla de alerta</Text>
          </View>

          <View>
            <Text className="font-sans-bold text-[11px] text-on-surface-variant uppercase tracking-wide mb-2">
              Tipo de telemetría
            </Text>
            <View className="flex-row flex-wrap gap-2.5" style={{ rowGap: 10 }}>
              {metricTypes.map((metric) => {
                const selected = metric.id === metricTypeId;
                return (
                  <Pressable
                    key={metric.id}
                    onPress={() => setMetricTypeId(metric.id)}
                    style={{
                      borderRadius: 20,
                      backgroundColor: selected ? "#84592B" : "#FFFFFF",
                      borderColor: selected ? "#84592B" : "#DFCBA0",
                    }}
                    className="px-3 h-8 items-center justify-center border"
                  >
                    <Text
                      style={{ color: selected ? "#FFFFFF" : "#7A6B52" }}
                      className="font-sans-bold text-[11px]"
                    >
                      {metric.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="font-sans-bold text-[11px] text-on-surface-variant uppercase tracking-wide mb-1.5">
                Umbral
              </Text>
              <TextInput
                value={value1}
                onChangeText={setValue1}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor="#9D9167"
                style={{ borderRadius: 12 }}
                className="bg-level2-input border border-outline-variant px-3 h-[44px] font-sans text-[14px] text-on-surface"
              />
            </View>
            <View className="flex-1">
              <Text className="font-sans-bold text-[11px] text-on-surface-variant uppercase tracking-wide mb-1.5">
                Lógica
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setOperator("gt")}
                  style={{
                    borderRadius: 12,
                    backgroundColor: operator === "gt" ? "#84592B" : "#FFFFFF",
                    borderColor: operator === "gt" ? "#84592B" : "#DFCBA0",
                  }}
                  className="flex-1 h-[44px] border items-center justify-center"
                >
                  <Text
                    style={{ color: operator === "gt" ? "#FFFFFF" : "#7A6B52" }}
                    className="font-sans-bold text-[12px]"
                  >
                    Mayor (&gt;)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setOperator("lt")}
                  style={{
                    borderRadius: 12,
                    backgroundColor: operator === "lt" ? "#84592B" : "#FFFFFF",
                    borderColor: operator === "lt" ? "#84592B" : "#DFCBA0",
                  }}
                  className="flex-1 h-[44px] border items-center justify-center"
                >
                  <Text
                    style={{ color: operator === "lt" ? "#FFFFFF" : "#7A6B52" }}
                    className="font-sans-bold text-[12px]"
                  >
                    Menor (&lt;)
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View>
            <Text className="font-sans-bold text-[11px] text-on-surface-variant uppercase tracking-wide mb-1.5">
              Nivel de urgencia
            </Text>
            <UrgencySelector value={urgency} onChange={setUrgency} />
          </View>

          <PillButton label="Guardar regla" onPress={onSaveRule} loading={saving} />
        </View>

        <View>
          <Text className="font-sans-bold text-[11px] text-on-surface-variant uppercase tracking-wider mb-2.5">
            Reglas actuales ({thresholds.length})
          </Text>
          <View className="gap-2.5">
            {thresholds.map((rule) => (
              <View
                key={rule.id}
                style={{ borderRadius: 16 }}
                className="flex-row items-center justify-between bg-surface-container-low border border-outline-variant p-3.5"
              >
                <View className="flex-1">
                  <Text className="font-sans-bold text-[13px] text-on-surface">
                    Si {rule.metric_name} {rule.operator === "gt" || rule.operator === "gte" ? ">" : "<"} {rule.value_1}
                  </Text>
                  <Text className="font-sans text-[11px] text-on-surface-variant">
                    {rule.message_template ?? "Notificación push"} · Urgencia{" "}
                    {rule.severity === "danger" ? "Alta" : "Media"}
                  </Text>
                </View>
                <Pressable onPress={() => onDeleteRule(rule.id)} className="p-2">
                  <MaterialIcons name="delete-outline" size={18} color="#9D9167" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View className="items-center pt-2">
          <Text className="font-sans text-[12px] text-on-surface-variant mb-3">
            Sesión: {user?.email}
          </Text>
          <Pressable
            onPress={logout}
            style={{
              borderRadius: 14,
              backgroundColor: "#743014",
              paddingHorizontal: 28,
              paddingVertical: 13,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              shadowColor: "#743014",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <MaterialIcons name="logout" size={16} color="#FFFFFF" />
            <Text
              style={{ color: "#FFFFFF" }}
              className="font-sans-bold text-[14px]"
            >
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}