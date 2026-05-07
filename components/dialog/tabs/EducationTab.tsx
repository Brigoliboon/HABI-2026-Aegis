"use client";

import { useState, FC } from "react";
import type { GeoJSON } from "geojson";
import { getFacilityName } from "@/lib/nearestFacility";
import { FacilityCard } from "../shared/FacilityCard";
import SectionHeader from "../shared/SectionHeader";
import LoadingSpinner from "../shared/LoadingSpinner";
import type { NearestFacilityResult, RouteDirections } from "../types";

type RouteProfile = "walking" | "driving";
type FacilityType = "elementary" | "higher";

interface ActiveRoute {
  facility: FacilityType;
  profile: RouteProfile;
}

interface EducationTabProps {
  elementary: NearestFacilityResult | null;
  higherEd: NearestFacilityResult | null;
  elementaryDirections: RouteDirections;
  higherEdDirections: RouteDirections;
  onShowRoute: (geometry: GeoJSON.LineString, profile: "walking" | "driving") => void;
  isScanning?: boolean;
}

export const EducationTab: FC<EducationTabProps> = ({
  elementary,
  higherEd,
  elementaryDirections,
  higherEdDirections,
  onShowRoute,
  isScanning = false,
}) => {
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);

  const handleShowRoute = (facility: FacilityType, profile: RouteProfile) => {
    const directions = facility === "elementary" ? elementaryDirections : higherEdDirections;
    const geometry = profile === "walking" ? directions.walking?.geometry : directions.driving?.geometry;
    if (!geometry) return;

    // Toggle: if same route is already active, deactivate it
    if (activeRoute?.facility === facility && activeRoute?.profile === profile) {
      setActiveRoute(null);
    } else {
      setActiveRoute({ facility, profile });
      onShowRoute(geometry, profile);
    }
  };

  if (isScanning) {
    return (
      <div className="p-5 space-y-4">
        <SectionHeader title="Education Facilities" />
        <LoadingSpinner text="Scanning facilities..." />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <SectionHeader title="Education Facilities" />

      <div className="space-y-5">
        {/* Elementary School */}
        <FacilityCard
          name={elementary ? getFacilityName(elementary.facility) : null}
          type="elementary"
          walking={elementaryDirections.walking}
          driving={elementaryDirections.driving}
          onShowWalkingRoute={() => handleShowRoute("elementary", "walking")}
          onShowDrivingRoute={() => handleShowRoute("elementary", "driving")}
          isWalkingRouteShowing={activeRoute?.facility === "elementary" && activeRoute?.profile === "walking"}
          isDrivingRouteShowing={activeRoute?.facility === "elementary" && activeRoute?.profile === "driving"}
        />

        <div className="h-px bg-gray-100" />

        {/* College / University */}
        <FacilityCard
          name={higherEd ? getFacilityName(higherEd.facility) : null}
          type="higher-ed"
          walking={higherEdDirections.walking}
          driving={higherEdDirections.driving}
          onShowWalkingRoute={() => handleShowRoute("higher", "walking")}
          onShowDrivingRoute={() => handleShowRoute("higher", "driving")}
          isWalkingRouteShowing={activeRoute?.facility === "higher" && activeRoute?.profile === "walking"}
          isDrivingRouteShowing={activeRoute?.facility === "higher" && activeRoute?.profile === "driving"}
        />
      </div>
    </div>
  );
};

export default EducationTab;
