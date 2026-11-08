import type { ExpoConfig, ConfigContext } from "expo/config";

/** Returns a configured value or the safe build-time fallback supplied by the caller. */
const requireValue = (value: string | undefined, fallback: string) =>
  value || fallback;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Citizens",
  slug: "citizens",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "citizens",
  userInterfaceStyle: "light",
  platforms: ["ios", "android"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.citizens.reporting",
    icon: "./assets/expo.icon",
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        "Choose photos that help document an incident.",
    },
  },
  android: {
    package: "com.citizens.reporting",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    config: {
      googleMaps: {
        apiKey: requireValue(
          process.env.GOOGLE_MAPS_ANDROID_API_KEY,
          "SET_IN_EAS",
        ),
      },
    },
    predictiveBackGestureEnabled: true,
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow Citizens to use your location when you report an incident. Public reports include the selected location.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Allow Citizens to select incident photos.",
        cameraPermission: "Allow Citizens to take incident photos.",
      },
    ],
    [
      "expo-notifications",
      { color: "#2563EB", defaultChannel: "new-incidents" },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#2563EB",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: {
    eas: {
      projectId:
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
        "6719e56f-d0ca-4c3c-bb74-77d28b8750b1",
    },
  },
});
