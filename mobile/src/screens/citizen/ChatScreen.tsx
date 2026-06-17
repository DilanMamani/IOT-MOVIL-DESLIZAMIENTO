import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useRef, useCallback } from "react";
import { useChatbot } from "../../hooks/useChatbot";
import type { Report } from "../../types";

const TERRACOTA = "#C4622D";
const DARK_PANEL = "#2C1A0E";
const CREAM = "#FAF7F2";
const CREAM_DEEP = "#F0EBE3";
const BORDER = "#E8E0D5";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: string;
}

const QUICK_REPLIES = [
  "¿Qué hago ante un deslizamiento?",
  "Estado de mis reportes",
  "¿Cómo reportar un incidente?",
  "Números de emergencia",
];

const BOT_RESPONSES: Record<string, string> = {
  "¿Qué hago ante un deslizamiento?":
    "🚨 En caso de deslizamiento:\n\n1. Mantén la calma y aléjate de la zona de peligro inmediatamente.\n2. No regreses a buscar pertenencias.\n3. Llama al 110 (Policía) o 119 (Bomberos).\n4. Reporta el incidente en la app para alertar a tu comunidad.\n5. Busca terreno elevado y estable.",
  "Estado de mis reportes":
    "📋 Para ver el estado de tus reportes ve a la pestaña Mapa y filtra por 'Mis reportes'. Allí verás si están Pendientes, En revisión o Resueltos.\n\nSi un reporte está urgente, las autoridades serán notificadas automáticamente.",
  "¿Cómo reportar un incidente?":
    "📸 Para reportar un incidente:\n\n1. Toca el botón + (Reportar) en la barra inferior.\n2. Agrega una foto si es posible.\n3. Selecciona el tipo de incidente.\n4. Describe lo que ves con detalle.\n5. Tu ubicación se adjunta automáticamente.\n6. Elige el nivel de urgencia y envía.\n\n¡Cada reporte ayuda a proteger tu comunidad!",
  "Números de emergencia":
    "📞 Números de emergencia en Bolivia:\n\n🚔 Policía: 110\n🚒 Bomberos: 119\n🚑 Ambulancia: 118\n⛑️ Defensa Civil: 117\n\nGuarda estos números. En emergencia, primero llama a las autoridades y luego reporta en la app.",
};

function now() {
  return new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: false });
}


let msgId = 0;
function newId() { return String(++msgId); }

const WELCOME: Message = {
  id: newId(),
  role: "bot",
  time: now(),
  text: "Hola, soy el asistente de SlideWatch. 👋\n\nPuedo ayudarte en emergencias, guiarte para reportar incidentes o consultar el estado de tus reportes.\n\n¿En qué te ayudo hoy?",
};
function statusConfig(status: Report["status"]) {
  if (status === "atendido") return { label: "Atendido", color: "#4CAF50", bg: "#E8F5E9" };
  if (status === "en_revision") return { label: "En revisión", color: "#E8A020", bg: "#FFF3E0" };
  if (status === "descartado") return { label: "Descartado", color: "#D94F4F", bg: "#FDEAEA" };
  return { label: "Pendiente", color: "#8C8C8C", bg: "#F0F0F0" };
}

function ReportCard({ report }: { report: Report }) {
  const status = statusConfig(report.status);
  const date = new Date(report.reported_at).toLocaleDateString("es-BO", {
    day: "2-digit", month: "short",
  });

  return (
    <View style={s.reportCard}>
      <View style={s.reportCardHeader}>
        <Text style={s.reportCardId}>Reporte #{report.id}</Text>
        <View style={[s.reportCardBadge, { backgroundColor: status.bg }]}>
          <Text style={[s.reportCardBadgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={s.reportCardType}>{report.incident_type}</Text>
      <Text style={s.reportCardDesc} numberOfLines={2}>{report.description}</Text>
      <View style={s.reportCardFooter}>
        <MaterialIcons name="place" size={12} color={TEXT_SECONDARY} />
        <Text style={s.reportCardMeta}>{report.location_name} · {date}</Text>
      </View>
    </View>
  );
}

export function ChatScreen() {
  const { messages, isSending, sendMessage } = useChatbot();
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setShowQuickReplies(false);
    sendMessage(text);
    setInput("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ... header igual ... */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[s.msgRow, msg.role === "user" && s.msgRowUser]}>
              {msg.role === "bot" && (
                <View style={s.botAvatarSmall}>
                  <MaterialIcons name="support-agent" size={15} color={TERRACOTA} />
                </View>
              )}
              <View style={{ maxWidth: "78%" }}>
                <View style={[s.bubble, msg.role === "user" ? s.bubbleUser : s.bubbleBot]}>
                  <Text style={[s.bubbleText, msg.role === "user" && s.bubbleTextUser]}>
                    {msg.text}
                  </Text>
                  <Text style={[s.bubbleTime, msg.role === "user" && { color: "rgba(255,255,255,0.6)" }]}>
                    {msg.time}
                  </Text>
                </View>

                {msg.reportCard && <ReportCard report={msg.reportCard} />}
              </View>
            </View>
          ))}

          {isSending && (
            <View style={s.msgRow}>
              <View style={s.botAvatarSmall}>
                <MaterialIcons name="support-agent" size={15} color={TERRACOTA} />
              </View>
              <View style={[s.bubble, s.bubbleBot]}>
                <Text style={s.bubbleText}>Escribiendo…</Text>
              </View>
            </View>
          )}

          {showQuickReplies && (
            <View style={s.quickReplies}>
              {QUICK_REPLIES.map((q) => (
                <TouchableOpacity key={q} style={s.quickChip} onPress={() => handleSend(q)} activeOpacity={0.8}>
                  <Text style={s.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={TEXT_SECONDARY}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSend(input)}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || isSending) && s.sendBtnDisabled]}
            onPress={() => handleSend(input)}
            disabled={!input.trim() || isSending}
            activeOpacity={0.85}
          >
            <MaterialIcons name="send" size={20} color={input.trim() && !isSending ? "#fff" : TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: "#fff",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  botAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: CREAM_DEEP, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: BORDER,
  },
  headerTitle: { fontSize: 16, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  headerSub: { fontSize: 12, color: "#4CAF50", fontFamily: "DMSans_400Regular" },
  aiBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFF0EA", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: "#F4C5AF",
  },
  aiBadgeText: { fontSize: 11, color: TERRACOTA, fontFamily: "DMSans_700Bold" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8 },
  msgRowUser: { flexDirection: "row-reverse" },

  botAvatarSmall: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: CREAM_DEEP, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: BORDER, flexShrink: 0,
  },

  bubble: {
    maxWidth: "78%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleBot: {
    backgroundColor: CREAM_DEEP,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: BORDER,
  },
  bubbleUser: {
    backgroundColor: TERRACOTA,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: TEXT_PRIMARY, fontFamily: "DMSans_400Regular", lineHeight: 21 },
  bubbleTextUser: { color: "#fff" },
  bubbleTime: { fontSize: 10, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", marginTop: 4, textAlign: "right" },

  quickReplies: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 4 },
  quickChip: {
    backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: BORDER,
  },
  quickChipText: { fontSize: 13, color: TEXT_PRIMARY, fontFamily: "DMSans_400Regular" },

  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: "#fff",
  },
  input: {
    flex: 1, backgroundColor: CREAM_DEEP, borderRadius: 22, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, color: TEXT_PRIMARY,
    fontFamily: "DMSans_400Regular", maxHeight: 100, borderWidth: 1, borderColor: BORDER,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: TERRACOTA, justifyContent: "center", alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: CREAM_DEEP },

  reportCard: {
    marginTop: 8, backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: BORDER, gap: 6,
  },
  reportCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reportCardId: { fontSize: 12, color: TEXT_SECONDARY, fontFamily: "DMSans_700Bold" },
  reportCardBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  reportCardBadgeText: { fontSize: 11, fontFamily: "DMSans_700Bold" },
  reportCardType: { fontSize: 14, color: TEXT_PRIMARY, fontFamily: "DMSans_700Bold" },
  reportCardDesc: { fontSize: 13, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular", lineHeight: 18 },
  reportCardFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  reportCardMeta: { fontSize: 11, color: TEXT_SECONDARY, fontFamily: "DMSans_400Regular" },
});
