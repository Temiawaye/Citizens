import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Pressable, Text, View } from "react-native";

import { MAX_IMAGES } from "@/lib/constants";

/** Displays selected incident photos and lets the user add or remove images. */
export function ImagePickerGrid({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  // Requests only the permission needed for the source the user selected.
  const add = async (source: "camera" | "library") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return Alert.alert(
        "Permission needed",
        `Allow ${source === "camera" ? "camera" : "photo library"} access in Settings to attach evidence.`,
        [
          { text: "Cancel" },
          { text: "Open Settings", onPress: () => void Linking.openSettings() },
        ],
      );
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 1,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
            allowsMultipleSelection: true,
            selectionLimit: MAX_IMAGES - images.length,
          });
    if (!result.canceled)
      onChange(
        [...images, ...result.assets.map((asset) => asset.uri)].slice(
          0,
          MAX_IMAGES,
        ),
      );
  };
  return (
    <View className="gap-3">
      <Text className="font-semibold text-muted">
        Photos ({images.length}/{MAX_IMAGES})
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {images.map((uri, index) => (
          <View key={uri} className="relative">
            <Image
              source={uri}
              accessibilityLabel={`Selected photo ${index + 1}`}
              className="h-24 w-24 rounded-control"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${index + 1}`}
              hitSlop={8}
              onPress={() => onChange(images.filter((item) => item !== uri))}
              className="absolute -right-2 -top-2 h-11 w-11 items-center justify-center rounded-full bg-danger-600 active:opacity-70"
            >
              <Text className="text-xl font-bold text-white">×</Text>
            </Pressable>
          </View>
        ))}
      </View>
      {images.length < MAX_IMAGES ? (
        <View className="flex-row flex-wrap gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Opens the camera"
            onPress={() => void add("camera")}
            className="min-h-12 min-w-32 flex-1 items-center justify-center rounded-control border border-outline bg-surface px-3 active:bg-brand-50"
          >
            <Text className="text-center font-semibold text-ink">
              Take photo
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Opens your photo library"
            onPress={() => void add("library")}
            className="min-h-12 min-w-32 flex-1 items-center justify-center rounded-control border border-outline bg-surface px-3 active:bg-brand-50"
          >
            <Text className="text-center font-semibold text-ink">
              Choose photos
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
