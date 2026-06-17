import { useState } from "react";
import {
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

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      {/* Blur sobre toda la imagen */}
      <BlurView
        intensity={50}
        tint="dark"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Overlay café semitransparente para legibilidad */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(68, 45, 28, 0.55)",
        }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-margin-mobile pt-16 pb-8 justify-center">

            {/* Logo sobre el fondo difuminado */}
            <View className="items-center mb-8">
              <View
                className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
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
            </View>

            {/* Card del formulario, flotando sobre la imagen */}
            <View
              className="bg-surface-bright rounded-2xl px-5 pt-6 pb-2"
              style={{
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
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}