import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";
import { communityGalleryPolicy, getCommunityGalleryReadiness } from "../lib/community-gallery";

export function CommunityGalleryPanel({ stadiumId }: { stadiumId: string }) {
  const readiness = getCommunityGalleryReadiness(stadiumId);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Community Gallery</Text>
        </View>
        <Text style={styles.title}>Billedgalleri bliver community-bygget.</Text>
        <Text style={styles.text}>{communityGalleryPolicy.summary}</Text>
      </View>

      <View style={styles.statsRow}>
        <InfoCard label="Uploads åbne" value={readiness.acceptingUploads ? "Ja" : "Ikke endnu"} />
        <InfoCard label="Godkendte fotos" value={String(readiness.approvedPhotos)} />
        <InfoCard label="Moderation" value={readiness.moderationRequired ? "Påkrævet" : "Ingen"} />
      </View>

      <View style={styles.ruleBlock}>
        <Text style={styles.ruleTitle}>Grundregler før vi åbner uploads</Text>
        {communityGalleryPolicy.requirements.slice(0, 3).map((requirement) => (
          <Text key={requirement} style={styles.ruleText}>
            - {requirement}
          </Text>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Næste produkttrin</Text>
        <Text style={styles.noteText}>
          Første version bør starte med indsendelser i `pending`, en enkel rettighedserklæring og manuel moderation,
          før nogen billeder bliver synlige offentligt.
        </Text>
      </View>
    </View>
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

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.paper,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
  },
  text: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 150,
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
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
  },
  ruleBlock: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    gap: spacing.xs,
    padding: spacing.md,
  },
  ruleTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  ruleText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  noteCard: {
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
  },
  noteTitle: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: "800",
  },
  noteText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
});
