import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Udforsk",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="earth-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Gemte",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="bookmark-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Kort",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="map-outline" size={size} />,
        }}
      />
    </Tabs>
  );
}
