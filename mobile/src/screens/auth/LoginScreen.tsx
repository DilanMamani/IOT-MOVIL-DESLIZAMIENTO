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
        <View className="flex-1 px-margin-mobile justify-center space-y-lg">
          <View className="items-center space-y-sm mb-lg">
            <View className="w-16 h-16 rounded-full bg-primary-container/20 items-center justify-center">
              <MaterialIcons name="sensors" size={32} color="#ffb693" />
            </View>
            <Text className="font-sans-bold text-display-lg text-on-surface">
              TerraGuard
            </Text>
            <Text className="font-sans text-label-caps text-on-surface-variant uppercase tracking-widest">
              Sistema de Monitoreo de Actividad
            </Text>
          </View>

          <View className="space-y-md">
            <View className="space-y-1">
              <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase">
                Correo Electrónico
              </Text>
              <View className="flex-row items-center bg-level2-input rounded-md border border-outline-variant px-md h-[52px]">
                <MaterialIcons name="alternate-email" size={18} color="#a98a7d" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="usuario@empresa.com"
                  placeholderTextColor="#5a4136"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 ml-sm font-sans text-on-surface"
                />
              </View>
            </View>

            <View className="space-y-1">
              <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase">
                Contraseña
              </Text>
              <View className="flex-row items-center bg-level2-input rounded-md border border-outline-variant px-md h-[52px]">
                <MaterialIcons name="lock-outline" size={18} color="#a98a7d" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#5a4136"
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-sm font-sans text-on-surface"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={18}
                    color="#a98a7d"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <Text className="font-sans text-[13px] text-error">{error}</Text>
            ) : null}

            <PillButton label="INICIAR SESIÓN" onPress={onSubmit} loading={loading} />
          </View>

          <View className="items-center">
            <Text className="font-sans text-body-base text-on-surface-variant">
              ¿No tienes una cuenta?{" "}
              <Text
                className="text-secondary font-sans-bold"
                onPress={() => navigation.navigate("Register")}
              >
                Crear una cuenta
              </Text>
            </Text>
          </View>

          <View className="flex-row items-center justify-center gap-1 pb-lg">
            <MaterialIcons name="shield" size={14} color="#4edea3" />
            <Text className="font-sans text-[11px] text-on-surface-variant">
              Cifrado de grado militar activo
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
