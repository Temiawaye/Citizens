import type { PropsWithChildren } from "react";
import { ActivityIndicator, Platform, Pressable, Text } from "react-native";
import { COLORS } from "@/lib/theme";

type ButtonProps = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}>;

/** Renders a reusable action button with loading, disabled, and visual variants. */
export function Button({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const unavailable = disabled || loading;
  const colors =
    variant === "primary"
      ? "bg-brand-600"
      : variant === "danger"
        ? "bg-danger-600"
        : "border border-outline bg-surface";
  const text = variant === "secondary" ? "text-ink" : "text-white";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      android_ripple={
        unavailable
          ? undefined
          : { color: variant === "secondary" ? COLORS.selected : "#FFFFFF33" }
      }
      disabled={unavailable}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-control px-5 py-3 ${colors} ${unavailable ? "opacity-50" : ""}`}
      style={({ pressed }) => ({
        opacity:
          pressed && !unavailable && Platform.OS === "ios" ? 0.72 : undefined,
      })}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityLabel="Loading"
          color={variant === "secondary" ? COLORS.text : COLORS.surface}
        />
      ) : (
        <Text className={`text-center text-base font-semibold ${text}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
