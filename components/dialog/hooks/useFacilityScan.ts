"use client";

import { useCallback, useEffect, useState } from "react";
import { scanFacilities, type ScanFacilitiesResult } from "@/lib/facilityFinder";
import type mapboxgl from "mapbox-gl";
import type { NearestFacilityResult, RouteDirections } from "../types";

export function useFacilityScan(
  mapRef: React.RefObject<mapboxgl.Map | null> | null,
  position: { lng: number; lat: number } | null,
  enabled: boolean = true
) {
  const [elementary, setElementary] = useState<NearestFacilityResult | null>(null);
  const [higherEd, setHigherEd] = useState<NearestFacilityResult | null>(null);
  const [directions, setDirections] = useState<RouteDirections>({
    walking: null,
    driving: null,
  });
  const [unpavedOverlap, setUnpavedOverlap] = useState<{ walking: boolean; driving: boolean }>({
    walking: false,
    driving: false,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async () => {
    if (!enabled || !mapRef?.current || !position) {
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const result: ScanFacilitiesResult = await scanFacilities(mapRef.current, position);

      setElementary(result.elementary);
      setHigherEd(result.higherEd);
      setDirections(result.directions);
      setUnpavedOverlap(result.unpavedOverlap);
    } catch (e) {
      console.error("Facility scan error:", e);
      setError("Failed to scan facilities");
    } finally {
      setIsScanning(false);
    }
  }, [mapRef, position, enabled]);

  useEffect(() => {
    scan();
  }, [scan]);

  return {
    elementary,
    higherEd,
    directions,
    unpavedOverlap,
    isScanning,
    error,
    scan,
    refetch: scan,
  };
}
