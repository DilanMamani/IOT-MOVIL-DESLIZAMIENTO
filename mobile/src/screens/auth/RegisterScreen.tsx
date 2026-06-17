import { useState, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { useAuth } from "../../context/AuthContext";
import { PillButton } from "../../components/PillButton";
import { ApiError } from "../../api/http";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const BG_IMAGE = "https://images.pexels.com/photos/950210/pexels-photo-950210.jpeg?auto=compress&cs=tinysrgb&w=1200";
const { height: SCREEN_H } = Dimensions.get("window");
const HERO_HEIGHT = Math.min(SCREEN_H * 0.22, 180);

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const onSubmit = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register({ full_name: fullName.trim(), email: email.trim(), password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">

      {/* Imagen de fondo — pantalla completa */}
      <Image
        source={{ uri: BG_IMAGE }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        contentFit="cover"
      />
      <BlurView
        intensity={45}
        tint="dark"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(68, 45, 28, 0.55)",
        }}
      />

      {/* Logo centrado en zona hero (más compacto, hay más campos abajo) */}
      <View style={{ height: HERO_HEIGHT, width: "100%" }}>
        <Animated.View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: "#84592B",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <MaterialIcons name="sensors" size={22} color="#FFFFFF" />
          </View>
          <Text className="font-sans-bold text-[18px] text-on-dark">
            SlideWatch
          </Text>
        </Animated.View>
      </View>

      {/* FORM: card flotante */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-margin-mobile pt-6 pb-8">
            <Animated.View
              style={{
                opacity: cardOpacity,
                transform: [{ translateY: cardY }],
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                paddingHorizontal: 20,
                paddingTop: 24,
                paddingBottom: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 8,
              }}
            >
              <Text className="font-sans-bold text-[22px] leading-[28px] text-on-surface mb-1">
                Crear cuenta
              </Text>
              <Text className="font-sans text-[13px] text-on-surface-variant mb-6">
                Únete a la red de monitoreo del terreno.
              </Text>

              <Field
                label="Nombre completo"
                icon="person-outline"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ej. Juan Pérez"
              />
              <Field
                label="Correo electrónico"
                icon="alternate-email"
                value={email}
                onChangeText={setEmail}
                placeholder="tu_correo@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Field
                label="Contraseña"
                icon="lock-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secure
              />
              <Field
                label="Confirmar contraseña"
                icon="lock-outline"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secure
              />

              <TouchableOpacity
                className="flex-row items-start mb-4"
                onPress={() => setAcceptedTerms((v) => !v)}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    borderWidth: 1,
                    marginRight: 8,
                    marginTop: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: acceptedTerms ? "#84592B" : "transparent",
                    borderColor: acceptedTerms ? "#84592B" : "#DFCBA0",
                  }}
                >
                  {acceptedTerms ? (
                    <MaterialIcons name="check" size={14} color="#fff" />
                  ) : null}
                </View>
                <Text className="flex-1 font-sans text-[13px] text-on-surface-variant">
                  Acepto los Términos y Condiciones y la Política de Privacidad.
                </Text>
              </TouchableOpacity>

              {error ? (
                <Text className="font-sans text-[13px] text-error mb-3">{error}</Text>
              ) : null}

              <PillButton label="Registrarse" onPress={onSubmit} loading={loading} />

              <View className="items-center mt-5 mb-5">
                <Text className="font-sans text-[13px] text-on-surface-variant">
                  ¿Ya tienes una cuenta?{" "}
                  <Text
                    className="text-primary font-sans-bold"
                    onPress={() => navigation.navigate("Login")}
                  >
                    Inicia sesión
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface FieldProps {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secure?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secure,
  autoCapitalize = "sentences",
  keyboardType = "default",
}: FieldProps) {
  const [hidden, setHidden] = useState(true);
  return (
    <View className="mb-4">
      <Text className="font-sans-bold text-[11px] text-on-surface uppercase tracking-wide mb-1.5">
        {label}
      </Text>
      <View className="flex-row items-center bg-level2-input rounded-xl border border-outline-variant px-3 h-[52px]">
        <MaterialIcons name={icon} size={17} color="#9D9167" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9D9167"
          secureTextEntry={secure ? hidden : false}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          className="flex-1 ml-2 font-sans text-[14px] text-on-surface"
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden((v) => !v)}>
            <MaterialIcons
              name={hidden ? "visibility" : "visibility-off"}
              size={17}
              color="#9D9167"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}