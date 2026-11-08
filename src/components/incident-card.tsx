import { Image } from "expo-image";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { CATEGORY_COLORS } from "@/lib/constants";
import type { Incident } from "@/types/database";

/** Converts an incident timestamp into a compact relative-time label. */
function relativeTime(value: string) {
  const seconds = Math.max(
    1,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/** Renders a navigable incident summary with optional card-level actions. */
export function IncidentCard({
  incident,
  actions,
}: {
  incident: Incident;
  actions?: ReactNode;
}) {
  return (
    <View className="mb-4 overflow-hidden rounded-card border border-outline bg-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${incident.category}: ${incident.title}`}
        accessibilityHint="Opens report details"
        onPress={() => router.push(`/incident/${incident.id}`)}
      >
        {incident.image_urls[0] ? (
          <Image
            source={incident.image_urls[0]}
            contentFit="cover"
            className="h-48 w-full"
            accessibilityLabel={`Photo for ${incident.title}`}
          />
        ) : (
          <View className="h-24 items-center justify-center bg-canvas">
            <Text className="text-muted">No photo</Text>
          </View>
        )}
        <View className="gap-2 p-4">
          <View className="flex-row items-center justify-between gap-2">
            <Text
              className={`overflow-hidden rounded-full px-2 py-1 text-xs font-semibold ${CATEGORY_COLORS[incident.category]}`}
            >
              {incident.category}
            </Text>
            <Text className="text-xs text-muted">
              {relativeTime(incident.created_at)}
            </Text>
          </View>
          <Text
            accessibilityRole="header"
            numberOfLines={2}
            className="text-lg font-bold text-heading"
          >
            {incident.title}
          </Text>
          <Text numberOfLines={2} className="text-sm text-muted">
            {incident.address ||
              `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}
          </Text>
        </View>
      </Pressable>
      {actions ? (
        <View className="flex-row gap-2 border-t border-outline p-3">
          {actions}
        </View>
      ) : null}
    </View>
  );
}
