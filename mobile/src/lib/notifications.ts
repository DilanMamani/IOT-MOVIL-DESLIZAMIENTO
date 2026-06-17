import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Alert } from "../types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const { status: requested } = await Notifications.requestPermissionsAsync();
  return requested === "granted";
}

export async function showLocalAlertNotification(alert: Alert) {
  const isCritical = alert.level === "danger";

  await Notifications.scheduleNotificationAsync({
    content: {
      title: isCritical ? `🔴 ${alert.title}` : `🟠 ${alert.title}`,
      body: `${alert.device_name} · ${alert.message}`,
      data: { alertId: alert.id },
      sound: Platform.OS === "ios" ? "default" : undefined,
      priority: isCritical
        ? Notifications.AndroidNotificationPriority.MAX
        : Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}
