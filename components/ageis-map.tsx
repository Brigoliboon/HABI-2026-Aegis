"use client";

import { useCallback, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MarkerData } from "@/types/locations";
import { LAYER_CATEGORIES, POPUP_PROPERTY_KEYS } from "@/lib/mapConstants";
import type { FeatureProperties } from "./FeatureDialog";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const STYLE = "mapbox://styles/boonjefferson/cmo5moe2k000n01rcahy17o82";

type StyleLayer = {
  id: string;
  type: string;
};

const STYLE_CATEGORY_LAYER_IDS = Array.from(
  new Set(LAYER_CATEGORIES.flatMap((c) => c.layers))
);

type Props = {
  mapStyle: string;
  selectedLocation: MarkerData | null;
  enableStyleLayerFeatures?: boolean;
  activeStyleLayerIds?: string[];
  onStyleLayersChange?: (layers: StyleLayer[], initiallyActiveLayerIds: string[]) => void;
  onViewportChange?: (viewport: {
    center: [number, number];
    bounds: { west: number; south: number; east: number; north: number };
    zoom: number;
  }) => void;
  onFeatureClick?: (properties: FeatureProperties, position: { lng: number; lat: number }) => void;
  onMapReady?: (map: mapboxgl.Map) => void;
};

export default function AGEISMap({
  mapStyle,
  selectedLocation,
  enableStyleLayerFeatures,
  activeStyleLayerIds,
  onStyleLayersChange,
  onViewportChange,
  onFeatureClick,
  onMapReady,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const lastStyleRef = useRef<string>(mapStyle);
  const enableStyleLayerFeaturesRef = useRef(Boolean(enableStyleLayerFeatures));
  const activeStyleLayerIdsRef = useRef<string[] | undefined>(activeStyleLayerIds);
  const onStyleLayersChangeRef = useRef<Props["onStyleLayersChange"]>(onStyleLayersChange);
  const styleLayerClickHandlersRef = useRef<
    Array<{ layerId: string; onClick: (e: mapboxgl.MapLayerMouseEvent) => void }>
  >([]);

  useEffect(() => {
    onStyleLayersChangeRef.current = onStyleLayersChange;
  }, [onStyleLayersChange]);

  const clearStyleLayerHandlers = useCallback((map: mapboxgl.Map) => {
    for (const handler of styleLayerClickHandlersRef.current) {
      map.off("click", handler.layerId, handler.onClick);
    }
    styleLayerClickHandlersRef.current = [];
  }, []);

  const applyCategorizedStyleLayerVisibility = useCallback(
    (map: mapboxgl.Map, activeIds: string[] | undefined) => {
      if (!enableStyleLayerFeaturesRef.current) return;
      if (!activeIds) return;

      const activeSet = new Set(activeIds);
      for (const layerId of STYLE_CATEGORY_LAYER_IDS) {
        if (!map.getLayer(layerId)) continue;
        map.setLayoutProperty(
          layerId,
          "visibility",
          activeSet.has(layerId) ? "visible" : "none"
        );
      }
    },
    []
  );

  const emitStyleLayers = useCallback((map: mapboxgl.Map) => {
    if (!enableStyleLayerFeaturesRef.current) return;

    const styleLayers = (map.getStyle().layers ?? []).map((layer) => ({
      id: layer.id,
      type: layer.type,
    }));

    const initiallyActive: string[] = [];
    for (const layerId of STYLE_CATEGORY_LAYER_IDS) {
      if (!map.getLayer(layerId)) continue;
      const vis = map.getLayoutProperty(layerId, "visibility");
      if (vis !== "none") initiallyActive.push(layerId);
    }

    onStyleLayersChangeRef.current?.(styleLayers, initiallyActive);
  }, []);

  const registerCategorizedStyleLayerPopups = useCallback(
    (map: mapboxgl.Map) => {
      clearStyleLayerHandlers(map);

      if (!enableStyleLayerFeaturesRef.current) return;

      for (const layerId of STYLE_CATEGORY_LAYER_IDS) {
        if (!map.getLayer(layerId)) continue;

        const onClick = (e: mapboxgl.MapLayerMouseEvent) => {
          const feature = e.features?.[0];
          if (!feature) return;
          if (feature.geometry?.type !== "Point") return;

          const coordsRaw = feature.geometry.coordinates;
          if (!Array.isArray(coordsRaw) || coordsRaw.length < 2) return;
          const lng = Number(coordsRaw[0]);
          const lat = Number(coordsRaw[1]);
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

          const props = (feature.properties ?? {}) as Record<string, unknown>;
          const titleRaw = props[POPUP_PROPERTY_KEYS.TITLE];
          const title =
            typeof titleRaw === "string"
              ? titleRaw
              : titleRaw == null
                ? ""
                : String(titleRaw);
          const populationRaw = props[POPUP_PROPERTY_KEYS.DESCRIPTION[0]];
          const population =
            typeof populationRaw === "string"
              ? populationRaw
              : populationRaw == null
                ? ""
                : String(populationRaw);
          const placeRaw = props[POPUP_PROPERTY_KEYS.DESCRIPTION[1]];
          const place =
            typeof placeRaw === "string"
              ? placeRaw
              : placeRaw == null
                ? ""
                : String(placeRaw);

          const hasContent = title.trim() || population.trim() || place.trim();
          if (!hasContent) return;

          if (onFeatureClick) {
            onFeatureClick(props, { lng, lat });
          } else {
            const container = document.createElement("div");
            container.style.color = "black";

            if (title.trim()) {
              const strong = document.createElement("strong");
              strong.textContent = title;
              container.appendChild(strong);
            }

            if (population.trim()) {
              const p = document.createElement("p");
              p.style.margin = "6px 0 0";
              p.textContent = `Population: ${population}`;
              container.appendChild(p);
            }

            if (place.trim()) {
              const p = document.createElement("p");
              p.style.margin = "6px 0 0";
              p.textContent = `Type: ${place}`;
              container.appendChild(p);
            }

            new mapboxgl.Popup()
              .setLngLat([lng, lat])
              .setDOMContent(container)
              .addTo(map);
          }
        };

        map.on("click", layerId, onClick);
        styleLayerClickHandlersRef.current.push({ layerId, onClick });
      }
    },
    [clearStyleLayerHandlers, onFeatureClick]
  );

  useEffect(() => {
    enableStyleLayerFeaturesRef.current = Boolean(enableStyleLayerFeatures);

    const map = mapRef.current;
    if (!map) return;

    if (!enableStyleLayerFeaturesRef.current) {
      clearStyleLayerHandlers(map);
      return;
    }

    emitStyleLayers(map);
    registerCategorizedStyleLayerPopups(map);
    applyCategorizedStyleLayerVisibility(map, activeStyleLayerIdsRef.current);
  }, [
    applyCategorizedStyleLayerVisibility,
    clearStyleLayerHandlers,
    emitStyleLayers,
    enableStyleLayerFeatures,
    registerCategorizedStyleLayerPopups,
  ]);

  useEffect(() => {
    activeStyleLayerIdsRef.current = activeStyleLayerIds;

    const map = mapRef.current;
    if (!map) return;

    applyCategorizedStyleLayerVisibility(map, activeStyleLayerIds);
  }, [activeStyleLayerIds, applyCategorizedStyleLayerVisibility]);

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

    map.on("load", () => {
      emitViewport();
      if (enableStyleLayerFeatures) {
        emitStyleLayers(map);
        registerCategorizedStyleLayerPopups(map);
        applyCategorizedStyleLayerVisibility(map, activeStyleLayerIdsRef.current);
      }
      onMapReady?.(map);
    });

    map.on("style.load", () => {
      if (enableStyleLayerFeatures) {
        emitStyleLayers(map);
        registerCategorizedStyleLayerPopups(map);
        applyCategorizedStyleLayerVisibility(map, activeStyleLayerIdsRef.current);
      }
    });

    map.on("moveend", () => {
      emitViewport();
    });

    map.on("mousemove", (e) => {
      const currentMap = mapRef.current;
      if (!currentMap) return;

      if (enableStyleLayerFeaturesRef.current) {
        const queryLayers = STYLE_CATEGORY_LAYER_IDS.filter((layerId) =>
          Boolean(currentMap.getLayer(layerId))
        );
        if (queryLayers.length > 0) {
          try {
            const styleFeatures = currentMap.queryRenderedFeatures(e.point, {
              layers: queryLayers,
            });
            currentMap.getCanvas().style.cursor =
              styleFeatures.length > 0 ? "pointer" : "";
            return;
          } catch {
            // ignore
          }
        }
      }

      currentMap.getCanvas().style.cursor = "";
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