import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0f131c",
    card: "#0a0e17",
    border: "#5a4136",
    primary: "#ffb693",
    text: "#dfe2ef",
  },
};

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#ffb693" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <SocketProvider>
          <MainTabs />
        </SocketProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
