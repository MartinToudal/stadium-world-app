import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useDeferredValue, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../constants/theme";
import { useStadiumCollections } from "../lib/favorites";
import {
  allCountries,
  allLeagues,
  capacityBands,
  featuredLeagues,
  getGlobalRank,
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

type SortKey = "rank" | "team" | "stadium" | "city" | "visit";
type SortDirection = "asc" | "desc";

type StadiumRow = {
  item: Stadium;
  rank: number | null;
  visitValue: string;
  visitLabel: string;
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
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [league, setLeague] = useState("Alle");
  const [country, setCountry] = useState("Alle");
  const [capacityBand, setCapacityBand] = useState<(typeof capacityBands)[number]>("Alle");
  const [collectionFilter, setCollectionFilter] = useState(defaultCollectionFilter);
  const [leagueMenuOpen, setLeagueMenuOpen] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const { favorites, visited, wishlist, isFavorite, isVisited, isWishlisted, getVisitedDate } = useStadiumCollections();

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
      .map((item) => {
        const visitedState = isVisited(item.id);
        const wishlisted = isWishlisted(item.id);
        const visitedDate = getVisitedDate(item.id);

        return {
          item,
          rank: getGlobalRank(item),
          visitValue: getVisitSortValue(item.id, visitedState, wishlisted, visitedDate),
          visitLabel: getVisitLabel(item.id, visitedState, wishlisted, isFavorite(item.id), visitedDate),
        };
      });

    return filtered.sort((a, b) => {
      const compare = (() => {
        switch (sortKey) {
          case "team":
            return a.item.team.localeCompare(b.item.team);
          case "stadium":
            return a.item.stadiumName.localeCompare(b.item.stadiumName);
          case "city":
            return a.item.city.localeCompare(b.item.city);
          case "visit":
            return a.visitValue.localeCompare(b.visitValue);
          case "rank":
          default:
            return (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER);
        }
      })();

      if (compare !== 0) {
        return sortDirection === "asc" ? compare : -compare;
      }

      const aLeagueIndex = featuredLeagues.indexOf(a.item.league);
      const bLeagueIndex = featuredLeagues.indexOf(b.item.league);
      const leagueOrder =
        (aLeagueIndex === -1 ? Number.MAX_SAFE_INTEGER : aLeagueIndex) -
        (bLeagueIndex === -1 ? Number.MAX_SAFE_INTEGER : bLeagueIndex);

      if (leagueOrder !== 0) {
        return leagueOrder;
      }

      return a.item.team.localeCompare(b.item.team);
    });
  }, [
    capacityBand,
    collectionFilter,
    country,
    deferredQuery,
    favorites,
    getVisitedDate,
    isFavorite,
    isVisited,
    isWishlisted,
    league,
    sortDirection,
    sortKey,
    visited,
    wishlist,
  ]);

  const stats = useMemo(() => {
    const countries = new Set(rows.map((row) => row.item.country)).size;
    const leagues = new Set(rows.map((row) => row.item.league)).size;
    return [
      { label: "Clubs", value: String(rows.length) },
      { label: "Countries", value: String(countries) },
      { label: "Visited", value: String(visited.length) },
      { label: "Leagues", value: String(leagues) },
    ];
  }, [rows, visited.length]);

  function handleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageEyebrow}>Explore</Text>
          <Text style={styles.pageTitle}>{heroTitle}</Text>
          <Text style={styles.pageText}>{heroText}</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {showTripPlanner ? <TripPlannerPanel /> : null}

        <View style={styles.directoryShell}>
          <View style={styles.directoryHeader}>
            <View style={styles.directoryHeaderText}>
              <Text style={styles.directoryEyebrow}>Directory</Text>
              <Text style={styles.directoryTitle}>{panelTitle}</Text>
            </View>
            <View style={styles.directoryCount}>
              <Text style={styles.directoryCountValue}>{rows.length}</Text>
            </View>
          </View>

          <TextInput
            onChangeText={setQuery}
            placeholder="Search club, stadium, city or country"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={query}
          />

          <View style={styles.toolbar}>
            <FilterSelect
              label="League"
              onSelect={(option) => setLeague(option)}
              open={leagueMenuOpen}
              options={["Alle", ...allLeagues]}
              setOpen={setLeagueMenuOpen}
              value={league}
            />
            <FilterSelect
              label="Country"
              onSelect={(option) => setCountry(option)}
              open={countryMenuOpen}
              options={["Alle", ...allCountries]}
              setOpen={setCountryMenuOpen}
              value={country}
            />
          </View>

          <View style={styles.filterStrip}>
            <View style={styles.filterBlock}>
              <Text style={styles.filterLabel}>Capacity</Text>
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
            </View>

            {showCollectionFilters ? (
              <View style={styles.filterBlock}>
                <Text style={styles.filterLabel}>Collection</Text>
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
              </View>
            ) : null}
          </View>

          <View style={styles.tableWrap}>
            <View style={styles.tableHeader}>
              <SortableHeader
                active={sortKey === "rank"}
                direction={sortDirection}
                label="Rank"
                onPress={() => handleSort("rank")}
                style={styles.rankCell}
              />
              <SortableHeader
                active={sortKey === "team"}
                direction={sortDirection}
                label="Team"
                onPress={() => handleSort("team")}
                style={styles.teamCell}
              />
              <SortableHeader
                active={sortKey === "stadium"}
                direction={sortDirection}
                label="Stadium"
                onPress={() => handleSort("stadium")}
                style={styles.stadiumCell}
              />
              <SortableHeader
                active={sortKey === "city"}
                direction={sortDirection}
                label="City"
                onPress={() => handleSort("city")}
                style={styles.cityCell}
              />
              <SortableHeader
                active={sortKey === "visit"}
                direction={sortDirection}
                label="Status"
                onPress={() => handleSort("visit")}
                style={styles.visitCell}
              />
            </View>

            {rows.length ? (
              rows.map((row, index) => (
                <Pressable
                  key={row.item.id}
                  onPress={() => router.push(`/stadium/${row.item.id}`)}
                  style={({ pressed }) => [
                    styles.tableRow,
                    index < rows.length - 1 && styles.tableRowBorder,
                    pressed && styles.tableRowPressed,
                  ]}
                >
                  <Text style={[styles.rowText, styles.rankCell, styles.rankValue]}>{row.rank ?? "-"}</Text>
                  <View style={[styles.teamCell, styles.rowCell]}>
                    <Text style={styles.teamName}>{row.item.team}</Text>
                    <Text style={styles.teamLeague}>{row.item.league}</Text>
                  </View>
                  <Text numberOfLines={1} style={[styles.rowText, styles.stadiumCell, styles.primaryValue]}>
                    {row.item.stadiumName}
                  </Text>
                  <Text numberOfLines={1} style={[styles.rowText, styles.cityCell, styles.secondaryValue]}>
                    {row.item.city}
                  </Text>
                  <Text numberOfLines={1} style={[styles.rowText, styles.visitCell, styles.visitValue]}>
                    {row.visitLabel}
                  </Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No stadiums match the current filters</Text>
                <Text style={styles.emptyText}>Try another search, league or country selection.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getVisitSortValue(id: string, visited: boolean, wishlisted: boolean, visitedDate: string | null) {
  if (visited) {
    return `0-${visitedDate ?? "9999-99-99"}-${id}`;
  }

  if (wishlisted) {
    return `1-${id}`;
  }

  return `2-${id}`;
}

function getVisitLabel(id: string, visited: boolean, wishlisted: boolean, favorite: boolean, visitedDate: string | null) {
  if (visited) {
    return visitedDate ? `Visited ${visitedDate}` : "Visited";
  }

  if (wishlisted) {
    return "Wishlist";
  }

  if (favorite) {
    return "Saved";
  }

  return "Open";
}

function SortableHeader({
  active,
  direction,
  label,
  onPress,
  style,
}: {
  active: boolean;
  direction: SortDirection;
  label: string;
  onPress: () => void;
  style: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.headerButton, style, pressed && styles.headerPressed]}>
      <Text style={[styles.headerText, active && styles.headerTextActive]}>{label}</Text>
      <Text style={[styles.headerArrow, active && styles.headerArrowActive]}>{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</Text>
    </Pressable>
  );
}

function FilterSelect({
  label,
  onSelect,
  open,
  options,
  setOpen,
  value,
}: {
  label: string;
  onSelect: (option: string) => void;
  open: boolean;
  options: string[];
  setOpen: (open: boolean) => void;
  value: string;
}) {
  return (
    <View style={styles.selectGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.dropdownWrap}>
        <Pressable
          onPress={() => setOpen(!open)}
          style={({ pressed }) => [styles.dropdownTrigger, open && styles.dropdownTriggerOpen, pressed && styles.dropdownTriggerPressed]}
        >
          <Text style={styles.dropdownValue}>{value}</Text>
          <Text style={styles.dropdownIcon}>{open ? "▴" : "▾"}</Text>
        </Pressable>

        {open ? (
          <View style={styles.dropdownMenu}>
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.dropdownOption,
                    value === option && styles.dropdownOptionActive,
                    pressed && styles.dropdownOptionPressed,
                  ]}
                >
                  <Text style={[styles.dropdownOptionText, value === option && styles.dropdownOptionTextActive]}>{option}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.shell,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  pageHeader: {
    gap: spacing.sm,
    maxWidth: 820,
    paddingTop: spacing.sm,
  },
  pageEyebrow: {
    color: colors.blueSoft,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  pageTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 38,
  },
  pageText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 760,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    textTransform: "uppercase",
  },
  directoryShell: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  directoryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  directoryHeaderText: {
    gap: 4,
  },
  directoryEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  directoryTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  directoryCount: {
    alignItems: "center",
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minWidth: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  directoryCountValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  searchInput: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  selectGroup: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 220,
  },
  filterStrip: {
    gap: spacing.md,
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
    paddingRight: spacing.sm,
  },
  dropdownWrap: {
    gap: spacing.xs,
  },
  dropdownTrigger: {
    alignItems: "center",
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  dropdownTriggerOpen: {
    borderColor: colors.blue,
  },
  dropdownTriggerPressed: {
    opacity: 0.9,
  },
  dropdownValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  dropdownIcon: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  dropdownMenu: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: 240,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownOption: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dropdownOptionActive: {
    backgroundColor: colors.blue,
  },
  dropdownOptionPressed: {
    opacity: 0.9,
  },
  dropdownOptionText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownOptionTextActive: {
    color: colors.text,
  },
  tableWrap: {
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableHeader: {
    alignItems: "center",
    backgroundColor: colors.panelAlt,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 16,
  },
  headerButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 54,
  },
  headerPressed: {
    opacity: 0.82,
  },
  headerText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTextActive: {
    color: colors.text,
  },
  headerArrow: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
  },
  headerArrowActive: {
    color: colors.text,
  },
  tableRow: {
    alignItems: "center",
    backgroundColor: colors.panel,
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: 16,
  },
  tableRowBorder: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  tableRowPressed: {
    backgroundColor: colors.panelAlt,
  },
  rowCell: {
    justifyContent: "center",
  },
  rowText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  rankCell: {
    width: 76,
  },
  teamCell: {
    flex: 1.4,
    paddingRight: 12,
  },
  stadiumCell: {
    flex: 1.45,
    paddingRight: 12,
  },
  cityCell: {
    flex: 1,
    paddingRight: 12,
  },
  visitCell: {
    minWidth: 132,
  },
  rankValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  teamName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  teamLeague: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  primaryValue: {
    color: colors.text,
  },
  secondaryValue: {
    color: colors.textSoft,
  },
  visitValue: {
    color: colors.blueSoft,
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: colors.panel,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
