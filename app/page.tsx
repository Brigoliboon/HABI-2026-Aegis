import AGEISApp from "@/components/ageis-app";
import { PH_PLACE_HIERARCHY } from "@/lib/ph-admin-data";

export default function HomePage() {
  return (
    <main className="h-screen w-screen">
      <AGEISApp initialPlaceHierarchy={PH_PLACE_HIERARCHY} />
    </main>
  );
}
