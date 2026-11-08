import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { supabase } from '@/lib/supabase';
import { registerSchema } from '@/lib/validation';

type Values = z.infer<typeof registerSchema>;
export default function RegisterScreen() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: '', email: '', password: '' } });
  const submit = handleSubmit(async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() }, emailRedirectTo: 'citizens://reset-password' } });
    if (error) return Alert.alert('Could not create account', error.message);
    if (!data.session) { Alert.alert('Check your email', 'Confirm your email address, then return to sign in.'); router.replace('/(auth)/login'); }
    else router.replace('/(tabs)');
  });
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-slate-50 p-6"><View className="gap-5 rounded-3xl bg-white p-6"><Text className="text-3xl font-bold text-slate-950">Create account</Text><Controller control={control} name="fullName" render={({ field: { onChange, value } }) => <FormField label="Full name (public on reports)" value={value} onChangeText={onChange} error={errors.fullName?.message} autoComplete="name" />} /><Controller control={control} name="email" render={({ field: { onChange, value } }) => <FormField label="Email" value={value} onChangeText={onChange} error={errors.email?.message} autoCapitalize="none" keyboardType="email-address" />} /><Controller control={control} name="password" render={({ field: { onChange, value } }) => <FormField label="Password" value={value} onChangeText={onChange} error={errors.password?.message} secureTextEntry />} /><Button disabled={isSubmitting} onPress={() => void submit()}>Create account</Button></View></KeyboardAvoidingView>;
}
