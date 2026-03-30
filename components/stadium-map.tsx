import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";
import { hasCoordinates, Stadium } from "../lib/stadiums";

type StadiumMapProps = {
  stadiums: Stadium[];
  onSelect: (stadiumId: string) => void;
  selectedId?: string | null;
};

const MAP_HEIGHT = 500;

function toMapPoint(latitude: number, longitude: number) {
  const leftValue = Math.min(96, Math.max(4, ((longitude + 180) / 360) * 100));
  const topValue = Math.min(92, Math.max(8, ((90 - latitude) / 180) * 100));

  return {
    leftValue,
    topValue,
    style: {
      left: `${leftValue}%` as `${number}%`,
      top: `${topValue}%` as `${number}%`,
    },
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
  const mappableStadiums = stadiums.filter(hasCoordinates);
  const countryGroups = getCountryGroups(mappableStadiums);
  const selectedStadium = mappableStadiums.find((stadium) => stadium.id === selectedId) ?? mappableStadiums[0] ?? null;
  const selectedPoint =
    selectedStadium && selectedStadium.latitude != null && selectedStadium.longitude != null
      ? toMapPoint(selectedStadium.latitude, selectedStadium.longitude)
      : null;

  return (
    <View style={styles.frame}>
      <View style={styles.stage}>
        <View style={styles.stageGlow} />
        <View style={styles.gridOverlay}>
          <View style={[styles.gridLineHorizontal, { top: "25%" }]} />
          <View style={[styles.gridLineHorizontal, { top: "50%" }]} />
          <View style={[styles.gridLineHorizontal, { top: "75%" }]} />
          <View style={[styles.gridLineVertical, { left: "25%" }]} />
          <View style={[styles.gridLineVertical, { left: "50%" }]} />
          <View style={[styles.gridLineVertical, { left: "75%" }]} />
        </View>

        <View style={[styles.continentShape, styles.northAmerica]} />
        <View style={[styles.continentShape, styles.southAmerica]} />
        <View style={[styles.continentShape, styles.europe]} />
        <View style={[styles.continentShape, styles.africa]} />
        <View style={[styles.continentShape, styles.middleEast]} />

        <View style={styles.mapHeader}>
          <View style={styles.mapHeaderText}>
            <Text style={styles.eyebrow}>Map View</Text>
            <Text style={styles.title}>Grounds with saved coordinates</Text>
            <Text style={styles.text}>Select a point to jump into the chosen ground profile.</Text>
          </View>

          <View style={styles.legend}>
            <LegendItem label="Ground" active={false} />
            <LegendItem label="Selected" active />
          </View>
        </View>

        <View style={styles.regionLabels}>
          <RegionLabel label="North America" left="8%" top="26%" />
          <RegionLabel label="South America" left="22%" top="72%" />
          <RegionLabel label="Europe" left="49%" top="24%" />
          <RegionLabel label="Middle East" left="63%" top="56%" />
        </View>

        {mappableStadiums.map((stadium) => {
          const point = toMapPoint(stadium.latitude as number, stadium.longitude as number);
          const active = stadium.id === selectedStadium?.id;

          return (
            <Pressable
              accessibilityRole="button"
              key={stadium.id}
              onPress={() => onSelect(stadium.id)}
              style={({ pressed }) => [
                styles.marker,
                point.style,
                active ? styles.markerActive : null,
                pressed ? styles.markerPressed : null,
              ]}
            >
              {active ? <View style={styles.markerHalo} /> : null}
              <View style={[styles.markerDot, active ? styles.markerDotActive : null]} />
            </Pressable>
          );
        })}

        {selectedStadium && selectedPoint ? (
          <View
            style={[
              styles.callout,
              selectedPoint.style,
              selectedPoint.leftValue > 68 ? styles.calloutLeft : styles.calloutRight,
              selectedPoint.topValue < 22 ? styles.calloutBelow : styles.calloutAbove,
            ]}
          >
            <Text style={styles.calloutEyebrow}>{selectedStadium.country}</Text>
            <Text style={styles.calloutTitle}>{selectedStadium.team}</Text>
            <Text style={styles.calloutText}>{selectedStadium.stadiumName}</Text>
            <Text style={styles.calloutMeta}>
              {selectedStadium.city} · {selectedStadium.league}
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryBar}>
          <SummaryPill label="Points" value={String(mappableStadiums.length)} />
          <SummaryPill label="Countries" value={String(countryGroups.length)} />
          <SummaryPill label="Top cluster" value={countryGroups[0]?.country ?? "None"} />
        </View>
      </View>
    </View>
  );
}

function RegionLabel({ label, left, top }: { label: string; left: `${number}%`; top: `${number}%` }) {
  return (
    <View style={[styles.regionLabel, { left, top }]}>
      <Text style={styles.regionLabelText}>{label}</Text>
    </View>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function LegendItem({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, active ? styles.legendDotActive : null]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 28,
    overflow: "hidden",
  },
  stage: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: MAP_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  stageGlow: {
    backgroundColor: "rgba(37,99,235,0.08)",
    borderRadius: 999,
    height: 320,
    position: "absolute",
    right: -90,
    top: -60,
    width: 320,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineHorizontal: {
    backgroundColor: "rgba(148,163,184,0.06)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  gridLineVertical: {
    backgroundColor: "rgba(148,163,184,0.06)",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 1,
  },
  continentShape: {
    backgroundColor: "#171C26",
    borderColor: "rgba(148,163,184,0.05)",
    borderRadius: 999,
    borderWidth: 1,
    position: "absolute",
  },
  northAmerica: {
    height: 122,
    left: 42,
    top: 138,
    transform: [{ rotate: "-10deg" }],
    width: 154,
  },
  southAmerica: {
    height: 148,
    left: 146,
    top: 286,
    transform: [{ rotate: "14deg" }],
    width: 86,
  },
  europe: {
    height: 72,
    right: 192,
    top: 148,
    transform: [{ rotate: "-8deg" }],
    width: 104,
  },
  africa: {
    height: 154,
    right: 176,
    top: 224,
    transform: [{ rotate: "8deg" }],
    width: 94,
  },
  middleEast: {
    height: 86,
    right: 70,
    top: 248,
    transform: [{ rotate: "-12deg" }],
    width: 122,
  },
  mapHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  mapHeaderText: {
    flex: 1,
    gap: 6,
    maxWidth: 460,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
  },
  text: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end",
    maxWidth: 220,
  },
  legendItem: {
    alignItems: "center",
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendDot: {
    backgroundColor: colors.blue,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  legendDotActive: {
    backgroundColor: colors.white,
  },
  legendText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  regionLabels: {
    ...StyleSheet.absoluteFillObject,
  },
  regionLabel: {
    position: "absolute",
  },
  regionLabelText: {
    color: "rgba(148,163,184,0.5)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  marker: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    marginLeft: -12,
    marginTop: -12,
    position: "absolute",
    width: 24,
    zIndex: 4,
  },
  markerActive: {
    zIndex: 8,
  },
  markerPressed: {
    opacity: 0.86,
  },
  markerHalo: {
    backgroundColor: "rgba(37,99,235,0.18)",
    borderRadius: 999,
    height: 24,
    position: "absolute",
    width: 24,
  },
  markerDot: {
    backgroundColor: colors.blue,
    borderColor: colors.text,
    borderRadius: 999,
    borderWidth: 2,
    height: 10,
    width: 10,
  },
  markerDotActive: {
    backgroundColor: colors.white,
    borderColor: colors.blue,
    height: 14,
    width: 14,
  },
  callout: {
    backgroundColor: colors.shell,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 220,
    minWidth: 160,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "absolute",
    zIndex: 9,
  },
  calloutAbove: {
    marginTop: -86,
  },
  calloutBelow: {
    marginTop: 18,
  },
  calloutRight: {
    marginLeft: 14,
  },
  calloutLeft: {
    marginLeft: -194,
  },
  calloutEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  calloutTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  calloutText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  calloutMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 5,
  },
  summaryBar: {
    bottom: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    left: spacing.md,
    position: "absolute",
    right: spacing.md,
  },
  summaryPill: {
    backgroundColor: colors.shell,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 108,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
});
