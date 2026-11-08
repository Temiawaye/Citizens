import { useEffect, useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import { AuthRequired } from "@/components/auth-required";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { registerPushToken } from "@/lib/notifications";

/** Displays account details and controls notification registration and sign-out. */
export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [notificationState, setNotificationState] = useState("Not registered");
  useEffect(() => {
    if (session)
      void registerPushToken(session.user.id)
        .then((result) =>
          setNotificationState(
            result.registered ? "Enabled" : result.reason || "Unavailable",
          ),
        )
        .catch(() =>
          setNotificationState("Registration failed — tap to retry"),
        );
  }, [session]);
  if (!session) return <AuthRequired route="/(tabs)/profile" />;
  // Surface denied permissions with a direct recovery path to system settings.
  const enable = async () => {
    try {
      const result = await registerPushToken(session.user.id);
      setNotificationState(
        result.registered ? "Enabled" : result.reason || "Unavailable",
      );
      if (!result.registered)
        Alert.alert(
          "Notifications unavailable",
          result.reason || "Unavailable",
          [
            { text: "Cancel" },
            {
              text: "Open Settings",
              onPress: () => void Linking.openSettings(),
            },
          ],
        );
    } catch (error) {
      Alert.alert(
        "Could not register",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  };
  return (
    <View className="flex-1 gap-6 bg-canvas p-5">
      <View className="gap-2 rounded-2xl border border-outline bg-surface p-5">
        <Text className="text-xl font-bold text-heading">
          {session.user.user_metadata.full_name || "Citizen"}
        </Text>
        <Text className="text-muted">{session.user.email}</Text>
      </View>
      <View className="gap-3 rounded-2xl border border-outline bg-surface p-5">
        <Text className="font-bold text-heading">
          New incident notifications
        </Text>
        <Text className="text-muted">{notificationState}</Text>
        <Button variant="secondary" onPress={() => void enable()}>
          Enable notifications
        </Button>
      </View>
      <Button variant="danger" onPress={() => void signOut()}>
        Sign out
      </Button>
    </View>
  );
}
