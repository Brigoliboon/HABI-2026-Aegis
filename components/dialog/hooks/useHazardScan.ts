"use client";

import { useCallback, useEffect, useState } from "react";
import { scanHazards } from "@/lib/hazardScanner";
import type mapboxgl from "mapbox-gl";
import type { HazardDataState } from "../types";

export function useHazardScan(
  mapRef: React.RefObject<mapboxgl.Map | null> | null,
  position: { lng: number; lat: number } | null,
  enabled: boolean = true
) {
  const [data, setData] = useState<HazardDataState>({
    faultDistance: null,
    floodDistance: null,
    landslideDistance: null,
    landslideIntensity: null,
    volcanoCount: 0,
    activeVolcanoes: [],
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
      const result = scanHazards(mapRef.current, position.lng, position.lat);
      setData(result);
    } catch (e) {
      console.error("Hazard scan error:", e);
      setError("Failed to scan hazards");
    } finally {
      setIsScanning(false);
    }
  }, [mapRef, position, enabled]);

  useEffect(() => {
    scan();
  }, [scan]);

  return { data, isScanning, error, scan, refetch: scan };
}
