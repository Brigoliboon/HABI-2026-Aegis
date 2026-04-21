import { readGeoJsonDatasetFile } from "@/lib/geojson";

type RouteContext = {
  params: Promise<{
    name: string;
  }>;
};

export async function GET(_: Request, ctx: RouteContext) {
  const { name } = await ctx.params;
  const baseName = name.replace(/\.geojson$/i, "");

  const contents = await readGeoJsonDatasetFile(baseName);
  if (!contents) {
    return new Response(null, { status: 404 });
  }

  return new Response(contents, {
    headers: {
      "Content-Type": "application/geo+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
