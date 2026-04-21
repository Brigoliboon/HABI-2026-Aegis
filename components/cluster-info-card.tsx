"use client";

import { FiBarChart2, FiX } from "react-icons/fi";

export type ClusterSelection = {
  level: "city" | "barangay";
  title: string;
  households: number | null;
  avgIncome: number | null;
  highRisk: number | null;
  totalChildren: number | null;
  barangayCount: number | null;
};

type Props = {
  clusterInfo: ClusterSelection | null;
  isOpen: boolean;
  onClose: () => void;
  onViewAnalyticsClick?: () => void;
  isDark: boolean;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function ClusterInfoCard({
  clusterInfo,
  isOpen,
  onClose,
  onViewAnalyticsClick,
  isDark,
}: Props) {
  const floatingPanelClass = cx(
    "w-80 rounded-xl border p-3",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const statCardClass = cx(
    "rounded-xl border p-3",
    isDark ? "border-white/10 bg-neutral-900/50" : "border-neutral-200 bg-white"
  );

  if (!clusterInfo) return null;

  return (
    <div
      className={cx(
        "absolute right-4 top-20 z-20",
        "transition duration-200 ease-out",
        isOpen ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
      )}
    >
      <div className={cx(floatingPanelClass, "max-h-[calc(100vh-6rem)] overflow-auto")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div
              className={cx(
                "text-sm font-semibold",
                isDark ? "text-neutral-100" : "text-neutral-900"
              )}
            >
              Selected {clusterInfo.level === "city" ? "Municipality / City" : "Barangay"}
            </div>
            <div
              className={cx(
                "mt-1 truncate text-sm",
                isDark ? "text-neutral-200" : "text-neutral-800"
              )}
            >
              {clusterInfo.title}
            </div>
          </div>

          <button
            type="button"
            className={cx(
              "grid h-9 w-9 place-items-center rounded-lg border transition",
              isDark
                ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
            )}
            onClick={onClose}
            aria-label="Close info card"
            title="Close"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={statCardClass}>
            <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              Households
            </div>
            <div className={cx("mt-1 text-2xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
              {clusterInfo.households == null ? "—" : clusterInfo.households.toLocaleString()}
            </div>
          </div>

          {clusterInfo.level === "city" ? (
            <div className={statCardClass}>
              <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
                Barangays
              </div>
              <div className={cx("mt-1 text-2xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                {clusterInfo.barangayCount == null
                  ? "—"
                  : clusterInfo.barangayCount.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className={statCardClass}>
              <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
                High risk
              </div>
              <div className={cx("mt-1 text-2xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                {clusterInfo.highRisk == null ? "—" : clusterInfo.highRisk.toLocaleString()}
              </div>
            </div>
          )}

          <div className={statCardClass}>
            <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              Avg monthly income
            </div>
            <div className={cx("mt-1 text-2xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
              {clusterInfo.avgIncome == null ? "—" : clusterInfo.avgIncome.toLocaleString()}
            </div>
          </div>

          <div className={statCardClass}>
            <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              Total children
            </div>
            <div className={cx("mt-1 text-2xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
              {clusterInfo.totalChildren == null
                ? "—"
                : clusterInfo.totalChildren.toLocaleString()}
            </div>
          </div>
        </div>

        {clusterInfo.level === "city" && (
          <div className="mt-3">
            <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              High risk households
            </div>
            <div className={cx("mt-1 text-xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
              {clusterInfo.highRisk == null ? "—" : clusterInfo.highRisk.toLocaleString()}
            </div>
          </div>
        )}

        <button
          type="button"
          className={cx(
            "mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
            isDark
              ? "border-white/10 bg-neutral-950 text-neutral-200 hover:bg-white/5"
              : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
          )}
          onClick={onViewAnalyticsClick}
        >
          <FiBarChart2 className="h-4 w-4" aria-hidden="true" />
          <span>View analytics</span>
        </button>
      </div>
    </div>
  );
}
