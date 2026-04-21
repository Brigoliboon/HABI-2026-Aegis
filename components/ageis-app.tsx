"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiHexagon,
  FiLayers,
  FiMoon,
  FiSettings,
  FiSun,
} from "react-icons/fi";

import AGEISMap from "./ageis-map";
import type { ClusterSelection } from "./cluster-info-card";
import ClusterInfoCard from "./cluster-info-card";
import SearchBar from "./search-bar";
import FiltersPanel from "./filters-panel";
import AnalyticsPanel from "./analytics-panel";
import LayersPanel from "./layers-panel";
import { ACTIVE_HOUSEHOLDS_DATASET_API_PATH } from "@/lib/datasets";
import { fetchGeoJsonFeatureCollection } from "@/lib/geojson-client";
import type { MarkerData } from "@/types/locations";

type HouseholdFilters = {
  timeFrameStartYear: string;
  timeFrameEndYear: string;
  barangay: string;
  minMonthlyIncome: string;
  maxMonthlyIncome: string;
};

type LayerKey = "base" | "risk" | "income" | "education" | "children";

type LayerToggles = Record<LayerKey, boolean>;

type ViewKey = "analytics" | "insights" | "settings";

type ThemeMode = "dark" | "light";

type MapStyleOption = {
  id: string;
  label: string;
  styleUrl: string;
};

type SelectedInfoCard = { kind: "cluster"; data: ClusterSelection };

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
    id: "streets",
    label: "Streets",
    styleUrl: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "outdoors",
    label: "Outdoors",
    styleUrl: "mapbox://styles/mapbox/outdoors-v12",
  },
  {
    id: "satellite",
    label: "Satellite",
    styleUrl: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  {
    id: "light",
    label: "Light",
    styleUrl: "mapbox://styles/mapbox/light-v11",
  },
  {
    id: "dark",
    label: "Dark",
    styleUrl: "mapbox://styles/mapbox/dark-v11",
  },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalizeYearRange(next: Pick<HouseholdFilters, "timeFrameStartYear" | "timeFrameEndYear">): {
  timeFrameStartYear: string;
  timeFrameEndYear: string;
} {
  const start = next.timeFrameStartYear.trim();
  const end = next.timeFrameEndYear.trim();

  if (!start || !end) {
    return {
      timeFrameStartYear: start,
      timeFrameEndYear: end,
    };
  }

  const startNum = Number(start);
  const endNum = Number(end);
  if (!Number.isFinite(startNum) || !Number.isFinite(endNum)) {
    return {
      timeFrameStartYear: start,
      timeFrameEndYear: end,
    };
  }

  if (startNum <= endNum) {
    return {
      timeFrameStartYear: start,
      timeFrameEndYear: end,
    };
  }

  return {
    timeFrameStartYear: end,
    timeFrameEndYear: start,
  };
}

export default function AGEISApp() {
  const [activeView, setActiveView] = useState<ViewKey>("analytics");
  const [panelOpen, setPanelOpen] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [mapStyleId, setMapStyleId] = useState<MapStyleOption["id"]>("streets");

  const [layersOpen, setLayersOpen] = useState(false);
  const [layers, setLayers] = useState<LayerToggles>({
    base: true,
    risk: false,
    income: false,
    education: false,
    children: false,
  });

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
  const [localSearchIndex, setLocalSearchIndex] = useState<LocalSearchIndex>({
    cities: [],
    barangays: [],
  });

  type HouseholdRow = {
    dateRecordedYear: string;
    barangay: string;
    monthlyIncome: number | null;
    riskLevel: string;
  };

  const [householdRows, setHouseholdRows] = useState<HouseholdRow[]>([]);

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
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);
  const mapViewportRef = useRef<MapViewport | null>(null);
  const [selectedInfoCard, setSelectedInfoCard] = useState<SelectedInfoCard | null>(null);
  const [infoCardOpen, setInfoCardOpen] = useState(false);
  const infoCardCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (infoCardCloseTimerRef.current) clearTimeout(infoCardCloseTimerRef.current);
      if (filtersCloseTimerRef.current) clearTimeout(filtersCloseTimerRef.current);
      if (searchDebounceTimerRef.current) clearTimeout(searchDebounceTimerRef.current);
      searchAbortRef.current?.abort();
    };
  }, []);

  const closeInfoCard = () => {
    setInfoCardOpen(false);
    if (infoCardCloseTimerRef.current) clearTimeout(infoCardCloseTimerRef.current);
    const timer = setTimeout(() => {
      setSelectedInfoCard(null);
      infoCardCloseTimerRef.current = null;
    }, 180);
    infoCardCloseTimerRef.current = timer;
  };

  const openInfoCard = (next: SelectedInfoCard) => {
    if (infoCardCloseTimerRef.current) {
      clearTimeout(infoCardCloseTimerRef.current);
      infoCardCloseTimerRef.current = null;
    }
    setSelectedInfoCard(next);
    setInfoCardOpen(true);
  };

  const handleViewAnalyticsClick = () => {
    setActiveView("analytics");
    setPanelOpen(true);
    closeInfoCard();
  };

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  const buildLocalSearchSuggestions = (query: string): SearchSuggestion[] => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const results: SearchSuggestion[] = [];
    const add = (suggestion: SearchSuggestion) => {
      if (results.length >= 6) return;
      results.push(suggestion);
    };

    for (const city of localSearchIndex.cities) {
      if (!city.nameLower.includes(normalized)) continue;
      add({
        id: `local-city:${city.nameLower}`,
        kind: "local-city",
        title: city.name,
        subtitle: "Municipality / City",
        lng: city.lng,
        lat: city.lat,
        zoom: 11,
      });
    }

    for (const brgy of localSearchIndex.barangays) {
      if (!brgy.nameLower.includes(normalized)) continue;
      add({
        id: `local-barangay:${brgy.city ?? ""}:${brgy.nameLower}`,
        kind: "local-barangay",
        title: brgy.name,
        subtitle: brgy.city ? `${brgy.city} • Barangay` : "Barangay",
        lng: brgy.lng,
        lat: brgy.lat,
        zoom: 12.2,
      });
    }

    return results;
  };

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

    const local = buildLocalSearchSuggestions(query);
    setSearchSuggestions(local);

    if (!mapboxToken) return;

    const requestId = searchRequestIdRef.current;

    searchDebounceTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setSearchIsLoading(true);

      void fetchMapboxSuggestions(query, controller.signal, mapViewportRef.current)
        .then((mapboxResults) => {
          if (searchRequestIdRef.current !== requestId) return;
          setSearchSuggestions([...local, ...mapboxResults]);
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

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const fc = await fetchGeoJsonFeatureCollection(ACTIVE_HOUSEHOLDS_DATASET_API_PATH);

        const barangays = new Set<string>();
        const years = new Set<string>();
        const rows: HouseholdRow[] = [];

        const cityAgg = new Map<string, { lngSum: number; latSum: number; n: number }>();
        const barangayAgg = new Map<
          string,
          { barangay: string; city: string | null; lngSum: number; latSum: number; n: number }
        >();

        for (const feature of fc.features as Array<{ properties?: unknown; geometry?: unknown }>) {
          const props = (feature?.properties ?? {}) as Record<string, unknown>;
          const barangay = typeof props.barangay === "string" ? props.barangay.trim() : "";
          if (barangay) barangays.add(barangay);

          const cityRaw = props.city;
          const city = typeof cityRaw === "string" ? cityRaw.trim() : "";

          const dateRecorded = typeof props.date_recorded === "string" ? props.date_recorded.trim() : "";
          const year = dateRecorded.length >= 4 ? dateRecorded.slice(0, 4) : "";
          if (year) years.add(year);

          const incomeRaw = props.monthly_income;
          const incomeNum = typeof incomeRaw === "number" ? incomeRaw : Number(incomeRaw);
          const monthlyIncome = Number.isFinite(incomeNum) ? incomeNum : null;

          const riskLevel = typeof props.risk_level === "string" ? props.risk_level.trim() : "";

          const geom = feature?.geometry as { type?: unknown; coordinates?: unknown } | undefined;
          const coords =
            geom && geom.type === "Point" && Array.isArray(geom.coordinates) ? geom.coordinates : null;
          const lng = coords && coords.length >= 2 ? Number(coords[0]) : null;
          const lat = coords && coords.length >= 2 ? Number(coords[1]) : null;
          const hasPoint = lng != null && lat != null && Number.isFinite(lng) && Number.isFinite(lat);

          if (hasPoint && city) {
            const prev = cityAgg.get(city) ?? { lngSum: 0, latSum: 0, n: 0 };
            prev.lngSum += lng as number;
            prev.latSum += lat as number;
            prev.n += 1;
            cityAgg.set(city, prev);
          }

          if (hasPoint && barangay) {
            const key = `${city}||${barangay}`;
            const prev = barangayAgg.get(key) ?? {
              barangay,
              city: city || null,
              lngSum: 0,
              latSum: 0,
              n: 0,
            };
            prev.lngSum += lng as number;
            prev.latSum += lat as number;
            prev.n += 1;
            barangayAgg.set(key, prev);
          }

          rows.push({
            dateRecordedYear: year,
            barangay,
            monthlyIncome,
            riskLevel,
          });
        }

        const cities = [...cityAgg.entries()]
          .map(([name, agg]) => ({
            name,
            nameLower: name.toLowerCase(),
            lng: agg.lngSum / Math.max(1, agg.n),
            lat: agg.latSum / Math.max(1, agg.n),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const barangaysIndex = [...barangayAgg.values()]
          .map((agg) => ({
            name: agg.barangay,
            nameLower: agg.barangay.toLowerCase(),
            city: agg.city,
            lng: agg.lngSum / Math.max(1, agg.n),
            lat: agg.latSum / Math.max(1, agg.n),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setLocalSearchIndex({
          cities,
          barangays: barangaysIndex,
        });

        const sortAlpha = (a: string, b: string) => a.localeCompare(b);
        setBarangayOptions([...barangays].sort(sortAlpha));
        setYearOptions([...years].sort((a, b) => Number(b) - Number(a)));
        setHouseholdRows(rows);
      } catch {
        // ignore
      }
    };

    void fetchFilterOptions();
  }, []);

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

  const railItems = useMemo(
    () =>
      [
        { key: "analytics" as const, label: "Analytics", icon: FiBarChart2 },
        { key: "insights" as const, label: "Insights", icon: FiHexagon },
      ],
    []
  );

  const isDark = themeMode === "dark";

  const containerClass = cx(
    "relative h-screen w-screen overflow-hidden",
    isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"
  );

  const overlayClass = "absolute left-0 top-0 z-10 flex h-full";

  const topCenterClass = "absolute left-1/2 top-4 z-20 w-[36rem] max-w-[calc(100vw-2rem)] -translate-x-1/2";

  const railClass = cx(
    "flex h-full w-16 flex-col items-center border-r px-2 py-3",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const railButtonClass = (isActive: boolean) =>
    cx(
      "grid h-11 w-11 place-items-center rounded-lg transition",
      isDark ? "text-neutral-200 hover:bg-white/5" : "text-neutral-700 hover:bg-black/5",
      isActive && (isDark ? "bg-white/10" : "bg-black/10")
    );

  const panelShellClass = cx(
    "flex h-full w-80 flex-col border-r",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const surfaceClass = cx(
    "rounded-xl border p-4",
    isDark ? "border-white/10 bg-neutral-900/50" : "border-neutral-200 bg-white"
  );

  const selectClass = cx(
    "h-10 w-full rounded-lg border px-3 text-sm outline-none",
    isDark ? "border-white/10 bg-neutral-900 text-neutral-100" : "border-neutral-200 bg-white text-neutral-900"
  );

  const floatingButtonClass = cx(
    "grid h-11 w-11 place-items-center rounded-xl border transition",
    isDark
      ? "border-white/10 bg-neutral-950 text-neutral-200 hover:bg-white/5"
      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
  );

  const toggleLayer = (key: LayerKey) => {
    setLayers((prev) => {
      if (key === "base") {
        const nextBase = !prev.base;
        return {
          ...prev,
          base: nextBase,
          risk: nextBase ? prev.risk : false,
        };
      }

      if (key === "risk") {
        const nextRisk = !prev.risk;
        return {
          ...prev,
          risk: nextRisk,
          base: nextRisk ? true : prev.base,
        };
      }

      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  const filteredHouseholdRows = useMemo(() => {
    const yearStartRaw = householdFilters.timeFrameStartYear.trim();
    const yearEndRaw = householdFilters.timeFrameEndYear.trim();
    const normalizedYears = normalizeYearRange({
      timeFrameStartYear: yearStartRaw,
      timeFrameEndYear: yearEndRaw,
    });
    const yearStart = normalizedYears.timeFrameStartYear ? Number(normalizedYears.timeFrameStartYear) : null;
    const yearEnd = normalizedYears.timeFrameEndYear ? Number(normalizedYears.timeFrameEndYear) : null;
    const hasYearFilter = yearStart != null || yearEnd != null;

    const barangayQuery = householdFilters.barangay.trim().toLowerCase();

    const minIncome = householdFilters.minMonthlyIncome.trim()
      ? Number(householdFilters.minMonthlyIncome.trim())
      : null;
    const maxIncome = householdFilters.maxMonthlyIncome.trim()
      ? Number(householdFilters.maxMonthlyIncome.trim())
      : null;

    return householdRows.filter((row) => {
      if (hasYearFilter) {
        const rowYearNum = Number(row.dateRecordedYear);
        if (!Number.isFinite(rowYearNum)) return false;
        if (yearStart != null && rowYearNum < yearStart) return false;
        if (yearEnd != null && rowYearNum > yearEnd) return false;
      }
      if (barangayQuery && !row.barangay.toLowerCase().includes(barangayQuery)) return false;

      if (minIncome != null || maxIncome != null) {
        if (row.monthlyIncome == null) return false;
        if (Number.isFinite(minIncome as number) && minIncome != null && row.monthlyIncome < minIncome) return false;
        if (Number.isFinite(maxIncome as number) && maxIncome != null && row.monthlyIncome > maxIncome) return false;
      }

      return true;
    });
  }, [householdFilters, householdRows]);

  const analytics = useMemo(() => {
    const total = filteredHouseholdRows.length;

    let incomeSum = 0;
    let incomeN = 0;
    let highRisk = 0;
    const byBarangay = new Map<string, number>();

    for (const row of filteredHouseholdRows) {
      if (row.monthlyIncome != null) {
        incomeSum += row.monthlyIncome;
        incomeN += 1;
      }
      if (row.riskLevel.trim().toLowerCase() === "high") highRisk += 1;
      if (row.barangay) byBarangay.set(row.barangay, (byBarangay.get(row.barangay) ?? 0) + 1);
    }

    const avgIncome = incomeN > 0 ? Math.round(incomeSum / incomeN) : null;
    const topBarangays = [...byBarangay.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { total, avgIncome, highRisk, topBarangays };
  }, [filteredHouseholdRows]);

  const selectedClusterInfo: ClusterSelection | null = selectedInfoCard ? selectedInfoCard.data : null;

  return (
    <div className={containerClass}>
      <div className="absolute inset-0">
        <AGEISMap
          selectedLocation={selectedLocation}
          mapStyle={mapStyleUrl}
          onViewportChange={(viewport) => {
            mapViewportRef.current = viewport;
          }}
          onClusterSelect={(selection) => {
            openInfoCard({ kind: "cluster", data: selection });
          }}
          householdFilters={householdFilters}
          layers={layers}
        />
      </div>

      {selectedInfoCard && (
        <ClusterInfoCard
          clusterInfo={selectedClusterInfo}
          isOpen={infoCardOpen}
          onClose={closeInfoCard}
          onViewAnalyticsClick={handleViewAnalyticsClick}
          isDark={isDark}
        />
      )}

      <div className={topCenterClass}>
        <div className="relative">
          <div className="flex items-start gap-2">
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
              isDark={isDark}
            />

            <div className="relative">
              <button
                type="button"
                className={cx(
                  "flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                  isDark
                    ? "border-white/10 bg-neutral-950 text-neutral-200 hover:bg-white/5"
                    : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                )}
                onClick={toggleFilters}
                aria-label="Open filters"
                aria-expanded={filtersOpen}
              >
                <FiFilter className="h-4 w-4" aria-hidden="true" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span
                    className={cx(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs",
                      isDark ? "bg-white/10 text-neutral-100" : "bg-black/5 text-neutral-900"
                    )}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {filtersMounted && (
                <FiltersPanel
                  filters={householdFilters}
                  onFiltersChange={setHouseholdFilters}
                  yearOptions={yearOptions}
                  barangayOptions={barangayOptions}
                  isOpen={filtersOpen}
                  onClose={closeFilters}
                  isDark={isDark}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className={overlayClass}>
        <div className={railClass}>
          <div className="flex flex-col items-center gap-2">
            <div
              className={cx(
                "grid h-11 w-11 place-items-center rounded-xl border",
                isDark ? "border-white/10 bg-neutral-900" : "border-neutral-200 bg-white"
              )}
              aria-label="AGEIS"
              title="AGEIS"
            >
              <Image src="/AGEIS_logo.svg" alt="AGEIS" width={32} height={32} className="h-8 w-8" priority />
            </div>

            {!panelOpen && (
              <button
                type="button"
                className={cx(
                  "grid h-9 w-9 place-items-center rounded-lg border transition",
                  isDark
                    ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                    : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                )}
                onClick={() => setPanelOpen(true)}
                aria-label="Expand panel"
              >
                <FiChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>

          <nav className="mt-4 flex w-full flex-1 flex-col items-center gap-2">
            {railItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={railButtonClass(activeView === key)}
                onClick={() => {
                  setActiveView(key);
                  setPanelOpen(true);
                }}
                aria-current={activeView === key ? "page" : undefined}
                aria-label={label}
                title={label}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </button>
            ))}
          </nav>

          <div className="mt-auto flex w-full flex-col items-center gap-2">
            <button
              type="button"
              className={railButtonClass(activeView === "settings")}
              onClick={() => {
                setActiveView("settings");
                setPanelOpen(true);
              }}
              aria-current={activeView === "settings" ? "page" : undefined}
              aria-label="Settings"
              title="Settings"
            >
              <FiSettings className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className={cx(
            "overflow-hidden transition-[width] duration-200 ease-out",
            panelOpen ? "w-80" : "w-0"
          )}
          aria-hidden={!panelOpen}
        >
          <div className={panelShellClass}>
            <div className="px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="leading-tight">
                  <div className="text-sm font-semibold">AGEIS</div>
                  <div className={cx("text-xs", isDark ? "text-neutral-400" : "text-neutral-500")}>
                    Valencia City households
                  </div>
                </div>

                <button
                  type="button"
                  className={cx(
                    "grid h-9 w-9 place-items-center rounded-lg border transition",
                    isDark
                      ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                  )}
                  onClick={() => setPanelOpen(false)}
                  aria-label="Collapse panel"
                >
                  <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-3 pb-3">
              {activeView === "analytics" && (
                <AnalyticsPanel analytics={analytics} isDark={isDark} />
              )}

              {activeView === "insights" && (
                <div className={surfaceClass}>
                  <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                    Insights
                  </div>
                  <div className={cx("mt-1 text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
                    Reserved for future AI-driven features.
                  </div>

                  <div className={cx("mt-4 text-sm", isDark ? "text-neutral-300" : "text-neutral-700")}>
                    This is a placeholder view.
                  </div>
                </div>
              )}

              {activeView === "settings" && (
                <div className="space-y-3">
                  <div className={surfaceClass}>
                    <div
                      className={cx(
                        "mb-3 flex items-center justify-between",
                        isDark ? "text-neutral-300" : "text-neutral-700"
                      )}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <FiSettings className="h-4 w-4" aria-hidden="true" />
                        <span>App settings</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className={cx("mb-1 text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
                          Theme
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setThemeMode("light")}
                            className={cx(
                              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                              themeMode === "light"
                                ? isDark
                                  ? "border-white/20 bg-white/10 text-neutral-100"
                                  : "border-neutral-300 bg-black/5 text-neutral-900"
                                : isDark
                                  ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-white/5"
                                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-black/5"
                            )}
                          >
                            <FiSun className="h-4 w-4" aria-hidden="true" />
                            <span>Light</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setThemeMode("dark")}
                            className={cx(
                              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                              themeMode === "dark"
                                ? isDark
                                  ? "border-white/20 bg-white/10 text-neutral-100"
                                  : "border-neutral-300 bg-black/5 text-neutral-900"
                                : isDark
                                  ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-white/5"
                                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-black/5"
                            )}
                          >
                            <FiMoon className="h-4 w-4" aria-hidden="true" />
                            <span>Dark</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className={cx("mb-1 text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
                          Map view
                        </div>
                        <select
                          className={selectClass}
                          value={mapStyleId}
                          onChange={(e) => setMapStyleId(e.target.value)}
                        >
                          {MAP_STYLES.map((style) => (
                            <option key={style.id} value={style.id}>
                              {style.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cx(
          "absolute bottom-4 z-20",
          "transition-[left] duration-200 ease-out",
          panelOpen ? "left-[25rem]" : "left-20"
        )}
      >
        {layersOpen ? (
          <LayersPanel
            layers={layers}
            onLayerToggle={toggleLayer}
            onClose={() => setLayersOpen(false)}
            isDark={isDark}
          />
        ) : (
          <button
            type="button"
            className={floatingButtonClass}
            onClick={() => setLayersOpen(true)}
            aria-label="Open layers"
            title="Layers"
          >
            <FiLayers className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
