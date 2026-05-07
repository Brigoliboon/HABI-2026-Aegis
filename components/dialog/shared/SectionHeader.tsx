"use client";

import type { FC, ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  align?: "left" | "center";
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  align = "center",
}) => {
  const alignClass = align === "center" ? "text-center" : "text-left";

  return (
    <div className={`pb-2 border-b border-gray-100 ${alignClass}`}>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">{title}</p>
      {badge && <div className="flex justify-center mb-1">{badge}</div>}
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;
