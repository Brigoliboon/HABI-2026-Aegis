"use client";

type AnalyticsData = {
  total: number;
  avgIncome: number | null;
  highRisk: number;
  topBarangays: Array<[string, number]>;
};

type Props = {
  analytics: AnalyticsData;
  isDark: boolean;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AnalyticsPanel({ analytics, isDark }: Props) {
  const surfaceClass = cx(
    "rounded-xl border p-4",
    isDark ? "border-white/10 bg-neutral-900/50" : "border-neutral-200 bg-white"
  );

  const statCardClass = cx(
    "rounded-xl border p-3",
    isDark ? "border-white/10 bg-neutral-900/50" : "border-neutral-200 bg-white"
  );

  return (
    <div className={surfaceClass}>
      <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
        Analytics
      </div>

      <div className={cx("mt-1 text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
        Summary for the current filters.
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={statCardClass}>
          <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
            Households
          </div>
          <div className={cx("mt-1 text-2xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
            {analytics.total}
          </div>
        </div>

        <div className={statCardClass}>
          <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
            Avg monthly income
          </div>
          <div className={cx("mt-1 text-2xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
            {analytics.avgIncome == null ? "—" : analytics.avgIncome.toLocaleString()}
          </div>
        </div>

        <div className={statCardClass}>
          <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
            High risk
          </div>
          <div className={cx("mt-1 text-2xl font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
            {analytics.highRisk}
          </div>
        </div>

        <div className={statCardClass}>
          <div className={cx("text-xs font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
            Top barangays
          </div>
          <div className={cx("mt-1 space-y-1 text-sm", isDark ? "text-neutral-200" : "text-neutral-800")}>
            {analytics.topBarangays.length === 0 ? (
              <div className={cx("text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
                —
              </div>
            ) : (
              analytics.topBarangays.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between gap-2">
                  <div className="truncate">{name}</div>
                  <div className={cx("text-xs", isDark ? "text-neutral-400" : "text-neutral-600")}>
                    {count}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
