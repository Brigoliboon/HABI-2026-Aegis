import phAdminLevelList from "./ph-admin-level-list.json";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export type PlaceHierarchy = {
  [region: string]: {
    [province: string]: {
      [municipality: string]: string[];
    };
  };
};

const REGION_MAPBOX_NAMES: Record<string, string> = {
  "REGION I": "Ilocos Region",
  "REGION II": "Cagayan Valley",
  "REGION III": "Central Luzon",
  "REGION IV-A": "CALABARZON",
  "REGION IV-B": "MIMAROPA",
  "REGION V": "Bicol Region",
  "REGION VI": "Western Visayas",
  "REGION VII": "Central Visayas",
  "REGION VIII": "Eastern Visayas",
  "REGION IX": "Zamboanga Peninsula",
  "REGION X": "Northern Mindanao",
  "REGION XI": "Davao Region",
  "REGION XII": "SOCCSKSARGEN",
  "REGION XIII": "Caraga Region",
  "NCR": "Metro Manila",
  "CAR": "Cordillera Administrative Region",
  "BARMM": "Bangsamoro Autonomous Region in Muslim Mindanao",
};

function transformToHierarchy(): PlaceHierarchy {
  const hierarchy: PlaceHierarchy = {};

  for (const regionCode of Object.keys(phAdminLevelList) as Array<keyof typeof phAdminLevelList>) {
    const regionData = phAdminLevelList[regionCode];
    const regionName = regionData.region_name;

    if (!hierarchy[regionName]) {
      hierarchy[regionName] = {};
    }

    const provinceList = regionData.province_list as Record<string, { municipality_list: Record<string, { barangay_list: string[] }> }>;

    for (const provinceName of Object.keys(provinceList)) {
      const provinceData = provinceList[provinceName as keyof typeof provinceList];

      if (!hierarchy[regionName][provinceName]) {
        hierarchy[regionName][provinceName] = {};
      }

      for (const municipalityName of Object.keys(provinceData.municipality_list)) {
        const municipalityData = provinceData.municipality_list[municipalityName as keyof typeof provinceData.municipality_list];
        const barangays = municipalityData.barangay_list || [];
        hierarchy[regionName][provinceName][municipalityName] = barangays;
      }
    }
  }

  return hierarchy;
}

export const PLACE_HIERARCHY = transformToHierarchy();

export const REGION_LIST = Object.keys(PLACE_HIERARCHY).sort();

export function getProvinces(region: string | null): string[] {
  if (!region) return [];
  const provinces = PLACE_HIERARCHY[region];
  if (!provinces) return [];
  return Object.keys(provinces).sort();
}

export function getMunicipalities(region: string | null, province: string | null): string[] {
  if (!region || !province) return [];
  const municipalities = PLACE_HIERARCHY[region]?.[province];
  if (!municipalities) return [];
  return Object.keys(municipalities).sort();
}

export function getBarangays(region: string | null, province: string | null, municipality: string | null): string[] {
  if (!region || !province || !municipality) return [];
  const barangays = PLACE_HIERARCHY[region]?.[province]?.[municipality];
  if (!barangays) return [];
  return [...barangays].sort();
}

export function getRegionCode(regionName: string): string | null {
  for (const [code, data] of Object.entries(phAdminLevelList)) {
    if (data.region_name === regionName) {
      return code;
    }
  }
  return null;
}

export function getProvinceCode(regionCode: string, provinceName: string): string | null {
  const regionData = phAdminLevelList[regionCode as keyof typeof phAdminLevelList];
  if (!regionData) return null;

  for (const [code, provData] of Object.entries(regionData.province_list)) {
    if (code === provinceName) {
      return code;
    }
  }
  return null;
}

export function getMunicipalityCode(regionCode: string, provinceName: string, municipalityName: string): string | null {
  const regionData = phAdminLevelList[regionCode as keyof typeof phAdminLevelList];
  if (!regionData) return null;

  const provinceList = regionData.province_list as Record<string, { municipality_list: Record<string, { barangay_list: string[] }> }>;
  const provinceData = provinceList[provinceName as keyof typeof provinceList];
  if (!provinceData) return null;

  const municipalityData = provinceData.municipality_list[municipalityName as keyof typeof provinceData.municipality_list];
  if (!municipalityData) return null;

  return municipalityName;
}

export function getMunicipalityCodes(region: string, province: string): Array<{ name: string; code: string }> {
  const municipalities = PLACE_HIERARCHY[region]?.[province];
  if (!municipalities) return [];

  return Object.keys(municipalities).map((name) => ({ name, code: name }));
}

export function searchLocations(query: string): Array<{
  type: "region" | "province" | "municipality" | "barangay";
  name: string;
  path: string[];
}> {
  const results: Array<{
    type: "region" | "province" | "municipality" | "barangay";
    name: string;
    path: string[];
  }> = [];
  const lowerQuery = query.toLowerCase();

  for (const region of REGION_LIST) {
    if (region.toLowerCase().includes(lowerQuery)) {
      results.push({ type: "region", name: region, path: [region] });
    }

    const provinces = getProvinces(region);
    for (const province of provinces) {
      if (province.toLowerCase().includes(lowerQuery)) {
        results.push({ type: "province", name: province, path: [region, province] });
      }

      const municipalities = getMunicipalities(region, province);
      for (const municipality of municipalities) {
        if (municipality.toLowerCase().includes(lowerQuery)) {
          results.push({ type: "municipality", name: municipality, path: [region, province, municipality] });
        }

        const barangays = getBarangays(region, province, municipality);
        for (const barangay of barangays) {
          if (barangay.toLowerCase().includes(lowerQuery)) {
            results.push({ type: "barangay", name: barangay, path: [region, province, municipality, barangay] });
          }
        }
      }
    }
  }

  return results;
}

export type PlaceBounds = {
  center: [number, number];
  bbox: [number, number, number, number];
  zoom?: number;
};

const boundsCache = new Map<string, PlaceBounds>();

export async function fetchPlaceBounds(
  region: string | null,
  province: string | null,
  municipality: string | null,
  barangay: string | null
): Promise<PlaceBounds | null> {
  let query = "";
  let zoomLevel = 8;

  const regionName = region ? REGION_MAPBOX_NAMES[region] || region : null;

  if (barangay && municipality && province && region) {
    query = `${barangay}, ${municipality}, ${province}, Philippines`;
    zoomLevel = 16;
  } else if (municipality && province && region) {
    query = `${municipality}, ${province}, ${regionName}, Philippines`;
    zoomLevel = 13;
  } else if (province && region) {
    query = `${province}, ${regionName}, Philippines`;
    zoomLevel = 10;
  } else if (region) {
    query = `${regionName}, Philippines`;
    zoomLevel = 8;
  } else {
    return null;
  }

  const cacheKey = `${region}|${province}|${municipality}|${barangay}|${zoomLevel}`;

  if (boundsCache.has(cacheKey)) {
    return boundsCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=ph&limit=1`
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();

    if (data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const bounds: PlaceBounds = {
      center: feature.center,
      bbox: feature.bbox || [],
      zoom: zoomLevel,
    };

    boundsCache.set(cacheKey, bounds);
    return bounds;
  } catch (error) {
    console.error("Failed to fetch place bounds:", error);
    return null;
  }
}

export const STATS = {
  regions: REGION_LIST.length,
  provinces: REGION_LIST.reduce((acc, region) => acc + getProvinces(region).length, 0),
  municipalities: REGION_LIST.reduce(
    (acc, region) =>
      acc +
      getProvinces(region).reduce(
        (provAcc, province) => provAcc + getMunicipalities(region, province).length,
        0
      ),
    0
  ),
  barangays: REGION_LIST.reduce(
    (acc, region) =>
      acc +
      getProvinces(region).reduce(
        (provAcc, province) =>
          provAcc +
          getMunicipalities(region, province).reduce(
            (munAcc, municipality) => munAcc + getBarangays(region, province, municipality).length,
            0
          ),
        0
      ),
    0
  ),
};