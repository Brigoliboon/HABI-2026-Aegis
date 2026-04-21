export const GEOJSON_DATASET_NAMES = [
  "valencia_city_31_barangays_3100_households_anchored",
  "val-31",
  "val-31-ver2",
] as const;

export type GeojsonDatasetName = (typeof GEOJSON_DATASET_NAMES)[number];

const DATASET_NAME_SET = new Set<string>(GEOJSON_DATASET_NAMES);

export function isGeojsonDatasetName(value: string): value is GeojsonDatasetName {
  return DATASET_NAME_SET.has(value);
}

export const ACTIVE_HOUSEHOLDS_DATASET_NAME: GeojsonDatasetName = "val-31-ver2";

export function geojsonApiPath(name: GeojsonDatasetName): string {
  return `/api/geojson/${name}`;
}

export const ACTIVE_HOUSEHOLDS_DATASET_API_PATH = geojsonApiPath(
  ACTIVE_HOUSEHOLDS_DATASET_NAME
);
