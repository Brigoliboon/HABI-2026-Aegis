"use client";

import type { FC } from "react";

interface RiskGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showScore?: boolean;
  colorZones?: Array<{ max: number; color: string }>;
}

export const RiskGauge: FC<RiskGaugeProps> = ({
  value,
  size = 120,
  strokeWidth = 12,
  label,
  sublabel,
  showScore = true,
  colorZones = [
    { max: 39, color: "#16a34a" },
    { max: 69, color: "#f59e0b" },
    { max: 100, color: "#dc2626" },
  ],
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((360 - (value / 100) * 360) / 360) * circumference;

  const getColor = () => {
    for (const zone of colorZones) {
      if (value <= zone.max) return zone.color;
    }
    return colorZones[colorZones.length - 1].color;
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb30"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            opacity={0.8}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showScore && (
            <span className="text-3xl font-black tracking-tight" style={{ color }}>
              {Math.round(value)}
            </span>
          )}
          {label && (
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">
              {label}
            </span>
          )}
        </div>
      </div>
      {sublabel && <p className="text-xs text-gray-500 mt-1.5 font-medium">{sublabel}</p>}
    </div>
  );
};

export default RiskGauge;
