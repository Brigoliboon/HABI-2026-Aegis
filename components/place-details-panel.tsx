"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type BreakdownItem = {
  label: string;
  count: number;
};

export type PlaceDetails = {
  title: string;
  level: "region" | "province" | "municipality" | "barangay";
  households: number;
  avgMonthlyIncome: number | null;
  minMonthlyIncome: number | null;
  maxMonthlyIncome: number | null;
  avgFamilySize: number | null;
  totalSchoolAgeChildren: number;
  dateFrom: string | null;
  dateTo: string | null;
  riskBreakdown: BreakdownItem[];
  floodBreakdown: BreakdownItem[];
};

type Props = {
  hasSelection: boolean;
  loading: boolean;
  error: string | null;
  details: PlaceDetails | null;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
};

function statValue(value: number | null, formatter?: (v: number) => string) {
  if (value == null || !Number.isFinite(value)) return "--";
  return formatter ? formatter(value) : value.toLocaleString();
}

export default function PlaceDetailsPanel({
  hasSelection,
  loading,
  error,
  details,
  isCollapsed,
  onToggleCollapsed,
}: Props) {
  if (!hasSelection) return null;

  return (
    <>
      <aside
        className={`pointer-events-auto absolute inset-y-0 right-0 z-40 flex h-full w-[24rem] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-l border-neutral-200 bg-white shadow-2xl transition-transform duration-200 ease-out ${
          isCollapsed ? "translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-2 py-2">
          <div className="min-w-0 px-2">
            <div className="text-xs font-semibold text-neutral-500">Place details</div>
            <div className="mt-1 truncate text-sm font-semibold text-neutral-900">
              {details ? details.title : "Selected place"}
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="grid h-9 w-9 place-items-center rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            aria-label="Collapse place details panel"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto p-4">
          {loading && <div className="text-sm text-neutral-600">Loading place details...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && details && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-[11px] text-neutral-500">Households</div>
                  <div className="mt-1 text-xl font-semibold text-neutral-900">{details.households.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-[11px] text-neutral-500">Avg income</div>
                  <div className="mt-1 text-xl font-semibold text-neutral-900">
                    {statValue(details.avgMonthlyIncome, (v) => `PHP ${Math.round(v).toLocaleString()}`)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-3">
                <div className="text-[11px] text-neutral-500">Income range</div>
                <div className="mt-1 text-sm font-medium text-neutral-800">
                  {statValue(details.minMonthlyIncome, (v) => `PHP ${Math.round(v).toLocaleString()}`)} to{" "}
                  {statValue(details.maxMonthlyIncome, (v) => `PHP ${Math.round(v).toLocaleString()}`)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-[11px] text-neutral-500">Avg family size</div>
                  <div className="mt-1 text-sm font-medium text-neutral-800">{statValue(details.avgFamilySize, (v) => v.toFixed(2))}</div>
                </div>
                <div className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-[11px] text-neutral-500">School-age children</div>
                  <div className="mt-1 text-sm font-medium text-neutral-800">{details.totalSchoolAgeChildren.toLocaleString()}</div>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-3">
                <div className="text-[11px] text-neutral-500">Recorded date range</div>
                <div className="mt-1 text-sm font-medium text-neutral-800">
                  {(details.dateFrom ?? "--")} to {(details.dateTo ?? "--")}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-3">
                <div className="text-[11px] text-neutral-500">Risk levels</div>
                <div className="mt-2 space-y-1 text-sm text-neutral-800">
                  {details.riskBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-3">
                <div className="text-[11px] text-neutral-500">Flood risk</div>
                <div className="mt-2 space-y-1 text-sm text-neutral-800">
                  {details.floodBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!loading && !error && !details && (
            <div className="text-sm text-neutral-600">
              No records found for the selected place.
            </div>
          )}
        </div>
      </aside>

      {isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="pointer-events-auto absolute right-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-lg hover:bg-neutral-100"
          aria-label="Expand place details panel"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>
      )}
    </>
  );
}
