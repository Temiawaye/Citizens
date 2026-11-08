import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ErrorState, LoadingState } from "@/components/screen-state";
import { useIncident } from "@/hooks/use-incidents";
import { CATEGORY_COLORS } from "@/lib/constants";
import { COLORS } from "@/lib/theme";

/** Loads and renders a complete incident with imagery, location, and map actions. */
export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = useIncident(id);
  if (incident.isLoading) return <LoadingState />;
  if (incident.isError)
    return (
      <ErrorState
        message="This report could not be loaded."
        retry={() => void incident.refetch()}
      />
    );
  if (!incident.data)
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-canvas p-8">
        <Text className="text-xl font-bold text-heading">
          Report unavailable
        </Text>
        <Text className="text-center text-muted">
          It may have been deleted by its reporter.
        </Text>
      </View>
    );
  const item = incident.data;
  // Use each platform's native map URL format for familiar handoff behavior.
  const openMaps = () => {
    const label = encodeURIComponent(item.title);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${item.latitude},${item.longitude}`,
      android: `geo:${item.latitude},${item.longitude}?q=${item.latitude},${item.longitude}(${label})`,
    });
    if (url) void Linking.openURL(url);
  };
  return (
    <ScrollView className="bg-canvas" contentContainerClassName="pb-12">
      {item.image_urls.length ? (
        <FlatList
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={item.image_urls}
          keyExtractor={(url) => url}
          renderItem={({ item: url }) => (
            <Image source={url} contentFit="cover" className="h-72 w-screen" />
          )}
        />
      ) : null}
      <View className="gap-4 p-5">
        <Text
          className={`self-start rounded-full px-3 py-2 font-semibold ${CATEGORY_COLORS[item.category]}`}
        >
          {item.category}
        </Text>
        <Text className="text-3xl font-bold text-heading">{item.title}</Text>
        <Text className="text-sm text-muted">
          Reported by {item.reporter_name} ·{" "}
          {new Date(item.created_at).toLocaleString()}
        </Text>
        <Text className="text-base leading-6 text-ink">
          {item.description}
        </Text>
        <MapView
          className="h-64 w-full rounded-2xl"
          initialRegion={{
            latitude: item.latitude,
            longitude: item.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            pinColor={COLORS.location}
            title={item.title}
          />
        </MapView>
        <Text className="text-muted">
          {item.address || `${item.latitude}, ${item.longitude}`}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={openMaps}
          accessibilityLabel="Open incident location in Maps"
          className="min-h-12 items-center justify-center rounded-xl bg-location active:opacity-75"
        >
          <Text className="font-semibold text-white">Open in Maps</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
