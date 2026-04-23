"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  findNearestFacility,
  getFacilityName,
  type NearestFacilityResult,
  type GeoJSONCollection,
} from "@/lib/nearestFacility";

export type FeatureProperties = Record<string, unknown>;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface DirectionsResult {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

interface RouteDirections {
  walking: DirectionsResult | null;
  driving: DirectionsResult | null;
}

// Layer IDs
const SCHOOLS_LAYER = "Schools";

// School type property values (using 'maki' field)
const SCHOOL_MAKI_ELEMENTARY = "school";
const SCHOOL_MAKI_COLLEGE = "college";

// Static risk data for demo
const RISK_DATA = {
  flood: { score: 35, label: "Flood" },
  landslide: { score: 22, label: "Landslide" },
  fault: { score: 45, label: "Active Fault" },
  overall: 34,
};

// Static economic data for demo
const ECONOMIC_DATA = {
  povertyIncidence: 18.5,
  unemploymentRate: 6.2,
  inflationRate: 4.1,
  avgIncome: 12500,
};

const getRiskColor = (score: number) => {
  if (score >= 70) return "bg-red-600";
  if (score >= 40) return "bg-yellow-500";
  return "bg-green-500";
};

const getRiskLabel = (score: number) => {
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Moderate Risk";
  return "Low Risk";
};

const getEconomicStatus = (value: number, type: "high" | "low") => {
  if (type === "high") {
    if (value >= 30) return { label: "High Poverty", color: "text-red-600" };
    if (value >= 15) return { label: "Moderate", color: "text-yellow-600" };
    return { label: "Low Poverty", color: "text-green-600" };
  }
  return { label: "Good", color: "text-green-600" };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  properties: FeatureProperties;
  titleKey?: string;
  descriptionKeys?: string[];
  position?: { lng: number; lat: number };
  mapRef?: React.RefObject<mapboxgl.Map | null>;
  onShowRoute?: (geometry: GeoJSON.LineString, profile: "walking" | "driving") => void;
};

export default function FeatureDialog({
  isOpen,
  onClose,
  properties,
  titleKey = "name",
  descriptionKeys = ["population", "place"],
  position,
  mapRef,
  onShowRoute,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [nearestElementary, setNearestElementary] = useState<NearestFacilityResult | null>(null);
  const [nearestHigherEd, setNearestHigherEd] = useState<NearestFacilityResult | null>(null);
  const [elementaryDirections, setElementaryDirections] = useState<RouteDirections>({ walking: null, driving: null });
  const [higherEdDirections, setHigherEdDirections] = useState<RouteDirections>({ walking: null, driving: null });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shownPath, setShownPath] = useState<{ type: "elementary" | "higher"; profile: "walking" | "driving" } | null>(null);

  const getDirections = useCallback(
    async (from: [number, number], to: [number, number], profile: "walking" | "driving"): Promise<DirectionsResult | null> => {
      try {
        const coordinates = `${from[0]},${from[1]};${to[0]},${to[1]}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&steps=true&annotations=distance,duration&overview=full&access_token=${MAPBOX_TOKEN}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry,
            steps: route.legs[0].steps.map((step: { maneuver: { instruction: string }; distance: number; duration: number }) => ({
              instruction: step.maneuver.instruction,
              distance: step.distance,
              duration: step.duration,
            })),
          };
        }
        return null;
      } catch (e) {
        console.error("Error fetching directions:", e);
        return null;
      }
    },
    []
  );

  const queryLayerForFacilities = useCallback(
    (map: mapboxgl.Map, layerId: string, typeFilter?: string | string[]) => {
      console.log(`[DEBUG] Querying layer: ${layerId}`, { typeFilter });
      const features = map.queryRenderedFeatures({ layers: [layerId] });
      console.log(`[DEBUG] Features found in ${layerId}:`, features.length);
      
      if (features.length === 0) return null;

      let filteredFeatures = features;
      
      // Handle single type or multiple types (OR logic) using 'maki' field
      if (typeFilter) {
        if (Array.isArray(typeFilter)) {
          // Multiple types - include any matching maki
          filteredFeatures = features.filter((f) => {
            const props = f.properties as Record<string, unknown>;
            const makiValue = props.maki as string | undefined;
            return makiValue && typeFilter.includes(makiValue);
          });
        } else {
          // Single type
          filteredFeatures = features.filter((f) => {
            const props = f.properties as Record<string, unknown>;
            const makiValue = props.maki as string | undefined;
            return makiValue === typeFilter;
          });
        }
      }

      console.log(`[DEBUG] Filtered features (maki=${typeFilter}):`, filteredFeatures.length);

      if (filteredFeatures.length === 0) return null;

      const collection: GeoJSONCollection = {
        type: "FeatureCollection",
        features: filteredFeatures
          .filter((f) => f.geometry?.type === "Point")
          .map((f) => {
            const coords = (f.geometry as GeoJSON.Point).coordinates;
            const props = f.properties as Record<string, unknown>;
            console.log(`[DEBUG] Feature:`, props.name || props.school_na, "maki:", props.maki, "coords:", coords);
            return {
              type: "Feature" as const,
              geometry: {
                type: "Point" as const,
                coordinates: coords as [number, number],
              },
              properties: f.properties || {},
            };
          }),
      };
      
      console.log(`[DEBUG] Collection built:`, collection.features.length, "features");
      return collection;
    },
    []
  );

  const scanForFacilities = useCallback(async () => {
    if (!isOpen || !position || !mapRef?.current) {
      console.log("[DEBUG] scanForFacilities: early return");
      return;
    }

    const map = mapRef.current;
    const name = properties[titleKey as keyof FeatureProperties] as string | undefined;
    console.log("[DEBUG] Starting scan for:", name, "at", position);

    if (!name || !name.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const fromLngLat: [number, number] = [position.lng, position.lat];
      console.log("[DEBUG] Search origin:", fromLngLat);

      // Query Schools layer for Elementary (maki=school)
      console.log("[DEBUG] Scanning for Elementary (maki=school)...");
      const elementaryCollection = queryLayerForFacilities(map, SCHOOLS_LAYER, SCHOOL_MAKI_ELEMENTARY);
      if (elementaryCollection) {
        const nearest = findNearestFacility(fromLngLat, elementaryCollection);
        console.log("[DEBUG] Nearest elementary:", nearest);
        if (nearest.facility) {
          setNearestElementary(nearest);
          const [walking, driving] = await Promise.all([
            getDirections(fromLngLat, nearest.facility.geometry.coordinates, "walking"),
            getDirections(fromLngLat, nearest.facility.geometry.coordinates, "driving"),
          ]);
          setElementaryDirections({ walking, driving });
        }
      }

      // Query Schools layer for College/University (maki=college)
      console.log("[DEBUG] Scanning for College/University (maki=college)...");
      const collegeCollection = queryLayerForFacilities(map, SCHOOLS_LAYER, SCHOOL_MAKI_COLLEGE);
      if (collegeCollection) {
        const nearest = findNearestFacility(fromLngLat, collegeCollection);
        console.log("[DEBUG] Nearest college/university:", nearest);
        if (nearest.facility) {
          setNearestHigherEd(nearest);
          const [walking, driving] = await Promise.all([
            getDirections(fromLngLat, nearest.facility.geometry.coordinates, "walking"),
            getDirections(fromLngLat, nearest.facility.geometry.coordinates, "driving"),
          ]);
          setHigherEdDirections({ walking, driving });
        }
      }
    } catch (e) {
      console.error("Error scanning facilities:", e);
      setError("Error scanning facilities");
    } finally {
      setIsSearching(false);
    }
  }, [isOpen, position, mapRef, properties, titleKey, queryLayerForFacilities, getDirections]);

  useEffect(() => {
    if (!isOpen || !mapRef?.current) {
      setNearestElementary(null);
      setNearestHigherEd(null);
      setElementaryDirections({ walking: null, driving: null });
      setHigherEdDirections({ walking: null, driving: null });
      return;
    }

    const timer = setTimeout(scanForFacilities, 100);
    return () => clearTimeout(timer);
  }, [isOpen, scanForFacilities, mapRef]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const getValue = (key: string): string => {
    const value = properties[key];
    if (typeof value === "string") return value;
    if (value == null) return "";
    return String(value);
  };

  const title = titleKey ? getValue(titleKey) : "";
  const descriptionFields = descriptionKeys
    .filter((key) => getValue(key).trim())
    .map((key) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: getValue(key),
    }));

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 m-auto rounded-lg border bg-white p-0 shadow-xl backdrop:fixed backdrop:inset-0"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const isInDialog =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (!isInDialog) {
          onClose();
        }
      }}
    >
      {/* Do Not Change the width and the Height */}
      <div className="w-250 h-250 overflow-y-auto p-4">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-2 mb-4">
          {descriptionFields.map((field) => (
            <div key={field.label} className="flex justify-between text-sm">
              <span className="text-gray-500">{field.label}:</span>
              <span className="text-gray-900 font-medium">{field.value}</span>
            </div>
          ))}
        </div>

        {/* Risk Analysis Section */}
        <div className="border-t pt-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Risk Analysis</h3>
          
          {/* Overall Score */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Overall Risk Score</span>
              <span className="font-semibold">{RISK_DATA.overall}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getRiskColor(RISK_DATA.overall)} transition-all`}
                style={{ width: `${RISK_DATA.overall}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-right">{getRiskLabel(RISK_DATA.overall)}</p>
          </div>

          {/* Individual Risks */}
          <div className="space-y-2">
            {Object.entries<{ score: number; label: string } | number>(RISK_DATA).map(([key, data]) => {
              if (key === "overall" || typeof data === "number") return null;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getRiskColor(data.score)}`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                    <span className="text-xs w-8">{data.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Economic Status Section */}
        <div className="border-t pt-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Economic Status</h3>
          
          <div className="space-y-3">
            {/* Poverty Incidence */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Poverty Incidence</span>
                <span className={`font-medium ${getEconomicStatus(ECONOMIC_DATA.povertyIncidence, "high").color}`}>
                  {ECONOMIC_DATA.povertyIncidence}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getRiskColor(ECONOMIC_DATA.povertyIncidence * 2)}`}
                  style={{ width: `${ECONOMIC_DATA.povertyIncidence * 2}%` }}
                />
              </div>
            </div>

            {/* Unemployment Rate */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Unemployment Rate</span>
                <span className="font-medium">{ECONOMIC_DATA.unemploymentRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getRiskColor(ECONOMIC_DATA.unemploymentRate * 5)}`}
                  style={{ width: `${ECONOMIC_DATA.unemploymentRate * 5}%` }}
                />
              </div>
            </div>

            {/* Inflation Rate */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Inflation Rate</span>
                <span className="font-medium">{ECONOMIC_DATA.inflationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getRiskColor(ECONOMIC_DATA.inflationRate * 10)}`}
                  style={{ width: `${ECONOMIC_DATA.inflationRate * 10}%` }}
                />
              </div>
            </div>

            {/* Average Income */}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Average Household Income</span>
                <span className="font-semibold">₱{ECONOMIC_DATA.avgIncome.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Education Facilities Section */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Education Facilities</h3>

          {isSearching && (
            <p className="text-sm text-gray-500">Scanning...</p>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Elementary School */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600 mb-1">Elementary / Primary</div>
            {nearestElementary && nearestElementary.facility ? (
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{getFacilityName(nearestElementary.facility)}</span>
                  {elementaryDirections.walking && (
                    <button
                      onClick={() => {
                        if (shownPath?.type === "elementary" && shownPath?.profile === "walking") {
                          setShownPath(null);
                        } else if (elementaryDirections.walking) {
                          setShownPath({ type: "elementary", profile: "walking" });
                          onShowRoute?.(elementaryDirections.walking.geometry, "walking");
                          onClose();
                        }
                      }}
                      className={`px-2 py-1 rounded ${shownPath?.type === "elementary" && shownPath?.profile === "walking" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                    >
                      Show Path
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {`${Math.round((elementaryDirections.walking?.distance || 0) / 10) / 100} km`}
                </div>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>🚶 {Math.round((elementaryDirections.walking?.duration || 0) / 60)} min</span>
                  <span>🚗 {Math.round((elementaryDirections.driving?.duration || 0) / 60)} min</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {elementaryDirections.walking?.steps[0]?.instruction && (
                    <span className="italic">{elementaryDirections.walking.steps[0].instruction}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No elementary school found</p>
            )}
          </div>

          {/* College / University */}
          <div>
            <div className="font-medium text-gray-600 mb-1">College / University</div>
            {nearestHigherEd && nearestHigherEd.facility ? (
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{getFacilityName(nearestHigherEd.facility)}</span>
                  {higherEdDirections.walking && (
                    <button
                      onClick={() => {
                        if (shownPath?.type === "higher" && shownPath?.profile === "walking") {
                          setShownPath(null);
                        } else if (higherEdDirections.walking) {
                          setShownPath({ type: "higher", profile: "walking" });
                          onShowRoute?.(higherEdDirections.walking.geometry, "walking");
                          onClose();
                        }
                      }}
                      className={`px-2 py-1 rounded flex ${shownPath?.type === "higher" && shownPath?.profile === "walking" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                    >
                      Show Path
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {`${Math.round((higherEdDirections.walking?.distance || 0) / 10) / 100} km`}
                </div>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>🚶 {Math.round((higherEdDirections.walking?.duration || 0) / 60)} min</span>
                  <span>🚗 {Math.round((higherEdDirections.driving?.duration || 0) / 60)} min</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {higherEdDirections.walking?.steps[0]?.instruction && (
                    <span className="italic">{higherEdDirections.walking.steps[0].instruction}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No higher education found</p>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
