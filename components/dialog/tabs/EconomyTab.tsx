"use client";

import { FC } from "react";
import SectionHeader from "../shared/SectionHeader";
import EmptyState from "../shared/EmptyState";
import MiniBarChart from "../shared/MiniBarChart";
import type { IncomeData } from "../types";

interface EconomyTabProps {
  incomeData: IncomeData | null;
}

export const EconomyTab: FC<EconomyTabProps> = ({ incomeData }) => {
  if (!incomeData) {
    return (
      <div className="p-5 space-y-4">
        <SectionHeader title="Income Indicators" />
        <EmptyState title="Loading income data..." />
      </div>
    );
  }

  const cleanName = incomeData.location.replace(" (Provincial)", "");
  const isProvincial = incomeData.location.includes("(Provincial)");

  // ─── Poverty Assessment ───────────────────────────────────────────────────────
  const povertyScore = (() => {
    let score = 0;
    if (incomeData.avgIncome < 15000) score += 40; // Below poverty line threshold
    if (incomeData.lowestDecile < 8000) score += 30; // Very low bottom decile
    if (incomeData.percentChange < 0) score += 20; // Economic decline
    if (incomeData.incomeInequality > 8) score += 10; // High inequality
    return score;
  })();

  const isPoorProvince = povertyScore >= 50;

  return (
    <div className="p-5 space-y-6">
      {/* Section header */}
      <div className="text-center pb-2 border-b border-gray-100">
        <SectionHeader title="Income Indicators" />
        <div className="flex flex-col items-center gap-1.5 mt-1">
          <p className="text-2xl font-black text-[#0F3A64] leading-none tracking-tight">{cleanName}</p>
          {isProvincial && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0F3A64] bg-[#0F3A64]/10 px-3 py-0.75 rounded-full border border-[#0F3A64]/20">
              Provincial Economy
            </span>
          )}
        </div>
      </div>

      {/* Poverty Assessment Indicator */}
      {isPoorProvince && (
        <div className="flex justify-center">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 rounded-full border border-red-200">
            Poor Province
          </span>
        </div>
      )}

      {/* Data Source Attribution */}
      <div className="text-center">
        <span className="text-[10px] text-gray-400">
          Source:{" "}
          <a href="#licenses-psa-2023" className="text-[#2A94A0] hover:underline">
            Philippine Statistics Authority (PSA) 2023
          </a>
        </span>
      </div>

      {/* Income Metrics */}
      <div className="space-y-5">
        {/* Average Monthly Income */}
        <div className="pb-3 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Average Monthly Income
            </span>
            <span className="text-2xl font-black text-[#2FB290]">
              ₱{incomeData.avgIncome.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">Typical household earnings per month</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#70D2AE] to-[#2FB290] rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((incomeData.avgIncome / 50000) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-mono">
            <span>₱0</span>
            <span>₱25k</span>
            <span>₱50k</span>
          </div>
        </div>

        {/* Income Growth */}
        <div className="pb-3 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Income Growth (2021–2023)
            </span>
            <span
              className={`text-2xl font-black ${incomeData.percentChange > 0 ? "text-[#2FB290]" : "text-red-600"}`}
            >
              {incomeData.percentChange > 0 ? "+" : ""}
              {incomeData.percentChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">How fast wages changed over 2 years</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                incomeData.percentChange >= 0
                  ? "bg-gradient-to-r from-[#2A94A0] to-[#2FB290]"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}
              style={{ width: `${Math.min(Math.abs(incomeData.percentChange) * 2, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-mono">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Income Inequality */}
        <div className="pb-3 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Income Inequality
            </span>
            <span className="text-2xl font-black text-[#70D2AE]">
              {incomeData.incomeInequality.toFixed(1)}×
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">Gap between richest and poorest households</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-[#2FB290] to-[#70D2AE] rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(incomeData.incomeInequality * 10, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-mono">
            <span>1×</span>
            <span>5×</span>
            <span>10×</span>
          </div>
        </div>

        {/* Income Range */}
        <div className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Income Range</span>
            <span className="text-base font-bold text-gray-700">
              ₱{incomeData.lowestDecile.toLocaleString()} – ₱{incomeData.highestDecile.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">Poorest to richest households</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0F3A64] via-[#2A94A0] to-[#70D2AE] rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((incomeData.highestDecile / 100000) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-mono">
            <span>₱0</span>
            <span>₱50k</span>
            <span>₱100k</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Income Distribution Chart */}
      <div className="pt-2">
        <SectionHeader title="Income Distribution" subtitle="How income is spread across households" />
        <MiniBarChart
          data={[
            { label: "Low", value: incomeData.lowestDecile / 1000, color: "#2A94A0" },
            { label: "Avg", value: incomeData.avgIncome / 1000, color: "#2FB290" },
            { label: "High", value: incomeData.highestDecile / 1000, color: "#70D2AE" },
          ]}
          height={56}
        />
      </div>
    </div>
  );
};

export default EconomyTab;
