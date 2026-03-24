import { StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

import { colors, spacing } from "../constants/theme";
import { getMapCenter, Stadium } from "../lib/stadiums";

type StadiumMapProps = {
  stadiums: Stadium[];
  onSelect: (stadiumId: string) => void;
  selectedId?: string | null;
};

export function StadiumMap({ stadiums, onSelect, selectedId }: StadiumMapProps) {
  const region = getMapCenter(stadiums);

  return (
    <View style={styles.frame}>
      <MapView initialRegion={region} style={styles.map}>
        {stadiums.map((stadium) => (
          <Marker
            coordinate={{ latitude: stadium.latitude, longitude: stadium.longitude }}
            key={stadium.id}
            pinColor={stadium.id === selectedId ? colors.plum : colors.accent}
            onPress={() => onSelect(stadium.id)}
          >
            <Callout onPress={() => onSelect(stadium.id)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTeam}>{stadium.team}</Text>
                <Text style={styles.calloutName}>{stadium.stadiumName}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderColor: colors.line,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  map: {
    height: 420,
    width: "100%",
  },
  callout: {
    gap: 4,
    maxWidth: 220,
    padding: spacing.xs,
  },
  calloutTeam: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  calloutName: {
    color: colors.muted,
    fontSize: 12,
  },
});
