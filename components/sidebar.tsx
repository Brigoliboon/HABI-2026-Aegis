"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FiBarChart2,
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
} from "react-icons/fi";

import { FiCheck } from "react-icons/fi";
import AnalyticsPanel from "./analytics-panel";
import PlaceSelectorPanel from "./place-selector-panel";

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
  const railClass = cx(
    "flex h-full w-16 flex-col items-center border-r px-2 py-3",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const railButtonClass = (isActive: boolean) =>
    cx(
      "group relative grid h-11 w-11 flex-col place-items-center justify-center rounded-lg transition",
      isDark ? "text-neutral-200 hover:bg-white/5" : "text-neutral-700 hover:bg-black/5",
      isActive && (isDark ? "bg-white/10" : "bg-black/10")
    );

  const labelClass = (isActive: boolean) =>
    cx(
      "mt-1 truncate text-center text-[10px] font-medium transition",
      isActive && (isDark ? "text-neutral-100" : "text-neutral-900")
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

  return (
    <aside className="absolute left-0 top-0 z-10 flex h-full">
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
        </div>

        <nav className="mt-4 flex w-full flex-1 flex-col items-center gap-2">
          {railItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={cx(
                railButtonClass(activeView === key),
                "group relative"
              )}
              onClick={() => {
                onViewChange(key);
                onPanelToggle(true);
              }}
            >
              <span className="sr-only">{label}</span>
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span
                className={cx(
                  labelClass(activeView === key),
                  "opacity-0 group-hover:opacity-100",
                  activeView !== key && (isDark ? "text-neutral-400" : "text-neutral-600")
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex w-full flex-col items-center gap-2">
          {/* Navigation Links */}
          <Link
            href="/about"
            className={cx(railButtonClass(false), "group relative")}
            aria-label="About"
          >
            <FiInfo className="h-5 w-5" aria-hidden="true" />
            <span className={cx(labelClass(false), "opacity-0 group-hover:opacity-100", isDark ? "text-neutral-400" : "text-neutral-600")}>
              About
            </span>
          </Link>
          <Link
            href="/licenses"
            className={cx(railButtonClass(false), "group relative")}
            aria-label="Licenses"
          >
            <FiFile className="h-5 w-5" aria-hidden="true" />
            <span className={cx(labelClass(false), "opacity-0 group-hover:opacity-100", isDark ? "text-neutral-400" : "text-neutral-600")}>
              Licenses
            </span>
          </Link>
          <Link
            href="/terms"
            className={cx(railButtonClass(false), "group relative")}
            aria-label="Terms"
          >
            <FiClipboard className="h-5 w-5" aria-hidden="true" />
            <span className={cx(labelClass(false), "opacity-0 group-hover:opacity-100", isDark ? "text-neutral-400" : "text-neutral-600")}>
              Terms
            </span>
          </Link>
          <Link
            href="/privacy"
            className={cx(railButtonClass(false), "group relative")}
            aria-label="Privacy"
          >
            <FiLock className="h-5 w-5" aria-hidden="true" />
            <span className={cx(labelClass(false), "opacity-0 group-hover:opacity-100", isDark ? "text-neutral-400" : "text-neutral-600")}>
              Privacy
            </span>
          </Link>

          <button
            type="button"
            className={cx(
              railButtonClass(false),
              "group relative"
            )}
            onClick={() => onPanelToggle(!panelOpen)}
            aria-label={panelOpen ? "Collapse panel" : "Expand panel"}
          >
            {panelOpen ? (
              <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            )}
            <span
              className={cx(
                labelClass(false),
                "opacity-0 group-hover:opacity-100",
                isDark ? "text-neutral-400" : "text-neutral-600"
              )}
            >
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
                    <div className="space-y-1 max-h-full overflow-auto">
                      {styleLayers.map((layer) => {
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