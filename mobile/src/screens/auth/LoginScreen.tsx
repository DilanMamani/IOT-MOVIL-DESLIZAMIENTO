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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { useAuth } from "../../context/AuthContext";
import { PillButton } from "../../components/PillButton";
import { ApiError } from "../../api/http";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

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
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header oscuro */}
        <View className="bg-dark px-margin-mobile pt-14 pb-6">
          <View className="w-11 h-11 rounded-xl bg-primary items-center justify-center mb-4">
            <MaterialIcons name="sensors" size={20} color="#FFFFFF" />
          </View>
          <Text className="font-sans-bold text-[24px] leading-[30px] text-on-dark">
            Accede al monitoreo del terreno.
          </Text>
          <Text className="font-sans text-[13px] leading-[19px] text-dark-muted mt-2">
            Consulta estados, métricas, sensores y alertas desde una experiencia limpia.
          </Text>
        </View>

        {/* Formulario claro */}
        <View className="flex-1 px-margin-mobile pt-6 bg-surface">
          <View className="self-start bg-surface-container px-3 py-1 rounded-full mb-3">
            <Text className="font-sans text-[11px] text-on-surface-variant">
              Iniciar sesión
            </Text>
          </View>

          <Text className="font-sans-bold text-[26px] leading-[32px] text-on-surface">
            Bienvenido de nuevo
          </Text>
          <Text className="font-sans text-[13px] text-on-surface-variant mt-1 mb-6">
            Ingresa tus credenciales para continuar al dashboard.
          </Text>

          <View className="mb-4">
            <Text className="font-sans-bold text-[11px] text-on-surface uppercase tracking-wide mb-1.5">
              Correo electrónico
            </Text>
            <View className="flex-row items-center bg-level2-input rounded-md border border-outline-variant px-3 h-[50px]">
              <MaterialIcons name="alternate-email" size={17} color="#A89080" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu_correo@ejemplo.com"
                placeholderTextColor="#A89080"
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 ml-2 font-sans text-[14px] text-on-surface"
              />
            </View>
            <Text className="font-sans text-[11px] text-on-surface-variant mt-1">
              Usa el correo con el que te registraste
            </Text>
          </View>

          <View className="mb-2">
            <Text className="font-sans-bold text-[11px] text-on-surface uppercase tracking-wide mb-1.5">
              Contraseña
            </Text>
            <View className="flex-row items-center bg-level2-input rounded-md border border-outline-variant px-3 h-[50px]">
              <MaterialIcons name="lock-outline" size={17} color="#A89080" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#A89080"
                secureTextEntry={!showPassword}
                className="flex-1 ml-2 font-sans text-[14px] text-on-surface"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={17}
                  color="#A89080"
                />
              </TouchableOpacity>
            </View>
            <Text className="font-sans text-[11px] text-on-surface-variant mt-1">
              Ingresa la contraseña asociada a tu cuenta
            </Text>
          </View>

          {error ? (
            <Text className="font-sans text-[13px] text-error mt-2">{error}</Text>
          ) : null}

          <View className="mt-5 mb-5">
            <PillButton label="Entrar al sistema →" onPress={onSubmit} loading={loading} />
          </View>

          <View className="items-center pb-8">
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}