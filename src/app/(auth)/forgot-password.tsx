import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => { setLoading(true); const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: 'citizens://reset-password' }); setLoading(false); Alert.alert(error ? 'Could not send link' : 'Check your email', error?.message || 'Open the reset link on this device.'); };
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-slate-50 p-6"><View className="gap-5"><Text className="text-2xl font-bold text-slate-950">Reset your password</Text><FormField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><Button disabled={loading || !email} onPress={() => void submit()}>Send reset link</Button></View></KeyboardAvoidingView>;
}
