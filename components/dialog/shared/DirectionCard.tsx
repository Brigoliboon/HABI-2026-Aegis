"use client";

import type { FC } from "react";

interface DirectionCardProps {
  label: string;
  distance: number; // meters
  duration: number; // seconds
  steps?: Array<{ instruction: string }>;
  onShowRoute?: () => void;
  isShowing?: boolean;
  variant?: "walking" | "driving";
}

export const DirectionCard: FC<DirectionCardProps> = ({
  label,
  distance,
  duration,
  steps,
  onShowRoute,
  isShowing = false,
  variant = "walking",
}) => {
  const distanceKm = variant === "walking" ? distance / 100 : distance / 1000;
  const distanceDisplay =
    variant === "walking"
      ? `${Math.round(distanceKm) / 100} km`
      : `${Math.round(distanceKm) || 0} km`;
  const minutes = Math.round(duration / 60);

  const iconMap = {
    walking: "🚶",
    driving: "🚗",
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
          {iconMap[variant]} {label}
        </span>
      </div>
      <p className="text-sm font-bold text-gray-800">{distanceDisplay}</p>
      <p className="text-[10px] text-gray-500">{minutes} min</p>
      {steps?.[0]?.instruction && (
        <p className="text-[11px] text-gray-500 italic border-l-2 border-blue-200 pl-2.5 py-0.5 mt-1 line-clamp-1">
          {steps[0].instruction}
        </p>
      )}
      {onShowRoute && (
        <button
          onClick={onShowRoute}
          className={`w-full py-2 text-xs font-bold uppercase tracking-wider transition-all mt-2 ${
            isShowing
              ? "bg-blue-600 text-white"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          {isShowing ? "✓ Route Showing on Map" : "Show on Map"}
        </button>
      )}
    </div>
  );
};

export default DirectionCard;
