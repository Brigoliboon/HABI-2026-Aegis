import * as turf from "@turf/turf";

export interface PointFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, unknown>;
}

export interface PolygonFeature {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: Record<string, unknown>;
}

export interface LineFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: Array<PointFeature | PolygonFeature | LineFeature>;
}

export type FacilityType = "school" | "hospital" | "clinic" | "education";

export interface RouteResult {
  from: [number, number];
  to: [number, number];
  distance: number;
  facility?: PointFeature;
  route?: {
    type: "LineString";
    coordinates: [number, number][];
  };
  snappedToRoad?: [number, number];
}

export interface NearestFacilityResult {
  facility: PointFeature | null;
  distance: number;
  coordinates: [number, number];
}

/**
 * Get centroid of a polygon feature
 */
export function getCentroid(polygon: PolygonFeature): [number, number] {
  const centroid = turf.centroid(polygon);
  return centroid.geometry.coordinates as [number, number];
}

/**
 * Find nearest point facility using Turf.js nearestPoint
 */
export function findNearestFacility(
  fromLngLat: [number, number],
  facilityCollection: GeoJSONCollection
): NearestFacilityResult {
  if (!facilityCollection.features || facilityCollection.features.length === 0) {
    return {
      facility: null,
      distance: Infinity,
      coordinates: [0, 0],
    };
  }

  const fromPoint = turf.point(fromLngLat);

  let nearestResult: NearestFacilityResult = {
    facility: null,
    distance: Infinity,
    coordinates: [0, 0],
  };

  for (const feature of facilityCollection.features) {
    if (feature.geometry.type !== "Point") continue;

    const candidatePoint = turf.point(feature.geometry.coordinates, feature.properties);
    const distance = turf.distance(fromPoint, candidatePoint);

    if (nearestResult.facility === null || distance < nearestResult.distance) {
      nearestResult = {
        facility: feature as PointFeature,
        distance,
        coordinates: feature.geometry.coordinates,
      };
    }
  }

  return nearestResult;
}

/**
 * Snap a point to the nearest line (road network) using Turf.js nearestPointOnLine
 */
export function snapToRoad(
  point: [number, number],
  roadNetwork: GeoJSONCollection
): [number, number] | null {
  if (!roadNetwork.features || roadNetwork.features.length === 0) {
    return null;
  }

  const pointFeature = turf.point(point);
  let closestPoint: [number, number] | null = null;
  let minDistance = Infinity;

  for (const feature of roadNetwork.features) {
    if (feature.geometry.type !== "LineString") continue;

    try {
      const line = turf.lineString(feature.geometry.coordinates, feature.properties);
      const snapped = turf.nearestPointOnLine(line, pointFeature);

      const snappedCoords = snapped.geometry.coordinates as [number, number];
      const distance = turf.distance(pointFeature, snapped);

      if (closestPoint === null || distance < minDistance) {
        closestPoint = snappedCoords;
        minDistance = distance;
      }
    } catch {
      continue;
    }
  }

  return closestPoint;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Get the facility name from properties
 */
export function getFacilityName(feature: PointFeature): string {
  const props = feature.properties;
  if (!props) return "Unknown";

  return (
    (props.name as string) ||
    (props.school_na as string) ||
    "Unknown"
  );
}

/**
 * Get facility type label
 */
export function getFacilityTypeLabel(type: FacilityType): string {
  const labels: Record<FacilityType, string> = {
    school: "School",
    hospital: "Hospital",
    clinic: "Clinic",
    education: "Education Facility",
  };
  return labels[type] || "Facility";
}
