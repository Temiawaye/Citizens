import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type { ComponentProps } from "react";
import type { TextInputProps } from "react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { COLORS } from "@/lib/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  appearance?: "default" | "auth";
  icon?: ComponentProps<typeof Ionicons>["name"];
};

/** Renders a labeled text field with optional auth styling, icon, and error feedback. */
export function FormField({
  label,
  error,
  multiline,
  appearance = "default",
  icon,
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}: FormFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const isAuth = appearance === "auth";
  const defaultContainerClasses = [
    "min-h-12 rounded-control bg-surface px-4",
    multiline ? "items-start" : "",
  ].join(" ");
  const containerClasses = [
    "flex-row items-center border",
    isAuth ? "min-h-16 rounded-2xl bg-surface px-4" : defaultContainerClasses,
    error
      ? "border-danger-600"
      : focused
        ? "border-brand-600"
      : isAuth
        ? "border-outline"
        : "border-outline",
  ].join(" ");
  const inputClasses = [
    "flex-1 text-base text-ink",
    isAuth ? "px-4 py-4" : "px-0 py-3",
    multiline ? "min-h-32" : "",
  ].join(" ");

  return (
    <View className="gap-2">
      <Text
        className={`${isAuth ? "text-base font-medium text-muted" : "text-sm font-semibold text-muted"}`}
      >
        {label}
      </Text>
      <View className={containerClasses}>
        {icon ? (
          <Ionicons
            accessibilityElementsHidden
            name={icon}
            color={COLORS.supporting}
            size={22}
          />
        ) : null}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error}
          allowFontScaling
          multiline={multiline}
          secureTextEntry={secureTextEntry && !passwordVisible}
          keyboardAppearance="light"
          placeholderTextColor={COLORS.supporting}
          className={inputClasses}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            hitSlop={10}
            onPress={() => setPasswordVisible((visible) => !visible)}
            className="h-11 w-11 items-center justify-center"
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              color={COLORS.supporting}
              size={23}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-sm font-medium text-danger-700"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
