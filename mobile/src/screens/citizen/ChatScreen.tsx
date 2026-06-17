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

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    setShowQuickReplies(false);

    const userMsg: Message = { id: newId(), role: "user", text: text.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const reply =
        BOT_RESPONSES[text.trim()] ??
        "Entendido. Por ahora puedo responder preguntas frecuentes sobre emergencias y el uso de la app. Para asistencia inmediata llama al 117 (Defensa Civil) o al 110 (Policía).";
      const botMsg: Message = { id: newId(), role: "bot", text: reply, time: now() };
      setMessages((prev) => [...prev, botMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 600);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.botAvatar}>
            <MaterialIcons name="support-agent" size={22} color={TERRACOTA} />
          </View>
          <View>
            <Text style={s.headerTitle}>Asistente SlideWatch</Text>
            <Text style={s.headerSub}>Respuesta automática</Text>
          </View>
        </View>
        <View style={s.aiBadge}>
          <MaterialIcons name="auto-awesome" size={12} color={TERRACOTA} />
          <Text style={s.aiBadgeText}>IA</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Messages */}
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
              <View style={[s.bubble, msg.role === "user" ? s.bubbleUser : s.bubbleBot]}>
                <Text style={[s.bubbleText, msg.role === "user" && s.bubbleTextUser]}>
                  {msg.text}
                </Text>
                <Text style={[s.bubbleTime, msg.role === "user" && { color: "rgba(255,255,255,0.6)" }]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}

          {/* Quick Replies */}
          {showQuickReplies && (
            <View style={s.quickReplies}>
              {QUICK_REPLIES.map((q) => (
                <TouchableOpacity key={q} style={s.quickChip} onPress={() => sendMessage(q)} activeOpacity={0.8}>
                  <Text style={s.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input Bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={TEXT_SECONDARY}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
            activeOpacity={0.85}
          >
            <MaterialIcons name="send" size={20} color={input.trim() ? "#fff" : TEXT_SECONDARY} />
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
});
