import { Stack, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FavoriteButton } from "../../components/favorite-button";
import { StadiumStatusButton } from "../../components/stadium-status-button";
import { colors, spacing } from "../../constants/theme";
import { useStadiumCollections } from "../../lib/favorites";
import { findStadiumById, formatCapacity, stadiumMapUrl } from "../../lib/stadiums";

export default function StadiumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stadium = findStadiumById(id);
  const { isFavorite, isVisited, isWishlisted, toggleFavorite, toggleVisited, toggleWishlist } = useStadiumCollections();

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
          {stadium.heroImageUrl ? (
            <Image resizeMode="cover" source={{ uri: stadium.heroImageUrl }} style={styles.heroImage} />
          ) : null}
          <View style={[styles.heroImageOverlay, stadium.heroImageUrl ? styles.heroImageOverlayVisible : null]} />
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
          {stadium.heroImageCredit ? (
            <View style={styles.heroCreditWrap}>
              <Text style={styles.heroCreditText}>Foto: {stadium.heroImageCredit}</Text>
            </View>
          ) : null}
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
            Brug stadionets egen status til at skelne mellem steder, du allerede har været, og steder du vil planlægge
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
          {stadium.heroImagePage ? (
            <ActionButton label="Fotokilde" onPress={() => Linking.openURL(stadium.heroImagePage!)} secondary />
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
    overflow: "hidden",
    padding: spacing.lg,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
  heroImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  heroImageOverlayVisible: {
    backgroundColor: "rgba(24,22,31,0.38)",
  },
  heroTopRow: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    zIndex: 1,
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
  heroCreditWrap: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 1,
  },
  heroCreditText: {
    color: "#F4E9DC",
    fontSize: 12,
    fontWeight: "700",
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
