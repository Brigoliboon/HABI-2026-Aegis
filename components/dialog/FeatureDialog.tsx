"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { LineString as GeoJSONLineString } from "geojson";
import { findIncomeData } from "@/lib/incomeLookup";
import { generateAISummary } from "@/lib/openrouter/client";
import { getFacilityName } from "@/lib/nearestFacility";
import type {
  FeatureDialogProps,
  IncomeData,
  DialogTab,
} from "./types";

// Hooks
import { useReverseGeocode } from "./hooks/useReverseGeocode";
import { useHazardScan } from "./hooks/useHazardScan";
import { useFacilityScan } from "./hooks/useFacilityScan";

// Tabs
import OverviewTab from "./tabs/OverviewTab";
import HazardsTab from "./tabs/HazardsTab";
import EconomyTab from "./tabs/EconomyTab";
import EducationTab from "./tabs/EducationTab";

// ─── Main Orchestrator ───────────────────────────────────────────────────
export default function FeatureDialog({
  isOpen,
  onClose,
  properties,
  titleKey = "name",
  position,
  mapRef,
  onShowRoute,
}: FeatureDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // ── Extract feature title ───────────────────────────────────────────────
  const getValue = useCallback((key: string): string => {
    const value = properties[key];
    if (typeof value === "string") return value;
    if (value == null) return "";
    return String(value);
  }, [properties]);

  const title = titleKey ? getValue(titleKey) : "";

  // ── Address (reverse geocode) ──────────────────────────────────────────
  const { address, geocode } = useReverseGeocode();

  // ── Income Data ─────────────────────────────────────────────────────────
  const incomeData = useMemo<IncomeData | null>(() => {
    if (!isOpen) return null;
    return findIncomeData(title, address);
  }, [isOpen, title, address]);

  // ── Hazard Scan ─────────────────────────────────────────────────────────
  const { data: hazardData, isScanning: hazardScanning } = useHazardScan(
    mapRef ?? null,
    position ?? null,
    isOpen
  );

  // ── Facility Scan ───────────────────────────────────────────────────────
  const {
    elementary,
    higherEd,
    directions,
    unpavedOverlap,
    isScanning: facilityScanning,
  } = useFacilityScan(mapRef ?? null, position ?? null, isOpen);

  // ── Derived state ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<DialogTab>("overview");
  const [aiSummary, setAiSummary] = useState<string>("Generating AI summary...");

  // ── Effects ─────────────────────────────────────────────────────────────
  // Fetch address on position change
  useEffect(() => {
    if (isOpen && position) {
      geocode(position.lng, position.lat);
    }
  }, [isOpen, position, geocode]);

  // Dialog lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) dialog.showModal();
    else dialog.close();
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate overall risk score for overview
  const riskScore =
    hazardData.faultDistance !== null ||
    hazardData.floodDistance !== null ||
    hazardData.landslideIntensity !== null
      ? Math.round(
          ((hazardData.faultDistance !== null ? Math.max(0, 100 - hazardData.faultDistance * 100) : 0) +
            (hazardData.floodDistance !== null ? Math.max(0, 100 - hazardData.floodDistance * 50) : 0) +
            (hazardData.landslideIntensity !== null ? hazardData.landslideIntensity : 0)) /
            3
        )
      : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleShowRoute = useCallback(
    (geometry: GeoJSONLineString, profile: "walking" | "driving") => {
      onShowRoute?.(geometry, profile);
    },
    [onShowRoute]
  );


  // ── Effects ─────────────────────────────────────────────────────────────
  // Fetch address on position change
  useEffect(() => {
    if (isOpen && position) {
      geocode(position.lng, position.lat);
    }
  }, [isOpen, position, geocode]);

  // Dialog lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) dialog.showModal();
    else dialog.close();
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // AI Summary generation
  useEffect(() => {
    if (!isOpen || !incomeData || !hazardData) return;

    const fetchAISummary = async () => {
      setAiSummary("Generating AI summary...");
      try {
        // Generate education summary text
        let educationInfo = "No education facilities data available.";
        if (elementary || higherEd) {
          const elementaryName = elementary?.facility ? getFacilityName(elementary.facility) : null;
          const higherEdName = higherEd?.facility ? getFacilityName(higherEd.facility) : null;

          const facilities = [];
          if (elementaryName) facilities.push(`nearest elementary school: ${elementaryName}`);
          if (higherEdName) facilities.push(`nearest higher education institution: ${higherEdName}`);

          const travelNotes = [];
          if (elementary && directions.walking && unpavedOverlap.walking) {
            travelNotes.push("walking route to elementary school may involve unpaved roads");
          }
          if (elementary && directions.driving && unpavedOverlap.driving) {
            travelNotes.push("driving route to elementary school may involve unpaved roads");
          }
          if (higherEd && directions.walking && unpavedOverlap.walking) {
            travelNotes.push("walking route to higher education facility may involve unpaved roads");
          }
          if (higherEd && directions.driving && unpavedOverlap.driving) {
            travelNotes.push("driving route to higher education facility may involve unpaved roads");
          }

          educationInfo = facilities.length > 0
            ? `Key education facilities include ${facilities.join(" and ")}.`
            : "No specific education facilities identified.";

          if (travelNotes.length > 0) {
            educationInfo += ` Travel considerations: ${travelNotes.join("; ")}.`;
          }
        }

        const summary = await generateAISummary({
          location: address?address:'',
          hazardData: {
            faultDistance: hazardData.faultDistance,
            floodDistance: hazardData.floodDistance,
            landslideIntensity: hazardData.landslideIntensity,
            volcanoCount: hazardData.volcanoCount,
            activeVolcanoes: hazardData.activeVolcanoes || [],
          },
          incomeData: {
            avgIncome: incomeData.avgIncome,
            percentChange: incomeData.percentChange,
            incomeInequality: incomeData.incomeInequality,
            lowestDecile: incomeData.lowestDecile,
            highestDecile: incomeData.highestDecile,
          },
          educationInfo,
        });
        setAiSummary(summary);
      } catch (error) {
        console.error("[FeatureDialog] AI summary error:", error);
        setAiSummary("AI summary currently unavailable. Please try again later.");
      }
    };

    fetchAISummary();
  }, [isOpen, incomeData, hazardData, elementary, higherEd, address, directions.walking, directions.driving, unpavedOverlap.walking, unpavedOverlap.driving]);


  // ── Render ───────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 m-auto border-0 bg-transparent p-0 shadow-none backdrop:fixed backdrop:inset-0"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const isInDialog =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (!isInDialog) onClose();
      }}
    >
      <div className="w-250 h-250 flex flex-col bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 bg-white/95 backdrop-blur flex-shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">{title}</h2>
            {incomeData && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
                  {incomeData.location.includes("(Provincial)") ? "Province / Region" : "Location"}
                </p>
                <p className="text-base font-bold text-[#0F3A64] leading-tight">
                  {incomeData.location.replace(" (Provincial)", "")}
                </p>
              </div>
            )}
            {address && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{address}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0 px-5 pt-0 bg-white flex-shrink-0 border-b border-gray-100">
          {(
            [
              { key: "overview", label: "Overview", color: "blue" },
              { key: "hazards", label: "Hazards", color: "red" },
              { key: "economy", label: "Economy", color: "green" },
              { key: "education", label: "Education", color: "purple" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all relative ${
                activeTab === tab.key ? `text-${tab.color}-600` : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className={`absolute bottom-0 left-2 right-2 h-0.5 bg-${tab.color}-600 rounded-full`} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1">
          {activeTab === "overview" && (
            <OverviewTab
              locationAddress={address}
              riskScore={riskScore}
              hazardData={hazardData}
              incomeData={incomeData}
              aiSummary={aiSummary}
            />
          )}

          {activeTab === "hazards" && (
            <HazardsTab hazardData={hazardData} isScanning={hazardScanning} />
          )}

          {activeTab === "economy" && <EconomyTab incomeData={incomeData} />}

          {activeTab === "education" && (
            <EducationTab
              elementary={elementary}
              higherEd={higherEd}
              elementaryDirections={directions}
              higherEdDirections={directions}
              unpavedOverlap={unpavedOverlap}
              onShowRoute={handleShowRoute}
              isScanning={facilityScanning}
            />
          )}
        </div>
      </div>
    </dialog>
  );
}
