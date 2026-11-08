import type { InfiniteData } from '@tanstack/react-query';

import { PAGE_SIZE } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import type { Incident, IncidentCategory } from '@/types/database';

export interface IncidentPage { items: Incident[]; nextCursor: string | null }

export const incidentKeys = {
  all: ['incidents'] as const,
  feed: (category: IncidentCategory | null, userId?: string) => ['incidents', 'feed', category, userId] as const,
  detail: (id: string) => ['incidents', 'detail', id] as const,
};

const cursorFor = (incident: Incident) => `${incident.created_at}|${incident.id}`;

export async function fetchIncidents({ category, userId, cursor }: { category: IncidentCategory | null; userId?: string; cursor?: string | null }): Promise<IncidentPage> {
  let query = supabase.from('incidents').select('*').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(PAGE_SIZE + 1);
  if (category) query = query.eq('category', category);
  if (userId) query = query.eq('user_id', userId);
  if (cursor) {
    const [createdAt, id] = cursor.split('|');
    query = query.or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`);
  }
  const { data, error } = await query;
  if (error) throw error;
  const rows = data as Incident[];
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);
  return { items, nextCursor: hasMore && items.length ? cursorFor(items[items.length - 1]) : null };
}

export function mergeRealtimeIncident(data: InfiniteData<IncidentPage> | undefined, event: 'INSERT' | 'UPDATE' | 'DELETE', incident: Incident) {
  if (!data) return data;
  const pages = data.pages.map((page) => ({ ...page, items: page.items.filter((item) => item.id !== incident.id) }));
  if (event === 'INSERT') pages[0] = { ...pages[0], items: [incident, ...pages[0].items] };
  if (event === 'UPDATE') {
    const belongs = data.pages.some((page) => page.items.some((item) => item.id === incident.id));
    if (belongs) pages[0] = { ...pages[0], items: [incident, ...pages[0].items] };
  }
  return { ...data, pages };
}
