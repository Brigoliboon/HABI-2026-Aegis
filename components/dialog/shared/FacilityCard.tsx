"use client";

import type { FC } from "react";
import DirectionCard from "./DirectionCard";

interface FacilityCardProps {
  name: string;
  type: "elementary" | "higher-ed";
  walking: { distance: number; duration: number; steps?: Array<{ instruction: string }> } | null;
  driving: { distance: number; duration: number } | null;
  onShowWalkingRoute: () => void;
  onShowDrivingRoute?: () => void;
  isWalkingRouteShowing: boolean;
  isDrivingRouteShowing?: boolean;
}

export const FacilityCard: FC<FacilityCardProps> = ({
  name,
  type,
  walking,
  driving,
  onShowWalkingRoute,
  onShowDrivingRoute,
  isWalkingRouteShowing,
  isDrivingRouteShowing = false,
}) => {
  const typeLabels = {
    "elementary": "Elementary / Primary School",
    "higher-ed": "College / University",
  };
  const elementaryColors = {
    barColor: "bg-blue-500",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
  };
  const higherEdColors = {
    barColor: "bg-purple-500",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
  };
  const colors = type === "elementary" ? elementaryColors : higherEdColors;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-1.5 h-6 ${colors.barColor} rounded-full`} />
        <h4 className={`text-xs font-bold ${colors.textColor} uppercase tracking-wide`}>
          {typeLabels[type]}
        </h4>
      </div>

      {name ? (
        <div className="pl-3 space-y-3">
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Nearest Facility</p>
          </div>

          <div className="flex gap-4">
            <DirectionCard
              label="Walking"
              distance={walking?.distance || 0}
              duration={walking?.duration || 0}
              steps={walking?.steps}
              onShowRoute={onShowWalkingRoute}
              isShowing={isWalkingRouteShowing}
              variant="walking"
            />
            <div className="w-px bg-gray-100" />
            <DirectionCard
              label="Driving"
              distance={driving?.distance || 0}
              duration={driving?.duration || 0}
              onShowRoute={onShowDrivingRoute}
              isShowing={isDrivingRouteShowing}
              variant="driving"
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 pl-3">No facility found nearby</p>
      )}
    </div>
  );
};

export default FacilityCard;
