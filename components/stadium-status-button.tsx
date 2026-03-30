import { GestureResponderEvent, Pressable, StyleSheet, Text } from "react-native";

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
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
  },
  visitedActive: {
    backgroundColor: "#262626",
    borderColor: "#404040",
  },
  visitedLabel: {
    color: "#D4D4D4",
  },
  visitedLabelActive: {
    color: "#FAFAFA",
  },
  wishlist: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
  },
  wishlistActive: {
    backgroundColor: "#262626",
    borderColor: "#404040",
  },
  wishlistLabel: {
    color: "#D4D4D4",
  },
  wishlistLabelActive: {
    color: "#FAFAFA",
  },
});
