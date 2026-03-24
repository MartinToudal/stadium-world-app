import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";
import { useStadiumCollections } from "../lib/favorites";
import { Stadium, stadiums } from "../lib/stadiums";

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getTopGroup(items: Stadium[], key: "country" | "region") {
  if (!items.length) {
    return null;
  }

  const counts = new Map<string, number>();

  for (const item of items) {
    const value = item[key];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
}

function getWishlistClusters(items: Stadium[]) {
  return [...items]
    .reduce((map, stadium) => {
      const current = map.get(stadium.country) ?? [];
      map.set(stadium.country, [...current, stadium]);
      return map;
    }, new Map<string, Stadium[]>())
    .entries();
}

export function TripPlannerPanel() {
  const { favorites, visited, wishlist } = useStadiumCollections();

  const visitedStadiums = stadiums.filter((stadium) => visited.includes(stadium.id));
  const wishlistStadiums = stadiums.filter((stadium) => wishlist.includes(stadium.id));
  const favoriteStadiums = stadiums.filter((stadium) => favorites.includes(stadium.id));

  const coverage = stadiums.length ? Math.round((visitedStadiums.length / stadiums.length) * 100) : 0;
  const topWishlistRegion = getTopGroup(wishlistStadiums, "region");
  const topVisitedCountry = getTopGroup(visitedStadiums, "country");
  const wishlistClusters = [...getWishlistClusters(wishlistStadiums)]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Trip Planner</Text>
          <Text style={styles.title}>Gør dine gemte stadioner til en konkret rejseplan.</Text>
          <Text style={styles.text}>
            Brug oversigten her til at se, hvor du allerede har momentum, og hvor næste stadiontur giver mest mening.
          </Text>
        </View>
        <View style={styles.progressCard}>
          <Text style={styles.progressValue}>{coverage}%</Text>
          <Text style={styles.progressLabel}>af datasættet markeret som besøgt</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <InsightCard
          label="Næste fokusregion"
          value={topWishlistRegion?.[0] ?? "Vælg et wishlist-mål"}
          helper={
            topWishlistRegion
              ? `${pluralize(topWishlistRegion[1], "stadion", "stadioner")} ligger allerede klar her`
              : "Begynd med at lægge stadioner i wishlist"
          }
        />
        <InsightCard
          label="Stærkeste besøgsspor"
          value={topVisitedCountry?.[0] ?? "Ingen besøg endnu"}
          helper={
            topVisitedCountry
              ? `${pluralize(topVisitedCountry[1], "besøgt stadion", "besøgte stadioner")} i samme land`
              : "Markér et stadion som besøgt for at starte historikken"
          }
        />
        <InsightCard
          label="Kuraterede favoritter"
          value={String(favoriteStadiums.length)}
          helper={
            favoriteStadiums.length
              ? `${pluralize(favoriteStadiums.length, "favorit", "favoritter")} kan bruges som prioritering`
              : "Brug stjerner til at fremhæve de vigtigste stop"
          }
        />
      </View>

      <View style={styles.clusterSection}>
        <Text style={styles.clusterTitle}>Wishlist-klynger</Text>
        <Text style={styles.clusterText}>
          Når flere stadioner ligger i samme land, er de oplagte at samle i én tur.
        </Text>
        {wishlistClusters.length ? (
          <View style={styles.clusterGrid}>
            {wishlistClusters.map(([country, items]) => (
              <View key={country} style={styles.clusterCard}>
                <Text style={styles.clusterCountry}>{country}</Text>
                <Text style={styles.clusterCount}>{pluralize(items.length, "stadion", "stadioner")}</Text>
                <Text style={styles.clusterTeams}>{items.map((item) => item.team).slice(0, 3).join(" · ")}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ingen wishlist-klynger endnu</Text>
            <Text style={styles.emptyText}>
              Tilføj et par stadioner til wishlist, så begynder appen at pege på oplagte ture.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function InsightCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{value}</Text>
      <Text style={styles.insightHelper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  header: {
    gap: spacing.md,
  },
  headerText: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    maxWidth: 720,
  },
  text: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 720,
  },
  progressCard: {
    alignSelf: "flex-start",
    backgroundColor: colors.ink,
    borderRadius: 24,
    minWidth: 180,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressValue: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "900",
  },
  progressLabel: {
    color: "#EADBC7",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  insightCard: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 180,
    padding: spacing.md,
  },
  insightLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  insightValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  insightHelper: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  clusterSection: {
    gap: spacing.sm,
  },
  clusterTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
  },
  clusterText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  clusterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  clusterCard: {
    backgroundColor: colors.paper,
    borderRadius: 20,
    flexGrow: 1,
    minWidth: 180,
    padding: spacing.md,
  },
  clusterCountry: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  clusterCount: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
    textTransform: "uppercase",
  },
  clusterTeams: {
    color: colors.navy,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  emptyState: {
    backgroundColor: colors.paper,
    borderRadius: 20,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
});
