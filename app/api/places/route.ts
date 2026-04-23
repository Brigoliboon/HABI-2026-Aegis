import { PH_PLACE_HIERARCHY } from "@/lib/ph-admin-data";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(PH_PLACE_HIERARCHY, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
