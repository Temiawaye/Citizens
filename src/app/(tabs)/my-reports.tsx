import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, FlatList, Pressable, RefreshControl, Text } from "react-native";
import { AuthRequired } from "@/components/auth-required";
import { IncidentCard } from "@/components/incident-card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/screen-state";
import { useAuth } from "@/hooks/use-auth";
import { useIncidents } from "@/hooks/use-incidents";
import { incidentKeys } from "@/lib/incidents";
import { queryClient } from "@/lib/query-client";
import { deleteIncidentWithImages } from "@/lib/submission";
import type { Incident } from "@/types/database";
import { COLORS } from "@/lib/theme";

/** Renders an accessible icon action for an owned report card. */
function ReportCardAction({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const foregroundColor = destructive ? COLORS.danger : COLORS.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-control active:opacity-70 ${destructive ? "bg-danger-50" : "bg-brand-50"}`}
    >
      <Ionicons name={icon} color={foregroundColor} size={20} />
      <Text
        className={`font-semibold ${destructive ? "text-danger-700" : "text-brand-600"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Lists the signed-in user's incidents and provides owned-report deletion. */
export default function MyReportsScreen() {
  const { session } = useAuth();
  const reports = useIncidents(null, session?.user.id);
  if (!session) return <AuthRequired route="/(tabs)/my-reports" />;
  if (reports.isLoading) return <LoadingState />;
  if (reports.isError)
    return (
      <ErrorState
        message="Your reports could not be loaded."
        retry={() => void reports.refetch()}
      />
    );
  // Require explicit confirmation because deletion removes both public data and photos.
  const confirmDelete = (incident: Incident) =>
    Alert.alert(
      "Delete report?",
      "This permanently removes the public report and its photos.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteIncidentWithImages(incident.id, session.user.id);
              await queryClient.invalidateQueries({
                queryKey: incidentKeys.all,
              });
            } catch (error) {
              Alert.alert(
                "Could not delete",
                error instanceof Error
                  ? error.message
                  : "Try again. If photo cleanup succeeded, retrying is safe.",
              );
            }
          },
        },
      ],
    );
  return (
    <FlatList
      className="bg-canvas"
      contentContainerClassName="grow p-4"
      data={reports.items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <IncidentCard
          incident={item}
          actions={
            <>
              <ReportCardAction
                icon="create-outline"
                label="Edit"
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/report",
                    params: { edit: item.id },
                  })
                }
              />
              <ReportCardAction
                destructive
                icon="trash-outline"
                label="Delete"
                onPress={() => confirmDelete(item)}
              />
            </>
          }
        />
      )}
      ItemSeparatorComponent={() => null}
      refreshControl={
        <RefreshControl
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
          refreshing={reports.isRefetching}
          onRefresh={() => void reports.refetch()}
        />
      }
      ListEmptyComponent={
        <EmptyState
          title="No reports"
          message="Incidents you publish will appear here."
        />
      }
      onEndReached={() => {
        if (reports.hasNextPage) void reports.fetchNextPage();
      }}
    />
  );
}
