import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACTIVE_COLOR = "#f8fafc";
const INACTIVE_COLOR = "#7c8491";
const NAV_BACKGROUND = "#191b20";

/** Renders a compact page title while retaining the platform status-bar safe area. */
function CompactPageHeader({ title }: { title: string }) {
  return (
    <SafeAreaView edges={["top"]} className="bg-white">
      <View className="h-14 justify-center px-5">
        <Text accessibilityRole="header" className="text-2xl font-bold text-ink">
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
}

/** Selects the active or inactive icon for a standard bottom-navigation item. */
function StandardTabIcon({
  focused,
  active,
  inactive,
}: {
  focused: boolean;
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Ionicons
      name={focused ? active : inactive}
      color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      size={23}
    />
  );
}

/** Renders the elevated center action used for incident reporting. */
function ReportTabIcon({ focused }: { focused: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`h-16 w-16 items-center justify-center rounded-full border-4 ${focused ? "border-brand-500 bg-white" : "border-[#191b20] bg-white"}`}
      style={{ transform: [{ translateY: -19 }] }}
    >
      <Ionicons
        name={focused ? "megaphone" : "megaphone-outline"}
        color={focused ? "#1d4ed8" : NAV_BACKGROUND}
        size={27}
      />
    </View>
  );
}

/** Configures the primary five-destination bottom navigation. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: ({ options }) => (
          <CompactPageHeader title={options.title ?? ""} />
        ),
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginTop: 2 },
        tabBarItemStyle: { paddingTop: 9 },
        tabBarStyle: {
          backgroundColor: NAV_BACKGROUND,
          borderTopColor: "transparent",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 88 : 72,
          paddingBottom: Platform.OS === "ios" ? 22 : 8,
          paddingTop: 4,
          marginBottom: 54,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Reports",
          tabBarAccessibilityLabel: "Public reports",
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon
              focused={focused}
              active="newspaper"
              inactive="newspaper-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarAccessibilityLabel: "Report categories",
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon
              focused={focused}
              active="grid"
              inactive="grid-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarAccessibilityLabel: "Create a report",
          tabBarIcon: ({ focused }) => <ReportTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="my-reports"
        options={{
          title: "My Reports",
          tabBarAccessibilityLabel: "My reports",
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon
              focused={focused}
              active="time"
              inactive="time-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon
              focused={focused}
              active="person"
              inactive="person-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}
