"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FiSearch, FiUser, FiX } from "react-icons/fi";

import mapboxgl from "mapbox-gl";

import AGEISMap from "./ageis-map";
import FiltersPanel from "./filters-panel";
import type { HouseholdFilters } from "./filters-panel";
import Sidebar from "./sidebar";
import FeatureDialog from "./FeatureDialog";
import type { FeatureProperties } from "./FeatureDialog";
import MapLayersPanel from "./map-layers-panel";
import PlaceDetailsPanel from "./place-details-panel";
import type { PlaceDetails } from "./place-details-panel";

import type { StyleLayer } from "@/lib/mapConstants";
import { geojsonApiPath } from "@/lib/datasets";
import { fetchGeoJsonFeatureCollection } from "@/lib/geojson-client";
import {
  normalizePlaceText,
  derivePlacesFromFeatures,
  getPlaceTarget,
  getSelectionKey,
  type PlaceSelection,
} from "@/lib/places";
import {
  buildPlaceSelectionQuery,
  type PlaceHierarchyData,
} from "@/lib/ph-admin";
import type { MarkerData } from "@/types/locations";

type ThemeMode = "dark" | "light";

type MapStyleOption = {
  id: string;
  label: string;
  styleUrl: string;
  preview: string;
};

type MapViewport = {
  center: [number, number];
  bounds: { west: number; south: number; east: number; north: number };
  zoom: number;
};

type SearchSuggestion = {
  id: string;
  kind: "local-city" | "local-barangay" | "mapbox";
  title: string;
  subtitle: string;
  lng: number;
  lat: number;
  zoom?: number;
  bbox?: [number, number, number, number];
};

type MapboxGeocodeFeature = {
  id: string;
  text: string;
  placeName: string;
  center: [number, number];
  placeType: string;
  bbox?: [number, number, number, number];
  contextTexts: string[];
};

type PlaceZoomSequenceRequest = {
  key: string;
  targets: MarkerData[];
};

type AGEISAppProps = {
  initialPlaceHierarchy: PlaceHierarchyData;
};

const MAP_STYLES: MapStyleOption[] = [
  {
    id: "ageis",
    label: "AGEIS",
    styleUrl: "mapbox://styles/boonjefferson/cmo5moe2k000n01rcahy17o82",
    preview: "linear-gradient(135deg,#16a34a 0%,#14532d 100%)",
  },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalizeSearchText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function searchTokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function scoreSearchText(query: string, title: string, subtitle: string): number {
  const q = query.toLowerCase();
  const t = title.toLowerCase();
  const s = subtitle.toLowerCase();
  let score = 0;

  if (t === q) score += 180;
  if (t.startsWith(q)) score += 120;
  if (t.includes(q)) score += 80;
  if (s.includes(q)) score += 35;

  const qTokens = searchTokenize(q);
  const haystack = `${t} ${s}`;
  for (const token of qTokens) {
    if (haystack.includes(token)) score += 20;
  }

  return score;
}

function shouldAutoNavigateToPlace(selection: PlaceSelection): boolean {
  return Boolean(
    selection.region ||
      selection.province ||
      selection.municipality ||
      selection.barangay
  );
}

function buildPlaceSelectionSteps(selection: PlaceSelection): PlaceSelection[] {
  const steps: PlaceSelection[] = [];

  if (selection.region) {
    steps.push({
      region: selection.region,
      province: null,
      municipality: null,
      barangay: null,
    });
  }

  if (selection.region && selection.province) {
    steps.push({
      region: selection.region,
      province: selection.province,
      municipality: null,
      barangay: null,
    });
  }

  if (selection.region && selection.province && selection.municipality) {
    steps.push({
      region: selection.region,
      province: selection.province,
      municipality: selection.municipality,
      barangay: null,
    });
  }

  if (
    selection.region &&
    selection.province &&
    selection.municipality &&
    selection.barangay
  ) {
    steps.push(selection);
  }

  return steps;
}

function dedupeMarkerTargets(targets: MarkerData[]): MarkerData[] {
  const deduped: MarkerData[] = [];
  let previousKey = "";

  for (const target of targets) {
    const key = target.bbox
      ? target.bbox.join(",")
      : `${target.lng.toFixed(6)},${target.lat.toFixed(6)}:${target.zoom ?? 0}`;
    if (key === previousKey) continue;
    previousKey = key;
    deduped.push(target);
  }

  return deduped;
}

function splitPlaceParts(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function selectionParts(selection: PlaceSelection): string[] {
  return [
    selection.barangay,
    selection.municipality,
    selection.province,
    selection.region,
  ].filter((value): value is string => Boolean(value && value.trim().length > 0));
}

function featureMatchesSelection(
  selection: PlaceSelection,
  feature: MapboxGeocodeFeature
): boolean {
  const targetLabel =
    selection.barangay ??
    selection.municipality ??
    selection.province ??
    selection.region;
  const normalizedTargetLabel = normalizePlaceText(targetLabel);
  const normalizedPrimaryParts = new Set(
    [feature.text, ...splitPlaceParts(feature.placeName)]
      .map((part) => normalizePlaceText(part))
      .filter((part) => part.length > 0)
  );
  const normalizedFeatureParts = new Set(
    [feature.text, feature.placeName, ...feature.contextTexts]
      .flatMap(splitPlaceParts)
      .map((part) => normalizePlaceText(part))
      .filter((part) => part.length > 0)
  );

  if (normalizedTargetLabel.length === 0 || !normalizedPrimaryParts.has(normalizedTargetLabel)) {
    return false;
  }

  return selectionParts(selection).every((part) =>
    normalizedFeatureParts.has(normalizePlaceText(part))
  );
}

type MapSearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  isFocused: boolean;
  onFocusChange: (focused: boolean) => void;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  isDark: boolean;
};

function MapSearchBar({
  query,
  onQueryChange,
  isFocused,
  onFocusChange,
  suggestions,
  isLoading,
  onSuggestionSelect,
  isDark,
}: MapSearchBarProps) {
  const normalizedQuery = query.trim();

  const inputClass = cx(
    "h-10 w-full rounded-full border px-10 text-sm outline-none transition",
    isDark
      ? "border-white/10 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:border-white/20"
      : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-300"
  );

  const suggestionContainerClass = cx(
    "absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-xl",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const suggestionRowClass = cx(
    "w-full border-b px-3 py-3 text-left transition last:border-b-0",
    isDark ? "border-white/5 hover:bg-white/5" : "border-neutral-100 hover:bg-black/5"
  );

  return (
    <div className="relative min-w-0 flex-1">
      <FiSearch
        className={cx(
          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
          isDark ? "text-neutral-500" : "text-neutral-500"
        )}
        aria-hidden="true"
      />
      <input
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          if (!isFocused) onFocusChange(true);
        }}
        onFocus={() => onFocusChange(true)}
        onBlur={() =>
          setTimeout(() => {
            onFocusChange(false);
          }, 150)
        }
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          if (suggestions.length === 0) return;
          e.preventDefault();
          onSuggestionSelect(suggestions[0]);
        }}
        placeholder="Search the map"
        className={inputClass}
        aria-label="Search"
      />
      {query.length > 0 && (
        <button
          type="button"
          className={cx(
            "absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full",
            isDark ? "text-neutral-300 hover:bg-white/10" : "text-neutral-600 hover:bg-black/5"
          )}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onQueryChange("")}
          aria-label="Clear search"
        >
          <FiX className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {isFocused && normalizedQuery.length > 0 && (
        <div className={suggestionContainerClass}>
          {suggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className={suggestionRowClass}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSuggestionSelect(suggestion)}
            >
              <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                {suggestion.title}
              </div>
              <div className={cx("text-xs", isDark ? "text-neutral-400" : "text-neutral-600")}>
                {suggestion.subtitle}
              </div>
            </button>
          ))}

          <div className={cx("px-3 py-2 text-xs", isDark ? "text-neutral-400" : "text-neutral-500")}>
            {isLoading
              ? "Searching..."
              : normalizedQuery.length < 2
                ? "Type at least 2 characters"
                : suggestions.length === 0
                  ? "No results"
                  : `${suggestions.length} result${suggestions.length === 1 ? "" : "s"}`}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AGEISApp({ initialPlaceHierarchy }: AGEISAppProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [mapStyleId, setMapStyleId] = useState<MapStyleOption["id"]>("ageis");

  const [styleLayers, setStyleLayers] = useState<StyleLayer[]>([]);
  const [activeStyleLayerIds, setActiveStyleLayerIds] = useState<Set<string>>(() => new Set());
  const [selectedPlace, setSelectedPlace] = useState<PlaceSelection>({ region: null, province: null, municipality: null, barangay: null });
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const [mapLayersCollapsed, setMapLayersCollapsed] = useState(true);
  const [placeDetailsCollapsed, setPlaceDetailsCollapsed] = useState(false);
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [placeHierarchy] = useState<PlaceHierarchyData>(initialPlaceHierarchy);
  const [datasetFeatures, setDatasetFeatures] = useState<
    Array<GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>>
  >([]);
  const [datasetLoading, setDatasetLoading] = useState(true);
  const [datasetError, setDatasetError] = useState<string | null>(null);

  const [householdFilters, setHouseholdFilters] = useState<HouseholdFilters>({
    timeFrameStartYear: "",
    timeFrameEndYear: "",
    barangay: "",
    minMonthlyIncome: "",
    maxMonthlyIncome: "",
    riskLevel: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MarkerData | null>(null);
  const [placeZoomSequence, setPlaceZoomSequence] = useState<PlaceZoomSequenceRequest | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProperties, setDialogProperties] = useState<FeatureProperties>({});
  const [dialogPosition, setDialogPosition] = useState({ lng: 0, lat: 0 });
  const [routeGeometry, setRouteGeometry] = useState<{ geometry: GeoJSON.LineString; profile: "walking" | "driving" } | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);
  const placeResolveAbortRef = useRef<AbortController | null>(null);
  const placeResolveRequestIdRef = useRef(0);
  const placeTargetCacheRef = useRef<Map<string, MarkerData | null>>(new Map());
  const mapViewportRef = useRef<MapViewport | null>(null);

  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) clearTimeout(searchDebounceTimerRef.current);
      searchAbortRef.current?.abort();
      placeResolveAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetchGeoJsonFeatureCollection(geojsonApiPath("val-31-ver2"))
      .then((featureCollection) => {
        if (cancelled) return;
        const features = featureCollection.features ?? [];
        setDatasetFeatures(features);

        const years = Array.from(
          new Set(
            features
              .map((feature) => {
                const props = (feature.properties ?? {}) as Record<string, unknown>;
                const value = props.date_recorded;
                if (typeof value !== "string") return "";
                const year = value.slice(0, 4);
                return /^\d{4}$/.test(year) ? year : "";
              })
              .filter((value) => value.length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));

        setYearOptions(years);
      })
      .catch(() => {
        if (cancelled) return;
        setDatasetError("Unable to load dataset for place details.");
      })
      .finally(() => {
        if (cancelled) return;
        setDatasetLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !routeGeometry) return;
    const map = mapRef.current;
    const sourceId = "route-path-source";
    const layerId = "route-path-layer";

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: routeGeometry.geometry,
      });
    } else {
      map.addSource(sourceId, { type: "geojson", data: { type: "Feature", properties: {}, geometry: routeGeometry.geometry } });
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { 
          "line-color": "#16a34a", 
          "line-width": 2, 
          "line-opacity": 0.5,
          "line-emissive-strength": 4,
        },
      });
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [routeGeometry]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const isAgeisStyle = mapStyleId === "ageis";

  const fetchMapboxSuggestions = useCallback(async (
    query: string,
    signal: AbortSignal,
    viewport: MapViewport | null
  ): Promise<SearchSuggestion[]> => {
    if (!mapboxToken) return [];

    const params = new URLSearchParams({
      access_token: mapboxToken,
      autocomplete: "true",
      limit: "6",
      types: "poi,address,neighborhood,locality,place",
      country: "PH",
      language: "en",
    });

    if (viewport) {
      params.set("proximity", `${viewport.center[0]},${viewport.center[1]}`);
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
    const response = await fetch(url, { signal });
    if (!response.ok) return [];

    const data = (await response.json()) as unknown;
    if (!data || typeof data !== "object") return [];

    const fc = data as { features?: unknown };
    if (!Array.isArray(fc.features)) return [];

    const zoomByType: Record<string, number> = {
      address: 16,
      poi: 15,
      neighborhood: 14,
      locality: 13,
      place: 12,
      region: 8,
      country: 5,
    };

    const results: SearchSuggestion[] = [];

    for (const raw of fc.features as Array<Record<string, unknown>>) {
      const id = typeof raw.id === "string" ? raw.id : null;
      const text = typeof raw.text === "string" ? raw.text : null;
      const placeName = typeof raw.place_name === "string" ? raw.place_name : null;
      const centerRaw = raw.center;
      const center =
        Array.isArray(centerRaw) && centerRaw.length >= 2
          ? [Number(centerRaw[0]), Number(centerRaw[1])]
          : null;
      if (!id || !text || !placeName || !center) continue;
      if (!Number.isFinite(center[0]) || !Number.isFinite(center[1])) continue;

      const placeTypeRaw = raw.place_type;
      const placeType =
        Array.isArray(placeTypeRaw) && typeof placeTypeRaw[0] === "string" ? placeTypeRaw[0] : "";

      const bboxRaw = raw.bbox;
      const bbox =
        Array.isArray(bboxRaw) && bboxRaw.length === 4
          ? [Number(bboxRaw[0]), Number(bboxRaw[1]), Number(bboxRaw[2]), Number(bboxRaw[3])]
          : null;

      results.push({
        id,
        kind: "mapbox",
        title: text,
        subtitle: placeName,
        lng: center[0],
        lat: center[1],
        zoom: zoomByType[placeType] ?? 12,
        bbox:
          bbox && bbox.every((n) => Number.isFinite(n))
            ? (bbox as [number, number, number, number])
            : undefined,
      });
    }

    return results;
  }, [mapboxToken]);

  const fetchMapboxGeocodeFeatures = useCallback(async (
    query: string,
    signal: AbortSignal,
    viewport: MapViewport | null
  ): Promise<MapboxGeocodeFeature[]> => {
    if (!mapboxToken) return [];

    const params = new URLSearchParams({
      access_token: mapboxToken,
      autocomplete: "false",
      limit: "10",
      types: "neighborhood,locality,place,district,region",
      country: "PH",
      language: "en",
    });

    if (viewport) {
      params.set("proximity", `${viewport.center[0]},${viewport.center[1]}`);
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
    const response = await fetch(url, { signal });
    if (!response.ok) return [];

    const data = (await response.json()) as unknown;
    if (!data || typeof data !== "object") return [];

    const fc = data as { features?: unknown };
    if (!Array.isArray(fc.features)) return [];

    const results: MapboxGeocodeFeature[] = [];
    for (const raw of fc.features as Array<Record<string, unknown>>) {
      const id = typeof raw.id === "string" ? raw.id : null;
      const text = typeof raw.text === "string" ? raw.text : null;
      const placeName = typeof raw.place_name === "string" ? raw.place_name : null;
      const centerRaw = raw.center;
      const center =
        Array.isArray(centerRaw) && centerRaw.length >= 2
          ? [Number(centerRaw[0]), Number(centerRaw[1])]
          : null;
      if (!id || !text || !placeName || !center) continue;
      if (!Number.isFinite(center[0]) || !Number.isFinite(center[1])) continue;

      const placeTypeRaw = raw.place_type;
      const placeType =
        Array.isArray(placeTypeRaw) && typeof placeTypeRaw[0] === "string" ? placeTypeRaw[0] : "";

      const bboxRaw = raw.bbox;
      const bbox =
        Array.isArray(bboxRaw) && bboxRaw.length === 4
          ? [Number(bboxRaw[0]), Number(bboxRaw[1]), Number(bboxRaw[2]), Number(bboxRaw[3])]
          : null;

      const contextRaw = raw.context;
      const contextTexts = Array.isArray(contextRaw)
        ? contextRaw
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null;
              const value = (entry as { text?: unknown }).text;
              return typeof value === "string" ? value : null;
            })
            .filter((value): value is string => Boolean(value))
        : [];

      results.push({
        id,
        text,
        placeName,
        center: center as [number, number],
        placeType,
        bbox:
          bbox && bbox.every((n) => Number.isFinite(n))
            ? (bbox as [number, number, number, number])
            : undefined,
        contextTexts,
      });
    }

    return results;
  }, [mapboxToken]);

  const localSearchSuggestions = useMemo(() => {
    type LocalAccumulator = {
      count: number;
      sumLng: number;
      sumLat: number;
      west: number;
      south: number;
      east: number;
      north: number;
      title: string;
      subtitle: string;
      kind: SearchSuggestion["kind"];
    };

    const barangays = new Map<string, LocalAccumulator>();
    const cities = new Map<string, LocalAccumulator>();

    for (const feature of datasetFeatures) {
      if (feature.geometry.type !== "Point") continue;
      const coords = feature.geometry.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;

      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

      const props = (feature.properties ?? {}) as Record<string, unknown>;
      const barangay = typeof props.barangay === "string" ? props.barangay.trim() : "";
      const city = typeof props.city === "string" ? props.city.trim() : "";
      const province = typeof props.province === "string" ? props.province.trim() : "";
      const region = typeof props.region === "string" ? props.region.trim() : "";

      if (barangay.length > 0) {
        const key = `${barangay}|${city}|${province}|${region}`.toLowerCase();
        const existing = barangays.get(key);
        if (existing) {
          existing.count += 1;
          existing.sumLng += lng;
          existing.sumLat += lat;
          existing.west = Math.min(existing.west, lng);
          existing.south = Math.min(existing.south, lat);
          existing.east = Math.max(existing.east, lng);
          existing.north = Math.max(existing.north, lat);
        } else {
          barangays.set(key, {
            count: 1,
            sumLng: lng,
            sumLat: lat,
            west: lng,
            south: lat,
            east: lng,
            north: lat,
            title: barangay,
            subtitle: [city, province, region].filter(Boolean).join(", "),
            kind: "local-barangay",
          });
        }
      }

      if (city.length > 0) {
        const key = `${city}|${province}|${region}`.toLowerCase();
        const existing = cities.get(key);
        if (existing) {
          existing.count += 1;
          existing.sumLng += lng;
          existing.sumLat += lat;
          existing.west = Math.min(existing.west, lng);
          existing.south = Math.min(existing.south, lat);
          existing.east = Math.max(existing.east, lng);
          existing.north = Math.max(existing.north, lat);
        } else {
          cities.set(key, {
            count: 1,
            sumLng: lng,
            sumLat: lat,
            west: lng,
            south: lat,
            east: lng,
            north: lat,
            title: city,
            subtitle: [province, region].filter(Boolean).join(", "),
            kind: "local-city",
          });
        }
      }
    }

    const toSuggestion = (key: string, acc: LocalAccumulator): SearchSuggestion => ({
      id: `local:${key}`,
      kind: acc.kind,
      title: acc.title,
      subtitle: acc.subtitle,
      lng: acc.sumLng / acc.count,
      lat: acc.sumLat / acc.count,
      zoom: acc.kind === "local-barangay" ? 14 : 12,
      bbox: [acc.west, acc.south, acc.east, acc.north],
    });

    return [
      ...Array.from(barangays.entries()).map(([key, acc]) => toSuggestion(key, acc)),
      ...Array.from(cities.entries()).map(([key, acc]) => toSuggestion(key, acc)),
    ];
  }, [datasetFeatures]);

  const getLocalSearchResults = useCallback(
    (rawQuery: string): SearchSuggestion[] => {
      const query = rawQuery.trim().toLowerCase();
      if (query.length === 0) return [];

      return localSearchSuggestions
        .map((suggestion) => ({
          suggestion,
          score: scoreSearchText(query, suggestion.title, suggestion.subtitle),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.suggestion.title.localeCompare(b.suggestion.title))
        .slice(0, 8)
        .map((item) => item.suggestion);
    },
    [localSearchSuggestions]
  );

  const clearSearchWork = () => {
    searchRequestIdRef.current += 1;
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
      searchDebounceTimerRef.current = null;
    }
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    setSearchIsLoading(false);
  };

  const scheduleSearch = (rawQuery: string) => {
    clearSearchWork();

    const query = rawQuery.trim();
    if (query.length === 0) {
      setSearchSuggestions([]);
      return;
    }

    const localResults = getLocalSearchResults(query);
    setSearchSuggestions(localResults);

    if (query.length < 2 || !mapboxToken) return;

    const requestId = searchRequestIdRef.current;

    searchDebounceTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setSearchIsLoading(true);

      void fetchMapboxSuggestions(query, controller.signal, mapViewportRef.current)
        .then((mapboxResults) => {
          if (searchRequestIdRef.current !== requestId) return;
          const seen = new Set<string>();
          const merged = [...localResults, ...mapboxResults].filter((item) => {
            const key = `${normalizeSearchText(item.title)}|${Math.round(item.lng * 10000)}|${Math.round(item.lat * 10000)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setSearchSuggestions(merged.slice(0, 10));
        })
        .catch((err: unknown) => {
          if (searchRequestIdRef.current !== requestId) return;
          if (err && typeof err === "object" && "name" in err && (err as { name?: unknown }).name === "AbortError") {
            return;
          }
          setSearchSuggestions(localResults);
        })
        .finally(() => {
          if (searchRequestIdRef.current !== requestId) return;
          setSearchIsLoading(false);
        });
    }, 250);
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    clearSearchWork();
    setSearchSuggestions([]);
    setPlaceZoomSequence(null);
    if (suggestion.kind === "local-barangay" || suggestion.kind === "local-city") {
      const parts = suggestion.subtitle.split(",").map((part) => part.trim());
      if (suggestion.kind === "local-barangay") {
        const municipality = parts[0] ?? "";
        const province = parts[1] ?? "";
        const region = parts[2] ?? "";
        setSelectedPlace({
          region: region || null,
          province: province || null,
          municipality: municipality || null,
          barangay: suggestion.title,
        });
      } else {
        const province = parts[0] ?? "";
        const region = parts[1] ?? "";
        setSelectedPlace({
          region: region || null,
          province: province || null,
          municipality: suggestion.title,
          barangay: null,
        });
      }
    } else {
      // Do not keep a stale place-selection target that can override subsequent searches.
      setSelectedPlace({ region: null, province: null, municipality: null, barangay: null });
    }
    setSelectedLocation({
      lng: suggestion.lng,
      lat: suggestion.lat,
      title: suggestion.title,
      description: suggestion.subtitle,
      zoom: suggestion.zoom,
      bbox: suggestion.bbox,
    });
    setSearchQuery(suggestion.title);
    setIsSearchFocused(false);
  };

  const mapStyleUrl = useMemo(() => {
    return MAP_STYLES.find((s) => s.id === mapStyleId)?.styleUrl ?? MAP_STYLES[0].styleUrl;
  }, [mapStyleId]);

  const derivedPlaces = useMemo(
    () => derivePlacesFromFeatures(datasetFeatures),
    [datasetFeatures]
  );
  const resolvePlaceTarget = useCallback(async (
    place: PlaceSelection,
    signal: AbortSignal
  ): Promise<MarkerData | null> => {
    const cacheKey = getSelectionKey(place);
    if (placeTargetCacheRef.current.has(cacheKey)) {
      return placeTargetCacheRef.current.get(cacheKey) ?? null;
    }

    const localTarget = getPlaceTarget(derivedPlaces, place);
    if (localTarget) {
      placeTargetCacheRef.current.set(cacheKey, localTarget);
      return localTarget;
    }

    const query = buildPlaceSelectionQuery(place);
    if (!query || !mapboxToken) {
      placeTargetCacheRef.current.set(cacheKey, null);
      return null;
    }

    const features = await fetchMapboxGeocodeFeatures(
      query,
      signal,
      mapViewportRef.current
    );

    const match =
      features.find((feature) => featureMatchesSelection(place, feature)) ??
      features[0];
    if (!match) {
      placeTargetCacheRef.current.set(cacheKey, null);
      return null;
    }

    const zoom = place.barangay
      ? 14
      : place.municipality
        ? 12
        : place.province
          ? 10
          : 8;

    const target = {
      lng: match.center[0],
      lat: match.center[1],
      title: match.text,
      description: match.placeName,
      zoom,
      bbox: match.bbox,
    };
    placeTargetCacheRef.current.set(cacheKey, target);
    return target;
  }, [derivedPlaces, fetchMapboxGeocodeFeatures, mapboxToken]);

  const availablePlaceHierarchy = placeHierarchy;
  const effectiveSelectedPlace = useMemo<PlaceSelection>(() => {
    const nextRegion =
      selectedPlace.region && availablePlaceHierarchy.regions.includes(selectedPlace.region)
        ? selectedPlace.region
        : null;

    const nextProvince =
      nextRegion &&
      selectedPlace.province &&
      (availablePlaceHierarchy.provincesByRegion[nextRegion] ?? []).includes(selectedPlace.province)
        ? selectedPlace.province
        : null;

    const municipalityKey = getSelectionKey({
      region: nextRegion,
      province: nextProvince,
      municipality: null,
      barangay: null,
    });
    const nextMunicipality =
      nextRegion &&
      nextProvince &&
      selectedPlace.municipality &&
      (availablePlaceHierarchy.municipalitiesByRegionProvince[municipalityKey] ?? []).includes(
        selectedPlace.municipality
      )
        ? selectedPlace.municipality
        : null;

    const barangayKey = getSelectionKey({
      region: nextRegion,
      province: nextProvince,
      municipality: nextMunicipality,
      barangay: null,
    });
    const nextBarangay =
      nextRegion &&
      nextProvince &&
      nextMunicipality &&
      selectedPlace.barangay &&
      (availablePlaceHierarchy.barangaysByRegionProvinceMunicipality[barangayKey] ?? []).includes(
        selectedPlace.barangay
      )
        ? selectedPlace.barangay
        : null;

    return {
      region: nextRegion,
      province: nextProvince,
      municipality: nextMunicipality,
      barangay: nextBarangay,
    };
  }, [availablePlaceHierarchy, selectedPlace]);

  const provinces = useMemo(() => {
    if (!effectiveSelectedPlace.region) return [];
    return availablePlaceHierarchy.provincesByRegion[effectiveSelectedPlace.region] ?? [];
  }, [availablePlaceHierarchy, effectiveSelectedPlace.region]);

  const municipalities = useMemo(() => {
    if (!effectiveSelectedPlace.region || !effectiveSelectedPlace.province) return [];
    return (
      availablePlaceHierarchy.municipalitiesByRegionProvince[
        getSelectionKey({
          region: effectiveSelectedPlace.region,
          province: effectiveSelectedPlace.province,
          municipality: null,
          barangay: null,
        })
      ] ?? []
    );
  }, [availablePlaceHierarchy, effectiveSelectedPlace.province, effectiveSelectedPlace.region]);

  const barangays = useMemo(() => {
    if (
      !effectiveSelectedPlace.region ||
      !effectiveSelectedPlace.province ||
      !effectiveSelectedPlace.municipality
    ) {
      return [];
    }

    return (
      availablePlaceHierarchy.barangaysByRegionProvinceMunicipality[
        getSelectionKey({
          region: effectiveSelectedPlace.region,
          province: effectiveSelectedPlace.province,
          municipality: effectiveSelectedPlace.municipality,
          barangay: null,
        })
      ] ?? []
    );
  }, [
    availablePlaceHierarchy,
    effectiveSelectedPlace.municipality,
    effectiveSelectedPlace.province,
    effectiveSelectedPlace.region,
  ]);

  const handlePlaceChange = useCallback(
    (place: PlaceSelection) => {
      setSelectedPlace(place);
      placeResolveRequestIdRef.current += 1;
      placeResolveAbortRef.current?.abort();
      placeResolveAbortRef.current = null;

      if (!shouldAutoNavigateToPlace(place)) {
        setPlaceZoomSequence(null);
        setSelectedLocation(null);
        return;
      }

      const selectionSteps = buildPlaceSelectionSteps(place);
      const localTargetsByStep = selectionSteps.map((step) => getPlaceTarget(derivedPlaces, step));
      const localSequence = dedupeMarkerTargets(
        localTargetsByStep.filter((target): target is MarkerData => Boolean(target))
      );
      if (localSequence.length > 0) {
        setPlaceZoomSequence({
          key: `${getSelectionKey(place)}:${placeResolveRequestIdRef.current}:local`,
          targets: localSequence,
        });
      } else {
        setPlaceZoomSequence(null);
      }

      setSelectedLocation(null);

      const requestId = placeResolveRequestIdRef.current;
      const controller = new AbortController();
      placeResolveAbortRef.current = controller;

      if (localTargetsByStep.every((target) => Boolean(target))) {
        return;
      }

      void (async () => {
        const resolvedByStep = await Promise.all(
          selectionSteps.map((step, index) =>
            localTargetsByStep[index]
              ? Promise.resolve(localTargetsByStep[index] as MarkerData)
              : resolvePlaceTarget(step, controller.signal)
          )
        );

        if (placeResolveRequestIdRef.current !== requestId) return;

        const resolvedSequence = dedupeMarkerTargets(
          resolvedByStep.filter((target): target is MarkerData => Boolean(target))
        );
        if (resolvedSequence.length > 0) {
          setPlaceZoomSequence({
            key: `${getSelectionKey(place)}:${requestId}:resolved`,
            targets: resolvedSequence,
          });
        }
      })()
        .catch((err: unknown) => {
          if (
            err &&
            typeof err === "object" &&
            "name" in err &&
            (err as { name?: unknown }).name === "AbortError"
          ) {
            return;
          }
          if (placeResolveRequestIdRef.current !== requestId) return;
        });
    },
    [derivedPlaces, resolvePlaceTarget]
  );

  const hasPlaceSelection = useMemo(
    () =>
      Boolean(
        effectiveSelectedPlace.region ||
          effectiveSelectedPlace.province ||
          effectiveSelectedPlace.municipality ||
          effectiveSelectedPlace.barangay
      ),
    [effectiveSelectedPlace]
  );

  const placeDetails = useMemo<PlaceDetails | null>(() => {
    if (!hasPlaceSelection) return null;

    const selectedRegion = normalizePlaceText(effectiveSelectedPlace.region);
    const selectedProvince = normalizePlaceText(effectiveSelectedPlace.province);
    const selectedCity = normalizePlaceText(effectiveSelectedPlace.municipality);
    const selectedBarangay = normalizePlaceText(effectiveSelectedPlace.barangay);

    const selectedRegionAliases = new Set(
      [selectedRegion, selectedRegion === "region x" ? "northern mindanao" : ""].filter((v) => v.length > 0)
    );

    const filtered = datasetFeatures.filter((feature) => {
      const props = (feature.properties ?? {}) as Record<string, unknown>;
      const region = normalizePlaceText(typeof props.region === "string" ? props.region : "");
      const province = normalizePlaceText(typeof props.province === "string" ? props.province : "");
      const city = normalizePlaceText(typeof props.city === "string" ? props.city : "");
      const barangay = normalizePlaceText(typeof props.barangay === "string" ? props.barangay : "");

      if (selectedRegion && !selectedRegionAliases.has(region)) return false;
      if (selectedProvince && selectedProvince !== province) return false;
      if (selectedCity && selectedCity !== city) return false;
      if (selectedBarangay && selectedBarangay !== barangay) return false;

      return true;
    });

    if (filtered.length === 0) return null;

    const numericValues = (key: string) =>
      filtered
        .map((feature) => {
          const props = (feature.properties ?? {}) as Record<string, unknown>;
          const value = props[key];
          const num = Number(value);
          return Number.isFinite(num) ? num : null;
        })
        .filter((value): value is number => value != null);

    const avg = (values: number[]) =>
      values.length === 0 ? null : values.reduce((sum, n) => sum + n, 0) / values.length;

    const incomeValues = numericValues("monthly_income");
    const familyValues = numericValues("family_size");
    const childrenValues = numericValues("school_age_children");

    const breakdown = (key: string): Array<{ label: string; count: number }> => {
      const map = new Map<string, number>();
      for (const feature of filtered) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const raw = props[key];
        const label = typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "Unknown";
        map.set(label, (map.get(label) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
    };

    const dates = filtered
      .map((feature) => {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        return typeof props.date_recorded === "string" ? props.date_recorded : "";
      })
      .filter((value) => value.length > 0)
      .sort();

    const title =
      effectiveSelectedPlace.barangay ||
      effectiveSelectedPlace.municipality ||
      effectiveSelectedPlace.province ||
      effectiveSelectedPlace.region ||
      "Selected place";

    const level: PlaceDetails["level"] = effectiveSelectedPlace.barangay
      ? "barangay"
      : effectiveSelectedPlace.municipality
        ? "municipality"
        : effectiveSelectedPlace.province
          ? "province"
          : "region";

    return {
      title,
      level,
      households: filtered.length,
      avgMonthlyIncome: avg(incomeValues),
      minMonthlyIncome: incomeValues.length > 0 ? Math.min(...incomeValues) : null,
      maxMonthlyIncome: incomeValues.length > 0 ? Math.max(...incomeValues) : null,
      avgFamilySize: avg(familyValues),
      totalSchoolAgeChildren: childrenValues.reduce((sum, n) => sum + n, 0),
      dateFrom: dates.length > 0 ? dates[0] : null,
      dateTo: dates.length > 0 ? dates[dates.length - 1] : null,
      riskBreakdown: breakdown("risk_level"),
      floodBreakdown: breakdown("flood_risk"),
    };
  }, [datasetFeatures, effectiveSelectedPlace, hasPlaceSelection]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (
      effectiveSelectedPlace.region ||
      effectiveSelectedPlace.province ||
      effectiveSelectedPlace.municipality ||
      effectiveSelectedPlace.barangay
    )
      count += 1;
    if (householdFilters.timeFrameStartYear.trim().length > 0 || householdFilters.timeFrameEndYear.trim().length > 0)
      count += 1;
    if (
      householdFilters.minMonthlyIncome.trim().length > 0 ||
      householdFilters.maxMonthlyIncome.trim().length > 0
    ) {
      count += 1;
    }
    if (householdFilters.riskLevel.trim().length > 0) {
      count += 1;
    }
    return count;
  }, [effectiveSelectedPlace, householdFilters]);

  const isDark = themeMode === "dark";

  const containerClass = cx(
    "flex flex-col h-screen w-screen overflow-hidden",
    isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"
  );

  const handleStyleLayersChange = useCallback(
    (nextLayers: StyleLayer[], initiallyActive: string[]) => {
      setStyleLayers(nextLayers);
      setActiveStyleLayerIds((prev) => {
        if (prev.size > 0) return prev;
        return new Set(initiallyActive);
      });
    },
    []
  );

  return (
    <div className={containerClass}>
      <header
        className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0f172a] px-4 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <Image src="/AGEIS_logo.svg" alt="AGEIS" width={36} height={36} priority />
          </div>
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-wide mr-2">AGEIS</span>
            <div className="flex flex-col border-l border-slate-600 pl-2">
              <span className="text-[10px] text-slate-300 leading-tight">AI-Powered Geospatial</span>
              <span className="text-[10px] text-slate-300 leading-tight">Education Intelligence System</span>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 w-[30rem] max-w-[calc(100vw-16rem)] -translate-x-1/2 -translate-y-1/2 z-40">
          <MapSearchBar
            query={searchQuery}
            onQueryChange={(query) => {
              setSearchQuery(query);
              if (!query.trim()) {
                clearSearchWork();
                setSearchSuggestions([]);
                return;
              }
              scheduleSearch(query);
            }}
            isFocused={isSearchFocused}
            onFocusChange={(focused) => {
              setIsSearchFocused(focused);
              if (focused) {
                setFiltersCollapsed(true);
              }
              if (!focused) {
                clearSearchWork();
                setSearchSuggestions([]);
              }
            }}
            suggestions={searchSuggestions}
            isLoading={searchIsLoading}
            onSuggestionSelect={selectSuggestion}
            isDark={true}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className={cx(
              "flex h-8 w-8 items-center justify-center rounded-full border transition",
              isDark ? "border-white/10 hover:bg-white/5" : "border-slate-700 bg-slate-800 hover:bg-slate-700"
            )}
            aria-label="User Profile"
          >
            <FiUser className={cx("h-4 w-4", isDark ? "text-neutral-300" : "text-slate-300")} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          panelOpen={panelOpen}
          isDark={isDark}
          themeMode={themeMode}
          mapStyleId={mapStyleId}
          mapStyles={MAP_STYLES}
          onPanelToggle={setPanelOpen}
          onThemeChange={setThemeMode}
          onMapStyleChange={setMapStyleId}
        />

        <div className="relative flex-1">
          <div className="absolute inset-0">
            <AGEISMap
              selectedLocation={selectedLocation}
              placeZoomSequence={placeZoomSequence?.targets}
              placeZoomSequenceKey={placeZoomSequence?.key ?? null}
              mapStyle={mapStyleUrl}
              enableStyleLayerFeatures={isAgeisStyle}
              activeStyleLayerIds={isAgeisStyle ? [...activeStyleLayerIds] : undefined}
              onStyleLayersChange={handleStyleLayersChange}
              onViewportChange={(viewport) => {
                mapViewportRef.current = viewport;
              }}
              onFeatureClick={(properties, position) => {
                setDialogProperties(properties);
                setDialogPosition(position);
                setDialogOpen(true);
              }}
              onMapReady={(map) => {
                mapRef.current = map;
              }}
            />
          </div>

          <div className="pointer-events-none absolute left-4 top-4 z-40 flex max-h-[calc(100%-2rem)] flex-col gap-3">
            <div className="pointer-events-auto max-w-[calc(100vw-2rem)]">
              <FiltersPanel
                filters={householdFilters}
                onFiltersChange={setHouseholdFilters}
                selectedPlace={effectiveSelectedPlace}
                onPlaceChange={handlePlaceChange}
                regions={availablePlaceHierarchy.regions}
                provinces={provinces}
                municipalities={municipalities}
                barangays={barangays}
                yearOptions={yearOptions}
                activeCount={activeFiltersCount}
                isCollapsed={filtersCollapsed}
                onToggleCollapsed={() => setFiltersCollapsed((current) => !current)}
                isDark={false}
              />
            </div>

            <div className="pointer-events-auto max-w-[calc(100vw-2rem)]">
              <MapLayersPanel
                styleLayers={styleLayers}
                activeStyleLayerIds={activeStyleLayerIds}
                onActiveStyleLayerIdsChange={setActiveStyleLayerIds}
                isCollapsed={mapLayersCollapsed}
                onToggleCollapsed={() => setMapLayersCollapsed((current) => !current)}
                isDark={false}
              />
            </div>
          </div>
          
          <FeatureDialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            properties={dialogProperties}
            titleKey="name"
            descriptionKeys={["population", "place"]}
            position={dialogPosition}
            mapRef={mapRef}
            onShowRoute={(geometry, profile) => setRouteGeometry({ geometry, profile })}
          />

          <PlaceDetailsPanel
            hasSelection={hasPlaceSelection}
            loading={datasetLoading}
            error={datasetError}
            details={placeDetails}
            isCollapsed={placeDetailsCollapsed}
            onToggleCollapsed={() => setPlaceDetailsCollapsed((current) => !current)}
          />

          {routeGeometry && (
            <div className="absolute bottom-28 right-4 z-30 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-lg">
              <span className="text-xs text-gray-600">
                {routeGeometry.profile === "walking" ? "🚶 Walking" : "🚗 Driving"} route displayed
              </span>
              <button
                onClick={() => setRouteGeometry(null)}
                className="ml-1 text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
