"use client";

import type { FC } from "react";

interface RiskBarProps {
  label: string;
  score: number;
  distance?: string;
  animate?: boolean;
}

export const RiskBar: FC<RiskBarProps> = ({ label, score, distance, animate = true }) => {
  const color = score >= 70 ? "#dc2626" : score >= 40 ? "#f59e0b" : "#16a34a";
  const level = score >= 70 ? "High" : score >= 40 ? "Moderate" : "Low";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">{label}</span>
          {distance && (
            <span className="text-[10px] text-gray-500 font-mono">{distance}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black" style={{ color }}>
            {score}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {level}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${animate ? "duration-1000 ease-out" : ""}`}
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default RiskBar;
