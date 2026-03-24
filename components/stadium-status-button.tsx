import { GestureResponderEvent, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../constants/theme";

type StadiumStatusButtonProps = {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onPress: (event?: GestureResponderEvent) => void;
  tone?: "visited" | "wishlist";
};

export function StadiumStatusButton({
  active,
  activeLabel,
  inactiveLabel,
  onPress,
  tone = "visited",
}: StadiumStatusButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === "visited" ? styles.visited : styles.wishlist,
        active && (tone === "visited" ? styles.visitedActive : styles.wishlistActive),
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          tone === "visited" ? styles.visitedLabel : styles.wishlistLabel,
          active && (tone === "visited" ? styles.visitedLabelActive : styles.wishlistLabelActive),
        ]}
      >
        {active ? activeLabel : inactiveLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pressed: {
    opacity: 0.86,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
  },
  visited: {
    backgroundColor: colors.white,
    borderColor: colors.moss,
  },
  visitedActive: {
    backgroundColor: colors.moss,
  },
  visitedLabel: {
    color: colors.moss,
  },
  visitedLabelActive: {
    color: colors.white,
  },
  wishlist: {
    backgroundColor: colors.white,
    borderColor: colors.gold,
  },
  wishlistActive: {
    backgroundColor: "#F7E9C8",
  },
  wishlistLabel: {
    color: colors.gold,
  },
  wishlistLabelActive: {
    color: colors.ink,
  },
});
