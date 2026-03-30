import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useDeferredValue, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../constants/theme";
import { useStadiumCollections } from "../lib/favorites";
import {
  allLeagues,
  allCountries,
  capacityBands,
  featuredLeagues,
  formatCapacity,
  getLeagueRank,
  matchesCapacityBand,
  stadiums,
  Stadium,
} from "../lib/stadiums";
import { FilterChip } from "./filter-chip";
import { TripPlannerPanel } from "./trip-planner-panel";

type StadiumBrowserProps = {
  defaultCollectionFilter?: "all" | "favorites" | "visited" | "wishlist";
  heroTitle: string;
  heroText: string;
  panelTitle: string;
  showCollectionFilters?: boolean;
  showTripPlanner?: boolean;
};

type StadiumRow = {
  item: Stadium;
  rank: number | null;
};

export function StadiumBrowser({
  defaultCollectionFilter = "all",
  heroTitle,
  heroText,
  panelTitle,
  showCollectionFilters = false,
  showTripPlanner = false,
}: StadiumBrowserProps) {
  const [query, setQuery] = useState("");
  const [league, setLeague] = useState<string>("Alle");
  const [leagueMenuOpen, setLeagueMenuOpen] = useState(false);
  const [country, setCountry] = useState<string>("Alle");
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [capacityBand, setCapacityBand] = useState<(typeof capacityBands)[number]>("Alle");
  const [collectionFilter, setCollectionFilter] = useState(defaultCollectionFilter);
  const { favorites, visited, wishlist, isFavorite, isVisited, isWishlisted, getVisitedDate } = useStadiumCollections();
  const deferredQuery = useDeferredValue(query);

  const rows = useMemo<StadiumRow[]>(() => {
    const trimmedQuery = deferredQuery.trim().toLowerCase();

    const filtered = stadiums
      .filter((stadium) => (league === "Alle" ? true : stadium.league === league))
      .filter((stadium) => (country === "Alle" ? true : stadium.country === country))
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
      })
      .filter((stadium) => {
        if (!trimmedQuery) {
          return true;
        }

        const haystack =
          `${stadium.team} ${stadium.stadiumName} ${stadium.city} ${stadium.country} ${stadium.league} ${stadium.aliases.join(" ")} ${stadium.tags.join(" ")}`.toLowerCase();
        return haystack.includes(trimmedQuery);
      })
      .map((item) => ({ item, rank: getLeagueRank(item) }));

    return filtered.sort((a, b) => {
      if (league !== "Alle") {
        if (a.rank != null && b.rank != null) {
          return a.rank - b.rank;
        }
        if (a.rank != null) {
          return -1;
        }
        if (b.rank != null) {
          return 1;
        }
      }

      const aLeagueIndex = featuredLeagues.indexOf(a.item.league);
      const bLeagueIndex = featuredLeagues.indexOf(b.item.league);
      const leagueOrder =
        (aLeagueIndex === -1 ? Number.MAX_SAFE_INTEGER : aLeagueIndex) -
        (bLeagueIndex === -1 ? Number.MAX_SAFE_INTEGER : bLeagueIndex);

      if (league === "Alle" && leagueOrder !== 0) {
        return leagueOrder;
      }

      return a.item.team.localeCompare(b.item.team);
    });
  }, [capacityBand, collectionFilter, country, deferredQuery, favorites, league, visited, wishlist]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>STADIUM DIRECTORY</Text>
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          <Text style={styles.heroText}>{heroText}</Text>
        </View>

        {showTripPlanner ? <TripPlannerPanel /> : null}

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>League Table</Text>
              <Text style={styles.panelTitle}>{panelTitle}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{rows.length}</Text>
            </View>
          </View>

          <TextInput
            onChangeText={setQuery}
            placeholder="Start typing to see suggestions"
            placeholderTextColor="#A09AA4"
            style={styles.searchInput}
            value={query}
          />

          <View style={styles.filterGrid}>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>League</Text>
              <View style={styles.dropdownWrap}>
                <Pressable
                  onPress={() => {
                    setLeagueMenuOpen((value) => !value);
                    setCountryMenuOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.dropdownTrigger,
                    leagueMenuOpen && styles.dropdownTriggerOpen,
                    pressed && styles.dropdownTriggerPressed,
                  ]}
                >
                  <Text style={styles.dropdownValue}>{league}</Text>
                  <Text style={styles.dropdownIcon}>{leagueMenuOpen ? "▴" : "▾"}</Text>
                </Pressable>

                {leagueMenuOpen ? (
                  <View style={styles.dropdownMenu}>
                    <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                      {["Alle", ...allLeagues].map((option) => (
                        <Pressable
                          key={option}
                          onPress={() => {
                            setLeague(option);
                            setLeagueMenuOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.dropdownOption,
                            league === option && styles.dropdownOptionActive,
                            pressed && styles.dropdownOptionPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              league === option && styles.dropdownOptionTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Country</Text>
              <View style={styles.dropdownWrap}>
                <Pressable
                  onPress={() => {
                    setCountryMenuOpen((value) => !value);
                    setLeagueMenuOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.dropdownTrigger,
                    countryMenuOpen && styles.dropdownTriggerOpen,
                    pressed && styles.dropdownTriggerPressed,
                  ]}
                >
                  <Text style={styles.dropdownValue}>{country}</Text>
                  <Text style={styles.dropdownIcon}>{countryMenuOpen ? "▴" : "▾"}</Text>
                </Pressable>

                {countryMenuOpen ? (
                  <View style={styles.dropdownMenu}>
                    <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                      {["Alle", ...allCountries].map((option) => (
                        <Pressable
                          key={option}
                          onPress={() => {
                            setCountry(option);
                            setCountryMenuOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.dropdownOption,
                            country === option && styles.dropdownOptionActive,
                            pressed && styles.dropdownOptionPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              country === option && styles.dropdownOptionTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Capacity</Text>
              <ScrollView contentContainerStyle={styles.miniChipRow} horizontal showsHorizontalScrollIndicator={false}>
                {capacityBands.map((option) => (
                  <FilterChip
                    active={capacityBand === option}
                    key={option}
                    label={option}
                    onPress={() => setCapacityBand(option)}
                  />
                ))}
              </ScrollView>
            </View>
          </View>

          {showCollectionFilters ? (
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
          ) : null}

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.rankCell]}>Rank</Text>
              <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
              <Text style={[styles.headerCell, styles.metaCell]}>Stadium</Text>
              <Text style={[styles.headerCell, styles.metaCell]}>City</Text>
              <Text style={[styles.headerCell, styles.statusCell]}>Visit</Text>
            </View>

            {rows.length ? (
              rows.map(({ item, rank }, index) => {
                const favorite = isFavorite(item.id);
                const visitedState = isVisited(item.id);
                const wishlisted = isWishlisted(item.id);
                const visitedDate = getVisitedDate(item.id);

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(`/stadium/${item.id}`)}
                    style={({ pressed }) => [
                      styles.tableRow,
                      index % 2 === 0 ? styles.rowLight : styles.rowWhite,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <Text style={[styles.rowCell, styles.rankCell, styles.rankValue]}>{rank ?? "-"}</Text>
                    <View style={[styles.rowCell, styles.teamCell]}>
                      <Text style={styles.teamName}>{item.team}</Text>
                      <Text style={styles.teamMeta}>{item.league}</Text>
                    </View>
                    <Text style={[styles.rowCell, styles.metaCell, styles.metaValue]} numberOfLines={2}>
                      {item.stadiumName}
                    </Text>
                    <Text style={[styles.rowCell, styles.metaCell, styles.metaValue]} numberOfLines={1}>
                      {item.city}
                    </Text>
                    <View style={[styles.rowCell, styles.statusCell]}>
                      {visitedState ? (
                        <Text style={styles.statusTextStrong}>{visitedDate ?? "Visited"}</Text>
                      ) : wishlisted ? (
                        <Text style={styles.statusText}>Wishlist</Text>
                      ) : favorite ? (
                        <Text style={styles.statusText}>Saved</Text>
                      ) : (
                        <Text style={styles.statusText}>Open</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No clubs match the current filters</Text>
                <Text style={styles.emptyText}>Try another league, country or search term.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0A0A0A",
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: "#111111",
    borderColor: "#262626",
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  eyebrow: {
    color: "#A3A3A3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#FAFAFA",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  heroText: {
    color: "#A3A3A3",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 780,
  },
  panel: {
    backgroundColor: "#111111",
    borderColor: "#262626",
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  panelEyebrow: {
    color: "#737373",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  panelTitle: {
    color: "#FAFAFA",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#262626",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    minWidth: 42,
    paddingHorizontal: 12,
  },
  countBadgeText: {
    color: "#FAFAFA",
    fontSize: 15,
    fontWeight: "800",
  },
  searchInput: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 12,
    borderWidth: 1,
    color: "#FAFAFA",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  filterGrid: {
    gap: spacing.md,
  },
  filterColumn: {
    gap: spacing.sm,
  },
  filterLabel: {
    color: "#737373",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  miniChipRow: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  dropdownWrap: {
    gap: spacing.xs,
  },
  dropdownTrigger: {
    alignItems: "center",
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownTriggerOpen: {
    borderColor: "#525252",
  },
  dropdownTriggerPressed: {
    opacity: 0.9,
  },
  dropdownValue: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "700",
  },
  dropdownIcon: {
    color: "#FAFAFA",
    fontSize: 16,
    fontWeight: "800",
  },
  dropdownMenu: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 240,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownOption: {
    borderTopColor: "#262626",
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownOptionActive: {
    backgroundColor: "#262626",
  },
  dropdownOptionPressed: {
    opacity: 0.9,
  },
  dropdownOptionText: {
    color: "#E5E5E5",
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownOptionTextActive: {
    color: "#FAFAFA",
  },
  table: {
    borderColor: "#2A2A2A",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableHeader: {
    alignItems: "center",
    backgroundColor: "#111111",
    borderBottomColor: "#2A2A2A",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 12,
  },
  headerCell: {
    color: "#737373",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tableRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 12,
  },
  rowLight: {
    backgroundColor: "#141414",
  },
  rowWhite: {
    backgroundColor: "#101010",
  },
  rowPressed: {
    opacity: 0.86,
  },
  rowCell: {
    justifyContent: "center",
  },
  rankCell: {
    width: 56,
  },
  teamCell: {
    flex: 1.6,
    paddingRight: 12,
  },
  metaCell: {
    flex: 1.2,
    paddingRight: 12,
  },
  statusCell: {
    minWidth: 100,
  },
  rankValue: {
    color: "#FAFAFA",
    fontSize: 18,
    fontWeight: "800",
  },
  teamName: {
    color: "#FAFAFA",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
    textTransform: "uppercase",
  },
  teamMeta: {
    color: "#A3A3A3",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  metaValue: {
    color: "#D4D4D4",
    fontSize: 14,
    fontWeight: "600",
  },
  statusText: {
    color: "#A3A3A3",
    fontSize: 13,
    fontWeight: "700",
  },
  statusTextStrong: {
    color: "#FAFAFA",
    fontSize: 13,
    fontWeight: "800",
  },
  emptyState: {
    backgroundColor: "#111111",
    padding: spacing.xl,
  },
  emptyTitle: {
    color: "#FAFAFA",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "#A3A3A3",
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
