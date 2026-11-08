import { zodResolver } from '@hookform/resolvers/zod';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

import { AuthRequired } from '@/components/auth-required';
import { ImagePickerGrid } from '@/components/image-picker-grid';
import { LocationPicker } from '@/components/location-picker';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { CATEGORIES } from '@/lib/constants';
import { incidentKeys } from '@/lib/incidents';
import { queryClient } from '@/lib/query-client';
import { submitIncident } from '@/lib/submission';
import { incidentSchema, type IncidentFormValues } from '@/lib/validation';
import { useAuth } from '@/hooks/use-auth';

export default function ReportScreen() {
  const { session } = useAuth();
  const [incidentId, setIncidentId] = useState(() => Crypto.randomUUID());
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<IncidentFormValues>({ resolver: zodResolver(incidentSchema), defaultValues: { title: '', description: '', category: 'Other', address: null, images: [] } });
  if (!session) return <AuthRequired route="/(tabs)/report" />;
  const submit = handleSubmit(async (values) => {
    try { await submitIncident({ id: incidentId, userId: session.user.id, values }); await queryClient.invalidateQueries({ queryKey: incidentKeys.all }); setIncidentId(Crypto.randomUUID()); reset({ title: '', description: '', category: 'Other', address: null, images: [] }); Alert.alert('Report published', 'Your incident is now visible to everyone.'); router.push(`/incident/${incidentId}`); } catch (error) { Alert.alert('Could not publish', error instanceof Error ? `${error.message}\n\nYour form is preserved. Tap submit to retry.` : 'Your form is preserved. Try again.'); }
  });
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} className="flex-1 bg-slate-50"><ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-5 p-4 pb-12"><Text className="text-sm text-slate-600">Reports are posted immediately. Descriptions, photos, your display name, and coordinates are public.</Text><Controller control={control} name="title" render={({ field: { onChange, value } }) => <FormField label="Title" value={value} onChangeText={onChange} error={errors.title?.message} maxLength={120} />} /><Controller control={control} name="description" render={({ field: { onChange, value } }) => <FormField label="Description" value={value} onChangeText={onChange} error={errors.description?.message} multiline numberOfLines={5} textAlignVertical="top" maxLength={2000} />} /><Controller control={control} name="category" render={({ field: { onChange, value } }) => <View className="gap-2"><Text className="font-semibold text-slate-700">Category</Text><View className="rounded-xl border border-slate-300 bg-white"><Picker selectedValue={value} onValueChange={onChange} dropdownIconColor="#64748b">{CATEGORIES.map((category) => <Picker.Item key={category} label={category} value={category} />)}</Picker></View></View>} /><Controller control={control} name="images" render={({ field: { onChange, value } }) => <ImagePickerGrid images={value} onChange={onChange} />} /><Controller control={control} name="latitude" render={({ field: latitudeField }) => <Controller control={control} name="longitude" render={({ field: longitudeField }) => <Controller control={control} name="address" render={({ field: addressField }) => <View><LocationPicker value={typeof latitudeField.value === 'number' && typeof longitudeField.value === 'number' ? { latitude: latitudeField.value, longitude: longitudeField.value, address: addressField.value } : null} onChange={(location) => { latitudeField.onChange(location.latitude); longitudeField.onChange(location.longitude); addressField.onChange(location.address); }} />{errors.latitude || errors.longitude ? <Text className="mt-2 text-red-600">Choose an incident location.</Text> : null}</View>} />} />} /><Button disabled={isSubmitting} onPress={() => void submit()}>{isSubmitting ? 'Publishing…' : 'Publish report'}</Button></ScrollView></KeyboardAvoidingView>;
}
