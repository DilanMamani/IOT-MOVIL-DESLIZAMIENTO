import { ActivityIndicator, Pressable, Text } from "react-native";

interface PillButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  flex?: boolean;
}

const VARIANT_STYLES = {
  primary: "bg-primary-container",
  secondary: "bg-level2-input border border-outline-variant",
  ghost: "bg-surface-container-high border border-outline-variant",
};

const TEXT_STYLES = {
  primary: "text-white",
  secondary: "text-on-surface",
  ghost: "text-on-surface-variant",
};

export function PillButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  flex = false,
}: PillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`h-[52px] rounded-xl items-center justify-center px-lg ${
        flex ? "flex-1" : ""
      } ${VARIANT_STYLES[variant]} ${disabled ? "opacity-50" : "active:opacity-80"}`}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className={`font-sans-bold text-[15px] ${TEXT_STYLES[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
