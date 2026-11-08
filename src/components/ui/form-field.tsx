import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

export function FormField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View className="gap-2"><Text className="text-sm font-semibold text-slate-700">{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#94a3b8" className={`min-h-12 rounded-xl border bg-white px-4 py-3 text-base text-slate-950 ${error ? 'border-red-500' : 'border-slate-300'}`} {...props} />{error ? <Text className="text-sm text-red-600">{error}</Text> : null}</View>;
}
