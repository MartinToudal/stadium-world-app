import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FavoriteButton } from "../../components/favorite-button";
import { StadiumStatusButton } from "../../components/stadium-status-button";
import { colors, spacing } from "../../constants/theme";
import { useStadiumCollections } from "../../lib/favorites";
import { findStadiumById, formatCapacity, getGlobalRank, stadiumMapUrl } from "../../lib/stadiums";

export default function StadiumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stadium = findStadiumById(id);
  const {
    isFavorite,
    isVisited,
    isWishlisted,
    getVisitedDate,
    toggleFavorite,
    toggleWishlist,
    setVisitedDate,
    clearVisited,
  } = useStadiumCollections();
  const [visitedDateInput, setVisitedDateInput] = useState("");
  const mapUrl = stadium ? stadiumMapUrl(stadium) : null;

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
          <Text style={styles.missingText}>Gå tilbage til oversigten og vælg stadionet igen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const visited = isVisited(stadium.id);
  const visitedDate = getVisitedDate(stadium.id);
  const globalRank = getGlobalRank(stadium);
  const profileStats = [
    { label: "Global rank", value: globalRank ? `#${globalRank}` : "Ikke sat" },
    { label: "Country", value: stadium.country },
    { label: "City", value: stadium.city },
    { label: "Status", value: visited ? "Visited" : isWishlisted(stadium.id) ? "Wishlist" : "Open" },
  ];
  const factRows = [
    { label: "Club", value: stadium.team },
    { label: "Stadium", value: stadium.stadiumName },
    { label: "League", value: stadium.league },
    { label: "Region", value: stadium.region },
    { label: "Capacity", value: formatCapacity(stadium.capacity) },
    { label: "Surface", value: stadium.surface ?? "Not registered" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: stadium.team }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageShell}>
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderText}>
              <Text style={styles.pageEyebrow}>Stadium Profile</Text>
              <Text style={styles.pageTitle}>{stadium.team}</Text>
              <Text style={styles.pageText}>
                {stadium.stadiumName} in {stadium.city}, {stadium.country}
              </Text>
            </View>
            <FavoriteButton active={isFavorite(stadium.id)} onPress={() => toggleFavorite(stadium.id)} />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <View style={styles.heroMetaRow}>
                  <MetaPill label={stadium.league} />
                  <MetaPill label={stadium.country} subtle />
                </View>
                <Text style={styles.heroTitle}>{stadium.stadiumName}</Text>
                <Text style={styles.heroSubtitle}>{stadium.team}</Text>
                <Text style={styles.heroLocation}>{stadium.locationLabel}</Text>
              </View>
            </View>

            <View style={styles.statGrid}>
              {profileStats.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <DetailBlock eyebrow="Personal Log" title="Track your visit">
            <View style={styles.statusRow}>
              <StadiumStatusButton
                active={visited}
                activeLabel="Visited"
                inactiveLabel="Mark visited"
                onPress={() => {
                  const nextVisited = !visited;
                  if (!nextVisited) {
                    setVisitedDateInput("");
                    clearVisited(stadium.id);
                    return;
                  }

                  const value = visitedDateInput.trim();
                  setVisitedDate(stadium.id, value || null);
                }}
                tone="visited"
              />
              <StadiumStatusButton
                active={isWishlisted(stadium.id)}
                activeLabel="On wishlist"
                inactiveLabel="Add wishlist"
                onPress={() => toggleWishlist(stadium.id)}
                tone="wishlist"
              />
            </View>

            <Text style={styles.bodyText}>
              {visited
                ? `Registered as visited${visitedDate ? ` on ${visitedDate}` : ""}.`
                : "Save the date once you have been there, or keep the ground on your wishlist for later."}
            </Text>

            <View style={styles.logPanel}>
              <View style={styles.logPanelHeader}>
                <Text style={styles.blockLabel}>Visit date</Text>
                {visitedDate ? <Text style={styles.logValue}>{visitedDate}</Text> : null}
              </View>
              <TextInput
                onChangeText={setVisitedDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={visitedDateInput}
              />
              <View style={styles.actionRow}>
                <ActionButton
                  label="Save date"
                  onPress={() => setVisitedDate(stadium.id, visitedDateInput.trim() || null)}
                />
                <ActionButton
                  label="Today"
                  onPress={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    setVisitedDateInput(today);
                    setVisitedDate(stadium.id, today);
                  }}
                  secondary
                />
                {visited ? (
                  <ActionButton
                    label="Clear"
                    onPress={() => {
                      setVisitedDateInput("");
                      clearVisited(stadium.id);
                    }}
                    secondary
                  />
                ) : null}
              </View>
            </View>
          </DetailBlock>

          <DetailBlock eyebrow="Profile" title="Ground details">
            <View style={styles.factsTable}>
              {factRows.map((row, index) => (
                <View
                  key={row.label}
                  style={[styles.factRow, index < factRows.length - 1 ? styles.factRowBorder : null]}
                >
                  <Text style={styles.factLabel}>{row.label}</Text>
                  <Text style={styles.factValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </DetailBlock>

          <DetailBlock eyebrow="Story" title="About this ground">
            <Text style={styles.bodyText}>{stadium.description}</Text>
            {stadium.statusNote ? (
              <View style={styles.notePanel}>
                <Text style={styles.noteLabel}>Status note</Text>
                <Text style={styles.noteText}>{stadium.statusNote}</Text>
              </View>
            ) : null}
            {stadium.tags.length ? (
              <View style={styles.tagWrap}>
                {stadium.tags.slice(0, 8).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </DetailBlock>

          <DetailBlock eyebrow="Location" title="Map and source">
            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <Text style={styles.blockLabel}>Area</Text>
                <Text style={styles.locationValue}>{stadium.locationLabel}</Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.blockLabel}>Coordinates</Text>
                <Text style={styles.locationValue}>{stadium.coordinatesLabel ?? "Not registered"}</Text>
              </View>
              {stadium.sourceHost ? (
                <View style={styles.locationRow}>
                  <Text style={styles.blockLabel}>Source</Text>
                  <Text style={styles.locationValue}>{stadium.sourceHost}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.footerActions}>
              {mapUrl ? <ActionButton label="Open map" onPress={() => Linking.openURL(mapUrl)} /> : null}
              {stadium.source ? (
                <ActionButton label="Open source" onPress={() => Linking.openURL(stadium.source!)} secondary />
              ) : null}
            </View>
          </DetailBlock>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailBlock({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <Text style={styles.blockEyebrow}>{eyebrow}</Text>
        <Text style={styles.blockTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function MetaPill({ label, subtle = false }: { label: string; subtle?: boolean }) {
  return (
    <View style={[styles.metaPill, subtle ? styles.metaPillSubtle : null]}>
      <Text style={[styles.metaPillText, subtle ? styles.metaPillTextSubtle : null]}>{label}</Text>
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
        pressed ? styles.buttonPressed : null,
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
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  pageHeaderText: {
    flex: 1,
    gap: spacing.xs,
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
    maxWidth: 620,
  },
  heroCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  heroTop: {
    gap: spacing.md,
  },
  heroCopy: {
    gap: spacing.sm,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  metaPill: {
    backgroundColor: colors.blue,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaPillSubtle: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderWidth: 1,
  },
  metaPillText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metaPillTextSubtle: {
    color: colors.textSoft,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  heroSubtitle: {
    color: colors.blueSoft,
    fontSize: 18,
    fontWeight: "700",
  },
  heroLocation: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.panelAlt,
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
  block: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  blockHeader: {
    gap: 4,
  },
  blockEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  blockTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  bodyText: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 24,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  logPanel: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  logPanelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  blockLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.shell,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  factsTable: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  factRow: {
    alignItems: "center",
    backgroundColor: colors.panelAlt,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
  },
  factRowBorder: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  factLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  factValue: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    paddingLeft: spacing.md,
    textAlign: "right",
  },
  notePanel: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  noteLabel: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  noteText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  locationCard: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  locationRow: {
    gap: 6,
  },
  locationValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  footerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  button: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  buttonPrimary: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  buttonSecondary: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  buttonLabelPrimary: {
    color: colors.white,
  },
  buttonLabelSecondary: {
    color: colors.textSoft,
  },
  missingState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  missingTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  missingText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
