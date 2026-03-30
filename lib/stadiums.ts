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
];

export const leagueRankings: Record<string, string[]> = {
  "Premier League": [
    "Arsenal",
    "Manchester City",
    "Liverpool",
    "Aston Villa",
    "Manchester United",
    "Chelsea",
    "Brighton & Hove Albion",
    "Newcastle United",
    "Brentford",
    "AFC Bournemouth",
    "Everton",
    "Fulham",
    "Crystal Palace",
    "Nottingham Forest",
    "Tottenham Hotspur",
    "Leeds United",
    "Sunderland",
    "West Ham United",
    "Wolverhampton Wanderers",
    "Burnley",
  ],
  "La Liga": [
    "Barcelona",
    "Real Madrid",
    "Atlético de Madrid",
    "Villarreal",
    "Celta de Vigo",
    "Real Betis",
    "Real Sociedad",
    "Athletic Club",
    "Osasuna",
    "Valencia",
    "Getafe",
    "Rayo Vallecano",
    "Girona",
    "Mallorca",
    "Alavés",
    "Espanyol",
    "Sevilla",
    "Levante",
    "Elche",
    "Real Oviedo",
  ],
  "Serie A": [
    "Internazionale",
    "Milan",
    "Napoli",
    "Juventus",
    "Atalanta",
    "Como",
    "Roma",
    "Lazio",
    "Bologna",
    "Fiorentina",
    "Udinese",
    "Torino",
    "Sassuolo",
    "Genoa",
    "Parma",
    "Cagliari",
    "Cremonese",
    "Lecce",
    "Pisa",
    "Hellas Verona",
  ],
  Bundesliga: [
    "Bayern München",
    "Borussia Dortmund",
    "Bayer Leverkusen",
    "Stuttgart",
    "RB Leipzig",
    "Hoffenheim",
    "Freiburg",
    "Eintracht Frankfurt",
    "Mainz 05",
    "Werder Bremen",
    "Borussia M'Gladbach",
    "Union Berlin",
    "Augsburg",
    "Hamburger SV",
    "Wolfsburg",
    "Köln",
    "St. Pauli",
    "Heidenheim",
  ],
  "Ligue 1": [
    "Paris Saint-Germain",
    "Lens",
    "Monaco",
    "Olympique Marseille",
    "Olympique Lyonnais",
    "Strasbourg",
    "Lille",
    "Rennes",
    "Brest",
    "Toulouse",
    "Lorient",
    "Nice",
    "Auxerre",
    "Paris FC",
    "Angers SCO",
    "Le Havre",
    "Nantes",
    "Metz",
  ],
};

export const globalRankings: Record<string, Record<string, number>> = {
  "Premier League": {
    Arsenal: 1,
    "Manchester City": 5,
    Liverpool: 7,
    "Aston Villa": 8,
    "Manchester United": 9,
    Chelsea: 12,
    "Brighton & Hove Albion": 14,
    "Newcastle United": 15,
    Brentford: 17,
    "AFC Bournemouth": 19,
    Everton: 22,
    Fulham: 26,
    "Crystal Palace": 28,
    "Nottingham Forest": 32,
    "Tottenham Hotspur": 38,
    "Leeds United": 43,
    Sunderland: 46,
    "West Ham United": 49,
    "Wolverhampton Wanderers": 68,
    Burnley: 85,
  },
  "La Liga": {
    Barcelona: 3,
    "Real Madrid": 4,
    "Atlético de Madrid": 11,
    Villarreal: 36,
    "Celta de Vigo": 44,
    "Real Betis": 45,
    "Real Sociedad": 52,
    "Athletic Club": 59,
    Osasuna: 66,
    Valencia: 70,
    Getafe: 76,
    "Rayo Vallecano": 77,
    Girona: 89,
    Mallorca: 97,
    "Alavés": 98,
    Espanyol: 106,
    Sevilla: 118,
    Levante: 122,
    Elche: 129,
    "Real Oviedo": 183,
  },
  "Serie A": {
    Internazionale: 10,
    Milan: 18,
    Napoli: 23,
    Juventus: 25,
    Atalanta: 27,
    Como: 29,
    Roma: 30,
    Lazio: 50,
    Bologna: 62,
    Fiorentina: 83,
    Udinese: 96,
    Torino: 99,
    Sassuolo: 101,
    Genoa: 112,
    Parma: 151,
    Cagliari: 174,
    Cremonese: 192,
    Lecce: 197,
    Pisa: 279,
    "Hellas Verona": 334,
  },
  Bundesliga: {
    "Bayern München": 2,
    "Borussia Dortmund": 16,
    "Bayer Leverkusen": 24,
    Stuttgart: 39,
    "RB Leipzig": 40,
    Hoffenheim: 54,
    Freiburg: 69,
    "Eintracht Frankfurt": 71,
    "Mainz 05": 73,
    "Werder Bremen": 113,
    "Borussia M'Gladbach": 124,
    "Union Berlin": 136,
    Augsburg: 140,
    "Hamburger SV": 144,
    Wolfsburg: 180,
    "Köln": 181,
    "St. Pauli": 213,
    Heidenheim: 361,
  },
  "Ligue 1": {
    "Paris Saint-Germain": 6,
    Lens: 37,
    Monaco: 42,
    "Olympique Marseille": 47,
    "Olympique Lyonnais": 48,
    Strasbourg: 51,
    Lille: 57,
    Rennes: 67,
    Brest: 90,
    Toulouse: 91,
    Lorient: 116,
    Nice: 157,
    Auxerre: 167,
    "Paris FC": 175,
    "Angers SCO": 215,
    "Le Havre": 230,
    Nantes: 320,
    Metz: 418,
  },
};

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
export const allLeagues = [...new Set(stadiums.map((stadium) => stadium.league))].sort((a, b) =>
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

export function getLeagueRank(stadium: Stadium) {
  const ranking = leagueRankings[stadium.league];
  if (!ranking) {
    return null;
  }

  const index = ranking.indexOf(stadium.team);
  return index === -1 ? null : index + 1;
}

export function getGlobalRank(stadium: Stadium) {
  return globalRankings[stadium.league]?.[stadium.team] ?? null;
}
