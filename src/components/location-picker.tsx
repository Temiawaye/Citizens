import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import MapView, { Marker, type MapPressEvent } from "react-native-maps";

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  address: string | null;
}
const DEFAULT_LOCATION = { latitude: 6.5244, longitude: 3.3792 };

/** Reverse-geocodes coordinates and returns a readable address when available. */
async function addressFor(latitude: number, longitude: number) {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return place
      ? [place.name, place.street, place.city, place.region]
          .filter(Boolean)
          .join(", ")
      : null;
  } catch {
    return null;
  }
}

/** Lets the user select a public incident location from GPS or the map. */
export function LocationPicker({
  value,
  onChange,
}: {
  value: SelectedLocation | null;
  onChange: (location: SelectedLocation) => void;
}) {
  const [loading, setLoading] = useState(false);
  const map = useRef<MapView>(null);
  // Falls back to manual map selection when location permission or GPS is unavailable.
  const locate = async () => {
    setLoading(true);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setLoading(false);
      onChange({ ...DEFAULT_LOCATION, address: null });
      return Alert.alert(
        "Location permission denied",
        "Move the pin manually to the incident. You can enable location in Settings.",
        [
          { text: "Continue manually" },
          { text: "Open Settings", onPress: () => void Linking.openSettings() },
        ],
      );
    }
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const point = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      onChange({
        ...point,
        address: await addressFor(point.latitude, point.longitude),
      });
    } catch {
      Alert.alert(
        "Location unavailable",
        "Move the map pin manually to select the public incident location.",
      );
      onChange({ ...DEFAULT_LOCATION, address: null });
    } finally {
      setLoading(false);
    }
  };
  // Publishes coordinates immediately, then enriches them without blocking selection.
  const select = async (point: { latitude: number; longitude: number }) => {
    onChange({ ...point, address: null });
    const address = await addressFor(point.latitude, point.longitude);
    onChange({ ...point, address });
  };
  const center = value ?? { ...DEFAULT_LOCATION, address: null };
  useEffect(() => {
    if (value)
      map.current?.animateToRegion(
        {
          latitude: value.latitude,
          longitude: value.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        300,
      );
  }, [value]);
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-slate-700">
          Public incident location
        </Text>
        <Pressable
          disabled={loading}
          onPress={() => void locate()}
          className="min-h-11 justify-center px-3"
        >
          <Text className="font-semibold text-brand-600">
            {loading ? "Locating…" : "Use my location"}
          </Text>
        </Pressable>
      </View>
      <MapView
        ref={map}
        className="h-64 w-full rounded-2xl"
        initialRegion={{ ...center, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
        onPress={(event: MapPressEvent) =>
          void select(event.nativeEvent.coordinate)
        }
      >
        {value ? (
          <Marker
            coordinate={value}
            draggable
            onDragEnd={(event) => void select(event.nativeEvent.coordinate)}
          />
        ) : null}
      </MapView>
      <Text className="text-sm text-slate-600">
        {value
          ? value.address ||
            `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
          : "Tap “Use my location” or tap the map to place a pin."}
      </Text>
      <Text className="text-sm font-medium text-amber-700">
        This exact location will be publicly visible.
      </Text>
    </View>
  );
}
