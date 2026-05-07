import incomeData from "@/data/income.json";
import type { IncomeData } from "@/components/dialog/types";

// ─── Helper: safe lowercase ─────────────────────────────────────────────
const lc = (s: string | undefined | null) => s?.toLowerCase().trim() || "";

// ─── Helper: extract stats from a data node ─────────────────────────────
function extractIncomeStats(
  data: typeof incomeData.data["PHILIPPINES"],
  name: string,
  suffix?: string
): Omit<IncomeData, "location"> & { name: string } {
  const avgIncome = data.value_2023?.["All Income Groups"] * 1000 || 0;
  return {
    name: suffix ? `${name} (${suffix})` : name,
    avgIncome,
    percentChange: data.percent_change?.["All Income Groups"] || 0,
    lowestDecile: data.value_2023?.["1st Decile"] * 1000 || 0,
    highestDecile: data.value_2023?.["10th Decile"] * 1000 || 0,
    incomeInequality:
      data.value_2023?.["10th Decile"]
        ? data.value_2023["10th Decile"] / data.value_2023["1st Decile"] - 1
        : 0,
  };
}

// ─── Lookup: province (from region.provinces) ───────────────────────────
function findProvince(provinceQuery: string) {
  const q = lc(provinceQuery);
  for (const region of Object.values(incomeData.data)) {
    const regionWithProvinces = region as any;
    if (regionWithProvinces.provinces) {
      for (const [provName, provData] of Object.entries(regionWithProvinces.provinces)) {
        if (provName.toLowerCase().includes(q) || q.includes(provName.toLowerCase())) {
          return extractIncomeStats(provData, provName, "Provincial");
        }
      }
    }
  }
  return null;
}

// ─── Lookup: city/municipality (from region.subregions) ─────────────────
function findCity(cityQuery: string) {
  const q = lc(cityQuery);
  for (const region of Object.values(incomeData.data)) {
    if (region.subregions) {
      for (const subregion of Object.values(region.subregions)) {
        for (const [cityName, cityData] of Object.entries(subregion)) {
          if (cityName.toLowerCase().includes(q) || q.includes(cityName.toLowerCase())) {
            return { name: cityName, ...extractIncomeStats(cityData, cityName) };
          }
        }
      }
    }
  }
  return null;
}

// ─── Lookup: region ──────────────────────────────────────────────────────
function findRegion(regionQuery: string) {
  const q = lc(regionQuery);
  for (const [regionName, regionData] of Object.entries(incomeData.data)) {
    if (regionName === "PHILIPPINES") continue;
    if (regionName.toLowerCase().includes(q) || q.includes(regionName.toLowerCase())) {
      return { name: regionName, ...extractIncomeStats(regionData, regionName) };
    }
  }
  return null;
}

// ─── Lookup: national average ────────────────────────────────────────────
function findNational(): IncomeData {
  const nat = incomeData.data["PHILIPPINES"];
  return {
    location: "Philippines (National Average)",
    avgIncome: nat.value_2023["All Income Groups"] * 1000,
    percentChange: nat.percent_change["All Income Groups"],
    lowestDecile: nat.value_2023["1st Decile"] * 1000,
    highestDecile: nat.value_2023["10th Decile"] * 1000,
    incomeInequality: (nat.value_2023["10th Decile"] / nat.value_2023["1st Decile"]) - 1,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────
/**
 * Resolve income data for a location using hierarchical lookup.
 *
 * Order of search (specific → broad):
 * 1. Feature name → city → province → region (exact/partial match)
 * 2. Parsed address levels from Mapbox reverse geocoding
 *    (format: "barangay, city, province, region, country")
 * 3. Fallback to national average
 *
 * @param locationName - Name of the clicked feature (e.g. barangay name)
 * @param address - Full address string from Mapbox reverse geocoding
 * @returns IncomeData with normalized values (pesos, percentages)
 */
export function findIncomeData(locationName: string, address?: string | null): IncomeData {
  // Parse address into admin levels
  let parsed = { barangay: "", city: "", province: "", region: "" } as Record<string, string>;
  if (address) {
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length >= 4) {
      parsed = {
        barangay: lc(parts[0]),
        city: lc(parts[1]),
        province: lc(parts[2]),
        region: lc(parts[3]),
      };
    } else if (parts.length >= 3) {
      parsed = { barangay: "", city: lc(parts[0]), province: lc(parts[1]), region: lc(parts[2]) };
    }
  }

  const searchName = lc(locationName);

  // Build candidate list: specific → broad
  const candidates: Array<{ name: string; level: string }> = [];
  if (parsed.city) candidates.push({ name: parsed.city, level: "city" });
  if (parsed.province) candidates.push({ name: parsed.province, level: "province" });
  if (parsed.region) candidates.push({ name: parsed.region, level: "region" });
  if (searchName) candidates.unshift({ name: searchName, level: "feature" });

  // Search cascade
  for (const cand of candidates) {
    // 1. Direct top-level key match (region name)
    const keyUpper = cand.name.toUpperCase();
    if (incomeData.data[keyUpper]) {
      if (keyUpper === "PHILIPPINES") return findNational();
      return { location: keyUpper, ...extractIncomeStats(incomeData.data[keyUpper], keyUpper) };
    }

    // 2. Feature name lookup (tries city, then province, then region)
    if (cand.level === "feature") {
      const city = findCity(cand.name);
      if (city) return { ...city, location: city.name };

      const prov = findProvince(cand.name);
      if (prov) return { ...prov, location: prov.name };

      const reg = findRegion(cand.name);
      if (reg) return { ...reg, location: reg.name };

      continue;
    }

    // 3. City level (from barangay address or direct city selection)
    if (cand.level === "city") {
      const city = findCity(cand.name);
      if (city) return { ...city, location: city.name };
    }

    // 4. Province level (barangay → province, or direct province selection)
    if (cand.level === "province") {
      const prov = findProvince(cand.name);
      if (prov) return { ...prov, location: prov.name };
    }

    // 5. Region level
    if (cand.level === "region") {
      const reg = findRegion(cand.name);
      if (reg) return { ...reg, location: reg.name };
    }
  }

  // Final fallback
  return findNational();
}
