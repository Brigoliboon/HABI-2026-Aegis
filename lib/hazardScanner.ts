import type mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import { findNearestHazardLine } from "./nearestFacility";

// ─── Hazard Scan Result ───────────────────────────────────────────────────
export type HazardScanResult = {
  faultDistance: number | null;
  floodDistance: number | null;
  landslideDistance: number | null;
  landslideIntensity: number | null;
  volcanoCount: number;
  activeVolcanoes: Array<{ name: string; distanceKm: number; risk: number }>;
};

// ─── Dummy Volcano Data (temporary) ──────────────────────────────────────
const DUMMY_VOLCANO_DATA = [
  { name: "Mayon", baseDistance: 12, risk: 75 },
  { name: "Taal", baseDistance: 25, risk: 68 },
  { name: "Kanlaon", baseDistance: 18, risk: 72 },
  { name: "Bulusan", baseDistance: 30, risk: 60 },
  { name: "Hibok-Hibok", baseDistance: 45, risk: 45 },
  { name: "Iriga", baseDistance: 55, risk: 20 },
  { name: "Arayat", baseDistance: 65, risk: 10 },
];

const VOLCANO_RADIUS_KM = 50;

// ─── Scan Fault Lines ─────────────────────────────────────────────────────
function scanFaultLines(map: mapboxgl.Map, lng: number, lat: number): number | null {
  const FAULT_LAYER_ID = "Active Fault";

  try {
    // Try rendered features first (viewport-limited)
    let faultFeatures = map.queryRenderedFeatures({ layers: [FAULT_LAYER_ID] });

    // Fall back to source query
    if (faultFeatures.length === 0) {
      const layer = map.getLayer(FAULT_LAYER_ID);
      if (layer?.source) {
        faultFeatures = map.querySourceFeatures(layer.source as string);
      }
    }

    // Filter to fault line geometries only
    faultFeatures = faultFeatures.filter((f) => {
      const name = (f.properties?.name as string) || "";
      const type = f.geometry?.type;
      return name.toLowerCase().includes("fault") || type === "LineString" || type === "MultiLineString";
    });

    if (faultFeatures.length === 0) return null;

    // Build collection and find nearest
    const collection = {
      type: "FeatureCollection" as const,
      features: faultFeatures
        .filter((f) => f.geometry?.type === "LineString")
        .map((f) => ({
          type: "Feature" as const,
          geometry: f.geometry as GeoJSON.LineString,
          properties: f.properties || {},
        })),
    };

    const result = findNearestHazardLine([lng, lat], collection);
    return result.distance !== Infinity ? Math.round(result.distance * 1000) / 1000 : null;
  } catch (error) {
    console.error("[HazardScanner] Fault scan error:", error);
    return null;
  }
}

// ─── Scan Volcanoes from Point Features ───────────────────────────────────
function scanVolcanoes(map: mapboxgl.Map, lng: number, lat: number): {
  count: number;
  active: Array<{ name: string; distanceKm: number; risk: number }>;
} {
  const VOLCANO_LAYER_ID = "volcanoes";

  try {
    // Try rendered features first
    let volcanoFeatures = map.queryRenderedFeatures({ layers: [VOLCANO_LAYER_ID] });

    // Fall back to source query
    if (volcanoFeatures.length === 0) {
      const layer = map.getLayer(VOLCANO_LAYER_ID);
      if (layer?.source) {
        volcanoFeatures = map.querySourceFeatures(layer.source as string);
      }
    }

    // Filter to point geometries only
    volcanoFeatures = volcanoFeatures.filter((f) => {
      return f.geometry?.type === "Point";
    });

    if (volcanoFeatures.length === 0) {
      // Fall back to dummy data if no features found
      const nearby = DUMMY_VOLCANO_DATA.filter((v) => v.baseDistance <= VOLCANO_RADIUS_KM);
      return {
        count: nearby.length,
        active: nearby.map((v) => ({
          name: v.name,
          distanceKm: v.baseDistance + Math.random() * 10,
          risk: v.risk,
        })),
      };
    }

    const nearbyVolcanoes: Array<{ name: string; distanceKm: number; risk: number }> = [];

    // Calculate distance to each volcano point using turf
    const fromPoint = turf.point([lng, lat]);

    for (const feature of volcanoFeatures) {
      const coords = (feature.geometry as GeoJSON.Point).coordinates;
      if (!coords) continue;

      const volcanoPoint = turf.point(coords);
      const distance = turf.distance(fromPoint, volcanoPoint);

      if (distance !== Infinity && distance <= VOLCANO_RADIUS_KM) {
        const name = (feature.properties?.name as string) || "Unknown Volcano";
        // Calculate risk based on proximity (closer = higher risk)
        const risk = Math.max(10, Math.min(90, 100 - distance * 2));

        nearbyVolcanoes.push({
          name,
          distanceKm: distance,
          risk,
        });
      }
    }

    return {
      count: nearbyVolcanoes.length,
      active: nearbyVolcanoes.sort((a, b) => a.distanceKm - b.distanceKm),
    };
  } catch (error) {
    console.error("[HazardScanner] Volcano scan error:", error);
    // Fall back to dummy data on error
    const nearby = DUMMY_VOLCANO_DATA.filter((v) => v.baseDistance <= VOLCANO_RADIUS_KM);
    return {
      count: nearby.length,
      active: nearby.map((v) => ({
        name: v.name,
        distanceKm: v.baseDistance + Math.random() * 10,
        risk: v.risk,
      })),
    };
  }
}

// ─── Scan Flood Zones (temporary random) ──────────────────────────────────
function scanFloodZones(): { distance: number } {
  // Temporary: random 0.5–2 km to avoid exaggeration
  const distance = Math.random() * 1.5 + 0.5;
  return { distance };
}

// ─── Scan Landslide (temporary random intensity) ──────────────────────────
function scanLandslides(): { intensity: number; distance: number | null } {
  // Temporary: random intensity 0–50
  const intensity = Math.floor(Math.random() * 51);
  const distance = intensity > 0 ? 100 - intensity : null;
  return { intensity, distance };
}

// ─── Main Scan Function ────────────────────────────────────────────────────
/**
 * Scan all hazards near a location.
 *
 * @param map - Mapbox map instance (for layer queries)
 * @param lng - Longitude
 * @param lat - Latitude
 * @returns HazardScanResult with all hazard metrics
 *
 * @note Currently uses random/dummy data for floods, landslides.
 *       Volcanoes now scan from map point features.
 *       Replace with real data sources when available.
 */
export function scanHazards(map: mapboxgl.Map, lng: number, lat: number): HazardScanResult {
  const faultDistance = scanFaultLines(map, lng, lat);
  const flood = scanFloodZones();
  const landslide = scanLandslides();
  const volcanoes = scanVolcanoes(map, lng, lat);

  return {
    faultDistance,
    floodDistance: flood.distance,
    landslideDistance: landslide.distance,
    landslideIntensity: landslide.intensity,
    volcanoCount: volcanoes.count,
    activeVolcanoes: volcanoes.active,
  };
}
