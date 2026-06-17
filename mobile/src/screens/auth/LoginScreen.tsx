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

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const BG_IMAGE = "https://images.pexels.com/photos/950210/pexels-photo-950210.jpeg?auto=compress&cs=tinysrgb&w=1200";
const { height: SCREEN_H } = Dimensions.get("window");
const HERO_HEIGHT = Math.min(SCREEN_H * 0.32, 260);

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (!email || !password) {
      setError("Email y contraseña son obligatorios");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión");
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

      {/* Logo, dentro de la zona "hero" superior */}
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
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: "#84592B",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <MaterialIcons name="sensors" size={26} color="#FFFFFF" />
          </View>
          <Text className="font-sans-bold text-[22px] text-on-dark">
            SlideWatch
          </Text>
          <Text className="font-sans text-[12px] text-dark-muted uppercase tracking-wider mt-1">
            Sistema de alerta temprana
          </Text>
        </Animated.View>
      </View>

      {/* FORM: card flotante sobre el fondo continuo */}
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
                Bienvenido de nuevo
              </Text>
              <Text className="font-sans text-[13px] text-on-surface-variant mb-6">
                Ingresa tus credenciales para continuar.
              </Text>

              <View className="mb-4">
                <Text className="font-sans-bold text-[11px] text-on-surface uppercase tracking-wide mb-1.5">
                  Correo electrónico
                </Text>
                <View className="flex-row items-center bg-level2-input rounded-xl border border-outline-variant px-3 h-[52px]">
                  <MaterialIcons name="alternate-email" size={17} color="#9D9167" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tu_correo@ejemplo.com"
                    placeholderTextColor="#9D9167"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="flex-1 ml-2 font-sans text-[14px] text-on-surface"
                  />
                </View>
              </View>

              <View className="mb-2">
                <Text className="font-sans-bold text-[11px] text-on-surface uppercase tracking-wide mb-1.5">
                  Contraseña
                </Text>
                <View className="flex-row items-center bg-level2-input rounded-xl border border-outline-variant px-3 h-[52px]">
                  <MaterialIcons name="lock-outline" size={17} color="#9D9167" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9D9167"
                    secureTextEntry={!showPassword}
                    className="flex-1 ml-2 font-sans text-[14px] text-on-surface"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                    <MaterialIcons
                      name={showPassword ? "visibility-off" : "visibility"}
                      size={17}
                      color="#9D9167"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity className="self-end mb-6">
                <Text className="font-sans text-[12px] text-primary">
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              {error ? (
                <Text className="font-sans text-[13px] text-error mb-3">{error}</Text>
              ) : null}

              <PillButton label="Iniciar sesión" onPress={onSubmit} loading={loading} />

              <View className="items-center mt-5 mb-5">
                <Text className="font-sans text-[13px] text-on-surface-variant">
                  ¿No tienes una cuenta?{" "}
                  <Text
                    className="text-primary font-sans-bold"
                    onPress={() => navigation.navigate("Register")}
                  >
                    Crear cuenta
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