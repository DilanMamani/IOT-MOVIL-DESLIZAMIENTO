import { Switch } from "react-native";

export function ToggleSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#1a2436", true: "#ff6b00" }}
      thumbColor="#ffffff"
      ios_backgroundColor="#1a2436"
    />
  );
}
