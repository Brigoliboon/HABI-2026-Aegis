import mapboxgl from "mapbox-gl";
import {
  findNearestFacility,
  type NearestFacilityResult,
  type GeoJSONCollection,
} from "./nearestFacility";

// ─── Facility Query ────────────────────────────────────────────────────────
export interface FacilityQueryResult {
  nearest: NearestFacilityResult | null;
  directions: RouteDirections | null;
}

export type RouteDirections = {
  walking: DirectionsResult | null;
  driving: DirectionsResult | null;
};

export interface DirectionsResult {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

// ─── Query a Mapbox layer for features ────────────────────────────────────
/**
 * Query a layer on the map, optionally filtering by maki type.
 *
 * @param map - Mapbox map instance
 * @param layerId - Map layer ID
 * @param typeFilter - Optional maki type filter (e.g. "school", "college")
 * @returns GeoJSONCollection of matching Point features, or null
 */
export function queryLayerForFacilities(
  map: mapboxgl.Map,
  layerId: string,
  typeFilter?: string | string[]
): GeoJSONCollection | null {
  // Try rendered features first (respects current viewport, fast)
  let features = map.queryRenderedFeatures({ layers: [layerId] });

  // Fall back to source query
  if (features.length === 0) {
    const layer = map.getLayer(layerId);
    if (layer?.source) {
      features = map.querySourceFeatures(layer.source as string);
    }
  }

  if (features.length === 0) return null;

  // Apply type filter if provided
  let filteredFeatures = features;
  if (typeFilter) {
    if (Array.isArray(typeFilter)) {
      filteredFeatures = features.filter((f) => {
        const maki = (f.properties as Record<string, unknown>)?.maki as string | undefined;
        return maki && typeFilter.includes(maki);
      });
    } else {
      filteredFeatures = features.filter((f) => {
        const maki = (f.properties as Record<string, unknown>)?.maki as string | undefined;
        return maki === typeFilter;
      });
    }
  }

  if (filteredFeatures.length === 0) return null;

  // Convert to GeoJSON FeatureCollection of Points
  return {
    type: "FeatureCollection",
    features: filteredFeatures
      .filter((f) => f.geometry?.type === "Point")
      .map((f) => ({
        type: "Feature" as const,
        geometry: f.geometry as GeoJSON.Point,
        properties: f.properties || {},
      })),
  };
}

// ─── Find Nearest Facility ────────────────────────────────────────────────
/**
 * Find the nearest facility of a given type from a point.
 *
 * @param from - [lng, lat] origin coordinates
 * @param collection - GeoJSON collection of facilities
 * @returns Nearest facility result (or null if none found)
 */
export function findNearest(
  from: [number, number],
  collection: GeoJSONCollection
): NearestFacilityResult | null {
  return findNearestFacility(from, collection);
}

// ─── Fetch Directions ──────────────────────────────────────────────────────
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Get walking/driving directions between two points.
 *
 * @param from - [lng, lat] origin
 * @param to - [lng, lat] destination
 * @param profile - "walking" or "driving"
 * @returns DirectionsResult or null on failure
 */
export async function getDirections(
  from: [number, number],
  to: [number, number],
  profile: "walking" | "driving"
): Promise<DirectionsResult | null> {
  try {
    const coordinates = `${from[0]},${from[1]};${to[0]},${to[1]}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&steps=true&annotations=distance,duration&overview=full&access_token=${MAPBOX_TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        steps: route.legs[0].steps.map((step: Record<string, unknown>) => ({
          instruction: step.maneuver?.instruction as string,
          distance: step.distance as number,
          duration: step.duration as number,
        })),
      };
    }
    return null;
  } catch (error) {
    console.error("[FacilityFinder] Directions error:", error);
    return null;
  }
}

// ─── Scan for Facilities ──────────────────────────────────────────────────
export interface ScanFacilitiesResult {
  elementary: NearestFacilityResult | null;
  higherEd: NearestFacilityResult | null;
  directions: RouteDirections;
}

/**
 * Scan map for nearest elementary and higher education facilities.
 *
 * @param map - Mapbox map instance
 * @param position - [lng, lat] to search from
 * @returns ScanFacilitiesResult (may be empty if none found)
 */
export async function scanFacilities(
  map: mapboxgl.Map,
  position: { lng: number; lat: number }
): Promise<ScanFacilitiesResult> {
  const from: [number, number] = [position.lng, position.lat];
  const SCHOOLS_LAYER = "Schools";
  const SCHOOL_ELEMENTARY = "school";
  const SCHOOL_COLLEGE = "college";

  const result: ScanFacilitiesResult = {
    elementary: null,
    higherEd: null,
    directions: { walking: null, driving: null },
  };

  // ── Elementary ──
  const elementaryCollection = queryLayerForFacilities(map, SCHOOLS_LAYER, SCHOOL_ELEMENTARY);
  if (elementaryCollection) {
    const nearest = findNearestFacility(from, elementaryCollection);
    if (nearest.facility) {
      result.elementary = nearest;
      const [walking, driving] = await Promise.all([
        getDirections(from, nearest.facility.geometry.coordinates, "walking"),
        getDirections(from, nearest.facility.geometry.coordinates, "driving"),
      ]);
      result.directions.walking = walking;
      result.directions.driving = driving;
    }
  }

  // ── Higher Education ──
  const collegeCollection = queryLayerForFacilities(map, SCHOOLS_LAYER, SCHOOL_COLLEGE);
  if (collegeCollection) {
    const nearest = findNearestFacility(from, collegeCollection);
    if (nearest.facility) {
      result.higherEd = nearest;
      const [walking, driving] = await Promise.all([
        getDirections(from, nearest.facility.geometry.coordinates, "walking"),
        getDirections(from, nearest.facility.geometry.coordinates, "driving"),
      ]);
      // Only overwrite if not already set by elementary (same destination possible)
      if (!result.directions.walking) result.directions.walking = walking;
      if (!result.directions.driving) result.directions.driving = driving;
    }
  }

  return result;
}
