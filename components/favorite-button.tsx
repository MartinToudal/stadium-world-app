import { GestureResponderEvent, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../constants/theme";

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
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  active: {
    backgroundColor: "#FFF0D6",
    borderColor: colors.accentSoft,
  },
  pressed: {
    opacity: 0.86,
  },
  icon: {
    color: colors.muted,
    fontSize: 20,
  },
  activeIcon: {
    color: colors.accent,
  },
});
