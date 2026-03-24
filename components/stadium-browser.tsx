import { StatusBar } from "expo-status-bar";
import { useDeferredValue, useMemo, useState } from "react";
import { FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../constants/theme";
import { useFavorites } from "../lib/favorites";
import {
  allCountries,
  capacityBands,
  featuredCountries,
  featuredLeagues,
  matchesCapacityBand,
  sortModes,
  sortStadiums,
  stadiums,
} from "../lib/stadiums";
import { FilterChip } from "./filter-chip";
import { StadiumCard } from "./stadium-card";

type StadiumBrowserProps = {
  defaultFavoritesOnly?: boolean;
  heroTitle: string;
  heroText: string;
  panelTitle: string;
};

export function StadiumBrowser({
  defaultFavoritesOnly = false,
  heroTitle,
  heroText,
  panelTitle,
}: StadiumBrowserProps) {
  const [query, setQuery] = useState("");
  const [league, setLeague] = useState<string>("Alle");
  const [country, setCountry] = useState<string>("Alle");
  const [favoritesOnly, setFavoritesOnly] = useState(defaultFavoritesOnly);
  const [capacityBand, setCapacityBand] = useState<(typeof capacityBands)[number]>("Alle");
  const [sortMode, setSortMode] = useState<(typeof sortModes)[number]>("Størst først");
  const { favorites } = useFavorites();
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const trimmedQuery = deferredQuery.trim().toLowerCase();

    return sortStadiums(
      stadiums
      .filter((stadium) => (league === "Alle" ? true : stadium.league === league))
      .filter((stadium) => (country === "Alle" ? true : stadium.country === country))
      .filter((stadium) => (favoritesOnly ? favorites.includes(stadium.id) : true))
      .filter((stadium) => matchesCapacityBand(stadium, capacityBand))
      .filter((stadium) => {
        if (!trimmedQuery) {
          return true;
        }

        const haystack =
          `${stadium.team} ${stadium.stadiumName} ${stadium.city} ${stadium.country} ${stadium.league}`.toLowerCase();
        return haystack.includes(trimmedQuery);
      }),
      sortMode
    );
  }, [capacityBand, country, deferredQuery, favorites, favoritesOnly, league, sortMode]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.hero}>
              <View style={styles.heroOrbPrimary} />
              <View style={styles.heroOrbSecondary} />
              <View style={styles.heroGrid} />
              <View style={styles.heroContent}>
                <Text style={styles.eyebrow}>STADIUM WORLD</Text>
                <Text style={styles.heroTitle}>{heroTitle}</Text>
                <Text style={styles.heroText}>{heroText}</Text>
                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{stadiums.length}</Text>
                    <Text style={styles.heroStatLabel}>stadions i datasættet</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{allCountries.length}</Text>
                    <Text style={styles.heroStatLabel}>lande</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{favorites.length}</Text>
                    <Text style={styles.heroStatLabel}>favoritter</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.searchPanel}>
              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderText}>
                  <Text style={styles.panelEyebrow}>Curated browser</Text>
                  <Text style={styles.panelTitle}>{panelTitle}</Text>
                </View>
                <View style={styles.panelBadge}>
                  <Text style={styles.panelBadgeText}>{filtered.length}</Text>
                </View>
              </View>
              <TextInput
                onChangeText={setQuery}
                placeholder="Søg på klub, stadion, by, land eller liga"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={query}
              />

              <View style={styles.filterBlock}>
                <Text style={styles.filterLabel}>Liganiveau</Text>
                <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
                  {["Alle", ...featuredLeagues].map((option) => (
                    <FilterChip
                      active={league === option}
                      key={option}
                      label={option}
                      onPress={() => setLeague(option)}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterBlock}>
                <Text style={styles.filterLabel}>Lande</Text>
                <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
                  {["Alle", ...featuredCountries].map((option) => (
                    <FilterChip
                      active={country === option}
                      key={option}
                      label={option}
                      onPress={() => setCountry(option)}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterBlock}>
                <Text style={styles.filterLabel}>Kuratering</Text>
                <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
                  <FilterChip
                    active={!favoritesOnly}
                    label="Alle stadions"
                    onPress={() => setFavoritesOnly(false)}
                  />
                  <FilterChip
                    active={favoritesOnly}
                    label={`Favoritter (${favorites.length})`}
                    onPress={() => setFavoritesOnly(true)}
                  />
                </ScrollView>
              </View>

              <View style={styles.filterBlock}>
                <Text style={styles.filterLabel}>Kapacitet</Text>
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

              <View style={styles.filterBlock}>
                <Text style={styles.filterLabel}>Sortering</Text>
                <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
                  {sortModes.map((option) => (
                    <FilterChip
                      active={sortMode === option}
                      key={option}
                      label={option}
                      onPress={() => setSortMode(option)}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{filtered.length}</Text>
                  <Text style={styles.statLabel}>viste stadions</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{new Set(filtered.map((item) => item.country)).size}</Text>
                  <Text style={styles.statLabel}>lande</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{new Set(filtered.map((item) => item.league)).size}</Text>
                  <Text style={styles.statLabel}>ligaer</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{allCountries.length}</Text>
                  <Text style={styles.statLabel}>lande totalt</Text>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ingen stadions matcher endnu</Text>
            <Text style={styles.emptyText}>
              Prøv at nulstille et filter eller søg bredere på klub, by eller land.
            </Text>
          </View>
        }
        numColumns={Platform.OS === "web" ? 2 : 1}
        columnWrapperStyle={Platform.OS === "web" ? styles.columnWrap : undefined}
        renderItem={({ item }) => <StadiumCard stadium={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerWrap: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: 32,
    marginTop: spacing.sm,
    minHeight: 320,
    overflow: "hidden",
    position: "relative",
  },
  heroOrbPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 260,
    opacity: 0.9,
    position: "absolute",
    right: -40,
    top: -50,
    width: 260,
  },
  heroOrbSecondary: {
    backgroundColor: colors.moss,
    borderRadius: 999,
    height: 220,
    left: -30,
    opacity: 0.6,
    position: "absolute",
    top: 130,
    width: 220,
  },
  heroGrid: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    opacity: 0.25,
  },
  heroContent: {
    gap: spacing.sm,
    justifyContent: "flex-end",
    minHeight: 320,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
    maxWidth: 740,
  },
  heroText: {
    color: "#F5EDE1",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 620,
  },
  heroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  heroStat: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroStatValue: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: "#DCCFC1",
    fontSize: 12,
    marginTop: 4,
  },
  searchPanel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 32,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  panelHeaderText: {
    gap: 4,
  },
  panelEyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  panelBadge: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  panelBadgeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
  },
  filterBlock: {
    gap: spacing.sm,
  },
  filterLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statBlock: {
    backgroundColor: colors.paper,
    borderRadius: 20,
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
  columnWrap: {
    gap: spacing.md,
    justifyContent: "space-between",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 28,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    maxWidth: 420,
    textAlign: "center",
  },
});
