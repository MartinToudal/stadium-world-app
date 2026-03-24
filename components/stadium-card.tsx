import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";
import { useStadiumCollections } from "../lib/favorites";
import { Stadium, formatCapacity } from "../lib/stadiums";
import { FavoriteButton } from "./favorite-button";
import { StadiumStatusButton } from "./stadium-status-button";

type StadiumCardProps = {
  stadium: Stadium;
};

export function StadiumCard({ stadium }: StadiumCardProps) {
  const { isFavorite, isVisited, isWishlisted, toggleFavorite, toggleVisited, toggleWishlist } = useStadiumCollections();
  const favorite = isFavorite(stadium.id);
  const visited = isVisited(stadium.id);
  const wishlisted = isWishlisted(stadium.id);

  return (
    <Pressable
      onPress={() => router.push(`/stadium/${stadium.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.heroBand}>
        <View style={styles.heroOrb} />
        <View style={styles.heroTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{stadium.country.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.leaguePill}>
            <Text style={styles.leaguePillText}>{stadium.league}</Text>
          </View>
          <FavoriteButton
            active={favorite}
            onPress={(event) => {
              event?.stopPropagation();
              toggleFavorite(stadium.id);
            }}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.team}>{stadium.team}</Text>
          <Text style={styles.stadium}>{stadium.stadiumName}</Text>
          <Text style={styles.meta}>
            {stadium.city} · {stadium.country}
          </Text>
          {visited || wishlisted ? (
            <View style={styles.statusRow}>
              {visited ? (
                <View style={[styles.statusPill, styles.statusVisited]}>
                  <Text style={[styles.statusPillText, styles.statusVisitedText]}>Besøgt</Text>
                </View>
              ) : null}
              {wishlisted ? (
                <View style={[styles.statusPill, styles.statusWishlist]}>
                  <Text style={[styles.statusPillText, styles.statusWishlistText]}>Wishlist</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.metricCard}>
          <Text style={styles.footerLabel}>Kapacitet</Text>
          <Text style={styles.footerValue}>{formatCapacity(stadium.capacity)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.footerLabel}>Åbnet</Text>
          <Text style={styles.footerValue}>{stadium.opened ?? "Ukendt"}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.footerLabel}>Niveau</Text>
          <Text style={styles.footerValue}>{stadium.tier ?? "?"}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <StadiumStatusButton
          active={visited}
          activeLabel="Besøgt"
          inactiveLabel="Markér besøgt"
          onPress={(event) => {
            event?.stopPropagation();
            toggleVisited(stadium.id);
          }}
          tone="visited"
        />
        <StadiumStatusButton
          active={wishlisted}
          activeLabel="På wishlist"
          inactiveLabel="Til wishlist"
          onPress={(event) => {
            event?.stopPropagation();
            toggleWishlist(stadium.id);
          }}
          tone="wishlist"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    overflow: "hidden",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 26,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  heroBand: {
    backgroundColor: colors.card,
    gap: spacing.md,
    padding: spacing.md,
    position: "relative",
  },
  heroOrb: {
    backgroundColor: colors.sand,
    borderRadius: 999,
    height: 120,
    position: "absolute",
    right: -24,
    top: -36,
    width: 120,
  },
  heroTopRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.plum,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  badgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  leaguePill: {
    alignSelf: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leaguePillText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusVisited: {
    backgroundColor: "#DCEEE7",
  },
  statusWishlist: {
    backgroundColor: "#F7E9C8",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusVisitedText: {
    color: colors.moss,
  },
  statusWishlistText: {
    color: colors.ink,
  },
  team: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
  },
  stadium: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "700",
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  footerLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  footerValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
});
