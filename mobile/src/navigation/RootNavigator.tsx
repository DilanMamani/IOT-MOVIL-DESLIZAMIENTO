import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { CitizenTabs } from "./CitizenTabs";

const CITIZEN_NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#C4622D",
    background: "#FAF7F2",
    card: "#FFFFFF",
    text: "#1A1A1A",
    border: "#E8E0D5",
    notification: "#D94F4F",
  },
};

const ADMIN_NAV_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#ffb693",
    background: "#0f131c",
    card: "#0a0e17",
    text: "#dfe2ef",
    border: "#5a4136",
    notification: "#ffb693",
  },
};

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FAF7F2" }}>
        <ActivityIndicator color="#C4622D" size="large" />
      </View>
    );
  }

  const isCitizen = user?.role === "ciudadano";

  return (
    <NavigationContainer theme={isCitizen ? CITIZEN_NAV_THEME : ADMIN_NAV_THEME}>
      {user ? (
        <SocketProvider>
          {isCitizen ? <CitizenTabs /> : <MainTabs />}
        </SocketProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
