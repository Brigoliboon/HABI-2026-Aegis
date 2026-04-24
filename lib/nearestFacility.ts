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

    const distance = turf.distance(fromPoint, feature as any);

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
      const snapped = turf.nearestPointOnLine(
        feature.geometry as any,
        pointFeature
      );

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

/**
 * Result of finding nearest hazard line (fault, landslide zone, etc.)
 */
export interface NearestHazardResult {
  distance: number;
  nearestPoint: [number, number] | null;
  hazardFeature: LineFeature | null;
  hazardName: string | null;
}

/**
 * Find the nearest point on a hazard line (fault line, landslide zone, etc.)
 * to a given point (community location).
 *
 * Uses turf.nearestPointOnLine to find the closest point on any LineString
 * in the collection, then calculates the distance.
 */
export function findNearestHazardLine(
  fromLngLat: [number, number],
  hazardCollection: GeoJSONCollection
): NearestHazardResult {
  if (!hazardCollection.features || hazardCollection.features.length === 0) {
    return {
      distance: Infinity,
      nearestPoint: null,
      hazardFeature: null,
      hazardName: null,
    };
  }

  const fromPoint = turf.point(fromLngLat);
  let closestResult: NearestHazardResult = {
    distance: Infinity,
    nearestPoint: null,
    hazardFeature: null,
    hazardName: null,
  };

  for (const feature of hazardCollection.features) {
    if (feature.geometry.type !== "LineString") continue;

    try {
      const snapped = turf.nearestPointOnLine(
        feature.geometry as any,
        fromPoint
      );

      const snappedCoords = snapped.geometry.coordinates as [number, number];
      const distance = turf.distance(fromPoint, snapped);

      if (distance < closestResult.distance) {
        closestResult = {
          distance,
          nearestPoint: snappedCoords,
          hazardFeature: feature as LineFeature,
          hazardName: (feature.properties?.name as string) || null,
        };
      }
    } catch {
      continue;
    }
  }

  return closestResult;
}

/**
 * Find nearest hazard polygon (flood zone, etc.) to a point.
 * Returns distance to polygon edge and the nearest point on the polygon.
 */
export function findNearestHazardPolygon(
  fromLngLat: [number, number],
  hazardCollection: GeoJSONCollection
): NearestHazardResult {
  if (!hazardCollection.features || hazardCollection.features.length === 0) {
    return {
      distance: Infinity,
      nearestPoint: null,
      hazardFeature: null,
      hazardName: null,
    };
  }

  const fromPoint = turf.point(fromLngLat);
  let closestResult: NearestHazardResult = {
    distance: Infinity,
    nearestPoint: null,
    hazardFeature: null,
    hazardName: null,
  };

  for (const feature of hazardCollection.features) {
    if (feature.geometry.type !== "Polygon") continue;

    try {
      // Convert polygon to line segments and find nearest point
      const coords = feature.geometry.coordinates[0]; // Outer ring
      if (!coords || coords.length < 2) continue;

      // Create a LineString from polygon outer ring for nearest point calculation
      const lineString = turf.lineString(coords);
      const snapped = turf.nearestPointOnLine(lineString, fromPoint);

      const snappedCoords = snapped.geometry.coordinates as [number, number];
      const distance = turf.distance(fromPoint, snapped);

      // Check if point is inside polygon
      const isInside = turf.booleanPointInPolygon(fromPoint, feature.geometry as any);
      const finalDistance = isInside ? 0 : distance;

      if (finalDistance < closestResult.distance) {
        closestResult = {
          distance: finalDistance,
          nearestPoint: isInside ? fromLngLat : snappedCoords,
          hazardFeature: feature as any,
          hazardName: (feature.properties?.name as string) || null,
        };
      }
    } catch {
      continue;
    }
  }

  return closestResult;
}