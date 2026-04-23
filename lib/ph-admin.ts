import type { PlaceSelection } from "@/lib/places";

export type PlaceHierarchyData = {
  regions: string[];
  provincesByRegion: Record<string, string[]>;
  municipalitiesByRegionProvince: Record<string, string[]>;
  barangaysByRegionProvinceMunicipality: Record<string, string[]>;
};

const REGION_LABELS: Record<string, string> = {
  "REGION I": "Region I",
  "REGION II": "Region II",
  "REGION III": "Region III",
  "REGION IV-A": "Region IV-A",
  "REGION IV-B": "Region IV-B",
  "REGION V": "Region V",
  "REGION VI": "Region VI",
  "REGION VII": "Region VII",
  "REGION VIII": "Region VIII",
  "REGION IX": "Region IX",
  "REGION X": "Region X",
  "REGION XI": "Region XI",
  "REGION XII": "Region XII",
  "REGION XIII": "Region XIII",
  NCR: "NCR",
  CAR: "CAR",
  BARMM: "BARMM",
  NIR: "NIR",
};

const UPPERCASE_TOKENS = new Set([
  "NCR",
  "CAR",
  "BARMM",
  "NIR",
  "POB.",
  "POB",
  "B.F.",
  "F.B.",
  "SR.",
  "JR.",
]);

const LOWERCASE_JOINERS = new Set(["and", "de", "del", "dela", "dello", "der", "di", "la", "las", "los", "ng", "of", "sa"]);

function titleCaseWord(word: string): string {
  if (UPPERCASE_TOKENS.has(word.toUpperCase())) {
    return word.toUpperCase();
  }

  return word.replace(/[A-Za-zÀ-ÿ]+/g, (part) => {
    const lower = part.toLocaleLowerCase("en-US");
    if (LOWERCASE_JOINERS.has(lower)) {
      return lower;
    }
    return lower.charAt(0).toLocaleUpperCase("en-US") + lower.slice(1);
  });
}

function titleCaseLabel(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .replace(/\b([a-zà-ÿ]+)\b/g, (part) => titleCaseWord(part))
    .replace(/\bNcr\b/g, "NCR")
    .replace(/\bCar\b/g, "CAR")
    .replace(/\bBarmm\b/g, "BARMM")
    .replace(/\bNir\b/g, "NIR")
    .replace(/\bPob\b/g, "POB")
    .replace(/\bPob\.\b/g, "POB.");
}

export function formatRegionLabel(value: string): string {
  return REGION_LABELS[value] ?? titleCaseLabel(value);
}

export function formatProvinceLabel(value: string): string {
  return titleCaseLabel(value);
}

export function formatMunicipalityLabel(value: string): string {
  if (value.startsWith("CITY OF ")) {
    return `${titleCaseLabel(value.slice("CITY OF ".length))} City`;
  }

  if (value.startsWith("MUNICIPALITY OF ")) {
    return titleCaseLabel(value.slice("MUNICIPALITY OF ".length));
  }

  return titleCaseLabel(value);
}

export function formatBarangayLabel(value: string): string {
  return titleCaseLabel(value);
}

export function placesApiPath(): string {
  return "/api/places";
}

export function buildPlaceSelectionQuery(selection: PlaceSelection): string | null {
  const parts = [
    selection.barangay,
    selection.municipality,
    selection.province,
    selection.region,
    "Philippines",
  ].filter((value): value is string => Boolean(value && value.trim().length > 0));

  return parts.length > 1 ? parts.join(", ") : null;
}
