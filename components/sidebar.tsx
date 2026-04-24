"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiFile,
  FiFilter,
  FiInfo,
  FiLock,
  FiMoon,
  FiSettings,
  FiSun,
  FiUsers,
  FiGrid,
  FiNavigation,
  FiMap,
} from "react-icons/fi";

import { FiCheck } from "react-icons/fi";
import AnalyticsPanel from "./analytics-panel";
import PlaceSelectorPanel from "./place-selector-panel";
import { MAP_LAYER_CATEGORIES, type MapLayerCategory } from "@/constants/MapLayers";

export const CATEGORY_ICONS: Record<MapLayerCategory["name"], typeof FiAlertTriangle> = {
  "Hazards": FiAlertTriangle,
  "Population": FiUsers,
  "Infrastructures": FiGrid,
  "Transport Access": FiNavigation,
  "Land Profile": FiMap,
};

type ViewKey = "filter" | "analytics" | "settings";

type ThemeMode = "dark" | "light";

type MapStyleOption = {
  id: string;
  label: string;
  styleUrl: string;
  preview: string;
};

type AnalyticsData = {
  total: number;
  avgIncome: number | null;
  highRisk: number;
  topBarangays: Array<[string, number]>;
};

type StyleLayer = {
  id: string;
  type: string;
};

type Props = {
  activeView: ViewKey;
  panelOpen: boolean;
  isDark: boolean;
  barangayOptions: string[];
  selectedPlace: { region: string | null; province: string | null; municipality: string | null; barangay: string | null };
  onPlaceChange: (place: { region: string | null; province: string | null; municipality: string | null; barangay: string | null }) => void;
  analytics: AnalyticsData;
  themeMode: ThemeMode;
  mapStyleId: MapStyleOption["id"];
  mapStyles: MapStyleOption[];
  onViewChange: (view: ViewKey) => void;
  onPanelToggle: (open: boolean) => void;
  onThemeChange: (mode: ThemeMode) => void;
  onMapStyleChange: (id: MapStyleOption["id"]) => void;
  styleLayers: StyleLayer[];
  activeStyleLayerIds: Set<string>;
  onActiveStyleLayerIdsChange: (ids: Set<string>) => void;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const railItems: Array<{ key: ViewKey; label: string; icon: typeof FiFilter }> = [
  { key: "filter", label: "Filter", icon: FiFilter },
  { key: "analytics", label: "Analytics", icon: FiBarChart2 },
  { key: "settings", label: "Settings", icon: FiSettings },
];

export default function Sidebar({
  activeView,
  panelOpen,
  isDark,
  barangayOptions,
  selectedPlace,
  onPlaceChange,
  analytics,
  themeMode,
  mapStyleId,
  mapStyles,
  onViewChange,
  onPanelToggle,
  onThemeChange,
  onMapStyleChange,
  styleLayers,
  activeStyleLayerIds,
  onActiveStyleLayerIdsChange,
}: Props) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (name: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const railClass = cx(
    "flex h-full w-20 flex-col items-center border-r py-4 z-20 shadow-md",
    "border-slate-800 bg-[#0f172a]" // Fixed dark blue theme
  );

  const railButtonClass = (isActive: boolean) =>
    cx(
      "group relative flex w-full flex-col items-center justify-center gap-1 py-3 transition",
      "text-slate-400 hover:text-white hover:bg-white/5",
      isActive && "text-white bg-white/10"
    );

  const labelClass = (isActive: boolean) =>
    cx(
      "text-[10px] font-medium tracking-wide transition-colors",
      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
    );

  const panelShellClass = cx(
    "flex h-full w-80 flex-col border-r shadow-lg relative z-10",
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

  return (
    <aside className="relative flex h-full z-20">
      <div className={railClass}>
        <nav className="flex w-full flex-1 flex-col gap-1">
          {railItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={cx(
                railButtonClass(activeView === key),
                "border-l-2 border-transparent",
                activeView === key && "border-blue-500" // active indicator
              )}
              onClick={() => {
                onViewChange(key);
                onPanelToggle(true);
              }}
            >
              <Icon className="h-5 w-5 mb-1" aria-hidden="true" />
              <span className={labelClass(activeView === key)}>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex w-full flex-col gap-1 border-t border-slate-800 pt-3">
          {/* Navigation Links */}
          <Link
            href="/about"
            className={railButtonClass(false)}
            aria-label="About"
          >
            <FiInfo className="h-5 w-5 mb-1" aria-hidden="true" />
            <span className={labelClass(false)}>About</span>
          </Link>
          <Link
            href="/licenses"
            className={railButtonClass(false)}
            aria-label="Licenses"
          >
            <FiFile className="h-5 w-5 mb-1" aria-hidden="true" />
            <span className={labelClass(false)}>Licenses</span>
          </Link>
          <Link
            href="/terms"
            className={railButtonClass(false)}
            aria-label="Terms"
          >
            <FiClipboard className="h-5 w-5 mb-1" aria-hidden="true" />
            <span className={labelClass(false)}>Terms</span>
          </Link>
          <Link
            href="/privacy"
            className={railButtonClass(false)}
            aria-label="Privacy"
          >
            <FiLock className="h-5 w-5 mb-1" aria-hidden="true" />
            <span className={labelClass(false)}>Privacy</span>
          </Link>

          <button
            type="button"
            className={cx(railButtonClass(false), "mt-2 bg-slate-800/50 hover:bg-slate-800")}
            onClick={() => onPanelToggle(!panelOpen)}
            aria-label={panelOpen ? "Collapse panel" : "Expand panel"}
          >
            {panelOpen ? (
              <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            )}
            <span className={labelClass(false)}>
              {panelOpen ? "Collapse" : "Expand"}
            </span>
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
              </div>

              <button
                type="button"
                className={cx(
                  "grid h-9 w-9 place-items-center rounded-lg border transition",
                  isDark
                    ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                    : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                )}
                onClick={() => onPanelToggle(false)}
                aria-label="Collapse panel"
              >
                <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-3 pb-3 space-y-3">
{activeView === "filter" && panelOpen && (
              <>
                <PlaceSelectorPanel
                  barangayOptions={barangayOptions}
                  selectedPlace={selectedPlace}
                  onPlaceChange={onPlaceChange}
                  isDark={isDark}
                />

                <div className="space-y-2">
                  <div
                    className={cx(
                      "text-xs font-semibold",
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    Map Layers
                  </div>

                  {styleLayers.length === 0 ? (
                    <div
                      className={cx(
                        "rounded-lg border p-3 text-center text-xs",
                        isDark ? "border-white/10 text-neutral-500" : "border-neutral-200 text-neutral-400"
                      )}
                    >
                      Loading layers...
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-full overflow-auto">
                      {MAP_LAYER_CATEGORIES.map((category) => {
                        const categoryLayers = styleLayers.filter((layer) =>
                          category.layers.includes(layer.id)
                        );
                        if (categoryLayers.length === 0) return null;
                        return (
                          <div key={category.name} className="space-y-1">
                            <button
                              type="button"
                              onClick={() => toggleCategory(category.name)}
                              className={cx(
                                "flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition",
                                isDark ? "text-neutral-400 hover:text-neutral-200" : "text-neutral-600 hover:text-neutral-800"
                              )}
                            >
                              {CATEGORY_ICONS[category.name] && (
                                <span className="flex items-center">
                                  {(() => {
                                    const Icon = CATEGORY_ICONS[category.name];
                                    return <Icon className="h-3.5 w-3.5" />;
                                  })()}
                                </span>
                              )}
                              <span className="flex-1 text-left">{category.name}</span>
                              <FiChevronDown
                                className={cx(
                                  "h-3 w-3 transition-transform",
                                  collapsedCategories.has(category.name) && "-rotate-90"
                                )}
                              />
                            </button>
                            {!collapsedCategories.has(category.name) && (
                              <div className="space-y-0.5">
                                {categoryLayers.map((layer) => {
                                  const isActive = activeStyleLayerIds.has(layer.id);
                                  return (
                                    <button
                                      key={layer.id}
                                      type="button"
                                      onClick={() => {
                                        const next = new Set(activeStyleLayerIds);
                                        if (next.has(layer.id)) next.delete(layer.id);
                                        else next.add(layer.id);
                                        onActiveStyleLayerIdsChange(next);
                                      }}
                                      className={cx(
                                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
                                        isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                                      )}
                                    >
                                      <div
                                        className={cx(
                                          "flex h-4 w-4 items-center justify-center rounded border",
                                          isActive
                                            ? isDark
                                              ? "border-white/30 bg-white/10"
                                              : "border-neutral-400 bg-black/5"
                                            : isDark
                                              ? "border-white/10"
                                              : "border-neutral-200"
                                        )}
                                      >
                                        {isActive && <FiCheck className="h-3 w-3" />}
                                      </div>
                                      <span
                                        className={cx(
                                          isDark ? "text-neutral-300" : "text-neutral-700"
                                        )}
                                      >
                                        {layer.id}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeView === "analytics" && panelOpen && (
              <>
                <PlaceSelectorPanel
                  barangayOptions={barangayOptions}
                  selectedPlace={selectedPlace}
                  onPlaceChange={onPlaceChange}
                  isDark={isDark}
                />
                {selectedPlace.barangay && (
                  <AnalyticsPanel analytics={analytics} isDark={isDark} />
                )}
              </>
            )}

            {activeView === "settings" && panelOpen && (
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
                          onClick={() => onThemeChange("light")}
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
                          onClick={() => onThemeChange("dark")}
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
                        onChange={(e) => onMapStyleChange(e.target.value as MapStyleOption["id"])}
                      >
                        {mapStyles.map((style) => (
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
  );
}