import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { CategoryChip } from '@/components/category-chip';
import { IncidentCard } from '@/components/incident-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { useIncidents } from '@/hooks/use-incidents';
import { CATEGORIES } from '@/lib/constants';
import type { IncidentCategory } from '@/types/database';

export default function FeedScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [manualCategory, setManualCategory] = useState<IncidentCategory | null>(null);
  const category = CATEGORIES.includes(params.category as IncidentCategory) ? params.category as IncidentCategory : manualCategory;
  const feed = useIncidents(category);
  if (feed.isLoading) return <LoadingState label="Loading public reports…" />;
  if (feed.isError) return <ErrorState message="Reports could not be loaded. Check your connection." retry={() => void feed.refetch()} />;
  const retryMore = () => { void feed.fetchNextPage(); };
  const footer = feed.isFetchingNextPage ? <View className="h-20"><LoadingState label="Loading more…" /></View> : feed.isFetchNextPageError ? <Pressable onPress={retryMore} className="p-4"><Text className="text-center text-red-600">Could not load more. Tap to retry.</Text></Pressable> : <View />;
  return <View className="flex-1 bg-slate-50">
    {feed.newCount > 0 ? <Pressable onPress={() => { feed.clearNewCount(); void feed.refetch(); }} className="mx-4 mt-3 min-h-11 items-center justify-center rounded-full bg-brand-600"><Text className="font-semibold text-white">{feed.newCount} new {feed.newCount === 1 ? 'report' : 'reports'}</Text></Pressable> : null}
    <FlatList data={feed.items} keyExtractor={(item) => item.id} renderItem={({ item }) => <IncidentCard incident={item} />} contentContainerClassName="p-4 grow" refreshControl={<RefreshControl refreshing={feed.isRefetching} onRefresh={() => { feed.clearNewCount(); void feed.refetch(); }} />} onEndReached={() => { if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage(); }} onEndReachedThreshold={0.4} ListHeaderComponent={<FlatList horizontal showsHorizontalScrollIndicator={false} data={['All', ...CATEGORIES] as const} keyExtractor={(item) => item} renderItem={({ item }) => <CategoryChip label={item} selected={item === 'All' ? category === null : category === item} onPress={() => { router.setParams({ category: undefined }); setManualCategory(item === 'All' ? null : item); }} />} className="mb-4" />} ListEmptyComponent={<EmptyState title={category ? 'No matching reports' : 'No reports yet'} message={category ? `There are no ${category} reports.` : 'Be the first to report an incident.'} />} ListFooterComponent={footer} />
  </View>;
}
