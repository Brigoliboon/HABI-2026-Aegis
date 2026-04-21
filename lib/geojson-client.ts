"use client";

const featureCollectionCache = new Map<string, Promise<GeoJSON.FeatureCollection>>();

export async function fetchGeoJsonFeatureCollection(
  url: string
): Promise<GeoJSON.FeatureCollection> {
  const existing = featureCollectionCache.get(url);
  if (existing) return existing;

  const promise = (async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
    }

    const data = (await response.json()) as unknown;
    if (!isFeatureCollection(data)) {
      throw new Error("Invalid GeoJSON FeatureCollection");
    }

    return data;
  })();

  featureCollectionCache.set(url, promise);

  try {
    return await promise;
  } catch (err) {
    featureCollectionCache.delete(url);
    throw err;
  }
}

function isFeatureCollection(value: unknown): value is GeoJSON.FeatureCollection {
  if (!value || typeof value !== "object") return false;
  const v = value as { type?: unknown; features?: unknown };
  return v.type === "FeatureCollection" && Array.isArray(v.features);
}
