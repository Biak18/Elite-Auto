// src/services/notificationService.ts
import { supabase } from "@/src/lib/supabase";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { showMessage } from "../lib/utils/dialog";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  // Request permissions and get push token
  async registerForPushNotifications() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#fbbf24",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications
        .getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        showMessage("Failed to get push token for push notification!", "error");
        return null;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        showMessage("Project ID not found", "info");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } else {
      showMessage("Must use physical device for Push Notifications", "warning");
    }
    return token;
  },

  // Save token to Supabase
  async savePushToken(userId: string, token: string) {
    if (!userId || userId.trim() === "") {
      console.warn("Cannot save push token: userId is empty");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ push_token: token })
      .eq("id", userId);

    if (error) {
      console.error("Error saving push token:", error);
      throw error;
    }
  },

  // Send notification via Expo Push API
  async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any,
  ) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: title,
      body: body,
      data: data,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    if (!userId || userId.trim() === "") {
      console.warn("Cannot get unread count: userId is empty");
      return 0;
    }
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw error;
    return count || 0;
  },

  // Mark as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) throw error;
  },
};
