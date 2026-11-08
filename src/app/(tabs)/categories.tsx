import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';

export default function CategoriesScreen() {
  return <FlatList className="bg-slate-50" contentContainerClassName="p-4" data={CATEGORIES} keyExtractor={(item) => item} renderItem={({ item }) => <Pressable onPress={() => router.navigate({ pathname: '/(tabs)', params: { category: item } })} className="mb-3 min-h-16 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"><View className={`rounded-full px-3 py-2 ${CATEGORY_COLORS[item]}`}><Text className="font-semibold">{item}</Text></View><Text className="text-xl text-slate-400">›</Text></Pressable>} />;
}
