"use client";

import { useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { PLACE_HIERARCHY } from "@/lib/placeConstants";

type PlaceSelection = {
  region: string | null;
  province: string | null;
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

export default function PlaceSelectorPanel({ barangayOptions, selectedPlace, onPlaceChange, isDark }: Props) {
  const regions = Object.keys(PLACE_HIERARCHY);

  const provinces = useMemo(() => {
    if (!selectedPlace.region) return [];
    return Object.keys(PLACE_HIERARCHY[selectedPlace.region as keyof typeof PLACE_HIERARCHY] || {});
  }, [selectedPlace.region]);

  const barangays = useMemo(() => {
    if (!selectedPlace.region || !selectedPlace.province) return barangayOptions;
    const ph = PLACE_HIERARCHY[selectedPlace.region as keyof typeof PLACE_HIERARCHY];
    if (!ph) return barangayOptions;
    return ph[selectedPlace.province as keyof typeof ph] || barangayOptions;
  }, [selectedPlace.region, selectedPlace.province, barangayOptions]);

  const selectClass = cx(
    "w-full rounded-lg border px-3 py-2 text-sm outline-none",
    isDark ? "border-white/10 bg-neutral-900 text-neutral-100" : "border-neutral-200 bg-white text-neutral-900"
  );

  const surfaceClass = cx(
    "rounded-xl border p-4 space-y-3",
    isDark ? "border-white/10 bg-neutral-900/50" : "border-neutral-200 bg-white"
  );

  return (
    <div className={surfaceClass}>
      <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
        Select Place
      </div>

      <div>
        <label className={cx("block text-xs font-semibold mb-1", isDark ? "text-neutral-300" : "text-neutral-700")}>
          Region
        </label>
        <select
          className={selectClass}
          value={selectedPlace.region || ""}
          onChange={(e) =>
            onPlaceChange({
              region: e.target.value || null,
              province: null,
              barangay: null,
            })
          }
        >
          <option value="">Choose region...</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {selectedPlace.region && (
        <div>
          <label className={cx("block text-xs font-semibold mb-1", isDark ? "text-neutral-300" : "text-neutral-700")}>
            Province
          </label>
          <select
            className={selectClass}
            value={selectedPlace.province || ""}
            onChange={(e) =>
              onPlaceChange({
                ...selectedPlace,
                province: e.target.value || null,
                barangay: null,
              })
            }
          >
            <option value="">Choose province...</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPlace.province && (
        <div>
          <label className={cx("block text-xs font-semibold mb-1", isDark ? "text-neutral-300" : "text-neutral-700")}>
            Barangay
          </label>
          <select
            className={selectClass}
            value={selectedPlace.barangay || ""}
            onChange={(e) =>
              onPlaceChange({
                ...selectedPlace,
                barangay: e.target.value || null,
              })
            }
          >
            <option value="">Choose barangay...</option>
            {barangays.map((barangay) => (
              <option key={barangay} value={barangay}>
                {barangay}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPlace.barangay && (
        <div className={cx("p-2 rounded text-sm", isDark ? "bg-white/5 text-neutral-300" : "bg-black/5 text-neutral-700")}>
          Selected: <span className="font-semibold">{selectedPlace.barangay}</span>
        </div>
      )}
    </div>
  );
}
