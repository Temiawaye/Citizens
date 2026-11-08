import { router } from "expo-router";
import { FlatList, Pressable, Text } from "react-native";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";

/** Lists incident categories and opens the public feed with the chosen filter. */
export default function CategoriesScreen() {
  return (
    <FlatList
      className="bg-canvas"
      contentContainerClassName="p-4"
      data={CATEGORIES}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.navigate({ pathname: "/(tabs)", params: { category: item } })
          }
          accessibilityRole="button"
          accessibilityLabel={`View ${item} reports`}
          className="mb-3 min-h-16 flex-row items-center justify-between rounded-2xl border-b border-outline p-4 active:bg-brand-50"
        >
          <Text
            className={`rounded-full px-3 py-2 font-semibold `}
          >
            {item}
          </Text>
          <Text className="text-2xl text-muted">›</Text>
        </Pressable>
      )}
    />
  );
}
