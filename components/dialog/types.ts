import type { GeoJSON } from "geojson";

// ─── Feature Properties ─────────────────────────────────────────────────
export type FeatureProperties = Record<string, unknown>;

// ─── Income Data ────────────────────────────────────────────────────────
export type IncomeData = {
  location: string;
  avgIncome: number;
  percentChange: number;
  lowestDecile: number;
  highestDecile: number;
  incomeInequality: number;
};

// ─── Hazard Data State ──────────────────────────────────────────────────
export type HazardDataState = {
  faultDistance: number | null;
  floodDistance: number | null;
  landslideDistance: number | null;
  landslideIntensity: number | null;
  volcanoCount: number;
  activeVolcanoes: Array<{ name: string; distanceKm: number; risk: number }>;
};

// ─── Facility Data State ────────────────────────────────────────────────
export type FacilityDataState = {
  nearestElementary: NearestFacilityResult | null;
  nearestHigherEd: NearestFacilityResult | null;
  elementaryDirections: RouteDirections;
  higherEdDirections: RouteDirections;
};

// Re-export from nearestFacility for convenience
export type { NearestFacilityResult, RouteDirections } from "@/lib/nearestFacility";

// ─── Dialog Tabs ─────────────────────────────────────────────────────────
export type DialogTab = "overview" | "hazards" | "economy" | "education";

// ─── Tab Props ───────────────────────────────────────────────────────────
export interface OverviewTabProps {
  locationAddress: string | null;
  riskScore: number;
  hazardData: HazardDataState;
  incomeData: IncomeData | null;
  aiSummary: string;
}

export interface HazardsTabProps {
  hazardData: HazardDataState;
}

export interface EconomyTabProps {
  incomeData: IncomeData | null;
}

export interface EducationTabProps {
  elementary: NearestFacilityResult | null;
  higherEd: NearestFacilityResult | null;
  elementaryDirections: RouteDirections;
  higherEdDirections: RouteDirections;
  onShowRoute: (geometry: GeoJSON.LineString, profile: "walking" | "driving") => void;
}

// ─── Main Dialog Props ───────────────────────────────────────────────────
export interface FeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  properties: FeatureProperties;
  titleKey?: string;
  descriptionKeys?: string[];
  position?: { lng: number; lat: number };
  mapRef?: React.RefObject<mapboxgl.Map | null>;
  onShowRoute?: (geometry: GeoJSON.LineString, profile: "walking" | "driving") => void;
}
