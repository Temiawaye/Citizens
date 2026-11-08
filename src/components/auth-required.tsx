import { router } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";

/** Prompts signed-out users to authenticate before returning them to a protected route. */
export function AuthRequired({ route }: { route: string }) {
  const { session } = useAuth();
  const setPendingRoute = useAuthStore((state) => state.setPendingRoute);
  if (session) return null;
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-canvas p-8">
      <Text className="text-2xl font-bold text-heading">
        Sign in required
      </Text>
      <Text className="text-center text-muted">
        Sign in to create and manage your reports.
      </Text>
      <Button
        onPress={() => {
          setPendingRoute(route);
          router.push("/(auth)/login");
        }}
      >
        Sign in
      </Button>
    </View>
  );
}
