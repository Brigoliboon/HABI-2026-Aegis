"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FiFilter, FiLayers, FiUser } from "react-icons/fi";

import mapboxgl from "mapbox-gl";

import AGEISMap from "./ageis-map";
import SearchBar from "./search-bar";
import FiltersPanel from "./filters-panel";
import type { HouseholdFilters } from "./filters-panel";
import OptionsPanel from "./options-panel";
import Sidebar from "./sidebar";
import FeatureDialog from "./FeatureDialog";
import type { FeatureProperties } from "./dialog/types";

import { LAYER_CATEGORIES, type LayerCategory, type StyleLayer } from "@/lib/mapConstants";
import { fetchPlaceBounds } from "@/lib/phLocations";
import type { MarkerData } from "@/types/locations";

type ViewKey = "filter" | "analytics" | "settings";

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

type LocalSearchIndex = {
  cities: Array<{ name: string; nameLower: string; lng: number; lat: number }>;
  barangays: Array<{ name: string; nameLower: string; city: string | null; lng: number; lat: number }>;
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

export default function AGEISApp() {
  const [activeView, setActiveView] = useState<ViewKey>("filter");
  const [panelOpen, setPanelOpen] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [mapStyleId, setMapStyleId] = useState<MapStyleOption["id"]>("ageis");

  const [styleLayers, setStyleLayers] = useState<StyleLayer[]>([]);
  const [activeStyleLayerIds, setActiveStyleLayerIds] = useState<Set<string>>(() => new Set());
  const [expandedStyleLayerCategories, setExpandedStyleLayerCategories] = useState<Set<string>>(
    () => new Set(LAYER_CATEGORIES.map((c) => c.name))
  );

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ region: string | null; province: string | null; municipality: string | null; barangay: string | null }>({ region: null, province: null, municipality: null, barangay: null });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersMounted, setFiltersMounted] = useState(false);
  const filtersCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openFilters = () => {
    if (filtersCloseTimerRef.current) {
      clearTimeout(filtersCloseTimerRef.current);
      filtersCloseTimerRef.current = null;
    }

    setFiltersMounted(true);
    requestAnimationFrame(() => {
      setFiltersOpen(true);
    });
  };

  const closeFilters = () => {
    setFiltersOpen(false);

    if (filtersCloseTimerRef.current) clearTimeout(filtersCloseTimerRef.current);
    filtersCloseTimerRef.current = setTimeout(() => {
      setFiltersMounted(false);
      filtersCloseTimerRef.current = null;
    }, 180);
  };

  const toggleFilters = () => {
    if (filtersOpen) {
      closeFilters();
      return;
    }

    openFilters();
  };
  const [barangayOptions, setBarangayOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>([]);

  const [householdFilters, setHouseholdFilters] = useState<HouseholdFilters>({
    timeFrameStartYear: "",
    timeFrameEndYear: "",
    barangay: "",
    minMonthlyIncome: "",
    maxMonthlyIncome: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MarkerData | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProperties, setDialogProperties] = useState<FeatureProperties>({});
  const [dialogPosition, setDialogPosition] = useState({ lng: 0, lat: 0 });
  const [routeGeometry, setRouteGeometry] = useState<{ geometry: GeoJSON.LineString; profile: "walking" | "driving" } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);
  const mapViewportRef = useRef<MapViewport | null>(null);

  useEffect(() => {
    return () => {
      if (filtersCloseTimerRef.current) clearTimeout(filtersCloseTimerRef.current);
      if (searchDebounceTimerRef.current) clearTimeout(searchDebounceTimerRef.current);
      searchAbortRef.current?.abort();
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
          "line-width": 4,
          "line-opacity": 0.5,
          "line-emissive-strength": 8,
        },
      });
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [routeGeometry]);

  const lastZoomedPlaceRef = useRef<string | null>(null);

  const zoomToPlace = useCallback(async (place: typeof selectedPlace) => {
    if (!mapRef.current || !mapRef.current.getStyle()) return;

    let zoomLevel = 8;

    if (place.barangay && place.municipality) {
      zoomLevel = 16;
    } else if (place.municipality) {
      zoomLevel = 13;
    } else if (place.province) {
      zoomLevel = 10;
    } else if (place.region) {
      zoomLevel = 8;
    } else {
      return;
    }

    const bounds = await fetchPlaceBounds(
      place.region,
      place.province,
      place.municipality,
      place.barangay
    );

    if (!bounds || !mapRef.current?.getStyle()) return;

    const placeKey = `${place.region}|${place.province}|${place.municipality}|${place.barangay}`;
    lastZoomedPlaceRef.current = placeKey;

    if (bounds.bbox && bounds.bbox.length === 4) {
      mapRef.current.fitBounds(
        [
          [bounds.bbox[0], bounds.bbox[1]],
          [bounds.bbox[2], bounds.bbox[3]],
        ],
        { padding: 60, duration: 900, maxZoom: zoomLevel }
      );
    } else if (bounds.center) {
      mapRef.current.flyTo({
        center: bounds.center,
        zoom: zoomLevel,
        duration: 900,
      });
    }
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    zoomToPlace(selectedPlace);
  }, [mapReady, selectedPlace, zoomToPlace]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const isAgeisStyle = mapStyleId === "ageis";

  const fetchMapboxSuggestions = async (
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
      address: 15,
      poi: 15,
      neighborhood: 13,
      locality: 12,
      place: 11,
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
  };

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
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    if (!mapboxToken) return;

    const requestId = searchRequestIdRef.current;

    searchDebounceTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setSearchIsLoading(true);

      void fetchMapboxSuggestions(query, controller.signal, mapViewportRef.current)
        .then((mapboxResults) => {
          if (searchRequestIdRef.current !== requestId) return;
          setSearchSuggestions(mapboxResults);
        })
        .catch((err: unknown) => {
          if (searchRequestIdRef.current !== requestId) return;
          if (err && typeof err === "object" && "name" in err && (err as { name?: unknown }).name === "AbortError") {
            return;
          }
          // swallow network errors
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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (householdFilters.timeFrameStartYear.trim().length > 0 || householdFilters.timeFrameEndYear.trim().length > 0)
      count += 1;
    if (householdFilters.barangay.trim().length > 0) count += 1;
    if (
      householdFilters.minMonthlyIncome.trim().length > 0 ||
      householdFilters.maxMonthlyIncome.trim().length > 0
    ) {
      count += 1;
    }
    return count;
  }, [householdFilters]);

  const isDark = themeMode === "dark";

  const containerClass = cx(
    "flex flex-col h-screen w-screen overflow-hidden",
    isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"
  );

  const floatingButtonClass = cx(
    "grid h-11 w-11 place-items-center rounded-xl border transition",
    isDark
      ? "border-white/10 bg-neutral-950 text-neutral-200 hover:bg-white/5"
      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
  );

  

  const analytics = useMemo(
    () => ({ total: 0, avgIncome: null, highRisk: 0, topBarangays: [] as Array<[string, number]> }),
    []
  );

  const handleStyleLayersChange = useCallback(
    (nextLayers: StyleLayer[], initiallyActive: string[]) => {
      // Only update if the layers have actually changed
      setStyleLayers(prevLayers => {
        // Simple comparison by length and first layer id
        if (prevLayers.length === nextLayers.length && 
            prevLayers[0]?.id === nextLayers[0]?.id) {
          return prevLayers;
        }
        return nextLayers;
      });
      
      // Only set initial active layers if we don't have any yet
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
          <SearchBar
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
          activeView={activeView}
          panelOpen={panelOpen}
          isDark={isDark}
          barangayOptions={barangayOptions}
          selectedPlace={selectedPlace}
          onPlaceChange={setSelectedPlace}
          analytics={analytics}
          themeMode={themeMode}
          mapStyleId={mapStyleId}
          mapStyles={MAP_STYLES}
          onViewChange={setActiveView}
          onPanelToggle={setPanelOpen}
          onThemeChange={setThemeMode}
          onMapStyleChange={setMapStyleId}
          styleLayers={styleLayers}
          activeStyleLayerIds={activeStyleLayerIds}
          onActiveStyleLayerIdsChange={setActiveStyleLayerIds}
        />

        <div className="relative flex-1">
          <div className="absolute inset-0">
            <AGEISMap
              selectedLocation={selectedLocation}
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
                setMapReady(true);
              }}
            />
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

          {routeGeometry && (
            <div className="absolute bottom-24 right-4 z-20 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-lg">
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
