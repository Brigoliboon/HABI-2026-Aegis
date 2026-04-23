"use client";

import { useMemo } from "react";
import { FiMapPin } from "react-icons/fi";
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
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function PlaceSelectorPanel({
  barangayOptions,
  selectedPlace,
  onPlaceChange,
  isDark,
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

  const selectClass = cx(
    "h-9 min-w-[140px] px-3 rounded-lg text-sm outline-none border transition-colors shadow-sm",
    isDark
      ? "bg-neutral-900 border-white/20 text-neutral-100 hover:border-white/40 focus:border-green-500"
      : "bg-white border-neutral-300 text-neutral-900 hover:border-neutral-400 focus:border-green-600"
  );

  return (
    <div className="flex items-center gap-2">
      <div className={cx(
          "flex items-center justify-center p-2 rounded-lg text-green-700",
          isDark ? "bg-green-900/30 text-green-400" : "bg-green-100"
        )}>
        <FiMapPin className="h-4 w-4" />
      </div>
      <select
        className={selectClass}
        value={selectedPlace.region || ""}
        onChange={(e) => onPlaceChange({ region: e.target.value || null, province: null, municipality: null, barangay: null })}
      >
        <option value="">Select Region</option>
        {regions.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <select
        className={selectClass}
        value={selectedPlace.province || ""}
        onChange={(e) => onPlaceChange({ ...selectedPlace, province: e.target.value || null, municipality: null, barangay: null })}
        disabled={!selectedPlace.region}
      >
        <option value="">Select Province</option>
        {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <select
        className={selectClass}
        value={selectedPlace.municipality || ""}
        onChange={(e) => onPlaceChange({ ...selectedPlace, municipality: e.target.value || null, barangay: null })}
        disabled={!selectedPlace.province}
      >
        <option value="">Select Municipality</option>
        {municipalities.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      <select
        className={selectClass}
        value={selectedPlace.barangay || ""}
        onChange={(e) => onPlaceChange({ ...selectedPlace, barangay: e.target.value || null })}
        disabled={!selectedPlace.municipality && barangayOptions.length === 0}
      >
        <option value="">Select Barangay</option>
        {barangays.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
    </div>
  );
}
