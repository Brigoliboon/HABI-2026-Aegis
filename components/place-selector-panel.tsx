"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronRight,
  FiMapPin,
  FiSearch,
  FiX,
} from "react-icons/fi";
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

const STEP_KEYS = ["region", "province", "municipality", "barangay"] as const;
const STEP_LABELS = ["Region", "Province", "Municipality", "Barangay"];

export default function PlaceSelectorPanel({
  barangayOptions,
  selectedPlace,
  onPlaceChange,
  isDark,
}: Props) {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const stepperRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const allOptions = step === 0 ? regions : step === 1 ? provinces : step === 2 ? municipalities : barangays;
  const filteredOptions = query.trim()
    ? allOptions.filter(opt => opt.toLowerCase().includes(query.toLowerCase()))
    : allOptions;

  const fullAddress = useMemo(() => {
    const parts: string[] = [];
    if (selectedPlace.barangay) parts.push(selectedPlace.barangay);
    if (selectedPlace.municipality) parts.push(selectedPlace.municipality);
    if (selectedPlace.province) parts.push(selectedPlace.province);
    if (selectedPlace.region) parts.push(selectedPlace.region);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [selectedPlace.region, selectedPlace.province, selectedPlace.municipality, selectedPlace.barangay]);

  useEffect(() => {
    const currentEl = stepRefs.current[step];
    if (currentEl && stepperRef.current) {
      currentEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [step]);

  const handleSelect = (value: string) => {
    const updates = { ...selectedPlace };
    if (step === 0) {
      updates.region = value;
      updates.province = null;
      updates.municipality = null;
      updates.barangay = null;
      setStep(1);
    } else if (step === 1) {
      updates.province = value;
      updates.municipality = null;
      updates.barangay = null;
      setStep(2);
    } else if (step === 2) {
      updates.municipality = value;
      updates.barangay = null;
      setStep(3);
    } else {
      updates.barangay = value;
    }
    setQuery("");
    onPlaceChange(updates);
  };

  const handleClear = () => {
    onPlaceChange({ region: null, province: null, municipality: null, barangay: null });
    setStep(0);
    setQuery("");
  };

  return (
    <div className="space-y-2">
      <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
        Place Filter
      </div>

      <div
        ref={stepperRef}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth no-scrollbar py-1"
      >
        {STEP_KEYS.map((key, idx) => {
          const value = selectedPlace[key];
          const isActive = idx <= step;
          const isCurrent = idx === step;
          
          return (
            <div
              key={key}
              ref={(el) => { stepRefs.current[idx] = el; }}
              className="flex items-center gap-2 shrink-0"
            >
              <div className={cx(
                "text-center text-xs font-semibold px-3 py-1.5 rounded whitespace-nowrap transition",
                isCurrent
                  ? isDark ? "bg-green-600 text-white" : "bg-green-600 text-white"
                  : isActive
                    ? isDark ? "bg-white/10 text-neutral-300" : "bg-neutral-200 text-neutral-700"
                    : isDark ? "bg-neutral-800 text-neutral-500" : "bg-neutral-100 text-neutral-400"
              )}>
                {STEP_LABELS[idx]}
              </div>
              {idx < 3 && (
                <FiChevronRight className={cx("h-3 w-3 shrink-0", isDark ? "text-neutral-600" : "text-neutral-400")} />
              )}
            </div>
          );
        })}
      </div>

      <div>
        {step <= 3 && (
          <div className="space-y-1">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${STEP_LABELS[step]}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={cx(
                  "w-full px-3 py-2 text-sm outline-none",
                  isDark
                    ? "bg-neutral-900 text-neutral-100 placeholder-neutral-500 border border-white/10"
                    : "bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-200"
                )}
              />
              <FiSearch className={cx("absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4", isDark ? "text-neutral-500" : "text-neutral-400")} />
            </div>
            <div className={cx(
              "max-h-40 overflow-auto",
              isDark ? "bg-neutral-900 border border-white/10" : "bg-white border border-neutral-200"
            )}>
              {filteredOptions.length === 0 ? (
                <div className={cx("p-3 text-center text-xs", isDark ? "text-neutral-500" : "text-neutral-400")}>
                  No results
                </div>
              ) : (
                filteredOptions.map((opt: string) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cx(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition",
                      isDark ? "text-neutral-300 hover:bg-white/5" : "text-neutral-700 hover:bg-black/5"
                    )}
                  >
                    <FiChevronRight className="h-3 w-3" />
                    {opt}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleClear}
        className={cx("flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold transition", isDark ? "text-neutral-400 hover:text-neutral-200" : "text-neutral-600 hover:text-neutral-800")}
      >
        <FiX className="h-4 w-4" />
        Clear
      </button>
      {fullAddress && (
        <div className={cx("flex items-start gap-2 p-2", isDark ? "bg-white/5" : "bg-neutral-50")}>
          <FiMapPin className={cx("mt-0.5 h-4 w-4 shrink-0", isDark ? "text-neutral-400" : "text-neutral-500")} />
          <div className={cx("text-sm font-semibold", isDark ? "text-neutral-200" : "text-neutral-800")}>
            {fullAddress}
          </div>
        </div>
      )}
    </div>
  );
}