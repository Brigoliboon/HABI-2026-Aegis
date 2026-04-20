import { readFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_NAMES = new Set([
  "valencia_city_31_barangays_3100_households_anchored",
  "val-31",
  "val-31-ver2",
]);

type RouteContext = {
  params: Promise<{
    name: string;
  }>;
};

export async function GET(_: Request, ctx: RouteContext) {
  const { name } = await ctx.params;
  const baseName = name.replace(/\.geojson$/i, "");

  if (!ALLOWED_NAMES.has(baseName)) {
    return new Response(null, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "data", `${baseName}.geojson`);

  try {
    const contents = await readFile(filePath, "utf8");

    return new Response(contents, {
      headers: {
        "Content-Type": "application/geo+json; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
