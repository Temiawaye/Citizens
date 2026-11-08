import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

import { AuthScreen } from "@/components/auth-screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { supabase } from "@/lib/supabase";

/** Updates the authenticated recovery session with a newly chosen password. */
export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Supabase restores the recovery session before this route updates the credential.
  const submit = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) Alert.alert("Could not update password", error.message);
    else {
      Alert.alert("Password updated");
      router.replace("/(tabs)");
    }
  };
  return (
    <AuthScreen
      title="New password"
      description="Choose a secure password with at least 8 characters."
    >
      <FormField
        appearance="auth"
        icon="lock-closed-outline"
        label="New password"
        placeholder="Enter a new password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={() => void submit()}
      />
      <Button
        disabled={password.length < 8}
        loading={loading}
        onPress={() => void submit()}
      >
        Update password →
      </Button>
    </AuthScreen>
  );
}
