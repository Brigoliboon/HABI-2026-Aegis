"use client";

import type { FC } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
}

export const Sparkline: FC<SparklineProps> = ({
  data,
  width = 100,
  height = 28,
  color = "#3b82f6",
  showDots = false,
}) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {showDots &&
        points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2}
            fill={color}
            opacity={i === points.length - 1 ? 1 : 0.4}
          />
        ))}
    </svg>
  );
};

export default Sparkline;
