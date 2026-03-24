import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "../constants/theme";
import { FavoritesProvider } from "../lib/favorites";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.paper },
            headerShadowVisible: false,
            headerTintColor: colors.ink,
            headerTitleStyle: {
              color: colors.ink,
              fontWeight: "800",
            },
            contentStyle: {
              backgroundColor: colors.paper,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="stadium/[id]" options={{ title: "Stadion" }} />
        </Stack>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}
