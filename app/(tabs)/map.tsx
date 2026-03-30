import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FilterChip } from "../../components/filter-chip";
import { StadiumMap } from "../../components/stadium-map";
import { StadiumStatusButton } from "../../components/stadium-status-button";
import { colors, spacing } from "../../constants/theme";
import { useStadiumCollections } from "../../lib/favorites";
import {
  capacityBands,
  featuredRegions,
  filterByRegion,
  formatCapacity,
  getGlobalRank,
  getRegionForCountry,
  hasCoordinates,
  matchesCapacityBand,
  stadiumMapUrl,
  stadiums,
  Stadium,
} from "../../lib/stadiums";

export default function MapScreen() {
  const [region, setRegion] = useState("World");
  const [capacityBand, setCapacityBand] = useState<(typeof capacityBands)[number]>("Alle");
  const [collectionFilter, setCollectionFilter] = useState<"all" | "favorites" | "visited" | "wishlist">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { favorites, visited, wishlist, isFavorite, isVisited, isWishlisted, toggleFavorite, toggleVisited, toggleWishlist } =
    useStadiumCollections();

  const regionStadiums = useMemo(
    () =>
      filterByRegion(stadiums, region)
        .filter((stadium) => matchesCapacityBand(stadium, capacityBand))
        .filter((stadium) => {
          switch (collectionFilter) {
            case "favorites":
              return favorites.includes(stadium.id);
            case "visited":
              return visited.some((entry) => entry.stadiumId === stadium.id);
            case "wishlist":
              return wishlist.includes(stadium.id);
            default:
              return true;
          }
        }),
    [capacityBand, collectionFilter, favorites, region, visited, wishlist]
  );

  const mappableRegionStadiums = regionStadiums.filter(hasCoordinates);
  const selectedStadium =
    regionStadiums.find((stadium) => stadium.id === selectedId) ??
    mappableRegionStadiums[0] ??
    regionStadiums[0] ??
    null;
  const selectedMapUrl = selectedStadium ? stadiumMapUrl(selectedStadium) : null;
  const previewStadiums = [...regionStadiums]
    .sort((a, b) => {
      const rankA = getGlobalRank(a) ?? Number.MAX_SAFE_INTEGER;
      const rankB = getGlobalRank(b) ?? Number.MAX_SAFE_INTEGER;
      return rankA - rankB;
    })
    .slice(0, 8);
  const regionCountries = new Set(regionStadiums.map((stadium) => stadium.country)).size;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageShell}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageEyebrow}>Map</Text>
            <Text style={styles.pageTitle}>Browse the stadium atlas geographically.</Text>
            <Text style={styles.pageText}>
              Filter by region, collection or size, then move between selected grounds without leaving the map flow.
            </Text>
          </View>

          <View style={styles.statRow}>
            <StatCard label="Region" value={region === "World" ? "Global" : region} />
            <StatCard label="Grounds" value={String(regionStadiums.length)} />
            <StatCard label="Mapped" value={String(mappableRegionStadiums.length)} />
            <StatCard label="Countries" value={String(regionCountries)} />
          </View>

          <View style={styles.filterShell}>
            <FilterBlock label="Region">
              <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
                {featuredRegions.map((option) => (
                  <FilterChip active={region === option} key={option} label={option} onPress={() => setRegion(option)} />
                ))}
              </ScrollView>
            </FilterBlock>

            <FilterBlock label="Capacity">
              <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
                {capacityBands.map((option) => (
                  <FilterChip
                    active={capacityBand === option}
                    key={option}
                    label={option}
                    onPress={() => setCapacityBand(option)}
                  />
                ))}
              </ScrollView>
            </FilterBlock>

            <FilterBlock label="Collection">
              <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
                <FilterChip active={collectionFilter === "all"} label="All" onPress={() => setCollectionFilter("all")} />
                <FilterChip
                  active={collectionFilter === "favorites"}
                  label={`Favorites (${favorites.length})`}
                  onPress={() => setCollectionFilter("favorites")}
                />
                <FilterChip
                  active={collectionFilter === "visited"}
                  label={`Visited (${visited.length})`}
                  onPress={() => setCollectionFilter("visited")}
                />
                <FilterChip
                  active={collectionFilter === "wishlist"}
                  label={`Wishlist (${wishlist.length})`}
                  onPress={() => setCollectionFilter("wishlist")}
                />
              </ScrollView>
            </FilterBlock>
          </View>

          <StadiumMap
            onSelect={(stadiumId) => setSelectedId(stadiumId)}
            selectedId={selectedStadium?.id ?? null}
            stadiums={regionStadiums}
          />

          {selectedStadium ? (
            <View style={styles.selectionCard}>
              <View style={styles.selectionHeader}>
                <View style={styles.selectionText}>
                  <Text style={styles.selectionEyebrow}>Selected Ground</Text>
                  <Text style={styles.selectionTitle}>{selectedStadium.team}</Text>
                  <Text style={styles.selectionSubtitle}>{selectedStadium.stadiumName}</Text>
                  <Text style={styles.selectionMeta}>
                    {selectedStadium.city} · {selectedStadium.country} · {selectedStadium.league}
                  </Text>
                </View>
              </View>

              <View style={styles.selectionStats}>
                <MiniStat label="Global rank" value={getGlobalRank(selectedStadium) ? `#${getGlobalRank(selectedStadium)}` : "None"} />
                <MiniStat label="Capacity" value={formatCapacity(selectedStadium.capacity)} />
                <MiniStat label="Opened" value={selectedStadium.opened ? String(selectedStadium.opened) : "Unknown"} />
              </View>

              <View style={styles.selectionActions}>
                <Pressable onPress={() => router.push(`/stadium/${selectedStadium.id}`)} style={styles.primaryAction}>
                  <Text style={styles.primaryActionText}>Open profile</Text>
                </Pressable>
                <Pressable
                  disabled={!selectedMapUrl}
                  onPress={() => selectedMapUrl && Linking.openURL(selectedMapUrl)}
                  style={styles.secondaryAction}
                >
                  <Text style={styles.secondaryActionText}>Open map</Text>
                </Pressable>
              </View>

              <View style={styles.selectionStatusRow}>
                <StadiumStatusButton
                  active={isVisited(selectedStadium.id)}
                  activeLabel="Visited"
                  inactiveLabel="Mark visited"
                  onPress={() => toggleVisited(selectedStadium.id)}
                  tone="visited"
                />
                <StadiumStatusButton
                  active={isWishlisted(selectedStadium.id)}
                  activeLabel="On wishlist"
                  inactiveLabel="Add wishlist"
                  onPress={() => toggleWishlist(selectedStadium.id)}
                  tone="wishlist"
                />
                <Pressable
                  onPress={() => toggleFavorite(selectedStadium.id)}
                  style={[styles.favoritePill, isFavorite(selectedStadium.id) ? styles.favoritePillActive : null]}
                >
                  <Text style={[styles.favoritePillText, isFavorite(selectedStadium.id) ? styles.favoritePillTextActive : null]}>
                    {isFavorite(selectedStadium.id) ? "Favorite" : "Save"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <EmptyPanel
              title="No grounds in this view"
              text="Try switching region, capacity or collection filter to bring mapped grounds back into focus."
            />
          )}

          <View style={styles.dualGrid}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionEyebrow}>Selection</Text>
              <Text style={styles.sectionTitle}>Grounds to jump into next</Text>
              <View style={styles.listColumn}>
                {previewStadiums.length ? (
                  previewStadiums.map((stadium) => (
                    <CompactGroundRow
                      active={stadium.id === selectedStadium?.id}
                      key={stadium.id}
                      onPress={() => setSelectedId(stadium.id)}
                      stadium={stadium}
                    />
                  ))
                ) : (
                  <EmptyPanel
                    title="No grounds match the filters"
                    text="There are no grounds in the current view. Reset one of the filters to continue browsing."
                  />
                )}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionEyebrow}>Coverage</Text>
              <Text style={styles.sectionTitle}>Regional distribution</Text>
              <View style={styles.regionGrid}>
                {featuredRegions
                  .filter((item) => item !== "World")
                  .map((item) => {
                    const count = stadiums.filter((stadium) => getRegionForCountry(stadium.country) === item).length;
                    return (
                      <View key={item} style={styles.regionCard}>
                        <Text style={styles.regionCardTitle}>{item}</Text>
                        <Text style={styles.regionCardText}>{count} grounds</Text>
                      </View>
                    );
                  })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterLabel}>{label}</Text>
      {children}
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

function CompactGroundRow({
  stadium,
  active,
  onPress,
}: {
  stadium: Stadium;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.groundRow, active ? styles.groundRowActive : null, pressed ? styles.groundRowPressed : null]}>
      <View style={styles.groundRowText}>
        <Text style={[styles.groundRowTeam, active ? styles.groundRowTeamActive : null]}>{stadium.team}</Text>
        <Text style={styles.groundRowMeta}>
          {stadium.stadiumName} · {stadium.city}
        </Text>
      </View>
      <Text style={[styles.groundRowRank, active ? styles.groundRowRankActive : null]}>
        {getGlobalRank(stadium) ? `#${getGlobalRank(stadium)}` : "—"}
      </Text>
    </Pressable>
  );
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.shell,
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  pageShell: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: 980,
    width: "100%",
  },
  pageHeader: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  pageEyebrow: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  pageTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
    textTransform: "uppercase",
  },
  pageText: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 640,
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 140,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
    textTransform: "uppercase",
  },
  filterShell: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  filterBlock: {
    gap: spacing.sm,
  },
  filterLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  selectionCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  selectionHeader: {
    gap: spacing.sm,
  },
  selectionText: {
    gap: 4,
  },
  selectionEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  selectionTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  selectionSubtitle: {
    color: colors.blueSoft,
    fontSize: 17,
    fontWeight: "700",
  },
  selectionMeta: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  selectionStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  miniStat: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 140,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  miniStatLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  miniStatValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  selectionActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  primaryAction: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryAction: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryActionText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  selectionStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  favoritePill: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  favoritePillActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  favoritePillText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  favoritePillTextActive: {
    color: colors.white,
  },
  dualGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.panel,
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
  listColumn: {
    gap: spacing.sm,
  },
  groundRow: {
    alignItems: "center",
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  groundRowActive: {
    backgroundColor: "#15233F",
    borderColor: "#294A87",
  },
  groundRowPressed: {
    opacity: 0.88,
  },
  groundRowText: {
    flex: 1,
    gap: 4,
  },
  groundRowTeam: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  groundRowTeamActive: {
    color: colors.white,
  },
  groundRowMeta: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  groundRowRank: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  groundRowRankActive: {
    color: colors.blueSoft,
  },
  regionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  regionCard: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 130,
    padding: spacing.md,
  },
  regionCardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  regionCardText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  emptyPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 24,
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
