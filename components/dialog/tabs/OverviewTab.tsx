"use client";

import { FC } from "react";
import SectionHeader from "../shared/SectionHeader";
import type { IncomeData } from "../types";

interface OverviewTabProps {
  locationAddress: string | null;
  riskScore: number;
  hazardData: {
    faultDistance: number | null;
    floodDistance: number | null;
    landslideIntensity: number | null;
    volcanoCount: number;
    activeVolcanoes: Array<{ name: string; distanceKm: number; risk: number }>;
  };
  incomeData: IncomeData | null;
  aiSummary: string;
}

export const OverviewTab: FC<OverviewTabProps> = ({
  locationAddress,
  riskScore,
  incomeData,
  aiSummary,
}) => {

  return (
    <div className="p-5 space-y-5">
      {/* Location / Address */}
      {incomeData && (
        <div className="text-center pb-2 border-b border-gray-100">
          <SectionHeader title="Location" />
          <p className="text-2xl font-black text-[#0F3A64] leading-tight tracking-tight">
            {incomeData.location.replace(" (Provincial)", "")}
          </p>
          {incomeData.location.includes("(Provincial)") && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0F3A64] bg-[#0F3A64]/10 px-3 py-0.75 rounded-full border border-[#0F3A64]/20 mt-1.5">
              Provincial / Municipality Economy
            </span>
          )}
        </div>
      )}

      {/* Address line */}
      {locationAddress && (
        <div className="text-center pb-2">
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto line-clamp-2">
            {locationAddress}
          </p>
        </div>
      )}

      {/* Overall Risk Score */}
      <div className="flex flex-col items-center py-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Overall Risk Score</p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-black text-gray-900 tabular-nums">{riskScore}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">
              Score out of 100
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="flex items-end justify-center gap-8">
          <div className="text-center flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">
              Average Monthly Income
            </p>
            <p className="text-2xl font-black text-[#2FB290]">
              {incomeData ? `₱${(incomeData.avgIncome / 1000).toFixed(0)}k` : "N/A"}
            </p>
            {/* Sparkline could be added here */}
          </div>
          <div className="text-center flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">
              Income Growth (2021–2023)
            </p>
            <p className="text-2xl font-black text-[#2A94A0]">
              {incomeData ? `${incomeData.percentChange > 0 ? "+" : ""}${incomeData.percentChange.toFixed(1)}%` : "N/A"}
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">
              Income Inequality
            </p>
            <p className="text-2xl font-black text-[#70D2AE]">
              {incomeData ? `${incomeData.incomeInequality.toFixed(1)}×` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* AI Insight */}
      <div className="pt-2">
        <SectionHeader title="AI Insight" />
        {/* AI Summary could be a dedicated component */}
        <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm mt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">AI Summary Report</h4>
            <span className="text-xs text-gray-500">Auto-generated</span>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed">
            <p>{aiSummary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
