import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { supabase } from '@/lib/supabase';
export default function ResetPasswordScreen() { const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false); const submit = async () => { setLoading(true); const { error } = await supabase.auth.updateUser({ password }); setLoading(false); if (error) Alert.alert('Could not update password', error.message); else { Alert.alert('Password updated'); router.replace('/(tabs)'); } }; return <View className="flex-1 justify-center gap-5 bg-slate-50 p-6"><Text className="text-2xl font-bold text-slate-950">Choose a new password</Text><FormField label="New password" value={password} onChangeText={setPassword} secureTextEntry /><Button disabled={loading || password.length < 8} onPress={() => void submit()}>Update password</Button></View>; }
