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
        tabBarActiveTintColor: "#84592B",
        tabBarInactiveTintColor: "#B5A488",
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 78,
          borderRadius: 26,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: 14,
          shadowColor: "#442D1C",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 10,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 3,
          height: 52,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={ICONS[route.name]} color={color} size={size - 6} />
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