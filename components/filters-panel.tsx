"use client";

import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronDown, FiDollarSign, FiFilter, FiX } from "react-icons/fi";
import type { PlaceSelection } from "@/lib/places";

export type HouseholdFilters = {
  timeFrameStartYear: string;
  timeFrameEndYear: string;
  barangay: string;
  minMonthlyIncome: string;
  maxMonthlyIncome: string;
  riskLevel: string;
};

type Props = {
  filters: HouseholdFilters;
  onFiltersChange: (filters: HouseholdFilters) => void;
  selectedPlace: PlaceSelection;
  onPlaceChange: (place: PlaceSelection) => void;
  regions: string[];
  provinces: string[];
  municipalities: string[];
  barangays: string[];
  yearOptions: string[];
  activeCount: number;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  isDark: boolean;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function normalizeYearRange(next: Pick<HouseholdFilters, "timeFrameStartYear" | "timeFrameEndYear">): {
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

export default function FiltersPanel({
  filters,
  onFiltersChange,
  selectedPlace,
  onPlaceChange,
  regions,
  provinces,
  municipalities,
  barangays,
  yearOptions,
  activeCount,
  isCollapsed,
  onToggleCollapsed,
  isDark,
}: Props) {
  const [additionalCollapsed, setAdditionalCollapsed] = useState(false);
  const [expandedWidth, setExpandedWidth] = useState(672);
  const placeRowRef = useRef<HTMLDivElement | null>(null);
  const panelClass = cx(
    "overflow-hidden rounded-xl border shadow-lg transition-[width] duration-200 ease-out",
    isDark ? "bg-neutral-900 border-white/10" : "bg-white border-neutral-200"
  );

  const compactSelectClass = cx(
    "w-[102px] lg:w-[112px] appearance-none bg-transparent pr-5 text-xs font-semibold outline-none",
    isDark ? "text-neutral-100" : "text-neutral-900"
  );

  const compactFieldClass = cx(
    "relative flex h-10 flex-col justify-center rounded-lg border px-2 shadow-sm transition",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const expandedControlClass = cx(
    "h-8 w-full rounded-md border px-2 text-xs outline-none",
    isDark ? "border-white/10 bg-neutral-900 text-neutral-100" : "border-neutral-200 bg-white text-neutral-900"
  );

  const clearAllFilters = () => {
    onFiltersChange({
      timeFrameStartYear: "",
      timeFrameEndYear: "",
      barangay: "",
      minMonthlyIncome: "",
      maxMonthlyIncome: "",
      riskLevel: "",
    });
    onPlaceChange({ region: null, province: null, municipality: null, barangay: null });
  };

  useEffect(() => {
    if (isCollapsed) return;
    const row = placeRowRef.current;
    if (!row) return;

    const updateWidth = () => {
      // Use intrinsic content width (scrollWidth) to avoid feedback loops where
      // container width changes alter measured width continuously.
      const rowWidth = Math.ceil(row.scrollWidth);
      const next = Math.max(320, rowWidth + 20);
      setExpandedWidth((current) => (Math.abs(current - next) <= 1 ? current : next));
    };

    const scheduleUpdate = () => {
      updateWidth();
    };

    // Run after paint so we read settled layout for the expanded state.
    const frameId = requestAnimationFrame(scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isCollapsed]);

  return (
    <section
      className={panelClass}
      style={{
        width: isCollapsed ? 128 : expandedWidth,
        maxWidth: "calc(100vw - 2rem)",
      }}
      aria-label="Filters panel"
    >
      <div className={cx("flex items-center justify-between gap-2 border-b border-inherit", isCollapsed ? "px-2 py-2" : "px-3 py-2.5")}>
        <button
          type="button"
          className={cx("flex min-w-0 flex-1 items-center gap-2 text-left", isCollapsed && "justify-center")}
          onClick={onToggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-controls="filters-panel-body"
          aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
        >
          <FiFilter className={cx("h-5 w-5 shrink-0", isDark ? "text-neutral-300" : "text-neutral-700")} aria-hidden="true" />
          {isCollapsed ? (
            <span className={cx("text-sm font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              Filters
            </span>
          ) : (
            <>
              <h3 className={cx("font-semibold text-sm", isDark ? "text-white" : "text-neutral-900")}>Filters</h3>
              {activeCount > 0 && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  {activeCount}
                </span>
              )}
              <FiChevronDown className={cx("ml-auto h-4 w-4 shrink-0", isDark ? "text-neutral-400" : "text-neutral-500")} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div id="filters-panel-body" className="max-h-[360px] overflow-auto p-2.5">
          <div ref={placeRowRef} className="flex flex-wrap items-center gap-1.5 lg:gap-2">
            <div className={compactFieldClass}>
              <label className={cx("mb-0.5 text-[11px] font-medium", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Region
              </label>
              <select
                className={compactSelectClass}
                value={selectedPlace.region || ""}
                onChange={(e) => {
                  onPlaceChange({ region: e.target.value || null, province: null, municipality: null, barangay: null });
                  onFiltersChange({ ...filters, barangay: "" });
                }}
                aria-label="Region"
              >
                <option value="">All regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className={cx("pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-neutral-400" : "text-neutral-500")}
                aria-hidden="true"
              />
            </div>

            <div className={compactFieldClass}>
              <label className={cx("mb-0.5 text-[11px] font-medium", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Province
              </label>
              <select
                className={compactSelectClass}
                value={selectedPlace.province || ""}
                onChange={(e) => {
                  onPlaceChange({ ...selectedPlace, province: e.target.value || null, municipality: null, barangay: null });
                  onFiltersChange({ ...filters, barangay: "" });
                }}
                disabled={!selectedPlace.region}
                aria-label="Province"
              >
                <option value="">All provinces</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className={cx("pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-neutral-400" : "text-neutral-500")}
                aria-hidden="true"
              />
            </div>

            <div className={compactFieldClass}>
              <label className={cx("mb-0.5 text-[11px] font-medium", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Municipality
              </label>
              <select
                className={compactSelectClass}
                value={selectedPlace.municipality || ""}
                onChange={(e) => {
                  onPlaceChange({ ...selectedPlace, municipality: e.target.value || null, barangay: null });
                  onFiltersChange({ ...filters, barangay: "" });
                }}
                disabled={!selectedPlace.province}
                aria-label="Municipality"
              >
                <option value="">All municipalities</option>
                {municipalities.map((municipality) => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className={cx("pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-neutral-400" : "text-neutral-500")}
                aria-hidden="true"
              />
            </div>

            <div className={compactFieldClass}>
              <label className={cx("mb-0.5 text-[11px] font-medium", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Barangay
              </label>
              <select
                className={compactSelectClass}
                value={selectedPlace.barangay || ""}
                onChange={(e) => {
                  const barangay = e.target.value || null;
                  onPlaceChange({ ...selectedPlace, barangay });
                  onFiltersChange({ ...filters, barangay: barangay || "" });
                }}
                disabled={!selectedPlace.municipality && barangays.length === 0}
                aria-label="Barangay"
              >
                <option value="">All barangays</option>
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className={cx("pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-neutral-400" : "text-neutral-500")}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className={cx("mt-2 rounded-lg border", isDark ? "border-white/10" : "border-neutral-200")}>
            <div className={cx("border-b px-3 py-2", isDark ? "border-white/10" : "border-neutral-200")}>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-2 py-2 text-left"
              onClick={() => setAdditionalCollapsed((current) => !current)}
              aria-expanded={!additionalCollapsed}
              aria-controls="additional-filters"
            >
              <FiCalendar className={cx("h-4 w-4", isDark ? "text-neutral-400" : "text-neutral-500")} aria-hidden="true" />
              <span className={cx("text-[11px] font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
                Additional filters
              </span>
              <FiChevronDown
                className={cx(
                  "ml-auto h-4 w-4 transition-transform",
                  isDark ? "text-neutral-400" : "text-neutral-500",
                  additionalCollapsed ? "" : "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
            </div>

            {!additionalCollapsed && (
              <div id="additional-filters" className="space-y-3 p-2.5">
                <div className="space-y-3">
                  <div>
                    <div className={cx("mb-0.5 text-[11px] font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
                      Time frame
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        className={expandedControlClass}
                        value={filters.timeFrameStartYear}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            ...normalizeYearRange({
                              timeFrameStartYear: e.target.value,
                              timeFrameEndYear: filters.timeFrameEndYear,
                            }),
                          })
                        }
                        aria-label="Time frame from"
                      >
                        <option value="">From</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        className={expandedControlClass}
                        value={filters.timeFrameEndYear}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            ...normalizeYearRange({
                              timeFrameStartYear: filters.timeFrameStartYear,
                              timeFrameEndYear: e.target.value,
                            }),
                          })
                        }
                        aria-label="Time frame to"
                      >
                        <option value="">To</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className={cx("mb-0.5 flex items-center gap-1 text-[11px] font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
                      <FiDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
                      Monthly income range
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        className={expandedControlClass}
                        value={filters.minMonthlyIncome}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            minMonthlyIncome: e.target.value,
                          })
                        }
                        inputMode="numeric"
                        placeholder="Min"
                        aria-label="Minimum monthly income"
                      />
                      <input
                        className={expandedControlClass}
                        value={filters.maxMonthlyIncome}
                        onChange={(e) =>
                          onFiltersChange({
                            ...filters,
                            maxMonthlyIncome: e.target.value,
                          })
                        }
                        inputMode="numeric"
                        placeholder="Max"
                        aria-label="Maximum monthly income"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={cx("mb-0.5 block text-[10px] font-medium", isDark ? "text-neutral-400" : "text-neutral-600")}>
                      Risk level
                    </label>
                    <select
                      className={expandedControlClass}
                      value={filters.riskLevel}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          riskLevel: e.target.value,
                        })
                      }
                      aria-label="Risk level"
                    >
                      <option value="">Any</option>
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className={cx(
                    "flex w-full items-center justify-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition",
                    isDark
                      ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-white/5"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-black/5"
                  )}
                  onClick={clearAllFilters}
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                  <span>Clear filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
