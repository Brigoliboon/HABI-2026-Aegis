import { isGeojsonDatasetName } from "@/lib/datasets";
import { readFile } from "node:fs/promises";
import path from "node:path";

type RouteContext = {
  params: Promise<{
    name: string;
  }>;
};

export async function GET(_: Request, ctx: RouteContext) {
  const { name } = await ctx.params;
  const baseName = name.replace(/\.geojson$/i, "");
  const normalized = baseName.trim();

  if (!normalized || !isGeojsonDatasetName(normalized)) {
    return new Response(null, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "data", "geojson", `${normalized}.geojson`);

  let contents: string | null = null;
  try {
    contents = await readFile(filePath, "utf8");
  } catch {
    // fall through
  }

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
