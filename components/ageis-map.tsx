"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MarkerData } from "@/types/locations";
import { ACTIVE_HOUSEHOLDS_DATASET_API_PATH } from "@/lib/datasets";
import { fetchGeoJsonFeatureCollection } from "@/lib/geojson-client";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const STYLE = "mapbox://styles/boonjefferson/cmo5moe2k000n01rcahy17o82";

type Props = {
  mapStyle: string;
  selectedLocation: MarkerData | null;
  onViewportChange?: (viewport: {
    center: [number, number];
    bounds: { west: number; south: number; east: number; north: number };
    zoom: number;
  }) => void;
  onClusterSelect?: (selection: ClusterSelection) => void;
  householdFilters: {
    timeFrameStartYear: string;
    timeFrameEndYear: string;
    barangay: string;
    minMonthlyIncome: string;
    maxMonthlyIncome: string;
  };
  layers: {
    base: boolean;
    risk: boolean;
    income: boolean;
    education: boolean;
    children: boolean;
  };
};

export type ClusterSelection = {
  level: "city" | "barangay";
  title: string;
  households: number | null;
  avgIncome: number | null;
  highRisk: number | null;
  totalChildren: number | null;
  barangayCount: number | null;
};

export type HouseholdSelection = {
  title: string;
  subtitle: string | null;
  properties: Record<string, unknown>;
};

const HOUSEHOLDS_DATASET_URL = ACTIVE_HOUSEHOLDS_DATASET_API_PATH;

const CITY_CLUSTER_MAX_ZOOM = 11;
const BARANGAY_CLUSTER_MIN_ZOOM = 11;
const BARANGAY_CLUSTER_MAX_ZOOM = 13;
const HOUSEHOLD_POINTS_MIN_ZOOM = 13;

export default function AGEISMap({
  mapStyle,
  selectedLocation,
  onViewportChange,
  onClusterSelect,
  householdFilters,
  layers,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const lastStyleRef = useRef<string>(mapStyle);
  const geoDataRef = useRef<{
    url: string;
    data: GeoJSON.FeatureCollection;
  } | null>(null);
  const didFitBoundsRef = useRef(false);
  const filtersRef = useRef(householdFilters);
  const layersRef = useRef(layers);

  useEffect(() => {
    filtersRef.current = householdFilters;

    const map = mapRef.current;
    const raw = geoDataRef.current?.data;
    if (!map || !raw) return;

    const filtered = filterFeatureCollection(raw, filtersRef.current);
    const prepared = prepareFeatureCollectionForLayers(filtered);

    setAllSourceData(map, prepared);
    ensureClusterSummaries(map, prepared);
  }, [householdFilters]);

  useEffect(() => {
    layersRef.current = layers;

    const map = mapRef.current;
    if (!map) return;

    applyLayerVisibility(map, layers);
  }, [layers]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialStyle = mapStyle?.trim() ? mapStyle : STYLE;
    lastStyleRef.current = initialStyle;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [125.0, 7.8],
      zoom: 8,
      style: initialStyle,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const emitViewport = () => {
      const currentMap = mapRef.current;
      if (!currentMap) return;

      const center = currentMap.getCenter();
      const bounds = currentMap.getBounds();
      if (!bounds) return;

      onViewportChange?.({
        center: [center.lng, center.lat],
        bounds: {
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        },
        zoom: currentMap.getZoom(),
      });
    };

    const ensureGeoLayers = async () => {
      const currentMap = mapRef.current;
      if (!currentMap) return;

      try {
        if (!geoDataRef.current || geoDataRef.current.url !== HOUSEHOLDS_DATASET_URL) {
          geoDataRef.current = {
            url: HOUSEHOLDS_DATASET_URL,
            data: await fetchGeoJsonFeatureCollection(HOUSEHOLDS_DATASET_URL),
          };
          didFitBoundsRef.current = false;
        }

        const filtered = filterFeatureCollection(geoDataRef.current.data, filtersRef.current);
        const prepared = prepareFeatureCollectionForLayers(filtered);

        addOrUpdateGeoJsonLayer(currentMap, prepared);
        ensureClusterSummaries(currentMap, prepared);
        applyLayerVisibility(currentMap, layersRef.current);

        if (!didFitBoundsRef.current && !selectedLocation) {
          const bounds = featureCollectionBounds(filtered);
          if (bounds) {
            didFitBoundsRef.current = true;
            currentMap.fitBounds(bounds, {
              padding: 40,
              duration: 0,
              maxZoom: 13,
            });
          }
        }
      } catch {
        // If the dataset isn't available, keep the base map functional.
      }
    };

    const INTERACTIVE_LAYERS = [
      "val-city-cluster-circle",
      "val-city-cluster-label",
      "val-barangay-cluster-circle",
      "val-barangay-cluster-label",
    ] as const;

    const getFirstInteractiveFeature = (e: mapboxgl.MapMouseEvent) => {
      const currentMap = mapRef.current;
      if (!currentMap) return null;

      const existingLayers = INTERACTIVE_LAYERS.filter((layerId) =>
        Boolean(currentMap.getLayer(layerId))
      );

      if (existingLayers.length === 0) return null;

      try {
        const features = currentMap.queryRenderedFeatures(e.point, {
          layers: existingLayers,
        });

        if (!features || features.length === 0) return null;

        const byPriority = (layerId: string) =>
          features.find((f) => f.layer?.id === layerId) ?? null;

        return (
          byPriority("val-city-cluster-circle") ??
          byPriority("val-city-cluster-label") ??
          byPriority("val-barangay-cluster-circle") ??
          byPriority("val-barangay-cluster-label")
        );
      } catch {
        return null;
      }
    };

    const getNumberOrNull = (value: unknown): number | null => {
      const num = typeof value === "number" ? value : Number(value);
      return Number.isFinite(num) ? num : null;
    };

    const clusterSelectionFromFeature = (
      feature: mapboxgl.MapboxGeoJSONFeature,
      level: ClusterSelection["level"]
    ): ClusterSelection => {
      const props = (feature.properties ?? {}) as Record<string, unknown>;

      const titleRaw =
        level === "city" ? props.city : (props.barangay ?? props.brgy ?? props.name);
      const title = typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim() : "Cluster";

      return {
        level,
        title,
        households: getNumberOrNull(props.households),
        avgIncome: getNumberOrNull(props.avg_income),
        highRisk: getNumberOrNull(props.high_risk_count),
        totalChildren: getNumberOrNull(props.total_children),
        barangayCount: getNumberOrNull(props.barangay_count),
      };
    };

    const getFeaturePointCenter = (
      feature: mapboxgl.MapboxGeoJSONFeature
    ): [number, number] | null => {
      if (feature.geometry?.type !== "Point") return null;
      const coords = feature.geometry.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return null;
      const [lng, lat] = coords as number[];
      if (typeof lng !== "number" || typeof lat !== "number") return null;
      return [lng, lat];
    };

    map.on("load", () => {
      void ensureGeoLayers().finally(() => {
        emitViewport();
      });
    });

    // After any style change, custom sources/layers are removed.
    map.on("style.load", () => {
      void ensureGeoLayers();
    });

    map.on("moveend", () => {
      emitViewport();
    });

    map.on("click", (e) => {
      const currentMap = mapRef.current;
      if (!currentMap) return;

      const feature = getFirstInteractiveFeature(e);
      if (!feature) return;

      if (feature.layer?.id === "val-city-cluster-circle" || feature.layer?.id === "val-city-cluster-label") {
        const center = getFeaturePointCenter(feature);
        if (center) {
          const currentZoom = currentMap.getZoom();
          const targetZoom = Math.min(
            Math.max(currentZoom, CITY_CLUSTER_MAX_ZOOM - 1.5),
            CITY_CLUSTER_MAX_ZOOM - 0.2
          );
          currentMap.easeTo({ center, zoom: targetZoom, duration: 650 });
        }
        onClusterSelect?.(clusterSelectionFromFeature(feature, "city"));
        return;
      }

      if (
        feature.layer?.id === "val-barangay-cluster-circle" ||
        feature.layer?.id === "val-barangay-cluster-label"
      ) {
        const center = getFeaturePointCenter(feature);
        if (center) {
          const currentZoom = currentMap.getZoom();
          const targetZoom = Math.min(
            Math.max(currentZoom, BARANGAY_CLUSTER_MIN_ZOOM + 1.2),
            BARANGAY_CLUSTER_MAX_ZOOM - 0.2
          );
          currentMap.easeTo({ center, zoom: targetZoom, duration: 650 });
        }
        onClusterSelect?.(clusterSelectionFromFeature(feature, "barangay"));
        return;
      }
    });

    map.on("mousemove", (e) => {
      const currentMap = mapRef.current;
      if (!currentMap) return;

      const feature = getFirstInteractiveFeature(e);
      currentMap.getCanvas().style.cursor = feature ? "pointer" : "";
    });

    map.on("mouseleave", () => {
      const currentMap = mapRef.current;
      if (!currentMap) return;

      currentMap.getCanvas().style.cursor = "";
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextStyle = mapStyle?.trim() ? mapStyle : STYLE;

    if (lastStyleRef.current !== nextStyle) {
      lastStyleRef.current = nextStyle;
      map.setStyle(nextStyle);
    }
  }, [mapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!selectedLocation) return;

    if (selectedLocation.bbox) {
      const [west, south, east, north] = selectedLocation.bbox;
      map.fitBounds(
        [
          [west, south],
          [east, north],
        ],
        {
          padding: 60,
          duration: 900,
          maxZoom: 14,
        }
      );
      return;
    }

    map.flyTo({
      center: [selectedLocation.lng, selectedLocation.lat],
      zoom: selectedLocation.zoom ?? 12,
      duration: 900,
    });
  }, [selectedLocation]);

  useEffect(() => {
    const map = mapRef.current;
    const container = mapContainerRef.current;
    if (!map || !container) return;

    if (typeof ResizeObserver === "undefined") return;

    let frameId = 0;

    const scheduleResize = () => {
      if (frameId) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        map.resize();
      });
    };

    scheduleResize();

    const observer = new ResizeObserver(() => {
      scheduleResize();
    });

    observer.observe(container);
    window.addEventListener("resize", scheduleResize);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", scheduleResize);
    };
  }, []);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}

function setAllSourceData(map: mapboxgl.Map, data: GeoJSON.FeatureCollection) {
  const points = map.getSource("val-households-points-src") as mapboxgl.GeoJSONSource | undefined;
  if (points) points.setData(data);

  const raw = map.getSource("val-households-raw-src") as mapboxgl.GeoJSONSource | undefined;
  if (raw) raw.setData(data);
}

function prepareFeatureCollectionForLayers(collection: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  // Compute continuous weights so heatmaps reflect the underlying values (not coarse buckets).
  const incomeValues: number[] = [];
  const childrenValues: number[] = [];

  for (const feature of collection.features) {
    const props = (feature.properties ?? {}) as Record<string, unknown>;

    const incomeRaw = props.monthly_income;
    const income = typeof incomeRaw === "number" ? incomeRaw : Number(incomeRaw);
    if (Number.isFinite(income)) incomeValues.push(income);

    const childrenRaw = props.school_age_children;
    const children = typeof childrenRaw === "number" ? childrenRaw : Number(childrenRaw);
    if (Number.isFinite(children)) childrenValues.push(children);
  }

  const incomeMin = incomeValues.length ? Math.min(...incomeValues) : null;
  const incomeMax = incomeValues.length ? Math.max(...incomeValues) : null;
  const childrenMin = childrenValues.length ? Math.min(...childrenValues) : null;
  const childrenMax = childrenValues.length ? Math.max(...childrenValues) : null;

  const features: GeoJSON.Feature[] = collection.features.map((feature) => {
    const props = { ...((feature.properties ?? {}) as Record<string, unknown>) };

    props.__income_heat = computeIncomePovertyWeight(props.monthly_income, incomeMin, incomeMax);
    props.__children_heat = computeLinearWeight(props.school_age_children, childrenMin, childrenMax, {
      gamma: 0.85,
    });
    props.__education_heat = computeEducationWeight(props.highest_educational_attainment);

    return {
      ...feature,
      properties: props,
    } as GeoJSON.Feature;
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

function computeIncomePovertyWeight(
  value: unknown,
  min: number | null,
  max: number | null
): number {
  const income = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(income) || min == null || max == null) return 0;
  if (min === max) return 0.5;

  // Use log scaling so small income differences show up more clearly.
  const logMin = Math.log(min + 1);
  const logMax = Math.log(max + 1);
  const logVal = Math.log(Math.max(0, income) + 1);
  const t = clamp01((logVal - logMin) / (logMax - logMin));

  // Lower income => stronger heat.
  const poverty = 1 - t;
  return clamp01(Math.pow(poverty, 0.65));
}

function computeLinearWeight(
  value: unknown,
  min: number | null,
  max: number | null,
  opts?: { gamma?: number }
): number {
  const v = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(v) || min == null || max == null) return 0;
  if (min === max) return 0.5;

  const t = clamp01((v - min) / (max - min));
  const gamma = opts?.gamma ?? 1;
  return clamp01(Math.pow(t, gamma));
}

function computeEducationWeight(value: unknown): number {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return 0;

  // Higher weight = lower attainment.
  const score = educationRank(v);
  return clamp01(1 - score / 9);
}

function educationRank(attainment: string): number {
  // 0 = lowest, 9 = highest
  switch (attainment) {
    case "No Formal Schooling":
      return 0;
    case "Elementary Undergraduate":
      return 1;
    case "Elementary Graduate":
      return 2;
    case "Junior High School Undergraduate":
      return 3;
    case "Junior High School Graduate":
      return 4;
    case "Senior High School Undergraduate":
      return 5;
    case "Senior High School Graduate":
      return 6;
    case "Vocational/Technical Certificate":
      return 7;
    case "College Undergraduate":
      return 8;
    case "College Graduate":
      return 9;
    default:
      return 4;
  }
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function computeBarangaySummary(collection: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  type Agg = {
    barangay: string;
    lngSum: number;
    latSum: number;
    n: number;
    incomeSum: number;
    incomeN: number;
    highRisk: number;
    childrenSum: number;
  };

  const byBarangay = new Map<string, Agg>();

  for (const feature of collection.features) {
    if (feature.geometry?.type !== "Point") continue;
    const coords = feature.geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;

    const [lng, lat] = coords as number[];
    if (typeof lng !== "number" || typeof lat !== "number") continue;

    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const barangayRaw = props.barangay;
    if (typeof barangayRaw !== "string" || !barangayRaw.trim()) continue;
    const barangay = barangayRaw.trim();

    let agg = byBarangay.get(barangay);
    if (!agg) {
      agg = {
        barangay,
        lngSum: 0,
        latSum: 0,
        n: 0,
        incomeSum: 0,
        incomeN: 0,
        highRisk: 0,
        childrenSum: 0,
      };
      byBarangay.set(barangay, agg);
    }

    agg.lngSum += lng;
    agg.latSum += lat;
    agg.n += 1;

    const incomeRaw = props.monthly_income;
    const income = typeof incomeRaw === "number" ? incomeRaw : Number(incomeRaw);
    if (Number.isFinite(income)) {
      agg.incomeSum += income;
      agg.incomeN += 1;
    }

    const childrenRaw = props.school_age_children;
    const children = typeof childrenRaw === "number" ? childrenRaw : Number(childrenRaw);
    if (Number.isFinite(children)) {
      agg.childrenSum += children;
    }

    const riskRaw = props.risk_level;
    const risk = typeof riskRaw === "string" ? riskRaw.trim().toLowerCase() : "";
    if (risk === "high") agg.highRisk += 1;
  }

  const features: GeoJSON.Feature[] = [];
  for (const agg of byBarangay.values()) {
    const avgIncome = agg.incomeN > 0 ? Math.round(agg.incomeSum / agg.incomeN) : null;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [agg.lngSum / agg.n, agg.latSum / agg.n],
      },
      properties: {
        barangay: agg.barangay,
        households: agg.n,
        avg_income: avgIncome,
        high_risk_count: agg.highRisk,
        total_children: agg.childrenSum,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

function applyLayerVisibility(map: mapboxgl.Map, layers: Props["layers"]) {
  const setVis = (layerId: string, visible: boolean) => {
    if (!map.getLayer(layerId)) return;
    map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
  };

  setVis("val-city-cluster-circle", layers.base);
  setVis("val-city-cluster-label", layers.base);
  setVis("val-barangay-cluster-circle", layers.base);
  setVis("val-barangay-cluster-label", layers.base);
  setVis("val-households", layers.base);

  setVis("val-income-heatmap", layers.income);
  setVis("val-education-heatmap", layers.education);
  setVis("val-children-heatmap", layers.children);

  if (map.getLayer("val-households")) {
    map.setPaintProperty(
      "val-households",
      "icon-color",
      layers.risk ? riskColorExpression() : "#22c55e"
    );
  }
}

function riskColorExpression(): mapboxgl.Expression {
  return [
    "match",
    ["downcase", ["to-string", ["get", "risk_level"]]],
    "high",
    "#ef4444",
    "medium",
    "#eab308",
    "low",
    "#22c55e",
    "#22c55e",
  ];
}

function filterFeatureCollection(
  collection: GeoJSON.FeatureCollection,
  filters: {
    timeFrameStartYear: string;
    timeFrameEndYear: string;
    barangay: string;
    minMonthlyIncome: string;
    maxMonthlyIncome: string;
  }
): GeoJSON.FeatureCollection {
  const yearStartRaw = filters.timeFrameStartYear.trim();
  const yearEndRaw = filters.timeFrameEndYear.trim();
  const yearStartNum = yearStartRaw ? Number(yearStartRaw) : null;
  const yearEndNum = yearEndRaw ? Number(yearEndRaw) : null;

  const normalizedYearStart =
    yearStartNum != null && yearEndNum != null && Number.isFinite(yearStartNum) && Number.isFinite(yearEndNum)
      ? Math.min(yearStartNum, yearEndNum)
      : yearStartNum;
  const normalizedYearEnd =
    yearStartNum != null && yearEndNum != null && Number.isFinite(yearStartNum) && Number.isFinite(yearEndNum)
      ? Math.max(yearStartNum, yearEndNum)
      : yearEndNum;
  const hasYearFilter =
    (normalizedYearStart != null && Number.isFinite(normalizedYearStart)) ||
    (normalizedYearEnd != null && Number.isFinite(normalizedYearEnd));

  const barangayQuery = filters.barangay.trim().toLowerCase();
  const minIncome = parseNumberOrNull(filters.minMonthlyIncome);
  const maxIncome = parseNumberOrNull(filters.maxMonthlyIncome);

  if (!hasYearFilter && !barangayQuery && minIncome == null && maxIncome == null) {
    return collection;
  }

  const features = collection.features.filter((feature) => {
    const props = (feature.properties ?? {}) as Record<string, unknown>;

    if (hasYearFilter) {
      const dateRaw = props.date_recorded;
      const dateStr = typeof dateRaw === "string" ? dateRaw.trim() : "";
      const year = dateStr.length >= 4 ? dateStr.slice(0, 4) : "";
      const yearNum = Number(year);
      if (!Number.isFinite(yearNum)) return false;
      if (normalizedYearStart != null && Number.isFinite(normalizedYearStart) && yearNum < normalizedYearStart) return false;
      if (normalizedYearEnd != null && Number.isFinite(normalizedYearEnd) && yearNum > normalizedYearEnd) return false;
    }

    if (barangayQuery) {
      const barangayRaw = props.barangay;
      const barangay = typeof barangayRaw === "string" ? barangayRaw.toLowerCase() : "";
      if (!barangay.includes(barangayQuery)) return false;
    }

    if (minIncome != null || maxIncome != null) {
      const rawIncome = props.monthly_income;
      const income = typeof rawIncome === "number" ? rawIncome : Number(rawIncome);
      if (!Number.isFinite(income)) return false;

      if (minIncome != null && income < minIncome) return false;
      if (maxIncome != null && income > maxIncome) return false;
    }

    return true;
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

function parseNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

function addOrUpdateGeoJsonLayer(map: mapboxgl.Map, data: GeoJSON.FeatureCollection) {
  removeLegacyProximityClustering(map);

  const existingPoints = map.getSource("val-households-points-src") as mapboxgl.GeoJSONSource | undefined;
  if (existingPoints) {
    existingPoints.setData(data);
  } else {
    map.addSource("val-households-points-src", {
      type: "geojson",
      data,
    });
  }

  const existingRaw = map.getSource("val-households-raw-src") as mapboxgl.GeoJSONSource | undefined;
  if (existingRaw) {
    existingRaw.setData(data);
  } else {
    map.addSource("val-households-raw-src", {
      type: "geojson",
      data,
    });
  }

  // Overlay heatmaps (off by default; toggled by layer mode)
  if (!map.getLayer("val-income-heatmap")) {
    map.addLayer({
      id: "val-income-heatmap",
      type: "heatmap",
      source: "val-households-raw-src",
      layout: {
        visibility: "none",
      },
      paint: {
        "heatmap-weight": ["coalesce", ["to-number", ["get", "__income_heat"]], 0],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1.1, 10, 2.6, 14, 3.2],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 10, 10, 22, 14, 38],
        "heatmap-opacity": 0.75,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0,0,0,0)",
          0.15,
          "rgba(59,130,246,0.25)",
          0.3,
          "rgba(34,197,94,0.35)",
          0.5,
          "rgba(234,179,8,0.55)",
          0.7,
          "rgba(249,115,22,0.75)",
          0.9,
          "rgba(239,68,68,0.9)",
          1,
          "rgba(127,29,29,0.95)",
        ],
      },
    });
  }

  if (!map.getLayer("val-education-heatmap")) {
    map.addLayer({
      id: "val-education-heatmap",
      type: "heatmap",
      source: "val-households-raw-src",
      layout: {
        visibility: "none",
      },
      paint: {
        "heatmap-weight": ["coalesce", ["to-number", ["get", "__education_heat"]], 0],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1.0, 10, 2.3, 14, 3.0],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 10, 10, 22, 14, 36],
        "heatmap-opacity": 0.75,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0,0,0,0)",
          0.15,
          "rgba(59,130,246,0.25)",
          0.35,
          "rgba(34,197,94,0.35)",
          0.55,
          "rgba(234,179,8,0.55)",
          0.75,
          "rgba(249,115,22,0.75)",
          0.92,
          "rgba(239,68,68,0.9)",
          1,
          "rgba(127,29,29,0.95)",
        ],
      },
    });
  }

  if (!map.getLayer("val-children-heatmap")) {
    map.addLayer({
      id: "val-children-heatmap",
      type: "heatmap",
      source: "val-households-raw-src",
      layout: {
        visibility: "none",
      },
      paint: {
        "heatmap-weight": ["coalesce", ["to-number", ["get", "__children_heat"]], 0],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1.1, 10, 2.5, 14, 3.2],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 10, 10, 22, 14, 40],
        "heatmap-opacity": 0.75,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0,0,0,0)",
          0.15,
          "rgba(59,130,246,0.25)",
          0.35,
          "rgba(99,102,241,0.45)",
          0.6,
          "rgba(168,85,247,0.65)",
          0.85,
          "rgba(30,64,175,0.85)",
          1,
          "rgba(30,64,175,0.92)",
        ],
      },
    });
  }

  ensureHomeIcon(map);

  if (!map.getLayer("val-households")) {
    map.addLayer({
      id: "val-households",
      type: "symbol",
      source: "val-households-points-src",
      minzoom: HOUSEHOLD_POINTS_MIN_ZOOM,
      layout: {
        "icon-image": "ageis-home",
        "icon-size": 0.8,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "icon-anchor": "bottom",
      },
      paint: {
        "icon-color": "#22c55e",
        "icon-opacity": 0.9,
      },
    });
  }
}

function removeLegacyProximityClustering(map: mapboxgl.Map) {
  const removeLayerIfExists = (id: string) => {
    if (map.getLayer(id)) {
      try {
        map.removeLayer(id);
      } catch {
        // ignore
      }
    }
  };

  // Old proximity cluster layers (no longer used)
  removeLayerIfExists("val-households-clusters");
  removeLayerIfExists("val-households-cluster-count");

  // Old point layer depended on legacy source; we'll recreate it.
  if (map.getLayer("val-households")) {
    try {
      map.removeLayer("val-households");
    } catch {
      // ignore
    }
  }

  if (map.getSource("val-households-src")) {
    try {
      map.removeSource("val-households-src");
    } catch {
      // ignore
    }
  }
}

function ensureClusterSummaries(map: mapboxgl.Map, data: GeoJSON.FeatureCollection) {
  ensureCityCluster(map, data);
  ensureBarangayCluster(map, data);
}

function ensureCityCluster(map: mapboxgl.Map, data: GeoJSON.FeatureCollection) {
  const summary = computeCitySummary(data);
  const existing = map.getSource("val-city-cluster-src") as mapboxgl.GeoJSONSource | undefined;
  if (existing) {
    existing.setData(summary);
  } else {
    map.addSource("val-city-cluster-src", {
      type: "geojson",
      data: summary,
    });
  }

  if (!map.getLayer("val-city-cluster-circle")) {
    map.addLayer({
      id: "val-city-cluster-circle",
      type: "circle",
      source: "val-city-cluster-src",
      maxzoom: CITY_CLUSTER_MAX_ZOOM,
      paint: {
        "circle-color": "#0ea5e9",
        "circle-opacity": 0.3,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#0284c7",
        "circle-radius": [
          "step",
          ["get", "households"],
          18,
          100,
          22,
          1000,
          26,
          5000,
          30,
        ],
      },
    });
  }

  if (!map.getLayer("val-city-cluster-label")) {
    map.addLayer({
      id: "val-city-cluster-label",
      type: "symbol",
      source: "val-city-cluster-src",
      maxzoom: CITY_CLUSTER_MAX_ZOOM,
      layout: {
        "text-field": ["concat", ["get", "city"], "\n", ["to-string", ["get", "households"]]],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
        "text-line-height": 1.1,
        "text-justify": "center",
      },
      paint: {
        "text-color": "#082f49",
      },
    });
  }
}

function ensureBarangayCluster(map: mapboxgl.Map, data: GeoJSON.FeatureCollection) {
  const summary = computeBarangaySummary(data);
  const existing = map.getSource("val-barangay-cluster-src") as mapboxgl.GeoJSONSource | undefined;
  if (existing) {
    existing.setData(summary);
  } else {
    map.addSource("val-barangay-cluster-src", {
      type: "geojson",
      data: summary,
    });
  }

  if (!map.getLayer("val-barangay-cluster-circle")) {
    map.addLayer({
      id: "val-barangay-cluster-circle",
      type: "circle",
      source: "val-barangay-cluster-src",
      minzoom: BARANGAY_CLUSTER_MIN_ZOOM,
      maxzoom: BARANGAY_CLUSTER_MAX_ZOOM,
      paint: {
        "circle-color": "#22c55e",
        "circle-opacity": 0.28,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#16a34a",
        "circle-radius": [
          "step",
          ["get", "households"],
          16,
          50,
          20,
          200,
          24,
          800,
          28,
        ],
      },
    });
  }

  if (!map.getLayer("val-barangay-cluster-label")) {
    map.addLayer({
      id: "val-barangay-cluster-label",
      type: "symbol",
      source: "val-barangay-cluster-src",
      minzoom: BARANGAY_CLUSTER_MIN_ZOOM,
      maxzoom: BARANGAY_CLUSTER_MAX_ZOOM,
      layout: {
        "text-field": ["concat", ["get", "barangay"], "\n", ["to-string", ["get", "households"]]],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 11,
        "text-line-height": 1.1,
        "text-justify": "center",
      },
      paint: {
        "text-color": "#052e16",
      },
    });
  }
}

function computeCitySummary(collection: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  type Agg = {
    city: string;
    n: number;
    lngSum: number;
    latSum: number;
    incomeSum: number;
    incomeN: number;
    childrenSum: number;
    highRisk: number;
    barangays: Set<string>;
  };

  const byCity = new Map<string, Agg>();

  for (const feature of collection.features) {
    if (feature.geometry?.type !== "Point") continue;
    const coords = feature.geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const [lng, lat] = coords as number[];
    if (typeof lng !== "number" || typeof lat !== "number") continue;

    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const cityRaw = props.city ?? props.municipality ?? props.city_municipality ?? props.lgu;
    const city = typeof cityRaw === "string" && cityRaw.trim() ? cityRaw.trim() : "Unknown";

    const barangayRaw = props.barangay;
    const barangay = typeof barangayRaw === "string" && barangayRaw.trim() ? barangayRaw.trim() : null;

    let agg = byCity.get(city);
    if (!agg) {
      agg = {
        city,
        n: 0,
        lngSum: 0,
        latSum: 0,
        incomeSum: 0,
        incomeN: 0,
        childrenSum: 0,
        highRisk: 0,
        barangays: new Set<string>(),
      };
      byCity.set(city, agg);
    }

    agg.n += 1;
    agg.lngSum += lng;
    agg.latSum += lat;

    if (barangay) agg.barangays.add(barangay);

    const incomeRaw = props.monthly_income;
    const income = typeof incomeRaw === "number" ? incomeRaw : Number(incomeRaw);
    if (Number.isFinite(income)) {
      agg.incomeSum += income;
      agg.incomeN += 1;
    }

    const childrenRaw = props.school_age_children;
    const children = typeof childrenRaw === "number" ? childrenRaw : Number(childrenRaw);
    if (Number.isFinite(children)) agg.childrenSum += children;

    const riskRaw = props.risk_level;
    const risk = typeof riskRaw === "string" ? riskRaw.trim().toLowerCase() : "";
    if (risk === "high") agg.highRisk += 1;
  }

  const features: GeoJSON.Feature[] = [];
  for (const agg of byCity.values()) {
    const avgIncome = agg.incomeN > 0 ? Math.round(agg.incomeSum / agg.incomeN) : null;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [agg.lngSum / agg.n, agg.latSum / agg.n],
      },
      properties: {
        city: agg.city,
        households: agg.n,
        barangay_count: agg.barangays.size,
        avg_income: avgIncome,
        high_risk_count: agg.highRisk,
        total_children: agg.childrenSum,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

function ensureHomeIcon(map: mapboxgl.Map) {
  const imageId = "ageis-home";
  if (map.hasImage(imageId)) return;

  // Simple home icon (monochrome) added as SDF so `icon-color` works.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 11l9-8 9 8"/>
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>
    </svg>
  `.trim();

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  // Mapbox expects image pixels; load the SVG into an Image and add it.
  const img = new Image();
  img.onload = () => {
    try {
      if (!map.hasImage(imageId)) {
        map.addImage(imageId, img, { sdf: true });
      }
    } catch {
      // Style may have changed between load and addImage.
    }
  };
  img.src = url;
}

function featureCollectionBounds(
  collection: GeoJSON.FeatureCollection
): mapboxgl.LngLatBoundsLike | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const feature of collection.features) {
    if (feature.geometry?.type !== "Point") continue;
    const coords = feature.geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;

    const [lng, lat] = coords as number[];
    if (typeof lng !== "number" || typeof lat !== "number") continue;

    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  if (!Number.isFinite(minLng)) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

