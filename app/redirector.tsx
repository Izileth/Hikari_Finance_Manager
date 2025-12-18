import { Redirect } from "expo-router";

export default function RedirectorScreen() {
  // Always redirect to the feed screen, bypassing auth check for now.
  return <Redirect href="/(tabs)/feed" />;
}
