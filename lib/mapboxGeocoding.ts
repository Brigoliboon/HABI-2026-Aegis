const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export type Region = {
  name: string;
  provinces: Province[];
};

export type Province = {
  name: string;
  municipalities: Municipality[];
};

export type Municipality = {
  name: string;
  barangays: string[];
};

const PHILIPPINE_REGIONS: Region[] = [
  {
    name: "Region IX",
    provinces: [
      {
        name: "Zamboanga del Sur",
        municipalities: [
          { name: "Zamboanga City", barangays: [] },
          { name: "Pagadian City", barangays: [] },
        ],
      },
      {
        name: "Zamboanga del Norte",
        municipalities: [
          { name: "Dipolog City", barangays: [] },
        ],
      },
    ],
  },
  {
    name: "Region X",
    provinces: [
      {
        name: "Misamis Oriental",
        municipalities: [
          { name: "Cagayan de Oro City", barangays: [] },
          { name: "Gingoog City", barangays: [] },
        ],
      },
      {
        name: "Bukidnon",
        municipalities: [
          { name: "Malaybalay City", barangays: [] },
        ],
      },
    ],
  },
];

export async function fetchPlaceSuggestions(query: string): Promise<Array<{
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
  placeType: "region" | "province" | "municipality" | "barangay";
}>> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=ph&types=region,province,place,locality`
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();

    return data.features.map((feature: any) => {
      const context = feature.context || [];
      let placeType: "region" | "province" | "municipality" | "barangay" = "municipality";

      const regionCtx = context.find((c: any) => c.id.startsWith("region."));
      const provinceCtx = context.find((c: any) => c.id.startsWith("province."));
      const placeCtx = context.find((c: any) => c.id.startsWith("place."));

      if (regionCtx) placeType = "region";
      else if (provinceCtx) placeType = "province";
      else if (placeCtx) placeType = "municipality";

      const regionName = regionCtx?.text || "";
      const provinceName = provinceCtx?.text || "";
      const placeName = placeCtx?.text || "";

      const fullAddress = [feature.text, placeName, provinceName, regionName]
        .filter(Boolean)
        .join(", ");

      return {
        name: feature.text,
        fullAddress,
        lat: feature.center[1],
        lng: feature.center[0],
        placeType,
      };
    });
  } catch (error) {
    console.error("Failed to fetch place suggestions:", error);
    return [];
  }
}

export async function fetchRegionBounds(regionName: string): Promise<{
  center: [number, number];
  bounds: [number, number, number, number];
} | null> {
  if (!regionName.trim()) return null;

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(regionName)}.json?access_token=${MAPBOX_TOKEN}&country=ph&types=region&limit=1`
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();

    if (data.features.length === 0) return null;

    const feature = data.features[0];
    return {
      center: feature.center,
      bounds: feature.bbox || [],
    };
  } catch (error) {
    console.error("Failed to fetch region bounds:", error);
    return null;
  }
}

export async function fetchMunicipalities(provinceName: string): Promise<string[]> {
  if (!provinceName.trim()) return [];

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(provinceName)}.json?access_token=${MAPBOX_TOKEN}&country=ph&types=place&limit=20`
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();

    return data.features.map((f: any) => f.text);
  } catch (error) {
    console.error("Failed to fetch municipalities:", error);
    return [];
  }
}

export async function fetchBarangays(municipalityName: string): Promise<string[]> {
  if (!municipalityName.trim()) return [];

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(municipalityName + ", Philippines")}.json?access_token=${MAPBOX_TOKEN}&country=ph&types=locality&limit=20`
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();

    return data.features
      .filter((f: any) => f.text.toLowerCase().includes("brgy") || f.text.toLowerCase().includes("barangay"))
      .map((f: any) => f.text);
  } catch (error) {
    console.error("Failed to fetch barangays:", error);
    return [];
  }
}

export { PHILIPPINE_REGIONS };