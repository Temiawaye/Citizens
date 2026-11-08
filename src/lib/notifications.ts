import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";

const DEVICE_KEY = "citizens-device-id";

/** Returns a stable locally stored identifier for this app installation. */
export async function getDeviceId() {
  let id = await SecureStore.getItemAsync(DEVICE_KEY);
  if (!id) {
    id = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await SecureStore.setItemAsync(DEVICE_KEY, id);
  }
  return id;
}

/** Registers this physical device for incident notifications for the supplied user. */
export async function registerPushToken(userId: string) {
  if (!Device.isDevice)
    return {
      registered: false,
      reason: "Push notifications require a physical device.",
    };
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("new-incidents", {
      name: "New incidents",
      importance: AndroidImportance.HIGH,
    });
  }
  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted")
    permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted")
    return { registered: false, reason: "Notification permission was denied." };
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as
    | string
    | undefined;
  if (!projectId)
    return {
      registered: false,
      reason: "EXPO_PUBLIC_EAS_PROJECT_ID is not configured.",
    };
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const deviceId = await getDeviceId();
  const { error } = await supabase.rpc("register_push_token", {
    p_token: token,
    p_device_id: deviceId,
  });
  if (error) throw error;
  return { registered: true, reason: null };
}

/** Removes this installation's push token registration when one exists. */
export async function unregisterPushToken() {
  const deviceId = await SecureStore.getItemAsync(DEVICE_KEY);
  if (!deviceId) return;
  await supabase.rpc("unregister_push_token", { p_device_id: deviceId });
}
