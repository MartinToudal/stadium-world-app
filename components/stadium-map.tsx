import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";
import { Stadium } from "../lib/stadiums";

type StadiumMapProps = {
  stadiums: Stadium[];
  onSelect: (stadiumId: string) => void;
  selectedId?: string | null;
};

const MAP_HEIGHT = 420;

function toMapPoint(latitude: number, longitude: number) {
  const left = ((longitude + 180) / 360) * 100;
  const top = ((90 - latitude) / 180) * 100;

  return {
    left: `${Math.min(98, Math.max(2, left))}%`,
    top: `${Math.min(96, Math.max(4, top))}%`,
  };
}

function getCountryGroups(stadiums: Stadium[]) {
  return [...new Set(stadiums.map((stadium) => stadium.country))]
    .map((country) => {
      const items = stadiums.filter((stadium) => stadium.country === country);
      return {
        country,
        count: items.length,
        first: items[0],
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function StadiumMap({ stadiums, onSelect, selectedId }: StadiumMapProps) {
  const countryGroups = getCountryGroups(stadiums);
  const topCountries = countryGroups.slice(0, 8);
  const selectedStadium = stadiums.find((stadium) => stadium.id === selectedId) ?? null;

  return (
    <View style={styles.frame}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Kortlag</Text>
          <Text style={styles.text}>
            Webversionen viser nu stadionerne direkte på et koordinatkort, så du kan scanne geografi og hotspots uden
            at vente på den native iOS-mapoplevelse.
          </Text>
        </View>
        <View style={styles.legend}>
          <LegendPill label="Alle stadioner" tone="default" />
          <LegendPill label="Valgt stadion" tone="selected" />
        </View>
      </View>

      <View style={styles.canvasWrap}>
        <View style={styles.canvas}>
          <View style={[styles.gridLineHorizontal, { top: "25%" }]} />
          <View style={[styles.gridLineHorizontal, { top: "50%" }]} />
          <View style={[styles.gridLineHorizontal, { top: "75%" }]} />
          <View style={[styles.gridLineVertical, { left: "25%" }]} />
          <View style={[styles.gridLineVertical, { left: "50%" }]} />
          <View style={[styles.gridLineVertical, { left: "75%" }]} />

          <View style={[styles.regionLabel, { left: 18, top: 16 }]}>
            <Text style={styles.regionLabelText}>North America</Text>
          </View>
          <View style={[styles.regionLabel, { left: "42%", top: 20 }]}>
            <Text style={styles.regionLabelText}>Europe</Text>
          </View>
          <View style={[styles.regionLabel, { left: "58%", top: "55%" }]}>
            <Text style={styles.regionLabelText}>Middle East</Text>
          </View>
          <View style={[styles.regionLabel, { left: "27%", top: "69%" }]}>
            <Text style={styles.regionLabelText}>South America</Text>
          </View>

          {stadiums.map((stadium) => {
            const point = toMapPoint(stadium.latitude, stadium.longitude);
            const active = stadium.id === selectedId;

            return (
              <Pressable
                accessibilityRole="button"
                key={stadium.id}
                onPress={() => onSelect(stadium.id)}
                style={({ pressed }) => [
                  styles.marker,
                  {
                    left: point.left,
                    top: point.top,
                  },
                  active && styles.markerActive,
                  pressed && styles.markerPressed,
                ]}
              >
                <View style={[styles.markerDot, active && styles.markerDotActive]} />
              </Pressable>
            );
          })}

          {selectedStadium ? (
            <View
              style={[
                styles.callout,
                {
                  ...toMapPoint(selectedStadium.latitude, selectedStadium.longitude),
                },
              ]}
            >
              <Text style={styles.calloutTeam}>{selectedStadium.team}</Text>
              <Text style={styles.calloutName}>{selectedStadium.stadiumName}</Text>
              <Text style={styles.calloutMeta}>{selectedStadium.city}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.summaryRow}>
        <StatCard label="Stadions" value={String(stadiums.length)} />
        <StatCard label="Lande" value={String(new Set(stadiums.map((stadium) => stadium.country)).size)} />
        <StatCard label="Hotspot" value={topCountries[0]?.country ?? "Ingen"} />
      </View>

      <View style={styles.hotspotSection}>
        <Text style={styles.hotspotTitle}>Hotspots</Text>
        <Text style={styles.hotspotText}>
          Tryk på et land for at hoppe til en repræsentativ stadionpost i det område.
        </Text>
        <View style={styles.countryGrid}>
          {topCountries.map((entry) => {
            const active = selectedStadium?.country === entry.country;

            return (
              <Pressable
                key={entry.country}
                onPress={() => onSelect(entry.first.id)}
                style={[styles.countryCard, active && styles.countryCardActive]}
              >
                <Text style={[styles.countryName, active && styles.countryNameActive]}>{entry.country}</Text>
                <Text style={[styles.countryCount, active && styles.countryCountActive]}>
                  {entry.count} stadioner
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LegendPill({ label, tone }: { label: string; tone: "default" | "selected" }) {
  return (
    <View style={styles.legendPill}>
      <View style={[styles.legendDot, tone === "selected" && styles.legendDotSelected]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    gap: spacing.md,
  },
  headerText: {
    gap: spacing.sm,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
  },
  text: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  legendPill: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendDot: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendDotSelected: {
    backgroundColor: colors.plum,
  },
  legendText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  canvasWrap: {
    borderColor: colors.line,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  canvas: {
    backgroundColor: "#E8F0F4",
    height: MAP_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  gridLineHorizontal: {
    backgroundColor: "rgba(35,64,95,0.08)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  gridLineVertical: {
    backgroundColor: "rgba(35,64,95,0.08)",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 1,
  },
  regionLabel: {
    position: "absolute",
  },
  regionLabelText: {
    color: "rgba(24,22,31,0.4)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  marker: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    marginLeft: -11,
    marginTop: -11,
    position: "absolute",
    width: 22,
    zIndex: 2,
  },
  markerActive: {
    zIndex: 4,
  },
  markerPressed: {
    opacity: 0.8,
  },
  markerDot: {
    backgroundColor: colors.accent,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 2,
    height: 10,
    width: 10,
  },
  markerDotActive: {
    backgroundColor: colors.plum,
    height: 14,
    width: 14,
  },
  callout: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 10,
    marginTop: -56,
    maxWidth: 180,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: "absolute",
    zIndex: 5,
  },
  calloutTeam: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  calloutName: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  calloutMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.paper,
    borderRadius: 18,
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
  hotspotSection: {
    gap: spacing.sm,
  },
  hotspotTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  hotspotText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  countryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  countryCard: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 150,
    padding: spacing.md,
  },
  countryCardActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  countryName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  countryNameActive: {
    color: colors.white,
  },
  countryCount: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  countryCountActive: {
    color: "#DCCFC1",
  },
});
