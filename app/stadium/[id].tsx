import { Stack, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { FavoriteButton } from "../../components/favorite-button";
import { StadiumStatusButton } from "../../components/stadium-status-button";
import { colors, spacing } from "../../constants/theme";
import { useStadiumCollections } from "../../lib/favorites";
import { findStadiumById, formatCapacity, stadiumMapUrl } from "../../lib/stadiums";

export default function StadiumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stadium = findStadiumById(id);
  const { isFavorite, isVisited, isWishlisted, getVisitedDate, toggleFavorite, toggleVisited, toggleWishlist, setVisitedDate, clearVisited } =
    useStadiumCollections();
  const [visitedDateInput, setVisitedDateInput] = useState("");

  useEffect(() => {
    if (!stadium) {
      return;
    }

    setVisitedDateInput(getVisitedDate(stadium.id) ?? "");
  }, [getVisitedDate, stadium]);

  if (!stadium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: "Ikke fundet" }} />
        <View style={styles.missingState}>
          <Text style={styles.missingTitle}>Stadionet blev ikke fundet</Text>
          <Text style={styles.missingText}>Prøv at gå tilbage til oversigten og vælg en stadionpost igen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: stadium.team }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTopText}>
              <Text style={styles.heroEyebrow}>{stadium.country}</Text>
              <Text style={styles.heroTitle}>{stadium.stadiumName}</Text>
              <Text style={styles.heroSubtitle}>
                {stadium.team} · {stadium.league}
              </Text>
              <Text style={styles.heroMeta}>
                {stadium.city} · {stadium.latitude.toFixed(4)}, {stadium.longitude.toFixed(4)}
              </Text>
            </View>
            <FavoriteButton active={isFavorite(stadium.id)} onPress={() => toggleFavorite(stadium.id)} />
          </View>
        </View>

        <View style={styles.grid}>
          <InfoCard label="Kapacitet" value={formatCapacity(stadium.capacity)} />
          <InfoCard label="Åbnet" value={stadium.opened ? String(stadium.opened) : "Ukendt"} />
          <InfoCard label="Underlag" value={stadium.surface ?? "Ikke registreret"} />
          <InfoCard label="Niveau" value={stadium.tier ? `${stadium.tier}. niveau` : "Ukendt"} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          <Text style={styles.sectionText}>{stadium.description}</Text>
          {stadium.statusNote ? <Text style={styles.statusNote}>{stadium.statusNote}</Text> : null}
          <View style={styles.tagWrap}>
            {stadium.tags.slice(0, 8).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Placering</Text>
          <Text style={styles.sectionText}>{stadium.locationLabel}</Text>
          <Text style={styles.coordinates}>{stadium.coordinatesLabel}</Text>
        </View>

        <View style={styles.grid}>
          <InfoCard label="Region" value={stadium.region} />
          <InfoCard label="Kildehost" value={stadium.sourceHost ?? "Ukendt"} />
          <InfoCard label="Kapacitetsklasse" value={stadium.capacityBucket} />
          <InfoCard label="Aliaser" value={stadium.aliases[0] ?? "Ingen"} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Din tracker</Text>
          <Text style={styles.sectionText}>
            Brug stadionets egen status til at skelne mellem steder, du allerede har været, og steder du vil planlaegge
            en tur til senere.
          </Text>
          <View style={styles.trackerRow}>
            <StadiumStatusButton
              active={isVisited(stadium.id)}
              activeLabel="Besøgt"
              inactiveLabel="Markér besøgt"
              onPress={() => toggleVisited(stadium.id)}
              tone="visited"
            />
            <StadiumStatusButton
              active={isWishlisted(stadium.id)}
              activeLabel="På wishlist"
              inactiveLabel="Til wishlist"
              onPress={() => toggleWishlist(stadium.id)}
              tone="wishlist"
            />
          </View>
          <View style={styles.visitDateBlock}>
            <Text style={styles.visitDateLabel}>Besøgsdato</Text>
            <TextInput
              onChangeText={setVisitedDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              style={styles.visitDateInput}
              value={visitedDateInput}
            />
            <View style={styles.visitDateActions}>
              <ActionButton
                label="Gem besøg"
                onPress={() => setVisitedDate(stadium.id, visitedDateInput.trim() || null)}
              />
              <ActionButton
                label="I dag"
                onPress={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setVisitedDateInput(today);
                  setVisitedDate(stadium.id, today);
                }}
                secondary
              />
              {isVisited(stadium.id) ? (
                <ActionButton
                  label="Fjern besøg"
                  onPress={() => {
                    setVisitedDateInput("");
                    clearVisited(stadium.id);
                  }}
                  secondary
                />
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datafundament</Text>
          <Text style={styles.sectionText}>
            Denne visning er bygget på samme typed datastruktur, som vi kan genbruge i en senere iOS-app. Det gør
            det hurtigt at dele lister, detaljesider, filtrering og datakilder mellem platforme.
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionButton label="Åbn i kort" onPress={() => Linking.openURL(stadiumMapUrl(stadium))} />
          {stadium.source ? (
            <ActionButton label="Åbn kilde" onPress={() => Linking.openURL(stadium.source!)} secondary />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonLabel, secondary ? styles.buttonLabelSecondary : styles.buttonLabelPrimary]}>
        {label}
      </Text>
    </Pressable>
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
  heroCard: {
    backgroundColor: colors.ink,
    borderRadius: 28,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  heroTopRow: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  heroTopText: {
    flex: 1,
    gap: spacing.sm,
  },
  heroEyebrow: {
    color: colors.accentSoft,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  heroSubtitle: {
    color: "#F0E6DA",
    fontSize: 17,
    fontWeight: "700",
  },
  heroMeta: {
    color: "#D2C7BA",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 160,
    padding: spacing.md,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  infoValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  coordinates: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: "700",
  },
  statusNote: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    padding: spacing.md,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  trackerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  visitDateBlock: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  visitDateLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  visitDateInput: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  visitDateActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  button: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderColor: colors.line,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "800",
  },
  buttonLabelPrimary: {
    color: colors.white,
  },
  buttonLabelSecondary: {
    color: colors.ink,
  },
  missingState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  missingTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  missingText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.sm,
    maxWidth: 420,
    textAlign: "center",
  },
});
