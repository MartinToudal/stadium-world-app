import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.resolve(__dirname, "../../opta_top100_stadiums.csv");
const outputPath = path.resolve(__dirname, "../data/stadiums.json");
const overridesPath = path.resolve(__dirname, "../data/stadium-overrides.json");

const countryToRegion = {
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
  "United States": "North America"
};

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",");

  return lines
    .filter(Boolean)
    .map((line) => {
      const values = line.split(",");
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    });
}

function toNumber(value) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function main() {
  const csv = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csv);
  const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));
  const stadiums = rows.map((row) => {
    const region = countryToRegion[row.country] ?? "Other";
    const capacity = toNumber(row.capacity);
    const opened = toNumber(row.opened);
    const override = overrides[row.id] ?? {};
    const sourceHost = row.source ? new URL(row.source).hostname.replace("www.", "") : null;
    const capacityBucket = !capacity
      ? "unknown"
      : capacity >= 60000
        ? "mega"
        : capacity >= 40000
          ? "large"
          : capacity >= 20000
            ? "medium"
            : "compact";
    const generatedTags = [
      row.league,
      row.country,
      region,
      row.tier === "1" ? "top-flight" : "second-tier",
      capacityBucket,
    ];

    return {
      id: row.id,
      stadiumName: row.name,
      team: row.team,
      league: row.league,
      country: row.country,
      tier: toNumber(row.tier),
      city: row.city,
      latitude: Number(row.lat),
      longitude: Number(row.lon),
      capacity,
      opened,
      surface: row.surface || null,
      source: row.source || null,
      sourceHost,
      region,
      coordinatesLabel: `${Number(row.lat).toFixed(4)}, ${Number(row.lon).toFixed(4)}`,
      capacityBucket,
      isTopFlight: row.tier === "1",
      locationLabel: `${row.city}, ${row.country}`,
      description:
        override.description ??
        `${row.team} spiller på ${row.name} i ${row.city}. Stadionet ligger i ${row.country} og konkurrerer i ${row.league}.`,
      statusNote: override.statusNote ?? null,
      aliases: override.aliases ?? [],
      tags: [...new Set([...(override.tags ?? []), ...generatedTags])],
    };
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(stadiums, null, 2)}\n`, "utf8");

  console.log(`Synced ${stadiums.length} stadiums to ${outputPath}`);
}

main();
