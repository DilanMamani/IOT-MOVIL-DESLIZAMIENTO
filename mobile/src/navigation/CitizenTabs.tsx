import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { HomeScreen } from "../screens/citizen/HomeScreen";
import { ReportScreen } from "../screens/citizen/ReportScreen";
import { MapScreen } from "../screens/citizen/MapScreen";
import { WeatherScreen } from "../screens/citizen/WeatherScreen";
import { ChatScreen } from "../screens/citizen/ChatScreen";

const TERRACOTA = "#C4622D";
const TEXT_SECONDARY = "#6B6B6B";

export type CitizenTabsParamList = {
  Inicio: undefined;
  Reportar: undefined;
  Mapa: undefined;
  Clima: undefined;
  Asistente: undefined;
};

const Tab = createBottomTabNavigator<CitizenTabsParamList>();

const ICONS: Record<keyof CitizenTabsParamList, keyof typeof MaterialIcons.glyphMap> = {
  Inicio: "home",
  Reportar: "add-circle",
  Mapa: "map",
  Clima: "cloud",
  Asistente: "chat-bubble-outline",
};

export function CitizenTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: TERRACOTA,
        tabBarInactiveTintColor: TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#E8E0D5",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 80 : 64,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "DMSans_500Medium",
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          if (route.name === "Reportar") {
            return (
              <View style={[styles.fabTab, focused && styles.fabTabActive]}>
                <MaterialIcons name="add" size={26} color={focused ? "#fff" : TERRACOTA} />
              </View>
            );
          }
          return (
            <MaterialIcons
              name={ICONS[route.name]}
              color={color}
              size={route.name === "Inicio" ? 24 : 22}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen
        name="Reportar"
        component={ReportScreen}
        options={{
          tabBarLabel: "Reportar",
        }}
      />
      <Tab.Screen name="Clima" component={WeatherScreen} />
      <Tab.Screen name="Asistente" component={ChatScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  fabTab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF0EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: "#F4C5AF",
  },
  fabTabActive: {
    backgroundColor: TERRACOTA,
    borderColor: TERRACOTA,
    shadowColor: TERRACOTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
