import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { CATEGORIES } from "@/lib/constants";

/** Lists incident categories and opens the public feed with the chosen filter. */
export default function CategoriesScreen() {
  return (
    <FlatList
      className="bg-slate-50"
      contentContainerClassName="p-4"
      data={CATEGORIES}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.navigate({ pathname: "/(tabs)", params: { category: item } })
          }
          className="mb-3 min-h-16 flex-row items-center justify-between rounded-2xl border-b border-b-slate-200 p-4"
        >
          <View className={`rounded-full px-3 py-2 `}>
            <Text className="font-semibold">{item}</Text>
          </View>
          <Text className="text-2xl text-slate-400">›</Text>
        </Pressable>
      )}
    />
  );
}
