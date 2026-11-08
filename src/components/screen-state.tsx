import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

export function LoadingState({ label = 'Loading…' }: { label?: string }) { return <View className="flex-1 items-center justify-center gap-3 p-8"><ActivityIndicator size="large" color="#2563eb" /><Text className="text-slate-600">{label}</Text></View>; }
export function EmptyState({ title, message }: { title: string; message: string }) { return <View className="flex-1 items-center justify-center gap-2 p-8"><Text className="text-xl font-bold text-slate-900">{title}</Text><Text className="text-center text-base text-slate-600">{message}</Text></View>; }
export function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <View className="flex-1 items-center justify-center gap-4 p-8"><Text className="text-center text-base text-red-700">{message}</Text><Button onPress={retry}>Try again</Button></View>; }
