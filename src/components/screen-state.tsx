import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "@/components/ui/button";

/** Renders an accessible full-screen loading indicator with an optional label. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className="flex-1 items-center justify-center gap-3 bg-canvas p-8"
    >
      <ActivityIndicator size="large" color="#1d4ed8" />
      <Text className="text-center text-muted">{label}</Text>
    </View>
  );
}

/** Renders a centered empty-state message from the supplied title and explanation. */
export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-canvas p-8">
      <Text
        accessibilityRole="header"
        className="text-center text-xl font-bold text-ink"
      >
        {title}
      </Text>
      <Text className="text-center text-base leading-6 text-muted">
        {message}
      </Text>
    </View>
  );
}

/** Renders an announced error message and exposes the supplied retry action. */
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      className="flex-1 items-center justify-center gap-4 bg-canvas p-8"
    >
      <Text
        accessibilityRole="alert"
        className="text-center text-base leading-6 text-danger-700"
      >
        {message}
      </Text>
      <Button onPress={retry}>Try again</Button>
    </View>
  );
}
