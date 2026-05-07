"use client";

import type { FC } from "react";

interface MiniBarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  height?: number;
  maxValue?: number;
}

export const MiniBarChart: FC<MiniBarChartProps> = ({ data, height = 32, maxValue }) => {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t transition-all duration-700 ease-out"
            style={{
              height: `${(d.value / max) * (height - 20)}px`,
              backgroundColor: d.color,
              opacity: 0.9,
              minHeight: "4px",
            }}
          />
          <span className="text-[10px] text-gray-600 uppercase tracking-wide font-semibold">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MiniBarChart;
