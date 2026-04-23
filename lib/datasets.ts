export const GEOJSON_DATASET_NAMES = [
  "val-31",
  "val-31-ver2",
] as const;

export type GeojsonDatasetName = (typeof GEOJSON_DATASET_NAMES)[number];

const DATASET_NAME_SET = new Set<string>(GEOJSON_DATASET_NAMES);

export function isGeojsonDatasetName(value: string): value is GeojsonDatasetName {
  return DATASET_NAME_SET.has(value);
}

export function geojsonApiPath(name: GeojsonDatasetName): string {
  return `/api/geojson/${name}`;
}