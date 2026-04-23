"use client";

import { FiX } from "react-icons/fi";

export type HouseholdFilters = {
  timeFrameStartYear: string;
  timeFrameEndYear: string;
  barangay: string;
  minMonthlyIncome: string;
  maxMonthlyIncome: string;
};

type Props = {
  filters: HouseholdFilters;
  onFiltersChange: (filters: HouseholdFilters) => void;
  yearOptions: string[];
  barangayOptions: string[];
  isOpen: boolean;
  onClose: () => void;
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
  yearOptions,
  barangayOptions,
  isOpen,
  onClose,
  isDark,
}: Props) {
  const selectClass = cx(
    "h-10 w-full rounded-lg border px-3 text-sm outline-none",
    isDark ? "border-white/10 bg-neutral-900 text-neutral-100" : "border-neutral-200 bg-white text-neutral-900"
  );

  const popoverPanelClass = cx(
    "mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl border p-3",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const clearAllFilters = () =>
    onFiltersChange({
      timeFrameStartYear: "",
      timeFrameEndYear: "",
      barangay: "",
      minMonthlyIncome: "",
      maxMonthlyIncome: "",
    });

  return (
    <div
      className={cx(
        "absolute right-0 top-full",
        "origin-top-right transition duration-200 ease-out",
        isOpen ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 -translate-y-1 scale-95"
      )}
      aria-hidden={!isOpen}
    >
      <div className={popoverPanelClass}>
        <div className="flex items-center justify-between gap-2">
          <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
            Filters
          </div>
          <button
            type="button"
            className={cx(
              "grid h-9 w-9 place-items-center rounded-lg border transition",
              isDark
                ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
            )}
            onClick={onClose}
            aria-label="Close filters"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <div className={cx("mb-1 text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              Time frame
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div
                  className={cx(
                    "mb-1 text-[11px] font-medium",
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  )}
                >
                  From
                </div>
                <select
                  className={selectClass}
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
                  <option value="">Any</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div
                  className={cx(
                    "mb-1 text-[11px] font-medium",
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  )}
                >
                  To
                </div>
                <select
                  className={selectClass}
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
                  <option value="">Any</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className={cx("mb-1 text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              Barangay
            </div>
            <select
              className={selectClass}
              value={filters.barangay}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  barangay: e.target.value,
                })
              }
              aria-label="Barangay"
            >
              <option value="">All barangays</option>
              {barangayOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className={cx("mb-1 text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              Monthly income range
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                className={selectClass}
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
                className={selectClass}
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

          <button
            type="button"
            className={cx(
              "flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
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
      </div>
    </div>
  );
}
