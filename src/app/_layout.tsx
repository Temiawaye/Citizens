import "@/global.css";
import "@/lib/nativewind";
import * as Notifications from "expo-notifications";
import { Stack, router, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";

import { useAuthBootstrap } from "@/hooks/use-auth";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";
import { registerPushToken } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

void SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Bootstraps cross-cutting services and renders the application route stack. */
function AppNavigator() {
  useAuthBootstrap();
  const initialized = useAuthStore((state) => state.initialized);
  const session = useAuthStore((state) => state.session);
  const rootState = useRootNavigationState();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (initialized) void SplashScreen.hideAsync();
  }, [initialized]);
  useEffect(() => {
    if (session) void registerPushToken(session.user.id).catch(() => undefined);
  }, [session]);
  useEffect(() => {
    // Password-reset links carry tokens in either a fragment or query string.
    const processUrl = async (url: string | null) => {
      if (!url) return;
      const values = new URLSearchParams(
        url.split("#")[1] || url.split("?")[1] || "",
      );
      const accessToken = values.get("access_token");
      const refreshToken = values.get("refresh_token");
      if (accessToken && refreshToken)
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
    };
    void Linking.getInitialURL().then(processUrl);
    const subscription = Linking.addEventListener(
      "url",
      ({ url }) => void processUrl(url),
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (!initialized || !rootState?.key) return;
    // De-duplicate notification responses so cold-start and live listeners cannot double-navigate.
    const open = (response: Notifications.NotificationResponse | null) => {
      const id = response?.notification.request.content.data?.incidentId;
      if (typeof id === "string" && handled.current !== id) {
        handled.current = id;
        router.push(`/incident/${id}`);
      }
    };
    void Notifications.getLastNotificationResponseAsync().then(open);
    const subscription =
      Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [initialized, rootState?.key]);

  if (!initialized) return null;
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#0f172a",
          headerTitleAlign: "left",
          headerTitleStyle: {
            color: "#0f172a",
            fontSize: 22,
            fontWeight: "700",
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen name="incident/[id]" options={{ title: "Incident" }} />
        <Stack.Screen
          name="reset-password"
          options={{
            headerShadowVisible: false,
            headerTitle: "",
            headerTransparent: true,
          }}
        />
      </Stack>
    </>
  );
}

/** Provides the shared query client and top-level application navigator. */
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
}
