import { GestureResponderEvent, Pressable, StyleSheet, Text } from "react-native";

type FavoriteButtonProps = {
  active: boolean;
  onPress: (event?: GestureResponderEvent) => void;
};

export function FavoriteButton({ active, onPress }: FavoriteButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, active && styles.active, pressed && styles.pressed]}>
      <Text style={[styles.icon, active && styles.activeIcon]}>{active ? "★" : "☆"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  active: {
    backgroundColor: "#262626",
    borderColor: "#404040",
  },
  pressed: {
    opacity: 0.86,
  },
  icon: {
    color: "#A3A3A3",
    fontSize: 20,
  },
  activeIcon: {
    color: "#FAFAFA",
  },
});
