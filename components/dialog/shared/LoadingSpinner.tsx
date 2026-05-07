"use client";

import type { FC } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = "md", text }) => {
  const sizeClass = {
    sm: "h-3 w-3 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-3",
  }[size];

  return (
    <div className="flex items-center gap-2 justify-center py-4">
      <div
        className={`animate-spin rounded-full border-blue-400 border-t-transparent ${sizeClass}`}
      />
      {text && <span className="text-xs text-gray-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
