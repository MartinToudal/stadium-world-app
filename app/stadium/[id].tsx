import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FavoriteButton } from "../../components/favorite-button";
import { StadiumStatusButton } from "../../components/stadium-status-button";
import { spacing } from "../../constants/theme";
import { useStadiumCollections } from "../../lib/favorites";
import { findStadiumById, formatCapacity, stadiumMapUrl } from "../../lib/stadiums";

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
  const infoRows = [
    { label: "Klub", value: stadium.team },
    { label: "Liga", value: stadium.league },
    { label: "By", value: stadium.city },
    { label: "Land", value: stadium.country },
    { label: "Kapacitet", value: formatCapacity(stadium.capacity) },
    { label: "Åbnet", value: stadium.opened ? String(stadium.opened) : "Ukendt" },
    { label: "Underlag", value: stadium.surface ?? "Ikke registreret" },
    { label: "Niveau", value: stadium.tier ? `${stadium.tier}. niveau` : "Ukendt" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: stadium.team }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.eyebrow}>{stadium.league}</Text>
              <Text style={styles.title}>{stadium.team}</Text>
              <Text style={styles.subtitle}>{stadium.stadiumName}</Text>
              <Text style={styles.meta}>
                {stadium.city}, {stadium.country}
              </Text>
            </View>
            <FavoriteButton active={isFavorite(stadium.id)} onPress={() => toggleFavorite(stadium.id)} />
          </View>
        </View>

        <Section title="Status">
          <View style={styles.statusRow}>
            <StadiumStatusButton
              active={visited}
              activeLabel="Besøgt"
              inactiveLabel="Markér besøgt"
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
              activeLabel="På wishlist"
              inactiveLabel="Til wishlist"
              onPress={() => toggleWishlist(stadium.id)}
              tone="wishlist"
            />
          </View>

          <Text style={styles.sectionBody}>
            {visited
              ? `Registreret som besøgt${visitedDate ? ` den ${visitedDate}` : ""}.`
              : "Markér stadionet som besøgt, når du har været der."}
          </Text>

          <View style={styles.dateBlock}>
            <Text style={styles.inputLabel}>Besøgsdato</Text>
            <TextInput
              onChangeText={setVisitedDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#737373"
              style={styles.input}
              value={visitedDateInput}
            />
            <View style={styles.actionRow}>
              <ActionButton
                label="Gem dato"
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
              {visited ? (
                <ActionButton
                  label="Ryd"
                  onPress={() => {
                    setVisitedDateInput("");
                    clearVisited(stadium.id);
                  }}
                  secondary
                />
              ) : null}
            </View>
          </View>
        </Section>

        <Section title="Stadiondata">
          <View style={styles.table}>
            {infoRows.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.tableRow,
                  index < infoRows.length - 1 ? styles.tableRowBorder : null,
                ]}
              >
                <Text style={styles.tableLabel}>{row.label}</Text>
                <Text style={styles.tableValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Om stadionet">
          <Text style={styles.sectionBody}>{stadium.description}</Text>
          {stadium.statusNote ? <Text style={styles.note}>{stadium.statusNote}</Text> : null}
        </Section>

        <Section title="Placering">
          <Text style={styles.sectionBody}>{stadium.locationLabel}</Text>
          <Text style={styles.coordinates}>{stadium.coordinatesLabel ?? "Koordinater kommer senere"}</Text>
        </Section>

        {stadium.tags.length ? (
          <Section title="Tags">
            <View style={styles.tagWrap}>
              {stadium.tags.slice(0, 8).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        <View style={styles.footerActions}>
          {mapUrl ? <ActionButton label="Åbn i kort" onPress={() => Linking.openURL(mapUrl)} /> : null}
          {stadium.source ? <ActionButton label="Åbn kilde" onPress={() => Linking.openURL(stadium.source!)} secondary /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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
    padding: spacing.lg,
  },
  heroTopRow: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  heroTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: "#A3A3A3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: "#FAFAFA",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#E5E5E5",
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: "#A3A3A3",
    fontSize: 14,
  },
  section: {
    backgroundColor: "#111111",
    borderColor: "#262626",
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    color: "#FAFAFA",
    fontSize: 20,
    fontWeight: "700",
  },
  sectionBody: {
    color: "#D4D4D4",
    fontSize: 15,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  dateBlock: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: "#A3A3A3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 12,
    borderWidth: 1,
    color: "#FAFAFA",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  table: {
    borderColor: "#2A2A2A",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableRow: {
    alignItems: "center",
    backgroundColor: "#111111",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  tableRowBorder: {
    borderBottomColor: "#262626",
    borderBottomWidth: 1,
  },
  tableLabel: {
    color: "#A3A3A3",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tableValue: {
    color: "#FAFAFA",
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    paddingLeft: spacing.md,
    textAlign: "right",
  },
  note: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 12,
    borderWidth: 1,
    color: "#E5E5E5",
    fontSize: 14,
    lineHeight: 21,
    padding: spacing.md,
  },
  coordinates: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "600",
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: "#D4D4D4",
    fontSize: 12,
    fontWeight: "700",
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
    backgroundColor: "#262626",
    borderColor: "#404040",
  },
  buttonSecondary: {
    backgroundColor: "#171717",
    borderColor: "#2A2A2A",
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  buttonLabelPrimary: {
    color: "#FAFAFA",
  },
  buttonLabelSecondary: {
    color: "#D4D4D4",
  },
  missingState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  missingTitle: {
    color: "#FAFAFA",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  missingText: {
    color: "#A3A3A3",
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
