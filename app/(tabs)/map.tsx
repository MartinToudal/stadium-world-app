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
          <Text style={styles.eyebrow}>GEOGRAFI</Text>
          <Text style={styles.title}>Find stadioner på kortet og bevæg dig hurtigt mellem hotspots.</Text>
          <Text style={styles.text}>
            Brug regioner, samlinger og kapacitet til at skære kortet til, og åbn derefter den stadionprofil du vil videre med.
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

        {selectedStadium ? (
          <View style={styles.selectedPanel}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedText}>
                <Text style={styles.selectedEyebrow}>{selectedStadium.country}</Text>
                <Text style={styles.selectedTitle}>{selectedStadium.team}</Text>
                <Text style={styles.selectedSubtitle}>{selectedStadium.stadiumName}</Text>
                <Text style={styles.selectedMeta}>
                  {selectedStadium.city} · {selectedStadium.league}
                </Text>
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
            Et hurtigt udvalg af stadioner i {region === "World" ? "hele datasættet" : region.toLowerCase()}.
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
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  eyebrow: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  text: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 22,
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
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
  },
  sectionText: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 22,
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  selectedPanel: {
    backgroundColor: "#111111",
    borderColor: "#262626",
    borderRadius: 24,
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
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  selectedTitle: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
  },
  selectedSubtitle: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
  },
  selectedMeta: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 2,
  },
  favoritePill: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  favoritePillActive: {
    backgroundColor: "#1D4ED8",
    borderColor: "#60A5FA",
  },
  favoritePillText: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "800",
  },
  favoritePillTextActive: {
    color: "#F8FAFC",
  },
  selectedStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  miniStat: {
    backgroundColor: "#171717",
    borderRadius: 18,
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  miniStatLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  miniStatValue: {
    color: "#F8FAFC",
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
    backgroundColor: "#1D4ED8",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryActionText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryAction: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  secondaryActionText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "800",
  },
  statCard: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statCardInverted: {
    backgroundColor: "#171717",
    borderColor: "#262626",
  },
  statValue: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
  },
  statValueInverted: {
    color: "#F8FAFC",
    fontSize: 18,
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 4,
  },
  statLabelInverted: {
    color: "#94A3B8",
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
    backgroundColor: "#111111",
    borderColor: "#262626",
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 150,
    padding: spacing.md,
  },
  regionCardTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "800",
  },
  regionCardText: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 4,
  },
});
