import { useEffect, useMemo, useState, type ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

import { colors, spacing } from "../constants/theme";
import { getMapCenter, hasCoordinates, Stadium } from "../lib/stadiums";

type StadiumMapProps = {
  stadiums: Stadium[];
  onSelect: (stadiumId: string) => void;
  selectedId?: string | null;
};

type BoundsTuple = [[number, number], [number, number]];

const LeafletMapContainer = MapContainer as unknown as (props: any) => ReactElement | null;
const LeafletTileLayer = TileLayer as unknown as (props: any) => ReactElement | null;
const LeafletCircleMarker = CircleMarker as unknown as (props: any) => ReactElement | null;

function getBounds(stadiums: Stadium[]): BoundsTuple | null {
  if (!stadiums.length) {
    return null;
  }

  const latitudes = stadiums.map((stadium) => stadium.latitude as number);
  const longitudes = stadiums.map((stadium) => stadium.longitude as number);

  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}

function MapViewportController({
  bounds,
  selectedStadium,
}: {
  bounds: BoundsTuple | null;
  selectedStadium: Stadium | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedStadium?.latitude != null && selectedStadium.longitude != null) {
      map.flyTo([selectedStadium.latitude, selectedStadium.longitude], Math.max(map.getZoom(), 6), {
        animate: true,
        duration: 0.65,
      });
      return;
    }

    if (bounds) {
      map.fitBounds(bounds, { padding: [28, 28] });
    }
  }, [bounds, map, selectedStadium]);

  return null;
}

export function StadiumMap({ stadiums, onSelect, selectedId }: StadiumMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof document !== "undefined" && !document.getElementById("leaflet-cdn-stylesheet")) {
      const link = document.createElement("link");
      link.id = "leaflet-cdn-stylesheet";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  const mappableStadiums = useMemo(() => stadiums.filter(hasCoordinates), [stadiums]);
  const selectedStadium = mappableStadiums.find((stadium) => stadium.id === selectedId) ?? mappableStadiums[0] ?? null;
  const bounds = useMemo(() => getBounds(mappableStadiums), [mappableStadiums]);
  const center = useMemo(() => getMapCenter(mappableStadiums), [mappableStadiums]);

  if (!mounted) {
    return (
      <View style={styles.placeholderFrame}>
        <Text style={styles.placeholderEyebrow}>Map View</Text>
        <Text style={styles.placeholderTitle}>Loading interactive map</Text>
        <Text style={styles.placeholderText}>The web map is preparing the live tiles and stadium markers.</Text>
      </View>
    );
  }

  if (!mappableStadiums.length) {
    return (
      <View style={styles.placeholderFrame}>
        <Text style={styles.placeholderEyebrow}>Map View</Text>
        <Text style={styles.placeholderTitle}>No mapped grounds available</Text>
        <Text style={styles.placeholderText}>Try a different filter to bring stadiums with coordinates back into the view.</Text>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <View style={styles.mapMeta}>
        <View style={styles.mapMetaText}>
          <Text style={styles.eyebrow}>Live Map</Text>
          <Text style={styles.title}>Pan, zoom and select grounds directly on the map.</Text>
          <Text style={styles.text}>Tiles by OpenStreetMap. Click any marker to sync the selected ground below.</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countValue}>{mappableStadiums.length}</Text>
          <Text style={styles.countLabel}>mapped grounds</Text>
        </View>
      </View>

      <View style={styles.mapShell}>
        <LeafletMapContainer
          bounds={bounds ?? undefined}
          center={[center.latitude, center.longitude]}
          style={styles.map}
          zoom={2}
          zoomControl
          scrollWheelZoom
        >
          <LeafletTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <MapViewportController bounds={bounds} selectedStadium={selectedStadium} />

          {mappableStadiums.map((stadium) => {
            const active = stadium.id === selectedStadium?.id;

            return (
              <LeafletCircleMarker
                center={[stadium.latitude as number, stadium.longitude as number]}
                eventHandlers={{ click: () => onSelect(stadium.id) }}
                key={stadium.id}
                pathOptions={{
                  color: active ? colors.blue : colors.text,
                  fillColor: active ? colors.white : colors.blue,
                  fillOpacity: 0.92,
                  weight: active ? 3 : 2,
                }}
                radius={active ? 8 : 6}
              >
                <Popup>
                  <View style={styles.popup}>
                    <Text style={styles.popupTeam}>{stadium.team}</Text>
                    <Text style={styles.popupName}>{stadium.stadiumName}</Text>
                    <Text style={styles.popupMeta}>
                      {stadium.city}, {stadium.country}
                    </Text>
                  </View>
                </Popup>
              </LeafletCircleMarker>
            );
          })}
        </LeafletMapContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.md,
  },
  mapMeta: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  mapMetaText: {
    flex: 1,
    gap: 6,
    maxWidth: 560,
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
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  text: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  countPill: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  countValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  countLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    textTransform: "uppercase",
  },
  mapShell: {
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  map: {
    height: 560,
    width: "100%",
  },
  popup: {
    gap: 2,
    minWidth: 140,
  },
  popupTeam: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  popupName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600",
  },
  popupMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  placeholderFrame: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 280,
    padding: spacing.lg,
  },
  placeholderEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  placeholderText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
});
