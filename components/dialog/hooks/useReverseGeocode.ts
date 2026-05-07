"use client";

import { useCallback, useState } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Reverse geocode a coordinate pair to a human-readable address.
 */
export function useReverseGeocode() {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (lng: number, lat: number): Promise<void> => {
    if (!MAPBOX_TOKEN) {
      setError("Mapbox token not configured");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,place,locality,postcode`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        setAddress(data.features[0].place_name);
      } else {
        setAddress(null);
      }
    } catch (e) {
      console.error("Reverse geocode error:", e);
      setError("Failed to fetch address");
      setAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { address, isLoading, error, geocode, setAddress };
}
