"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  findNearestFacility,
  findNearestHazardLine,
  findNearestHazardPolygon,
  formatDistance,
  getFacilityName,
  type NearestFacilityResult,
  type GeoJSONCollection,
} from "@/lib/nearestFacility";
import AISummary from "./AISummary";
import incomeData from "@/data/income.json";
// ─── Mini Bar Chart ────────────────────────────────────────────────
interface MiniBarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  height?: number;
  maxValue?: number;
}
function MiniBarChart({ data, height = 32, maxValue }: MiniBarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t transition-all duration-700 ease-out"
            style={{
              height: `${(d.value / max) * (height - 16)}px`,
              backgroundColor: d.color,
              opacity: 0.85,
              minHeight: "3px",
            }}
          />
          <span className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
// ─── Sparkline (SVG) ───────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
}
function Sparkline({ data, width = 100, height = 28, color = "#3b82f6", showDots = false }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {showDots &&
        points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} opacity={i === points.length - 1 ? 1 : 0.4} />
        ))}
    </svg>
  );
}
// ─── Horizontal Risk Bar ───────────────────────────────────────────
interface RiskBarProps {
  label: string;
  score: number;
  distance?: string;
  animate?: boolean;
}
function RiskBar({ label, score, distance, animate = true }: RiskBarProps) {
  const color =
    score >= 70 ? "#dc2626" : score >= 40 ? "#f59e0b" : "#16a34a";
  const label2 =
    score >= 70 ? "High" : score >= 40 ? "Moderate" : "Low";
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          {distance && (
            <span className="text-[11px] text-gray-400 font-mono">{distance}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color }}>{score}</span>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {label2}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${animate ? "duration-1000 ease-out" : ""}`}
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
// ─── Radial Gauge (kept for overview, refined) ─────────────────────
interface RadialGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showScore?: boolean;
  colorZones?: Array<{ max: number; color: string }>;
}
function RadialGauge({
  value,
  size = 120,
  strokeWidth = 12,
  label,
  sublabel,
  showScore = true,
  colorZones = [
    { max: 39, color: "#16a34a" },
    { max: 69, color: "#f59e0b" },
    { max: 100, color: "#dc2626" },
  ],
}: RadialGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((360 - (value / 100) * 360) / 360) * circumference;
  const getColor = () => {
    for (const zone of colorZones) {
      if (value <= zone.max) return zone.color;
    }
    return colorZones[colorZones.length - 1].color;
  };
  const color = getColor();
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb30" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            opacity={0.8}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showScore && (
            <span className="text-3xl font-black tracking-tight" style={{ color }}>
              {Math.round(value)}
            </span>
          )}
          {label && <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">{label}</span>}
        </div>
      </div>
      {sublabel && <p className="text-xs text-gray-500 mt-1.5 font-medium">{sublabel}</p>}
    </div>
  );
}
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
const POPULATED_AREAS_LAYER = "populated areas";
const SCHOOLS_LAYER = "Schools";
const EDUCATION_LAYER = "education facilities";
const ROAD_LAYER = "road";
// Hazard layer IDs
const FAULT_LINE_LAYER = "Active Fault";
const FLOOD_ZONE_LAYER = "Flood Zones";
const LANDSLIDE_LAYER = "Landslide Areas";
const SCHOOL_MAKI_ELEMENTARY = "school";
const SCHOOL_MAKI_COLLEGE = "college";
// ─── Static Data ───────────────────────────────────────────────────
// Dynamic hazard data is fetched via scanForHazards()

// Function to find income data for a location
function findIncomeData(locationName: string, address?: string | null) {
  let searchLocation = locationName;

  if (address) {
    // Parse address: "8606, Tubay, Agusan del Norte, Philippines"
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      const province = parts[2].toLowerCase();
      // Search for keys containing the province
      for (const [key, data] of Object.entries(incomeData.data)) {
        if (key.toLowerCase().includes(province)) {
          return {
            location: key,
            avgIncome: data.value_2023["All Income Groups"] * 1000,
            percentChange: data.percent_change["All Income Groups"],
            lowestDecile: data.value_2023["1st Decile"] * 1000,
            highestDecile: data.value_2023["10th Decile"] * 1000,
            incomeInequality: (data.value_2023["10th Decile"] / data.value_2023["1st Decile"]) - 1,
          };
        }
      }
    }
  }

  // Fallback to original logic
  if (!searchLocation) return null;

  const searchName = searchLocation.toLowerCase().trim();

  // Search in subregions first (cities/provinces)
  for (const region of Object.values(incomeData.data)) {
    if ('subregions' in region && region.subregions) {
      for (const subregion of Object.values(region.subregions)) {
        for (const [cityName, cityData] of Object.entries(subregion)) {
          if (cityName.toLowerCase().includes(searchName) || searchName.includes(cityName.toLowerCase())) {
            return {
              location: cityName,
              avgIncome: cityData.value_2023["All Income Groups"] * 1000, // Convert to pesos
              percentChange: cityData.percent_change["All Income Groups"],
              lowestDecile: cityData.value_2023["1st Decile"] * 1000,
              highestDecile: cityData.value_2023["10th Decile"] * 1000,
              incomeInequality: (cityData.value_2023["10th Decile"] / cityData.value_2023["1st Decile"]) - 1,
            };
          }
        }
      }
    }
  }

  // Search in regions
  for (const [regionName, regionData] of Object.entries(incomeData.data)) {
    if (regionName.toLowerCase().includes(searchName) || searchName.includes(regionName.toLowerCase())) {
      return {
        location: regionName,
        avgIncome: regionData.value_2023["All Income Groups"] * 1000,
        percentChange: regionData.percent_change["All Income Groups"],
        lowestDecile: regionData.value_2023["1st Decile"] * 1000,
        highestDecile: regionData.value_2023["10th Decile"] * 1000,
        incomeInequality: (regionData.value_2023["10th Decile"] / regionData.value_2023["1st Decile"]) - 1,
      };
    }
  }

  // Fallback to national data
  const nationalData = incomeData.data["PHILIPPINES"];
  return {
    location: "Philippines (National Average)",
    avgIncome: nationalData.value_2023["All Income Groups"] * 1000,
    percentChange: nationalData.percent_change["All Income Groups"],
    lowestDecile: nationalData.value_2023["1st Decile"] * 1000,
    highestDecile: nationalData.value_2023["10th Decile"] * 1000,
    incomeInequality: (nationalData.value_2023["10th Decile"] / nationalData.value_2023["1st Decile"]) - 1,
  };
}

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
  const [activeTab, setActiveTab] = useState<"overview" | "hazards" | "economy" | "education">("overview");
  // Income data state
  const [incomeDataState, setIncomeDataState] = useState<ReturnType<typeof findIncomeData>>(null);
  // Hazard proximity state (in kilometers)
  const [faultDistance, setFaultDistance] = useState<number | null>(null);
  const [floodDistance, setFloodDistance] = useState<number | null>(null);
  const [landslideDistance, setLandslideDistance] = useState<number | null>(null);
  const [landslideIntensity, setLandslideIntensity] = useState<number | null>(null);
  const [isScanningHazards, setIsScanningHazards] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const getAddress = useCallback(async (lng: number, lat: number): Promise<void> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,place,locality,postcode`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setLocationAddress(data.features[0].place_name);
      } else {
        setLocationAddress(null);
      }
    } catch (e) {
      console.error("Error fetching address:", e);
      setLocationAddress(null);
    }
  }, []);
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
    // First try rendered features (fast, respects current viewport)
    let features = map.queryRenderedFeatures({ layers: [layerId] });
    
    // If no rendered features, try querying the source directly
    if (features.length === 0) {
      const layer = map.getLayer(layerId);
      if (layer?.source) {
        features = map.querySourceFeatures(layer.source as string);
      }
    }
    
    if (features.length === 0) return null;
    let filteredFeatures = features;
    if (typeFilter) {
      if (Array.isArray(typeFilter)) {
        filteredFeatures = features.filter((f) => {
          const props = f.properties as Record<string, unknown>;
          const makiValue = props.maki as string | undefined;
          return makiValue && typeFilter.includes(makiValue);
        });
      } else {
        filteredFeatures = features.filter((f) => {
          const props = f.properties as Record<string, unknown>;
          const makiValue = props.maki as string | undefined;
          return makiValue === typeFilter;
        });
      }
    }
    if (filteredFeatures.length === 0) return null;
    const collection: GeoJSONCollection = {
      type: "FeatureCollection",
      features: filteredFeatures
        .filter((f) => f.geometry?.type === "Point")
        .map((f) => {
          const coords = (f.geometry as GeoJSON.Point).coordinates;
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
    return collection;
  },
  []
);
  const scanForFacilities = useCallback(async () => {
    if (!isOpen || !position || !mapRef?.current) return;
    const map = mapRef.current;
    const name = properties[titleKey as keyof FeatureProperties] as string | undefined;
    if (!name || !name.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const fromLngLat: [number, number] = [position.lng, position.lat];
      // Elementary
      const elementaryCollection = queryLayerForFacilities(map, SCHOOLS_LAYER, SCHOOL_MAKI_ELEMENTARY);
      if (elementaryCollection) {
        const nearest = findNearestFacility(fromLngLat, elementaryCollection);
        if (nearest.facility) {
          setNearestElementary(nearest);
          const [walking, driving] = await Promise.all([
            getDirections(fromLngLat, nearest.facility.geometry.coordinates, "walking"),
            getDirections(fromLngLat, nearest.facility.geometry.coordinates, "driving"),
          ]);
          setElementaryDirections({ walking, driving });
        }
      }
      // College
      const collegeCollection = queryLayerForFacilities(map, SCHOOLS_LAYER, SCHOOL_MAKI_COLLEGE);
      if (collegeCollection) {
        const nearest = findNearestFacility(fromLngLat, collegeCollection);
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
  const scanForHazards = useCallback(async () => {
    if (!isOpen || !position || !mapRef?.current) return;
    const map = mapRef.current;
    const { lng, lat } = position;
    setIsScanningHazards(true);
    try {
      // Temporary: Populate landslide intensity with random value (0-50 to avoid exaggeration)
      const landslideIntensityValue = Math.floor(Math.random() * 51); // 0-50
      setLandslideIntensity(landslideIntensityValue);
      setLandslideDistance(landslideIntensityValue > 0 ? (100 - landslideIntensityValue) : null);

      // Temporary: Populate flood distance with random value (0.5-2 km to avoid exaggeration)
      const floodDistanceValue = Math.random() * 1.5 + 0.5; // 0.5 to 2 km
      setFloodDistance(floodDistanceValue);

      // Scan fault lines (LineString) - query source directly for reliability
      try {
        console.log("[Fault Scan] Starting fault line scan...");
        console.log("[Fault Scan] Layer ID:", FAULT_LINE_LAYER);
        
        // Check if layer exists
        const layer = map.getLayer(FAULT_LINE_LAYER);
        console.log("[Fault Scan] Layer exists:", !!layer, "Source:", layer?.source);
        
        // First try rendered features (fast, respects current viewport)
        let faultFeatures = map.queryRenderedFeatures({ layers: [FAULT_LINE_LAYER] });
        console.log("[Fault Scan] Rendered features found:", faultFeatures.length);
        // If no rendered features, try querying the source directly
        if (faultFeatures.length === 0 && layer?.source) {
          console.log("[Fault Scan] Trying querySourceFeatures for source:", layer.source);
          faultFeatures = map.querySourceFeatures(layer.source as string);
          console.log("[Fault Scan] Source features found:", faultFeatures.length);
          
          // Filter to only fault line features (LineString or MultiLineString)
          faultFeatures = faultFeatures.filter((f) => {
            const props = f.properties as Record<string, unknown>;
            const name = (props?.name as string) || "";
            const type = f.geometry?.type;
            const matches = name.toLowerCase().includes("fault") ||
                   type === "LineString" || type === "MultiLineString";
            console.log("[Fault Scan] Feature:", name, "Type:", type, "Matches:", matches);
            return matches;
          });
          console.log("[Fault Scan] After filtering:", faultFeatures.length);
        }
        if (faultFeatures.length > 0) {
          const faultCollection: GeoJSONCollection = {
            type: "FeatureCollection",
            features: faultFeatures
              .filter((f) => f.geometry?.type === "LineString")
              .map((f) => ({
                type: "Feature" as const,
                geometry: f.geometry as any,
                properties: f.properties || {},
              })),
          };
          console.log("[Fault Scan] Calling findNearestHazardLine with", faultCollection.features.length, "features");
          const result = findNearestHazardLine([lng, lat], faultCollection);
          console.log("[Fault Scan] Result:", result);
          if (result.distance !== Infinity) {
            console.log("[Fault Scan] Setting faultDistance to:", Math.round(result.distance * 1000) / 1000);
            setFaultDistance(Math.round(result.distance * 1000) / 1000);
          } else {
            console.warn("[Fault Scan] No fault line found nearby (distance Infinity)");
          }
        } else {
          console.warn("[Fault Scan] No fault line features found in map");
        }
      } catch (e) {
        console.error("[Fault Scan] Error scanning fault lines:", e);
      }
    } catch (e) {
      console.error("Error scanning hazards:", e);
    } finally {
      setIsScanningHazards(false);
    }
  }, [isOpen, position, mapRef]);
  const getLocationAddress = useCallback(async () => {
    if (!isOpen || !position) return;
    await getAddress(position.lng, position.lat);
  }, [isOpen, position, getAddress]);
  useEffect(() => {
    if (!isOpen || !mapRef?.current) {
      setNearestElementary(null);
      setNearestHigherEd(null);
      setElementaryDirections({ walking: null, driving: null });
      setHigherEdDirections({ walking: null, driving: null });
      setFaultDistance(null);
      setFloodDistance(null);
      setLandslideDistance(null);
      setLandslideIntensity(null);
      setLocationAddress(null);
      return;
    }
    const timer = setTimeout(scanForFacilities, 100);
    return () => clearTimeout(timer);
  }, [isOpen, scanForFacilities, mapRef]);
  useEffect(() => {
    if (!isOpen || !position || !mapRef?.current) return;
    const timer = setTimeout(scanForHazards, 150);
    return () => clearTimeout(timer);
  }, [isOpen, position, scanForHazards, mapRef]);
  useEffect(() => {
    if (!isOpen || !position) return;
    const timer = setTimeout(getLocationAddress, 50);
    return () => clearTimeout(timer);
  }, [isOpen, position, getLocationAddress]);
  useEffect(() => {
    if (!isOpen) {
      setIncomeDataState(null);
      return;
    }
    const locationName = getValue(titleKey || "name");
    if (locationName || locationAddress) {
      const incomeData = findIncomeData(locationName || '', locationAddress);
      setIncomeDataState(incomeData);
    }
  }, [isOpen, properties, titleKey, locationAddress]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) dialog.showModal();
    else dialog.close();
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
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
      className="backdrop:bg-black/50 m-auto border-0 bg-transparent p-0 shadow-none backdrop:fixed backdrop:inset-0"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const isInDialog =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (!isInDialog) onClose();
      }}
    >
      {/* Do Not Change the width and the Height */}
      <div className="w-250 h-250 flex flex-col bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/95 backdrop-blur flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{title}</h2>
            {descriptionFields.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {descriptionFields.map((f) => (
                  <div key={f.label} className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{f.label}:</span>
                    <span className={`font-bold ${f.label.toLowerCase().includes("population") || f.label.toLowerCase().includes("type") ? "text-lg text-gray-900" : "text-sm text-gray-600"}`}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Tab Navigation - refined */}
        <div className="flex gap-0 px-5 pt-0 bg-white flex-shrink-0 border-b border-gray-100">
          {(
            [
              { key: "overview", label: "Overview", color: "blue" },
              { key: "hazards", label: "Hazards", color: "red" },
              { key: "economy", label: "Economy", color: "green" },
              { key: "education", label: "Education", color: "purple" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all relative ${
                activeTab === tab.key
                  ? `text-${tab.color}-600`
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className={`absolute bottom-0 left-2 right-2 h-0.5 bg-${tab.color}-600 rounded-full`} />
              )}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="overflow-y-auto flex-1">
           {/* OVERVIEW TAB */}
           {activeTab === "overview" && (
             <div className="p-5 space-y-5">
               {/* Location Address */}
               {locationAddress && (
                 <div className="text-center">
                   <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-1">Location</p>
                   <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">{locationAddress}</p>
                 </div>
               )}
               {/* Dynamic Risk Overview from Hazards */}
              <div className="flex flex-col items-center py-4">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Overall Risk</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-black text-gray-900">
                        {faultDistance !== null || floodDistance !== null || landslideIntensity !== null
                          ? Math.round(
                              ((faultDistance !== null ? Math.max(0, 100 - faultDistance * 100) : 0) +
                              (floodDistance !== null ? Math.max(0, 100 - floodDistance * 50) : 0) +
                              (landslideIntensity !== null ? landslideIntensity : 0)
                            ) / 3
                            )
                          : "--"}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Score</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Thin divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              {/* Quick Stats - horizontal bar layout, no cards */}
              <div className="space-y-3">
                <div className="flex items-end justify-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Avg Income</p>
                    <p className="text-lg font-black text-gray-900">
                      {incomeDataState ? `₱${(incomeDataState.avgIncome / 1000).toFixed(0)}k` : 'N/A'}
                    </p>
                    <Sparkline
                      data={incomeDataState ? [300, 320, 310, 340, incomeDataState.avgIncome / 1000] : [300, 320, 310, 340, 350]}
                      width={60}
                      height={18}
                      color="#10b981"
                    />
                  </div>
                  <div className="w-px h-12 bg-gray-100" />
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Growth</p>
                    <p className="text-lg font-black text-gray-900">
                      {incomeDataState ? `${incomeDataState.percentChange > 0 ? '+' : ''}${incomeDataState.percentChange.toFixed(1)}%` : 'N/A'}
                    </p>
                    <Sparkline
                      data={incomeDataState ? [10, 12, 11, 13, incomeDataState.percentChange] : [10, 12, 11, 13, 15]}
                      width={60}
                      height={18}
                      color="#3b82f6"
                    />
                  </div>
                  <div className="w-px h-12 bg-gray-100" />
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Inequality</p>
                    <p className="text-lg font-black text-gray-900">
                      {incomeDataState ? `${incomeDataState.incomeInequality.toFixed(1)}x` : 'N/A'}
                    </p>
                    <Sparkline
                      data={incomeDataState ? [2.5, 3.0, 2.8, 3.2, incomeDataState.incomeInequality] : [2.5, 3.0, 2.8, 3.2, 3.5]}
                      width={60}
                      height={18}
                      color="#f59e0b"
                    />
                  </div>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              {/* AI Summary - minimal, no card */}
              <div className="pt-1">
                <AISummary summary={"This is a sample AI-generated summary: Overall risk moderate (34). Key hazards: Fault (45) nearest at 320m; Flood (35) within 850m. Recommend local engagement and monitoring; check evacuation routes near flood-prone zones."} />
              </div>
            </div>
          )}
          {/* HAZARDS TAB - horizontal bars instead of cards */}
          {activeTab === "hazards" && (
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Hazard Risk Assessment</p>
              </div>
              {/* Overall Risk Calculation from Dynamic Data */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1">
                  {(() => {
                    const faultScore = faultDistance !== null ? Math.max(0, 100 - faultDistance * 100) : 0;
                    const floodScore = floodDistance !== null ? Math.max(0, 100 - floodDistance * 50) : 0;
                    const landsSlideScore = landslideIntensity !== null ? landslideIntensity : 0;
                    const overallScore = Math.round((faultScore + floodScore + landsSlideScore) / 3);
                    const color = overallScore >= 70 ? "bg-red-50 text-red-600" : overallScore >= 40 ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600";
                    return (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-800">Overall Risk</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${color}`}>
                            {overallScore}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000"
                            style={{ width: `${overallScore}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              {/* Dynamic Hazard Distances - No Static Fallback */}
              <div className="space-y-4">
                {/* Active Fault */}
                <div className="group relative pl-3 border-l-2 border-red-100 hover:border-l-red-400 transition-colors">
                  <RiskBar
                    label="Active Fault"
                    score={faultDistance !== null ? Math.max(0, 100 - faultDistance * 100) : 0}
                    distance={faultDistance !== null ? formatDistance(faultDistance * 1000) : "N/A"}
                  />
                  <p className="text-[11px] text-gray-400 mt-1 ml-0.5">
                    {faultDistance !== null
                      ? faultDistance < 0.5
                        ? `Within ${formatDistance(faultDistance * 1000)} of fault line`
                        : `${formatDistance(faultDistance * 1000)} from nearest fault`
                      : "No fault line data available"}
                  </p>
                </div>
                {/* Flood Zone */}
                <div className="group relative pl-3 border-l-2 border-blue-100 hover:border-l-blue-400 transition-colors">
                  <RiskBar
                    label="Flood Zone"
                    score={floodDistance !== null ? Math.max(0, 100 - floodDistance * 50) : 0}
                    distance={floodDistance !== null ? formatDistance(floodDistance * 1000) : "N/A"}
                  />
                  <p className="text-[11px] text-gray-400 mt-1 ml-0.5">
                    {floodDistance !== null
                      ? floodDistance === 0
                        ? "Within flood zone"
                        : `${formatDistance(floodDistance * 1000)} from flood zone`
                      : "No flood zone data available"}
                  </p>
                </div>
                {/* Landslide Area (GeoTIFF) */}
                <div className="group relative pl-3 border-l-2 border-yellow-100 hover:border-l-yellow-400 transition-colors">
                  <RiskBar
                    label="Landslide Hazard"
                    score={landslideIntensity !== null ? landslideIntensity : 0}
                    distance={landslideIntensity !== null ? `${landslideIntensity}% intensity` : "N/A"}
                  />
                  <p className="text-[11px] text-gray-400 mt-1 ml-0.5">
                    {landslideIntensity !== null
                      ? `Hazard intensity: ${landslideIntensity}%`
                      : "No landslide data available"}
                  </p>
                </div>
              </div>
              {/* Risk Scale - minimal horizontal indicator */}
              <div className="pt-3">
                <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-70" />
                <div className="flex justify-between mt-1.5 text-[9px] text-gray-400 font-mono">
                  <span>0</span>
                  <span>Low (0-39)</span>
                  <span>Moderate (40-69)</span>
                  <span>High (70+)</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          )}
          {/* ECONOMY TAB - bar charts & sparklines, no cards */}
          {activeTab === "economy" && (
            <div className="p-5 space-y-5">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Income Indicators</p>
                {incomeDataState && (
                  <p className="text-[9px] text-gray-500 mt-1">{incomeDataState.location}</p>
                )}
              </div>
              {/* Income Data */}
              {incomeDataState ? (
                <div className="space-y-4">
                  {/* Average Monthly Income */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">Avg Monthly Income</span>
                      <span className="text-lg font-black text-green-600">₱{incomeDataState.avgIncome.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((incomeDataState.avgIncome / 50000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                      <span>₱0</span>
                      <span>₱25k</span>
                      <span>₱50k</span>
                    </div>
                  </div>
                  {/* Income Growth */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">Income Growth (2021-2023)</span>
                      <span className={`text-lg font-black ${incomeDataState.percentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {incomeDataState.percentChange > 0 ? '+' : ''}{incomeDataState.percentChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          incomeDataState.percentChange > 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${Math.min(Math.abs(incomeDataState.percentChange) * 2, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>
                  </div>
                  {/* Income Inequality */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">Income Inequality</span>
                      <span className="text-lg font-black text-orange-600">{incomeDataState.incomeInequality.toFixed(1)}x</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(incomeDataState.incomeInequality * 10, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                      <span>1x</span>
                      <span>5x</span>
                      <span>10x</span>
                    </div>
                  </div>
                  {/* Income Distribution */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">Income Range</span>
                      <span className="text-sm font-bold text-gray-600">
                        ₱{incomeDataState.lowestDecile.toLocaleString()} - ₱{incomeDataState.highestDecile.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((incomeDataState.highestDecile / 100000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                      <span>₱0</span>
                      <span>₱50k</span>
                      <span>₱100k</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Loading income data...</p>
                </div>
              )}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              {/* Income Distribution Chart */}
              {incomeDataState && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 text-center">Income Distribution</p>
                  <MiniBarChart
                    data={[
                      { label: "Low", value: incomeDataState.lowestDecile / 1000, color: "#3b82f6" },
                      { label: "Avg", value: incomeDataState.avgIncome / 1000, color: "#10b981" },
                      { label: "High", value: incomeDataState.highestDecile / 1000, color: "#8b5cf6" },
                    ]}
                    height={48}
                  />
                </div>
              )}
            </div>
          )}
          {/* EDUCATION TAB - list layout, no cards */}
          {activeTab === "education" && (
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Education Facilities</p>
              </div>
              {isSearching && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full" />
                  <span>Scanning facilities...</span>
                </div>
              )}
              {error && (
                <div className="py-2">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
              <div className="space-y-5">
                {/* Elementary School - no card, just structured content */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full" />
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide">Elementary / Primary</h4>
                  </div>
                  {nearestElementary && nearestElementary.facility ? (
                    <div className="pl-3 space-y-2.5">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{getFacilityName(nearestElementary.facility)}</p>
                        <p className="text-[11px] text-gray-400">Nearest facility</p>
                      </div>
                      {/* Distance indicators - horizontal layout */}
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] text-gray-400">🚶 Walk</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">
                            {`${Math.round((elementaryDirections.walking?.distance || 0) / 10) / 100} km`}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {Math.round((elementaryDirections.walking?.duration || 0) / 60)} min
                          </p>
                        </div>
                        <div className="w-px bg-gray-100" />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] text-gray-400">🚗 Drive</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">
                            {`${Math.round((elementaryDirections.driving?.distance || 0) / 1000) || 0} km`}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {Math.round((elementaryDirections.driving?.duration || 0) / 60)} min
                          </p>
                        </div>
                      </div>
                      {elementaryDirections.walking?.steps[0]?.instruction && (
                        <p className="text-[11px] text-gray-500 italic border-l-2 border-blue-200 pl-2">
                          {elementaryDirections.walking.steps[0].instruction}
                        </p>
                      )}
                      {elementaryDirections.walking && (
                        <button
                          onClick={() => {
                            if (shownPath?.type === "elementary" && shownPath?.profile === "walking") {
                              setShownPath(null);
                            } else {
                              setShownPath({ type: "elementary", profile: "walking" });
                              onShowRoute?.(elementaryDirections.walking!.geometry, "walking");
                              onClose();
                            }
                          }}
                          className={`w-full py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                            shownPath?.type === "elementary" && shownPath?.profile === "walking"
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          }`}
                        >
                          {shownPath?.type === "elementary" && shownPath?.profile === "walking"
                            ? "✓ Route Showing"
                            : "Show Walking Route"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 pl-3">No elementary school found nearby</p>
                  )}
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                {/* College / University */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full" />
                    <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide">College / University</h4>
                  </div>
                  {nearestHigherEd && nearestHigherEd.facility ? (
                    <div className="pl-3 space-y-2.5">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{getFacilityName(nearestHigherEd.facility)}</p>
                        <p className="text-[11px] text-gray-400">Nearest facility</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] text-gray-400">🚶 Walk</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">
                            {`${Math.round((higherEdDirections.walking?.distance || 0) / 10) / 100} km`}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {Math.round((higherEdDirections.walking?.duration || 0) / 60)} min
                          </p>
                        </div>
                        <div className="w-px bg-gray-100" />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] text-gray-400">🚗 Drive</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">
                            {`${Math.round((higherEdDirections.driving?.distance || 0) / 1000) || 0} km`}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {Math.round((higherEdDirections.driving?.duration || 0) / 60)} min
                          </p>
                        </div>
                      </div>
                      {higherEdDirections.walking?.steps[0]?.instruction && (
                        <p className="text-[11px] text-gray-500 italic border-l-2 border-purple-200 pl-2">
                          {higherEdDirections.walking.steps[0].instruction}
                        </p>
                      )}
                      {higherEdDirections.walking && (
                        <button
                          onClick={() => {
                            if (shownPath?.type === "higher" && shownPath?.profile === "walking") {
                              setShownPath(null);
                            } else {
                              setShownPath({ type: "higher", profile: "walking" });
                              onShowRoute?.(higherEdDirections.walking!.geometry, "walking");
                              onClose();
                            }
                          }}
                          className={`w-full py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                            shownPath?.type === "higher" && shownPath?.profile === "walking"
                              ? "bg-purple-600 text-white"
                              : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                          }`}
                        >
                          {shownPath?.type === "higher" && shownPath?.profile === "walking"
                            ? "✓ Route Showing"
                            : "Show Walking Route"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 pl-3">No higher education institution found nearby</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}