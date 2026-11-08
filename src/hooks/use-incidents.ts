import NetInfo from "@react-native-community/netinfo";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fetchIncidents, incidentKeys } from "@/lib/incidents";
import { supabase } from "@/lib/supabase";
import type { Incident, IncidentCategory } from "@/types/database";

/** Loads a paginated incident feed and keeps it synchronized with network and realtime events. */
export function useIncidents(
  category: IncidentCategory | null = null,
  userId?: string,
) {
  const queryClient = useQueryClient();
  const [newCount, setNewCount] = useState(0);
  const query = useInfiniteQuery({
    queryKey: incidentKeys.feed(category, userId),
    queryFn: ({ pageParam }) =>
      fetchIncidents({ category, userId, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
  });

  useEffect(() => {
    // Effects can briefly overlap during fast refresh, Strict Mode, or route transitions.
    // A unique topic prevents Supabase from returning an already-subscribed channel.
    const channelScope = `${category ?? "all"}:${userId ?? "public"}`;
    const channelInstance = `${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const channelTopic = `incidents:${channelScope}:${channelInstance}`;
    const channel = supabase
      .channel(channelTopic)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          const changed = (
            payload.new && Object.keys(payload.new).length
              ? payload.new
              : payload.old
          ) as Incident;
          const applies =
            (!category || changed.category === category) &&
            (!userId || changed.user_id === userId);
          queryClient.invalidateQueries({
            queryKey: incidentKeys.detail(changed.id),
          });
          if (applies) {
            if (payload.eventType === "INSERT")
              setNewCount((count) => count + 1);
            else
              queryClient.invalidateQueries({
                queryKey: incidentKeys.feed(category, userId),
              });
          } else if (payload.eventType !== "INSERT") {
            queryClient.invalidateQueries({
              queryKey: incidentKeys.feed(category, userId),
            });
          }
        },
      )
      .subscribe();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected)
        queryClient.invalidateQueries({
          queryKey: incidentKeys.feed(category, userId),
        });
    });
    return () => {
      unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [category, queryClient, userId]);

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    newCount,
    clearNewCount: () => setNewCount(0),
  };
}

/** Loads one incident by identifier and returns its React Query state. */
export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Incident | null;
    },
  });
}
