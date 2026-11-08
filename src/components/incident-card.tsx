import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_COLORS } from '@/lib/constants';
import type { Incident } from '@/types/database';

function relativeTime(value: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function IncidentCard({ incident }: { incident: Incident }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${incident.title}`} onPress={() => router.push(`/incident/${incident.id}`)} className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    {incident.image_urls[0] ? <Image source={incident.image_urls[0]} contentFit="cover" className="h-48 w-full" accessibilityLabel={`Photo for ${incident.title}`} /> : <View className="h-24 items-center justify-center bg-slate-100"><Text className="text-slate-500">No photo</Text></View>}
    <View className="gap-2 p-4"><View className="flex-row items-center justify-between gap-2"><Text className={`overflow-hidden rounded-full px-2 py-1 text-xs font-semibold ${CATEGORY_COLORS[incident.category]}`}>{incident.category}</Text><Text className="text-xs text-slate-500">{relativeTime(incident.created_at)}</Text></View><Text numberOfLines={2} className="text-lg font-bold text-slate-950">{incident.title}</Text><Text numberOfLines={1} className="text-sm text-slate-600">{incident.address || `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}</Text></View>
  </Pressable>;
}
