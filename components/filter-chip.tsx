import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../constants/theme";

type FilterChipProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

export function FilterChip({ active, label, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.activeChip : styles.inactiveChip,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  activeChip: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  inactiveChip: {
    backgroundColor: colors.white,
    borderColor: colors.line,
  },
  activeLabel: {
    color: colors.white,
  },
  inactiveLabel: {
    color: colors.ink,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
