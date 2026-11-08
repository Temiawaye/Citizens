import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthScreen } from "@/components/auth-screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { supabase } from "@/lib/supabase";
import { loginSchema } from "@/lib/validation";
import { useAuthStore } from "@/store/auth-store";

type Values = z.infer<typeof loginSchema>;

/** Authenticates a user and returns them to their originally requested route. */
export default function LoginScreen() {
  const pendingRoute = useAuthStore((state) => state.pendingRoute);
  const setPendingRoute = useAuthStore((state) => state.setPendingRoute);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = handleSubmit(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return Alert.alert("Could not sign in", error.message);
    const destination = pendingRoute || "/(tabs)";
    setPendingRoute(null);
    router.replace(destination as never);
  });

  const footer = (
    <View className="min-h-12 flex-row flex-wrap items-center justify-center">
      <Text className="text-base text-muted">Don’t have an account? </Text>
      <Link
        href="/(auth)/register"
        className="py-3 text-base font-semibold text-brand-600"
      >
        Create one
      </Link>
    </View>
  );
  return (
    <AuthScreen
      title="Sign in"
      description="Welcome back. Sign in to continue to Citizens."
      footer={footer}
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <FormField
            appearance="auth"
            icon="mail-outline"
            label="Email"
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <FormField
            appearance="auth"
            icon="lock-closed-outline"
            label="Password"
            placeholder="Enter your password"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            secureTextEntry
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
          />
        )}
      />
      <Link
        href="/(auth)/forgot-password"
        className="min-h-12 self-end py-3 text-right font-semibold text-brand-600"
      >
        Forgot password?
      </Link>
      <Button loading={isSubmitting} onPress={() => void submit()}>
        Sign in →
      </Button>
    </AuthScreen>
  );
}
