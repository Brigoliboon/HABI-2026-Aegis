import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { isGeojsonDatasetName } from "@/lib/datasets";

export async function readGeoJsonDatasetFile(baseName: string): Promise<string | null> {
  const normalized = baseName.trim();
  if (!normalized) return null;

  if (!isGeojsonDatasetName(normalized)) {
    return null;
  }

  const filePath = path.join(process.cwd(), "data", "geojson", `${normalized}.geojson`);

  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}
