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

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-margin-mobile justify-center space-y-md py-xl">
          <View className="space-y-1 mb-md">
            <View className="flex-row items-center gap-sm">
              <MaterialIcons name="sensors" size={22} color="#ffb693" />
              <Text className="font-sans-bold text-headline-md text-on-surface">
                TerraGuard
              </Text>
            </View>
            <Text className="font-sans-bold text-display-lg text-on-surface">
              Crear cuenta
            </Text>
            <Text className="font-sans text-body-base text-on-surface-variant">
              Únete a la red de monitoreo ambiental inteligente.
            </Text>
          </View>

          <Field
            label="Nombre Completo"
            icon="person-outline"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ej. Juan Pérez"
          />
          <Field
            label="Correo Electrónico"
            icon="alternate-email"
            value={email}
            onChangeText={setEmail}
            placeholder="usuario@terraguard.io"
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
            label="Confirmar Contraseña"
            icon="lock-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secure
          />

          <TouchableOpacity
            className="flex-row items-start gap-sm"
            onPress={() => setAcceptedTerms((v) => !v)}
          >
            <View
              className={`w-5 h-5 rounded-sm border items-center justify-center mt-0.5 ${
                acceptedTerms
                  ? "bg-primary-container border-primary-container"
                  : "border-outline-variant"
              }`}
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
            <Text className="font-sans text-[13px] text-error">{error}</Text>
          ) : null}

          <PillButton label="REGISTRARSE" onPress={onSubmit} loading={loading} />

          <View className="items-center">
            <Text className="font-sans text-body-base text-on-surface-variant">
              ¿Ya tienes una cuenta?{" "}
              <Text
                className="text-secondary font-sans-bold"
                onPress={() => navigation.navigate("Login")}
              >
                Inicia sesión
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    <View className="space-y-1">
      <Text className="font-sans-bold text-label-caps text-on-surface-variant uppercase">
        {label}
      </Text>
      <View className="flex-row items-center bg-level2-input rounded-md border border-outline-variant px-md h-[52px]">
        <MaterialIcons name={icon} size={18} color="#a98a7d" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#5a4136"
          secureTextEntry={secure ? hidden : false}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          className="flex-1 ml-sm font-sans text-on-surface"
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden((v) => !v)}>
            <MaterialIcons
              name={hidden ? "visibility" : "visibility-off"}
              size={18}
              color="#a98a7d"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
