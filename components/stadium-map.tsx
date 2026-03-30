import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { spacing } from "../constants/theme";
import { hasCoordinates, Stadium } from "../lib/stadiums";

type StadiumMapProps = {
  stadiums: Stadium[];
  onSelect: (stadiumId: string) => void;
  selectedId?: string | null;
};

const MAP_HEIGHT = 520;

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
  const topCountries = countryGroups.slice(0, 10);
  const selectedStadium = mappableStadiums.find((stadium) => stadium.id === selectedId) ?? mappableStadiums[0] ?? null;
  const selectedPoint =
    selectedStadium && selectedStadium.latitude != null && selectedStadium.longitude != null
      ? toMapPoint(selectedStadium.latitude, selectedStadium.longitude)
      : null;

  return (
    <View style={styles.frame}>
      <View style={styles.stage}>
        <View style={styles.stageGlowPrimary} />
        <View style={styles.stageGlowSecondary} />
        <View style={[styles.landmass, styles.landmassNorthAmerica]} />
        <View style={[styles.landmass, styles.landmassSouthAmerica]} />
        <View style={[styles.landmass, styles.landmassEurope]} />
        <View style={[styles.landmass, styles.landmassAfrica]} />
        <View style={[styles.landmass, styles.landmassMiddleEast]} />

        <View style={styles.stageHeader}>
          <View style={styles.stageHeaderText}>
            <Text style={styles.eyebrow}>MAP VIEW</Text>
            <Text style={styles.title}>Stadions på tværs af regioner</Text>
            <Text style={styles.text}>Zoom ikke med fingrene endnu. Brug i stedet markører og hotspots til at bevæge dig hurtigt rundt.</Text>
          </View>

          <View style={styles.legend}>
            <LegendPill label="Stadions" tone="default" />
            <LegendPill label="Valgt" tone="selected" />
          </View>
        </View>

        <View style={styles.summaryDock}>
          <StatPill label="Punkter" value={String(mappableStadiums.length)} />
          <StatPill label="Lande" value={String(countryGroups.length)} />
          <StatPill label="Hotspot" value={topCountries[0]?.country ?? "Ingen"} />
        </View>

        <View style={[styles.regionLabel, { left: 18, top: 112 }]}>
          <Text style={styles.regionLabelText}>North America</Text>
        </View>
        <View style={[styles.regionLabel, { left: "24%", top: "72%" }]}>
          <Text style={styles.regionLabelText}>South America</Text>
        </View>
        <View style={[styles.regionLabel, { left: "47%", top: 108 }]}>
          <Text style={styles.regionLabelText}>Europe</Text>
        </View>
        <View style={[styles.regionLabel, { left: "54%", top: "62%" }]}>
          <Text style={styles.regionLabelText}>Middle East</Text>
        </View>

        <View style={styles.gridOverlay}>
          <View style={[styles.gridLineHorizontal, { top: "25%" }]} />
          <View style={[styles.gridLineHorizontal, { top: "50%" }]} />
          <View style={[styles.gridLineHorizontal, { top: "75%" }]} />
          <View style={[styles.gridLineVertical, { left: "25%" }]} />
          <View style={[styles.gridLineVertical, { left: "50%" }]} />
          <View style={[styles.gridLineVertical, { left: "75%" }]} />
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
                active && styles.markerActive,
                pressed && styles.markerPressed,
              ]}
            >
              {active ? <View style={styles.markerPulse} /> : null}
              <View style={[styles.markerDot, active && styles.markerDotActive]} />
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
            <Text style={styles.calloutCountry}>{selectedStadium.country}</Text>
            <Text style={styles.calloutTeam}>{selectedStadium.team}</Text>
            <Text style={styles.calloutName}>{selectedStadium.stadiumName}</Text>
            <Text style={styles.calloutMeta}>
              {selectedStadium.city} · {selectedStadium.league}
            </Text>
          </View>
        ) : null}

        <View style={styles.hotspotDock}>
          <View style={styles.hotspotHeader}>
            <Text style={styles.hotspotTitle}>Hotspots</Text>
            <Text style={styles.hotspotText}>Vælg et land og spring direkte til en relevant markør.</Text>
          </View>

          <View style={styles.countryGrid}>
            {topCountries.map((entry) => {
              const active = selectedStadium?.country === entry.country;

              return (
                <Pressable
                  key={entry.country}
                  onPress={() => onSelect(entry.first.id)}
                  style={({ pressed }) => [
                    styles.countryCard,
                    active && styles.countryCardActive,
                    pressed && styles.countryCardPressed,
                  ]}
                >
                  <Text style={[styles.countryName, active && styles.countryNameActive]}>{entry.country}</Text>
                  <Text style={[styles.countryCount, active && styles.countryCountActive]}>{entry.count} stadioner</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
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
    borderRadius: 28,
    overflow: "hidden",
  },
  stage: {
    backgroundColor: "#0B1020",
    borderColor: "#1E293B",
    borderRadius: 28,
    borderWidth: 1,
    height: MAP_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  stageGlowPrimary: {
    backgroundColor: "rgba(56,189,248,0.18)",
    borderRadius: 999,
    height: 260,
    position: "absolute",
    right: -40,
    top: -20,
    width: 260,
  },
  stageGlowSecondary: {
    backgroundColor: "rgba(148,163,184,0.12)",
    borderRadius: 999,
    height: 220,
    left: -50,
    position: "absolute",
    top: 170,
    width: 220,
  },
  landmass: {
    backgroundColor: "#132238",
    borderColor: "rgba(148,163,184,0.08)",
    borderRadius: 999,
    borderWidth: 1,
    position: "absolute",
  },
  landmassNorthAmerica: {
    height: 140,
    left: 28,
    top: 140,
    transform: [{ rotate: "-9deg" }],
    width: 170,
  },
  landmassSouthAmerica: {
    height: 160,
    left: 145,
    top: 286,
    transform: [{ rotate: "14deg" }],
    width: 92,
  },
  landmassEurope: {
    height: 84,
    right: 182,
    top: 152,
    transform: [{ rotate: "-8deg" }],
    width: 112,
  },
  landmassAfrica: {
    height: 164,
    right: 170,
    top: 228,
    transform: [{ rotate: "8deg" }],
    width: 106,
  },
  landmassMiddleEast: {
    height: 96,
    right: 72,
    top: 246,
    transform: [{ rotate: "-12deg" }],
    width: 124,
  },
  stageHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  stageHeaderText: {
    flex: 1,
    gap: 6,
    maxWidth: 440,
  },
  eyebrow: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },
  text: {
    color: "#94A3B8",
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
  legendPill: {
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.74)",
    borderColor: "rgba(148,163,184,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendDot: {
    backgroundColor: "#38BDF8",
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  legendDotSelected: {
    backgroundColor: "#F8FAFC",
  },
  legendText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryDock: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    left: spacing.lg,
    position: "absolute",
    top: 124,
    zIndex: 3,
  },
  statPill: {
    backgroundColor: "rgba(15,23,42,0.84)",
    borderColor: "rgba(148,163,184,0.16)",
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 108,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statPillValue: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
  },
  statPillLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },
  regionLabel: {
    position: "absolute",
  },
  regionLabelText: {
    color: "rgba(148,163,184,0.55)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineHorizontal: {
    backgroundColor: "rgba(148,163,184,0.08)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  gridLineVertical: {
    backgroundColor: "rgba(148,163,184,0.08)",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 1,
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
    opacity: 0.85,
  },
  markerPulse: {
    backgroundColor: "rgba(56,189,248,0.18)",
    borderRadius: 999,
    height: 24,
    position: "absolute",
    width: 24,
  },
  markerDot: {
    backgroundColor: "#38BDF8",
    borderColor: "#E2E8F0",
    borderRadius: 999,
    borderWidth: 2,
    height: 10,
    width: 10,
  },
  markerDotActive: {
    backgroundColor: "#F8FAFC",
    borderColor: "#38BDF8",
    height: 14,
    width: 14,
  },
  callout: {
    backgroundColor: "rgba(15,23,42,0.94)",
    borderColor: "rgba(148,163,184,0.18)",
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
  calloutCountry: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  calloutTeam: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  calloutName: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  calloutMeta: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 5,
  },
  hotspotDock: {
    backgroundColor: "rgba(15,23,42,0.84)",
    borderTopColor: "rgba(148,163,184,0.14)",
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    padding: spacing.md,
    position: "absolute",
    right: 0,
  },
  hotspotHeader: {
    gap: 4,
  },
  hotspotTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },
  hotspotText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
  },
  countryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  countryCard: {
    backgroundColor: "#111827",
    borderColor: "#1F2937",
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 134,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  countryCardActive: {
    backgroundColor: "#1D4ED8",
    borderColor: "#60A5FA",
  },
  countryCardPressed: {
    opacity: 0.86,
  },
  countryName: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "800",
  },
  countryNameActive: {
    color: "#F8FAFC",
  },
  countryCount: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },
  countryCountActive: {
    color: "#DBEAFE",
  },
});
