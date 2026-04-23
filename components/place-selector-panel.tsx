"use client";

import { useMemo } from "react";
import { FiFilter } from "react-icons/fi";
import { PLACE_HIERARCHY } from "@/lib/placeConstants";

type PlaceSelection = {
  region: string | null;
  province: string | null;
  municipality: string | null;
  barangay: string | null;
};

type Props = {
  barangayOptions: string[];
  selectedPlace: PlaceSelection;
  onPlaceChange: (place: PlaceSelection) => void;
  isDark: boolean;
  filterCount?: number;
  filtersCollapsed?: boolean;
  onOpenFilters?: () => void;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function PlaceSelectorPanel({
  barangayOptions,
  selectedPlace,
  onPlaceChange,
  isDark,
  filterCount = 0,
  filtersCollapsed = false,
  onOpenFilters,
}: Props) {
  const regions = Object.keys(PLACE_HIERARCHY);

  const provinces = useMemo(() => {
    if (!selectedPlace.region) return [];
    return Object.keys(PLACE_HIERARCHY[selectedPlace.region] || {});
  }, [selectedPlace.region]);

  const municipalities = useMemo(() => {
    if (!selectedPlace.region || !selectedPlace.province) return [];
    return Object.keys((PLACE_HIERARCHY[selectedPlace.region] || {})[selectedPlace.province] || {});
  }, [selectedPlace.region, selectedPlace.province]);

  const barangays = useMemo(() => {
    if (!selectedPlace.region || !selectedPlace.province || !selectedPlace.municipality) return barangayOptions;
    const data = ((PLACE_HIERARCHY[selectedPlace.region] || {})[selectedPlace.province] || {})[selectedPlace.municipality];
    return data || barangayOptions;
  }, [selectedPlace.region, selectedPlace.province, selectedPlace.municipality, barangayOptions]);

  const containerClass = cx(
    "flex flex-col rounded-xl px-4 py-2 border shadow-sm transition-colors",
    isDark
      ? "bg-neutral-900 border-white/10"
      : "bg-white border-neutral-200"
  );

  const labelClass = cx(
    "text-[10px] font-medium uppercase tracking-wider mb-0.5",
    isDark ? "text-neutral-400" : "text-neutral-500"
  );

  const selectClass = cx(
    "w-[130px] lg:w-[150px] appearance-none bg-transparent outline-none text-sm font-semibold cursor-pointer truncate",
    isDark ? "text-neutral-100" : "text-neutral-900"
  );

  return (
    <div className="flex flex-wrap items-center gap-3 relative z-30">
      <div className={containerClass}>
        <label className={labelClass}>Region</label>
        <select
          className={selectClass}
          value={selectedPlace.region || ""}
          onChange={(e) => onPlaceChange({ region: e.target.value || null, province: null, municipality: null, barangay: null })}
        >
          <option value="">Region</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className={containerClass}>
        <label className={labelClass}>Province</label>
        <select
          className={selectClass}
          value={selectedPlace.province || ""}
          onChange={(e) => onPlaceChange({ ...selectedPlace, province: e.target.value || null, municipality: null, barangay: null })}
          disabled={!selectedPlace.region}
        >
          <option value="">Province</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className={containerClass}>
        <label className={labelClass}>Municipality</label>
        <select
          className={selectClass}
          value={selectedPlace.municipality || ""}
          onChange={(e) => onPlaceChange({ ...selectedPlace, municipality: e.target.value || null, barangay: null })}
          disabled={!selectedPlace.province}
        >
          <option value="">Municipality</option>
          {municipalities.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className={containerClass}>
        <label className={labelClass}>Barangay</label>
        <select
          className={selectClass}
          value={selectedPlace.barangay || ""}
          onChange={(e) => onPlaceChange({ ...selectedPlace, barangay: e.target.value || null })}
          disabled={!selectedPlace.municipality && barangayOptions.length === 0}
        >
          <option value="">Barangay</option>
          {barangays.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        className={cx(
          "flex items-center justify-center gap-2 h-14 px-6 rounded-xl border shadow-sm transition font-semibold text-sm",
          isDark
            ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
            : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
        )}
        aria-expanded={!filtersCollapsed}
        aria-label={filtersCollapsed ? "Expand filters" : "Collapse filters"}
      >
        <FiFilter className="h-4 w-4" />
        Filters
        {filterCount > 0 && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
            {filterCount}
          </span>
        )}
      </button>
    </div>
  );
}
