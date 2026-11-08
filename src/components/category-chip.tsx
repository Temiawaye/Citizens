import { Pressable, Text } from 'react-native';
import type { IncidentCategory } from '@/types/database';

export function CategoryChip({ label, selected, onPress }: { label: IncidentCategory | 'All'; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} className={`mr-2 min-h-11 justify-center rounded-full border px-4 ${selected ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'}`}><Text className={`font-medium ${selected ? 'text-white' : 'text-slate-700'}`}>{label}</Text></Pressable>;
}
