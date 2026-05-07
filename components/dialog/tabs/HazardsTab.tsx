"use client";

import type { FC } from "react";
import { formatDistance } from "@/lib/nearestFacility";
import { RiskBar } from "../shared/RiskBar";
import SectionHeader from "../shared/SectionHeader";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import type { HazardDataState } from "../types";

interface HazardsTabProps {
  hazardData: HazardDataState;
  isScanning?: boolean;
}

export const HazardsTab: FC<HazardsTabProps> = ({ hazardData, isScanning = false }) => {
  const { faultDistance, floodDistance, landslideIntensity, volcanoCount, activeVolcanoes } = hazardData;

  // Calculate scores
  const faultScore = faultDistance !== null ? Math.max(0, 100 - faultDistance * 100) : 0;
  const floodScore = floodDistance !== null ? Math.max(0, 100 - floodDistance * 50) : 0;
  const landslideScore = landslideIntensity !== null ? landslideIntensity : 0;
  const volcanoScore =
    volcanoCount > 0
      ? Math.min(
          100,
          (activeVolcanoes.reduce((a, v) => a + v.risk, 0) / activeVolcanoes.length) *
            (volcanoCount >= 3 ? 1.2 : 1)
        )
      : 0;
  const overallScore = Math.round((faultScore + floodScore + landslideScore + volcanoScore) / 4);

  if (isScanning) {
    return (
      <div className="p-5 space-y-4">
        <SectionHeader title="Hazard Risk Assessment" />
        <LoadingSpinner text="Scanning hazards..." />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <SectionHeader title="Hazard Risk Assessment" />

      {/* Overall Risk */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Overall Risk</span>
            <span
              className={`text-lg font-black ${
                overallScore >= 70
                  ? "text-red-600"
                  : overallScore >= 40
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {overallScore}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000"
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* Volcano Count Gauge */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative" style={{ width: 60, height: 60 }}>
            <svg width={60} height={60} className="transform -rotate-90" viewBox="0 0 60 60">
              <circle cx={30} cy={30} r={24} stroke="#e5e7eb30" strokeWidth={8} fill="none" />
              <circle
                cx={30}
                cy={30}
                r={24}
                stroke={volcanoCount >= 3 ? "#dc2626" : volcanoCount >= 1 ? "#f97316" : "#16a34a"}
                strokeWidth={8}
                fill="none"
                strokeDasharray={`${Math.min((volcanoCount / 5) * 150, 150)} 150`}
                strokeLinecap="round"
                className="transition-all duration-1000"
                opacity={0.85}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-lg font-black"
                style={{
                  color: volcanoCount >= 3 ? "#dc2626" : volcanoCount >= 1 ? "#f97316" : "#16a34a",
                }}
              >
                {volcanoCount}
              </span>
            </div>
          </div>
          <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
            Volcanoes ≤50km
          </span>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3" />

      {/* Individual Hazards */}
      <div className="space-y-4">
        {/* Active Fault */}
        <div className="group relative pl-3 border-l-2 border-red-100 hover:border-l-red-400 transition-colors">
          <RiskBar
            label="Active Fault"
            score={faultDistance !== null ? Math.max(0, 100 - faultDistance * 100) : 0}
            distance={
              faultDistance !== null ? formatDistance(faultDistance * 1000) : "N/A"
            }
          />
          <p className="text-[11px] text-gray-500 mt-1 ml-0.5 leading-relaxed">
            {faultDistance !== null
              ? faultDistance < 0.5
                ? `Within ${formatDistance(faultDistance * 1000)} of fault line`
                : `${formatDistance(faultDistance * 1000)} from nearest fault`
              : "No fault line data available"}
          </p>
        </div>

        {/* Flood Zone */}
        <div className="group relative pl-3 border-l-2 border-blue-100 hover:border-l-blue-400 transition-colors">
          <RiskBar
            label="Flood Zone"
            score={floodDistance !== null ? Math.max(0, 100 - floodDistance * 50) : 0}
            distance={floodDistance !== null ? formatDistance(floodDistance * 1000) : "N/A"}
          />
          <p className="text-[11px] text-gray-500 mt-1 ml-0.5 leading-relaxed">
            {floodDistance !== null
              ? floodDistance === 0
                ? "Within flood zone"
                : `${formatDistance(floodDistance * 1000)} from flood zone`
              : "No flood zone data available"}
          </p>
        </div>

        {/* Landslide Hazard */}
        <div className="group relative pl-3 border-l-2 border-yellow-100 hover:border-l-yellow-400 transition-colors">
          <RiskBar
            label="Landslide Hazard"
            score={landslideIntensity !== null ? landslideIntensity : 0}
            distance={landslideIntensity !== null ? `${landslideIntensity}% intensity` : "N/A"}
          />
          <p className="text-[11px] text-gray-500 mt-1 ml-0.5 leading-relaxed">
            {landslideIntensity !== null
              ? `Hazard intensity: ${landslideIntensity}%`
              : "No landslide data available"}
          </p>
        </div>
      </div>

      {/* Volcano List */}
      <div className="pt-3 pb-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-6 rounded-full bg-gradient-to-b from-[#f97316] to-[#dc2626]" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Active Volcanoes Within 50 km
          </p>
          <span className="ml-auto text-xs font-black text-[#dc2626] bg-red-50 px-2 py-1 rounded-sm border border-red-100">
            {volcanoCount} total
          </span>
        </div>

        {activeVolcanoes.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {activeVolcanoes.map((v, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#dc2626] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 truncate pr-2">
                        {v.name}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 flex-shrink-0">
                        {v.distanceKm.toFixed(0)} km
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${(1 - v.distanceKm / 80) * 100}%`,
                          background:
                            v.risk >= 70
                              ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                              : v.risk >= 40
                              ? 'linear-gradient(90deg, #f97316, #fb923c)'
                              : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-1">
                    <span
                      className={`text-[10px] font-black ${
                        v.risk >= 70
                          ? "text-red-600"
                          : v.risk >= 40
                          ? "text-orange-600"
                          : "text-yellow-600"
                      }`}
                    >
                      R{v.risk}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">risk</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  Average Volcano Risk
                </span>
                <span className="text-sm font-black text-[#f97316]">
                  {Math.round(activeVolcanoes.reduce((a, v) => a + v.risk, 0) / activeVolcanoes.length)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-orange-400 via-red-500 to-red-600"
                  style={{
                    width: `${activeVolcanoes.reduce((a, v) => a + v.risk, 0) / activeVolcanoes.length}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="No active volcanoes within 50 km radius" />
        )}
      </div>

      {/* Risk Scale */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-70 mt-2" />
        <div className="flex justify-between mt-2 text-[9px] text-gray-500 font-mono uppercase tracking-wide">
          <span>0</span>
          <span>Low 0–39</span>
          <span>Mod 40–69</span>
          <span>High 70+</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export default HazardsTab;
