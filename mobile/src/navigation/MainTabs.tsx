import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { MonitorScreen } from "../screens/alerts/MonitorScreen";
import { SensorsScreen } from "../screens/sensors/SensorsScreen";
import { HistoryScreen } from "../screens/history/HistoryScreen";
import { AlertRulesScreen } from "../screens/settings/AlertRulesScreen";

export type MainTabsParamList = {
  Alertas: undefined;
  Sensores: undefined;
  Historial: undefined;
  Ajustes: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICONS: Record<
  keyof MainTabsParamList,
  keyof typeof MaterialIcons.glyphMap
> = {
  Alertas: "notifications",
  Sensores: "settings-input-component",
  Historial: "history",
  Ajustes: "settings",
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4edea3",
        tabBarInactiveTintColor: "#e2bfb0",
        tabBarStyle: {
          backgroundColor: "#0a0e17",
          borderTopColor: "#5a4136",
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Alertas" component={MonitorScreen} />
      <Tab.Screen name="Sensores" component={SensorsScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Ajustes" component={AlertRulesScreen} />
    </Tab.Navigator>
  );
}
