import { Alert, FlatList, RefreshControl } from 'react-native';
import { AuthRequired } from '@/components/auth-required';
import { IncidentCard } from '@/components/incident-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-state';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useIncidents } from '@/hooks/use-incidents';
import { incidentKeys } from '@/lib/incidents';
import { queryClient } from '@/lib/query-client';
import { deleteIncidentWithImages } from '@/lib/submission';
import type { Incident } from '@/types/database';

export default function MyReportsScreen() {
  const { session } = useAuth();
  const reports = useIncidents(null, session?.user.id);
  if (!session) return <AuthRequired route="/(tabs)/my-reports" />;
  if (reports.isLoading) return <LoadingState />;
  if (reports.isError) return <ErrorState message="Your reports could not be loaded." retry={() => void reports.refetch()} />;
  const confirmDelete = (incident: Incident) => Alert.alert('Delete report?', 'This permanently removes the public report and its photos.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteIncidentWithImages(incident.id, session.user.id); await queryClient.invalidateQueries({ queryKey: incidentKeys.all }); } catch (error) { Alert.alert('Could not delete', error instanceof Error ? error.message : 'Try again. If photo cleanup succeeded, retrying is safe.'); } } }]);
  return <FlatList className="bg-slate-50" contentContainerClassName="grow p-4" data={reports.items} keyExtractor={(item) => item.id} renderItem={({ item }) => <><IncidentCard incident={item} /><Button variant="danger" onPress={() => confirmDelete(item)}>Delete report</Button></>} ItemSeparatorComponent={() => null} refreshControl={<RefreshControl refreshing={reports.isRefetching} onRefresh={() => void reports.refetch()} />} ListEmptyComponent={<EmptyState title="No reports" message="Incidents you publish will appear here." />} onEndReached={() => { if (reports.hasNextPage) void reports.fetchNextPage(); }} />;
}
