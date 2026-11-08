import { Redirect } from "expo-router";
/** Redirects the root route to the primary tab navigator. */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
