import stadiumsData from "../data/stadiums.json";

export type Stadium = {
  id: string;
  stadiumName: string;
  team: string;
  league: string;
  country: string;
  tier: number | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  opened: number | null;
  surface: string | null;
  source: string | null;
  sourceHost: string | null;
  region: string;
  coordinatesLabel: string | null;
  capacityBucket: string;
  isTopFlight: boolean;
  locationLabel: string;
  description: string;
  statusNote: string | null;
  aliases: string[];
  tags: string[];
};

export const stadiums = stadiumsData as Stadium[];

const countryToRegion: Record<string, string> = {
  Argentina: "South America",
  Belgium: "Europe",
  Brazil: "South America",
  Croatia: "Europe",
  "Czech Republic": "Europe",
  Denmark: "Europe",
  France: "Europe",
  Germany: "Europe",
  Greece: "Europe",
  Italy: "Europe",
  Mexico: "North America",
  Monaco: "Europe",
  Netherlands: "Europe",
  Norway: "Europe",
  Portugal: "Europe",
  Russia: "Europe",
  "Saudi Arabia": "Middle East",
  Serbia: "Europe",
  Spain: "Europe",
  Sweden: "Europe",
  Turkey: "Europe",
  "United Kingdom": "Europe",
  "United States": "North America",
};

export const featuredLeagues = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "MLS",
];

export const featuredCountries = [
  "United Kingdom",
  "Spain",
  "Italy",
  "Germany",
  "France",
  "United States",
];

export const allCountries = [...new Set(stadiums.map((stadium) => stadium.country))].sort((a, b) =>
  a.localeCompare(b)
);

export const featuredRegions = ["World", "Europe", "North America", "South America", "Middle East"];
export const capacityBands = ["Alle", "60k+", "40k+", "20k+", "<20k"] as const;
export const sortModes = ["Størst først", "Mindst først", "Nyest først", "A-Å"] as const;

export function findStadiumById(id: string) {
  return stadiums.find((stadium) => stadium.id === id) ?? null;
}

export function formatCapacity(value: number | null) {
  if (!value) {
    return "Ukendt";
  }

  return new Intl.NumberFormat("da-DK").format(value);
}

export function stadiumMapUrl(stadium: Stadium) {
  if (stadium.latitude == null || stadium.longitude == null) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${stadium.latitude},${stadium.longitude}`;
}

export function hasCoordinates(stadium: Stadium) {
  return stadium.latitude != null && stadium.longitude != null;
}

export function getRegionForCountry(country: string) {
  return countryToRegion[country] ?? "Other";
}

export function filterByRegion(items: Stadium[], region: string) {
  if (region === "World") {
    return items;
  }

  return items.filter((item) => getRegionForCountry(item.country) === region);
}

export function getMapCenter(items: Stadium[]) {
  const mappableItems = items.filter(hasCoordinates);

  if (!mappableItems.length) {
    return {
      latitude: 20,
      longitude: 0,
      latitudeDelta: 80,
      longitudeDelta: 80,
    };
  }

  const latitudes = mappableItems.map((item) => item.latitude as number);
  const longitudes = mappableItems.map((item) => item.longitude as number);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max(8, (maxLat - minLat) * 1.5),
    longitudeDelta: Math.max(8, (maxLon - minLon) * 1.5),
  };
}

export function matchesCapacityBand(stadium: Stadium, band: (typeof capacityBands)[number]) {
  const capacity = stadium.capacity ?? 0;

  switch (band) {
    case "60k+":
      return capacity >= 60000;
    case "40k+":
      return capacity >= 40000;
    case "20k+":
      return capacity >= 20000;
    case "<20k":
      return capacity > 0 && capacity < 20000;
    default:
      return true;
  }
}

export function sortStadiums(items: Stadium[], mode: (typeof sortModes)[number]) {
  return [...items].sort((a, b) => {
    switch (mode) {
      case "Mindst først":
        return (a.capacity ?? Number.MAX_SAFE_INTEGER) - (b.capacity ?? Number.MAX_SAFE_INTEGER);
      case "Nyest først":
        return (b.opened ?? 0) - (a.opened ?? 0);
      case "A-Å":
        return a.team.localeCompare(b.team);
      case "Størst først":
      default:
        return (b.capacity ?? 0) - (a.capacity ?? 0);
    }
  });
}
