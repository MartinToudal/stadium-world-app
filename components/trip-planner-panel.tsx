import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";
import { useStadiumCollections } from "../lib/favorites";
import { Stadium, stadiums } from "../lib/stadiums";

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getTopGroup(items: Stadium[], key: "country" | "region" | "league") {
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

function getLatestVisits(entries: { stadiumId: string; visitedOn: string | null }[], limit: number) {
  return [...entries]
    .filter((entry) => entry.visitedOn)
    .sort((a, b) => (b.visitedOn ?? "").localeCompare(a.visitedOn ?? ""))
    .slice(0, limit);
}

function getVisitsThisYear(entries: { visitedOn: string | null }[]) {
  const currentYear = String(new Date().getFullYear());
  return entries.filter((entry) => entry.visitedOn?.startsWith(currentYear)).length;
}

export function TripPlannerPanel() {
  const { favorites, visited, wishlist } = useStadiumCollections();

  const visitedStadiums = stadiums.filter((stadium) => visited.some((entry) => entry.stadiumId === stadium.id));
  const wishlistStadiums = stadiums.filter((stadium) => wishlist.includes(stadium.id));
  const favoriteStadiums = stadiums.filter((stadium) => favorites.includes(stadium.id));

  const coverage = stadiums.length ? Math.round((visitedStadiums.length / stadiums.length) * 100) : 0;
  const visitsThisYear = getVisitsThisYear(visited);
  const topVisitedCountry = getTopGroup(visitedStadiums, "country");
  const topVisitedLeague = getTopGroup(visitedStadiums, "league");
  const topWishlistRegion = getTopGroup(wishlistStadiums, "region");
  const visitedCountries = new Set(visitedStadiums.map((stadium) => stadium.country)).size;
  const visitedLeagues = new Set(visitedStadiums.map((stadium) => stadium.league)).size;
  const recentVisits = getLatestVisits(visited, 3)
    .map((entry) => ({
      visitedOn: entry.visitedOn,
      stadium: stadiums.find((stadium) => stadium.id === entry.stadiumId) ?? null,
    }))
    .filter((item): item is { visitedOn: string; stadium: Stadium } => Boolean(item.visitedOn && item.stadium));
  const wishlistClusters = [...getWishlistClusters(wishlistStadiums)]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>My Tour</Text>
          <Text style={styles.title}>Keep a clean record of where you have been and where you want to go next.</Text>
          <Text style={styles.text}>
            This is your personal ground log: visits, dates, favourite stops and the countries or leagues where your tour is starting to take shape.
          </Text>
        </View>
        <View style={styles.coverageCard}>
          <Text style={styles.coverageValue}>{coverage}%</Text>
          <Text style={styles.coverageLabel}>of the full stadium list marked as visited</Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <MetricCard label="Visited grounds" value={String(visitedStadiums.length)} helper="Every ground you have actively logged." />
        <MetricCard label="Visits this year" value={String(visitsThisYear)} helper="Based on visits with a saved date in the current year." />
        <MetricCard label="Countries" value={String(visitedCountries)} helper="How many countries your recorded visits already cover." />
        <MetricCard label="Leagues" value={String(visitedLeagues)} helper="How broad your tour is across different competitions." />
      </View>

      <View style={styles.dualGrid}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Highlights</Text>
          <Text style={styles.sectionTitle}>Current shape of your tour</Text>

          <View style={styles.summaryList}>
            <SummaryRow
              label="Strongest country"
              value={topVisitedCountry?.[0] ?? "No visits yet"}
              helper={
                topVisitedCountry
                  ? `${pluralize(topVisitedCountry[1], "visited ground", "visited grounds")} in the same country`
                  : "Start by marking your first ground as visited."
              }
            />
            <SummaryRow
              label="Most visited league"
              value={topVisitedLeague?.[0] ?? "No league yet"}
              helper={
                topVisitedLeague
                  ? `${pluralize(topVisitedLeague[1], "logged ground", "logged grounds")} in this league`
                  : "Your league spread appears once you begin saving visits."
              }
            />
            <SummaryRow
              label="Wishlist focus"
              value={topWishlistRegion?.[0] ?? "No wishlist focus yet"}
              helper={
                topWishlistRegion
                  ? `${pluralize(topWishlistRegion[1], "ground", "grounds")} already point to this region`
                  : "Add a few grounds to wishlist to surface travel patterns."
              }
            />
            <SummaryRow
              label="Favourites"
              value={String(favoriteStadiums.length)}
              helper={
                favoriteStadiums.length
                  ? `${pluralize(favoriteStadiums.length, "priority stop", "priority stops")} marked with a star`
                  : "Use favourites to highlight the grounds that matter most."
              }
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Recent Log</Text>
          <Text style={styles.sectionTitle}>Latest recorded visits</Text>

          {recentVisits.length ? (
            <View style={styles.timeline}>
              {recentVisits.map((item, index) => (
                <View key={`${item.stadium.id}-${item.visitedOn}`} style={styles.timelineRow}>
                  <View style={styles.timelineMarker}>
                    <Text style={styles.timelineIndex}>{String(index + 1).padStart(2, "0")}</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTeam}>{item.stadium.team}</Text>
                    <Text style={styles.timelineMeta}>
                      {item.stadium.stadiumName} · {item.stadium.city}
                    </Text>
                    <Text style={styles.timelineDate}>{item.visitedOn}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              title="No dated visits yet"
              text="As soon as you save visit dates, your latest grounds will appear here and start building a real tour timeline."
            />
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionEyebrow}>Wishlist Clusters</Text>
        <Text style={styles.sectionTitle}>Countries that already look like a future trip</Text>
        <Text style={styles.sectionText}>
          When multiple wishlist grounds sit in the same country, they become the clearest candidates for a focused football weekend.
        </Text>

        {wishlistClusters.length ? (
          <View style={styles.clusterGrid}>
            {wishlistClusters.map(([country, items]) => (
              <View key={country} style={styles.clusterCard}>
                <Text style={styles.clusterCountry}>{country}</Text>
                <Text style={styles.clusterCount}>{pluralize(items.length, "ground", "grounds")}</Text>
                <Text style={styles.clusterTeams}>{items.map((item) => item.team).slice(0, 3).join(" · ")}</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="No wishlist clusters yet"
            text="Start starring a few future grounds and this section will begin to point out natural country-based trips."
          />
        )}
      </View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryHelper}>{helper}</Text>
    </View>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
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
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    maxWidth: 760,
  },
  text: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 760,
  },
  coverageCard: {
    alignSelf: "flex-start",
    backgroundColor: colors.blue,
    borderRadius: 22,
    minWidth: 200,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  coverageValue: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "900",
  },
  coverageLabel: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    opacity: 0.86,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 180,
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  metricValue: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 10,
  },
  metricHelper: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  dualGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 280,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  sectionText: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 24,
  },
  summaryList: {
    gap: spacing.md,
  },
  summaryRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: 6,
    paddingTop: spacing.md,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  summaryHelper: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  timeline: {
    gap: spacing.md,
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineMarker: {
    alignItems: "center",
    backgroundColor: colors.shell,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  timelineIndex: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  timelineContent: {
    flex: 1,
    gap: 4,
  },
  timelineTeam: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  timelineMeta: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  timelineDate: {
    color: colors.blueSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  clusterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  clusterCard: {
    backgroundColor: colors.shell,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 200,
    padding: spacing.md,
  },
  clusterCountry: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  clusterCount: {
    color: colors.blueSoft,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 8,
    textTransform: "uppercase",
  },
  clusterTeams: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  emptyState: {
    backgroundColor: colors.shell,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
});
