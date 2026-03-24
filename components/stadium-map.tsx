import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";
import { Stadium } from "../lib/stadiums";

type StadiumMapProps = {
  stadiums: Stadium[];
  onSelect: (stadiumId: string) => void;
  selectedId?: string | null;
};

export function StadiumMap({ stadiums, onSelect, selectedId }: StadiumMapProps) {
  const topCountries = [...new Set(stadiums.map((stadium) => stadium.country))]
    .map((country) => ({
      country,
      count: stadiums.filter((stadium) => stadium.country === country).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <View style={styles.frame}>
      <Text style={styles.title}>Geografisk overblik</Text>
      <Text style={styles.text}>
        Native-iOS-versionen vil bruge et rigtigt kort her. På web viser vi foreløbig en geografisk oversigt, så den
        delte kodebase stadig bygger rent.
      </Text>
      <View style={styles.summaryRow}>
        <StatCard label="Stadions" value={String(stadiums.length)} />
        <StatCard label="Lande" value={String(new Set(stadiums.map((stadium) => stadium.country)).size)} />
        <StatCard label="Ligaer" value={String(new Set(stadiums.map((stadium) => stadium.league)).size)} />
      </View>
      <View style={styles.countryGrid}>
        {topCountries.map((entry) => (
          <Pressable
            key={entry.country}
            onPress={() => {
              const firstMatch = stadiums.find((stadium) => stadium.country === entry.country);
              if (firstMatch) {
                onSelect(firstMatch.id);
              }
            }}
            style={[styles.countryCard, selectedId && stadiums.some((stadium) => stadium.id === selectedId && stadium.country === entry.country) && styles.countryCardActive]}
          >
            <Text style={styles.countryName}>{entry.country}</Text>
            <Text style={styles.countryCount}>{entry.count} stadions</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
  },
  text: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    minWidth: 110,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statValue: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  countryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  countryCard: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 150,
    padding: spacing.md,
  },
  countryCardActive: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  countryName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  countryCount: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
