import { Pressable, Text } from "react-native";
import type { IncidentCategory } from "@/types/database";

/** Renders a selectable category filter and reports its selected state to assistive tools. */
export function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: IncidentCategory | "All";
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${label}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`mr-2 min-h-11 justify-center rounded-full border px-4 active:opacity-70 ${selected ? "border-brand-600 bg-brand-50" : "border-outline bg-surface"}`}
    >
      <Text className={`font-semibold ${selected ? "text-brand-600" : "text-muted"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
