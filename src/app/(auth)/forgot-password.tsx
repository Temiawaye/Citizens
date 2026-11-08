import { useState } from "react";
import { Alert } from "react-native";

import { AuthScreen } from "@/components/auth-screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { supabase } from "@/lib/supabase";

/** Collects an email address and requests a Supabase password-reset link. */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  // Use the app scheme so the emailed link resumes the reset flow on this device.
  const submit = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "citizens://reset-password",
    });
    setLoading(false);
    Alert.alert(
      error ? "Could not send link" : "Check your email",
      error?.message || "Open the reset link on this device.",
    );
  };
  return (
    <AuthScreen
      title="Forgot password?"
      description="Enter your email and we’ll send you a secure reset link."
    >
      <FormField
        appearance="auth"
        icon="mail-outline"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={() => void submit()}
      />
      <Button
        disabled={!email.trim()}
        loading={loading}
        onPress={() => void submit()}
      >
        Send reset link →
      </Button>
    </AuthScreen>
  );
}
