import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FilterChip } from "../../components/filter-chip";
import { StadiumMap } from "../../components/stadium-map";
import { StadiumCard } from "../../components/stadium-card";
import { StadiumStatusButton } from "../../components/stadium-status-button";
import { colors, spacing } from "../../constants/theme";
import { useStadiumCollections } from "../../lib/favorites";
import {
  capacityBands,
  featuredRegions,
  filterByRegion,
  formatCapacity,
  getRegionForCountry,
  hasCoordinates,
  matchesCapacityBand,
  stadiumMapUrl,
  stadiums,
} from "../../lib/stadiums";
import * as Linking from "expo-linking";

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
  const previewStadiums = [...regionStadiums]
    .sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))
    .slice(0, 6);
  const mappableRegionStadiums = regionStadiums.filter(hasCoordinates);
  const selectedStadium =
    regionStadiums.find((stadium) => stadium.id === selectedId) ?? previewStadiums[0] ?? regionStadiums[0] ?? null;
  const selectedMapUrl = selectedStadium ? stadiumMapUrl(selectedStadium) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroOrbPrimary} />
          <View style={styles.heroOrbSecondary} />
          <Text style={styles.eyebrow}>GEOGRAFI</Text>
          <Text style={styles.title}>Se stadioner efter region på et rigtigt koordinatkort.</Text>
          <Text style={styles.text}>
            Webversionen viser stadionerne direkte på et koordinatkort, mens iPhone senere kan få en endnu stærkere
            native map-oplevelse oven på samme data.
          </Text>
          <View style={styles.heroStats}>
            <StatCard inverted label="Region" value={region === "World" ? "Global" : region} />
            <StatCard inverted label="Stadions" value={String(regionStadiums.length)} />
            <StatCard inverted label="Besøgt" value={String(visited.length)} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
          {featuredRegions.map((option) => (
            <FilterChip
              active={region === option}
              key={option}
              label={option}
              onPress={() => setRegion(option)}
            />
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
          {capacityBands.map((option) => (
            <FilterChip
              active={capacityBand === option}
              key={option}
              label={option}
              onPress={() => setCapacityBand(option)}
            />
          ))}
          <FilterChip
            active={collectionFilter === "favorites"}
            label={`Favoritter (${favorites.length})`}
            onPress={() => setCollectionFilter((value) => (value === "favorites" ? "all" : "favorites"))}
          />
          <FilterChip
            active={collectionFilter === "visited"}
            label={`Besøgt (${visited.length})`}
            onPress={() => setCollectionFilter((value) => (value === "visited" ? "all" : "visited"))}
          />
          <FilterChip
            active={collectionFilter === "wishlist"}
            label={`Wishlist (${wishlist.length})`}
            onPress={() => setCollectionFilter((value) => (value === "wishlist" ? "all" : "wishlist"))}
          />
        </ScrollView>

        <StadiumMap
          onSelect={(stadiumId) => setSelectedId(stadiumId)}
          selectedId={selectedStadium?.id ?? null}
          stadiums={regionStadiums}
        />

        {!mappableRegionStadiums.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kortdata kommer løbende</Text>
            <Text style={styles.sectionText}>
              Denne del af listen mangler stadig koordinater. Klubberne er med i overblikket nu, og kortlaget bliver
              udfyldt efterhaanden som vi beriger data.
            </Text>
          </View>
        ) : null}

        {selectedStadium ? (
          <View style={styles.selectedPanel}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedText}>
                <Text style={styles.selectedEyebrow}>{selectedStadium.country}</Text>
                <Text style={styles.selectedTitle}>{selectedStadium.team}</Text>
                <Text style={styles.selectedSubtitle}>{selectedStadium.stadiumName}</Text>
              </View>
            </View>
            <View style={styles.selectedStats}>
              <MiniStat label="Liga" value={selectedStadium.league} />
              <MiniStat label="Kapacitet" value={formatCapacity(selectedStadium.capacity)} />
              <MiniStat label="Åbnet" value={selectedStadium.opened ? String(selectedStadium.opened) : "Ukendt"} />
            </View>
            <View style={styles.selectedActions}>
              <Pressable onPress={() => router.push(`/stadium/${selectedStadium.id}`)} style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Åbn detalje</Text>
              </Pressable>
              <Pressable disabled={!selectedMapUrl} onPress={() => selectedMapUrl && Linking.openURL(selectedMapUrl)} style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Åbn i kort</Text>
              </Pressable>
            </View>
            <View style={styles.selectedStatusRow}>
              <StadiumStatusButton
                active={isVisited(selectedStadium.id)}
                activeLabel="Besøgt"
                inactiveLabel="Markér besøgt"
                onPress={() => toggleVisited(selectedStadium.id)}
                tone="visited"
              />
              <StadiumStatusButton
                active={isWishlisted(selectedStadium.id)}
                activeLabel="På wishlist"
                inactiveLabel="Til wishlist"
                onPress={() => toggleWishlist(selectedStadium.id)}
                tone="wishlist"
              />
              <Pressable
                onPress={() => toggleFavorite(selectedStadium.id)}
                style={[styles.favoritePill, isFavorite(selectedStadium.id) && styles.favoritePillActive]}
              >
                <Text style={[styles.favoritePillText, isFavorite(selectedStadium.id) && styles.favoritePillTextActive]}>
                  {isFavorite(selectedStadium.id) ? "Favorit" : "Gem"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Region snapshot</Text>
          <View style={styles.statRow}>
            <StatCard label="Stadions" value={String(regionStadiums.length)} />
            <StatCard
              label="Lande"
              value={String(new Set(regionStadiums.map((stadium) => stadium.country)).size)}
            />
            <StatCard
              label="Topregion"
              value={
                region === "World"
                  ? "Global"
                  : region
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Udvalgte stadioner</Text>
          <Text style={styles.sectionText}>
            Et hurtigt udvalg af store stadioner i {region === "World" ? "hele datasættet" : region.toLowerCase()}.
          </Text>
        </View>

        <View style={styles.cardColumn}>
          {previewStadiums.map((stadium) => (
            <StadiumCard key={stadium.id} stadium={stadium} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regionfordeling</Text>
          <View style={styles.regionGrid}>
            {featuredRegions
              .filter((item) => item !== "World")
              .map((item) => {
                const count = stadiums.filter((stadium) => getRegionForCountry(stadium.country) === item).length;
                return (
                  <View key={item} style={styles.regionCard}>
                    <Text style={styles.regionCardTitle}>{item}</Text>
                    <Text style={styles.regionCardText}>{count} stadioner</Text>
                  </View>
                );
              })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  inverted,
}: {
  label: string;
  value: string;
  inverted?: boolean;
}) {
  return (
    <View style={[styles.statCard, inverted && styles.statCardInverted]}>
      <Text style={[styles.statValue, inverted && styles.statValueInverted]}>{value}</Text>
      <Text style={[styles.statLabel, inverted && styles.statLabelInverted]}>{label}</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: colors.moss,
    borderRadius: 32,
    gap: spacing.sm,
    overflow: "hidden",
    padding: spacing.lg,
    position: "relative",
  },
  heroOrbPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 180,
    opacity: 0.3,
    position: "absolute",
    right: -30,
    top: -20,
    width: 180,
  },
  heroOrbSecondary: {
    backgroundColor: colors.sky,
    borderRadius: 999,
    height: 120,
    left: -20,
    opacity: 0.18,
    position: "absolute",
    top: 110,
    width: 120,
  },
  eyebrow: {
    color: "#D7F1E7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  text: {
    color: "#E4F4EF",
    fontSize: 16,
    lineHeight: 24,
  },
  heroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  selectedPanel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  selectedHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  selectedText: {
    flex: 1,
    gap: 4,
  },
  selectedEyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  selectedTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
  },
  selectedSubtitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "700",
  },
  favoritePill: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  favoritePillActive: {
    backgroundColor: "#FFF0D6",
    borderColor: colors.accentSoft,
  },
  favoritePillText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  favoritePillTextActive: {
    color: colors.accent,
  },
  selectedStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  miniStat: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  miniStatLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  miniStatValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  selectedActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  selectedStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  primaryAction: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryAction: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  secondaryActionText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  statCard: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statCardInverted: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  statValue: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: "900",
  },
  statValueInverted: {
    color: colors.white,
    fontSize: 18,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  statLabelInverted: {
    color: "#D7F1E7",
  },
  cardColumn: {
    gap: spacing.md,
  },
  regionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  regionCard: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 150,
    padding: spacing.md,
  },
  regionCardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  regionCardText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
