import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { MonitorScreen } from "../screens/alerts/MonitorScreen";
import { SensorsScreen } from "../screens/sensors/SensorsScreen";
import { HistoryScreen } from "../screens/history/HistoryScreen";
import { AlertRulesScreen } from "../screens/settings/AlertRulesScreen";
import { AdminHomeScreen } from "../screens/adminHome/AdminHomeScreen";

// 1. Nuevos colores importados del esquema Citizen
const TERRACOTA = "#C4622D";
const TEXT_SECONDARY = "#6B6B6B";
const TAB_BG = "#fff";
const TAB_BORDER = "#E8E0D5";

export type AdminTabsParamList = {
  Home: undefined;
  Alertas: undefined;
  Sensores: undefined;
  Historial: undefined;
  Ajustes: undefined;
};

const Tab = createBottomTabNavigator<AdminTabsParamList>();

const ICONS: Record<keyof AdminTabsParamList, keyof typeof MaterialIcons.glyphMap> = {
  Home: "home",
  Alertas: "notifications-active",
  Sensores: "sensors",
  Historial: "history",
  Ajustes: "settings",
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // 2. Aplicar los nuevos colores a los estados activo e inactivo
        tabBarActiveTintColor: TERRACOTA,
        tabBarInactiveTintColor: TEXT_SECONDARY,
        tabBarStyle: {
          // 3. Aplicar colores de fondo y borde
          backgroundColor: TAB_BG,
          borderTopColor: TAB_BORDER,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 80 : 64,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          // 4. Reducir la opacidad de la sombra para igualar el aspecto "claro" de CitizenTabs
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "DMSans_500Medium",
          marginTop: 2,
        },
        tabBarIcon: ({ color }) => (
          <MaterialIcons
            name={ICONS[route.name as keyof AdminTabsParamList]}
            color={color}
            size={route.name === "Home" ? 24 : 22}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={AdminHomeScreen} /> 
      <Tab.Screen name="Alertas" component={MonitorScreen} />
      <Tab.Screen name="Sensores" component={SensorsScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Ajustes" component={AlertRulesScreen} />
    </Tab.Navigator>
  );
}