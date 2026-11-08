import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Renders a keyboard-safe authentication layout around the supplied content and footer. */
export function AuthScreen({
  title,
  description,
  children,
  footer,
}: PropsWithChildren<{
  title: string;
  description?: string;
  footer?: ReactNode;
}>) {
  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="grow px-6 pb-10 pt-16"
          automaticallyAdjustKeyboardInsets
        >
          <View className="mx-auto w-full max-w-xl gap-7">
            <View className="mb-2 items-center gap-3">
              <View className="h-1 w-12 rounded-full bg-brand-600" />
              <Text
                accessibilityRole="header"
                className="text-center text-4xl font-bold tracking-tight text-heading"
              >
                {title}
              </Text>
              {description ? (
                <Text className="max-w-md text-center text-base leading-6 text-muted">
                  {description}
                </Text>
              ) : null}
            </View>
            {children}
            {footer ? (
              <View className="items-center pt-2">{footer}</View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
