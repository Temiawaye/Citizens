import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { supabase } from '@/lib/supabase';
import { loginSchema } from '@/lib/validation';
import { useAuthStore } from '@/store/auth-store';

type Values = z.infer<typeof loginSchema>;
export default function LoginScreen() {
  const pendingRoute = useAuthStore((state) => state.pendingRoute);
  const setPendingRoute = useAuthStore((state) => state.setPendingRoute);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const submit = handleSubmit(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return Alert.alert('Could not sign in', error.message);
    const destination = pendingRoute || '/(tabs)'; setPendingRoute(null); router.replace(destination as never);
  });
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-slate-50 p-6"><View className="gap-5 rounded-3xl bg-white p-6"><Text className="text-3xl font-bold text-slate-950">Welcome back</Text><Controller control={control} name="email" render={({ field: { onChange, value } }) => <FormField label="Email" value={value} onChangeText={onChange} error={errors.email?.message} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />} /><Controller control={control} name="password" render={({ field: { onChange, value } }) => <FormField label="Password" value={value} onChangeText={onChange} error={errors.password?.message} secureTextEntry autoComplete="current-password" />} /><Button disabled={isSubmitting} onPress={() => void submit()}>Sign in</Button><Link href="/(auth)/forgot-password" className="min-h-11 text-center text-brand-600">Forgot password?</Link><Link href="/(auth)/register" className="min-h-11 text-center text-brand-600">Create an account</Link></View></KeyboardAvoidingView>;
}
