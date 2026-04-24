import { fromFile } from "geotiff";
import path from "node:path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return Response.json({ error: "Invalid lat/lng parameters" }, { status: 400 });
  }

  try {
    const tiffPath = path.join(
      process.cwd(),
      "public",
      "geojson",
      "raster",
      "Bukidnon_LandslideHazards.TIFF"
    );

    const tiff = await fromFile(tiffPath);
    const image = await tiff.getImage();

    // Get geospatial bounding box: [minX, minY, maxX, maxY] = [minLng, minLat, maxLng, maxLat]
    const bbox = image.getBoundingBox();
    const width = image.getWidth();
    const height = image.getHeight();

    // Check if point is within bounding box
    if (lng < bbox[0] || lng > bbox[2] || lat < bbox[1] || lat > bbox[3]) {
      return Response.json({
        intensity: null,
        withinBounds: false,
        message: "Point outside GeoTIFF bounds",
      });
    }

    // Convert lng/lat to pixel coordinates
    // GeoTIFF pixel coordinates: x = (lng - minLng) / (bbox width) * width
    // y = (maxLat - lat) / (bbox height) * height (flipped because image origin is top-left)
    const pixelX = Math.floor(((lng - bbox[0]) / (bbox[2] - bbox[0])) * width);
    const pixelY = Math.floor(((bbox[3] - lat) / (bbox[3] - bbox[1])) * height);

    // Clamp to valid pixel range
    const clampedX = Math.max(0, Math.min(pixelX, width - 1));
    const clampedY = Math.max(0, Math.min(pixelY, height - 1));

    // Read raster data
    const raster = await image.readRasters();
    const value = raster[0][clampedY * width + clampedX];

    // Normalize intensity to 0-100 scale (assuming GeoTIFF values are 0-1 or similar)
    let normalizedIntensity = null;
    if (value !== undefined && value !== null) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        // Assuming values are 0-1, convert to 0-100
        normalizedIntensity = Math.round(numValue * 100);
      }
    }

    return Response.json({
      intensity: normalizedIntensity,
      rawValue: value,
      withinBounds: true,
      pixelCoords: { x: clampedX, y: clampedY },
      bbox: { minLng: bbox[0], minLat: bbox[1], maxLng: bbox[2], maxLat: bbox[3] },
    });
  } catch (error) {
    console.error("Error reading GeoTIFF:", error);
    return Response.json(
      { error: "Failed to read landslide data" },
      { status: 500 }
    );
  }
}
