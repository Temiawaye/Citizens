import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

export function Button({ children, onPress, disabled, variant = 'primary', accessibilityLabel }: PropsWithChildren<{ onPress?: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger'; accessibilityLabel?: string }>) {
  const colors = variant === 'primary' ? 'bg-brand-600' : variant === 'danger' ? 'bg-red-600' : 'bg-slate-200';
  const text = variant === 'secondary' ? 'text-slate-900' : 'text-white';
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onPress} className={`min-h-12 items-center justify-center rounded-xl px-5 ${colors} ${disabled ? 'opacity-50' : ''}`}><Text className={`text-base font-semibold ${text}`}>{disabled ? <ActivityIndicator color={variant === 'secondary' ? '#334155' : '#fff'} /> : children}</Text></Pressable>;
}
