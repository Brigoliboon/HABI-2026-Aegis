import type { MarkerData } from "@/types/locations";

export type PlaceSelection = {
  region: string | null;
  province: string | null;
  municipality: string | null;
  barangay: string | null;
};

export type DerivedPlaces = {
  regions: string[];
  provincesByRegion: Record<string, string[]>;
  municipalitiesByRegionProvince: Record<string, string[]>;
  barangaysByRegionProvinceMunicipality: Record<string, string[]>;
  allBarangays: string[];
  targets: {
    regions: Record<string, MarkerData>;
    provinces: Record<string, MarkerData>;
    municipalities: Record<string, MarkerData>;
    barangays: Record<string, MarkerData>;
  };
};

type BBoxAccumulator = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export function normalizePlaceText(value: string | null | undefined): string {
  const normalized = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\bcity of\s+/g, "")
    .replace(/\bmunicipality of\s+/g, "")
    .replace(/\bcity\b/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  switch (normalized) {
    case "region i":
    case "ilocos region":
      return "region i";
    case "region ii":
    case "cagayan valley":
      return "region ii";
    case "region iii":
    case "central luzon":
      return "region iii";
    case "region iv-a":
    case "calabarzon":
      return "region iv-a";
    case "region iv-b":
    case "mimaropa":
    case "mimaropa region":
      return "region iv-b";
    case "region v":
    case "bicol":
    case "bicol region":
      return "region v";
    case "region vi":
    case "western visayas":
      return "region vi";
    case "region vii":
    case "central visayas":
      return "region vii";
    case "region viii":
    case "eastern visayas":
      return "region viii";
    case "region ix":
    case "zamboanga peninsula":
      return "region ix";
    case "region x":
    case "northern mindanao":
      return "region x";
    case "region xi":
    case "davao region":
      return "region xi";
    case "region xii":
    case "soccsksargen":
      return "region xii";
    case "region xiii":
    case "caraga":
      return "region xiii";
    case "ncr":
    case "national capital region":
      return "ncr";
    case "car":
    case "cordillera administrative region":
      return "car";
    case "barmm":
    case "bangsamoro autonomous region in muslim mindanao":
      return "barmm";
    case "nir":
    case "negros island region":
      return "nir";
    default:
      return normalized;
  }
}

function joinKey(parts: Array<string | null | undefined>): string {
  return parts.map((part) => normalizePlaceText(part)).join("|");
}

function getStringProperty(
  props: GeoJSON.GeoJsonProperties,
  key: string
): string | null {
  const raw = props?.[key];
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return value.length > 0 ? value : null;
}

function updateBBox(bbox: BBoxAccumulator | null, lng: number, lat: number): BBoxAccumulator {
  if (!bbox) {
    return { west: lng, south: lat, east: lng, north: lat };
  }

  return {
    west: Math.min(bbox.west, lng),
    south: Math.min(bbox.south, lat),
    east: Math.max(bbox.east, lng),
    north: Math.max(bbox.north, lat),
  };
}

function toMarkerData(
  title: string,
  description: string,
  lng: number,
  lat: number,
  bbox: BBoxAccumulator | null,
  zoomLevel: number = 13
): MarkerData {
  const width = bbox ? Math.abs(bbox.east - bbox.west) : 0;
  const height = bbox ? Math.abs(bbox.north - bbox.south) : 0;
  const shouldUseBounds = bbox != null && (width > 0.0001 || height > 0.0001);

  return {
    lng,
    lat,
    title,
    description,
    zoom: shouldUseBounds ? zoomLevel : zoomLevel,
    bbox: shouldUseBounds
      ? [bbox.west, bbox.south, bbox.east, bbox.north]
      : undefined,
  };
}

export function derivePlacesFromFeatures(
  features: Array<GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>>
): DerivedPlaces {
  const regionSet = new Set<string>();
  const provincesByRegionMap = new Map<string, Set<string>>();
  const municipalitiesByRegionProvinceMap = new Map<string, Set<string>>();
  const barangaysByRegionProvinceMunicipalityMap = new Map<string, Set<string>>();
  const barangaySet = new Set<string>();

  const regionAgg = new Map<string, { count: number; lngSum: number; latSum: number; bbox: BBoxAccumulator | null; label: string }>();
  const provinceAgg = new Map<string, { count: number; lngSum: number; latSum: number; bbox: BBoxAccumulator | null; label: string; description: string }>();
  const municipalityAgg = new Map<string, { count: number; lngSum: number; latSum: number; bbox: BBoxAccumulator | null; label: string; description: string }>();
  const barangayAgg = new Map<string, { count: number; lngSum: number; latSum: number; bbox: BBoxAccumulator | null; label: string; description: string }>();

  for (const feature of features) {
    if (feature.geometry?.type !== "Point") continue;

    const [lngRaw, latRaw] = feature.geometry.coordinates;
    const lng = Number(lngRaw);
    const lat = Number(latRaw);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

    const props = feature.properties ?? {};
    const region = getStringProperty(props, "region");
    const province = getStringProperty(props, "province");
    const municipality = getStringProperty(props, "city");
    const barangay = getStringProperty(props, "barangay");

    if (region) {
      regionSet.add(region);
      const key = joinKey([region]);
      const current = regionAgg.get(key) ?? {
        count: 0,
        lngSum: 0,
        latSum: 0,
        bbox: null,
        label: region,
      };
      current.count += 1;
      current.lngSum += lng;
      current.latSum += lat;
      current.bbox = updateBBox(current.bbox, lng, lat);
      regionAgg.set(key, current);
    }

    if (region && province) {
      const provinces = provincesByRegionMap.get(region) ?? new Set<string>();
      provinces.add(province);
      provincesByRegionMap.set(region, provinces);

      const key = joinKey([region, province]);
      const current = provinceAgg.get(key) ?? {
        count: 0,
        lngSum: 0,
        latSum: 0,
        bbox: null,
        label: province,
        description: region,
      };
      current.count += 1;
      current.lngSum += lng;
      current.latSum += lat;
      current.bbox = updateBBox(current.bbox, lng, lat);
      provinceAgg.set(key, current);
    }

    if (region && province && municipality) {
      const municipalities =
        municipalitiesByRegionProvinceMap.get(joinKey([region, province])) ?? new Set<string>();
      municipalities.add(municipality);
      municipalitiesByRegionProvinceMap.set(joinKey([region, province]), municipalities);

      const key = joinKey([region, province, municipality]);
      const current = municipalityAgg.get(key) ?? {
        count: 0,
        lngSum: 0,
        latSum: 0,
        bbox: null,
        label: municipality,
        description: `${province}, ${region}`,
      };
      current.count += 1;
      current.lngSum += lng;
      current.latSum += lat;
      current.bbox = updateBBox(current.bbox, lng, lat);
      municipalityAgg.set(key, current);
    }

    if (region && province && municipality && barangay) {
      const barangays =
        barangaysByRegionProvinceMunicipalityMap.get(joinKey([region, province, municipality])) ??
        new Set<string>();
      barangays.add(barangay);
      barangaysByRegionProvinceMunicipalityMap.set(
        joinKey([region, province, municipality]),
        barangays
      );
      barangaySet.add(barangay);

      const key = joinKey([region, province, municipality, barangay]);
      const current = barangayAgg.get(key) ?? {
        count: 0,
        lngSum: 0,
        latSum: 0,
        bbox: null,
        label: barangay,
        description: `${municipality}, ${province}`,
      };
      current.count += 1;
      current.lngSum += lng;
      current.latSum += lat;
      current.bbox = updateBBox(current.bbox, lng, lat);
      barangayAgg.set(key, current);
    }
  }

  const buildSortedRecord = (map: Map<string, Set<string>>) =>
    Object.fromEntries(
      Array.from(map.entries()).map(([key, values]) => [
        key,
        Array.from(values).sort((a, b) => a.localeCompare(b)),
      ])
    );

  const buildTargetsWithZoom = <T extends { count: number; lngSum: number; latSum: number; bbox: BBoxAccumulator | null; label: string; description?: string }>(
    map: Map<string, T>,
    zoom: number
  ) =>
    Object.fromEntries(
      Array.from(map.entries()).map(([key, value]) => [
        key,
        toMarkerData(
          value.label,
          value.description ?? "",
          value.lngSum / value.count,
          value.latSum / value.count,
          value.bbox,
          zoom
        ),
      ])
    );

  return {
    regions: Array.from(regionSet).sort((a, b) => a.localeCompare(b)),
    provincesByRegion: buildSortedRecord(provincesByRegionMap),
    municipalitiesByRegionProvince: buildSortedRecord(municipalitiesByRegionProvinceMap),
    barangaysByRegionProvinceMunicipality: buildSortedRecord(
      barangaysByRegionProvinceMunicipalityMap
    ),
    allBarangays: Array.from(barangaySet).sort((a, b) => a.localeCompare(b)),
    targets: {
      regions: buildTargetsWithZoom(regionAgg, 8),
      provinces: buildTargetsWithZoom(provinceAgg, 10),
      municipalities: buildTargetsWithZoom(municipalityAgg, 12),
      barangays: buildTargetsWithZoom(barangayAgg, 14),
    },
  };
}

export function getPlaceTarget(
  derivedPlaces: DerivedPlaces,
  selection: PlaceSelection
): MarkerData | null {
  if (selection.barangay && selection.municipality && selection.province && selection.region) {
    return (
      derivedPlaces.targets.barangays[
        joinKey([selection.region, selection.province, selection.municipality, selection.barangay])
      ] ?? null
    );
  }

  if (selection.municipality && selection.province && selection.region) {
    return (
      derivedPlaces.targets.municipalities[
        joinKey([selection.region, selection.province, selection.municipality])
      ] ?? null
    );
  }

  if (selection.province && selection.region) {
    return (
      derivedPlaces.targets.provinces[joinKey([selection.region, selection.province])] ?? null
    );
  }

  if (selection.region) {
    return derivedPlaces.targets.regions[joinKey([selection.region])] ?? null;
  }

  return null;
}

export function getSelectionKey(selection: PlaceSelection): string {
  return joinKey([
    selection.region,
    selection.province,
    selection.municipality,
    selection.barangay,
  ]);
}
