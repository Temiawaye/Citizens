import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthScreen } from "@/components/auth-screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { supabase } from "@/lib/supabase";
import { registerSchema } from "@/lib/validation";

type Values = z.infer<typeof registerSchema>;

/** Creates a Citizens account and handles both immediate and email-confirmed sessions. */
export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });
  const submit = handleSubmit(async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: "citizens://reset-password",
      },
    });
    if (error) return Alert.alert("Could not create account", error.message);
    if (!data.session) {
      Alert.alert(
        "Check your email",
        "Confirm your email address, then return to sign in.",
      );
      router.replace("/(auth)/login");
    } else router.replace("/(tabs)");
  });

  const footer = (
    <View className="min-h-12 flex-row flex-wrap items-center justify-center">
      <Text className="text-base text-muted">Already have an account? </Text>
      <Link
        href="/(auth)/login"
        className="py-3 text-base font-semibold text-brand-600"
      >
        Sign in
      </Link>
    </View>
  );
  return (
    <AuthScreen
      title="Create account"
      description="Join your community and report incidents that matter."
      footer={footer}
    >
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <FormField
            appearance="auth"
            icon="person-outline"
            label="Full name"
            placeholder="Enter your full name"
            value={value}
            onChangeText={onChange}
            error={errors.fullName?.message}
            autoComplete="name"
          />
        )}
      />
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
            placeholder="Create a password"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            secureTextEntry
            autoComplete="new-password"
          />
        )}
      />
      <Text className="-mt-3 text-sm leading-5 text-muted">
        Your full name is displayed publicly on reports you publish.
      </Text>
      <Button loading={isSubmitting} onPress={() => void submit()}>
        Create account →
      </Button>
    </AuthScreen>
  );
}
