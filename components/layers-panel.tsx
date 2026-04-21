"use client";

import { FiCheck, FiLayers, FiX } from "react-icons/fi";

type LayerKey = "base" | "risk" | "income" | "education" | "children";

type LayerToggles = Record<LayerKey, boolean>;

type Props = {
  layers: LayerToggles;
  onLayerToggle: (key: LayerKey) => void;
  onClose: () => void;
  isDark: boolean;
};

const LAYER_ORDER: LayerKey[] = ["base", "risk", "income", "education", "children"];

const LAYER_LABELS: Record<LayerKey, string> = {
  base: "Households",
  risk: "Risk coloring",
  income: "Income heatmap",
  education: "Education heatmap",
  children: "Children heatmap",
};

const LAYER_DESCRIPTIONS: Record<LayerKey, string> = {
  base: "Clustered household points; click for details",
  risk: "Colors household icons by risk_level (requires Households)",
  income: "Heatmap weighted by monthly_income",
  education: "Heatmap weighted by education attainment",
  children: "Heatmap weighted by school_age_children",
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function LayersPanel({
  layers,
  onLayerToggle,
  onClose,
  isDark,
}: Props) {
  const floatingPanelClass = cx(
    "w-80 rounded-xl border p-3",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const layerRowClass = (enabled: boolean) =>
    cx(
      "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
      isDark
        ? "border-white/10 bg-neutral-900/50 hover:bg-white/5"
        : "border-neutral-200 bg-white hover:bg-black/5",
      enabled && (isDark ? "border-white/20 bg-white/10" : "border-neutral-300 bg-black/5")
    );

  const layerCheckboxClass = (enabled: boolean) =>
    cx(
      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border",
      isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white",
      enabled && (isDark ? "border-white/30 bg-white/10" : "border-neutral-400 bg-black/5")
    );

  return (
    <div className={floatingPanelClass}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FiLayers className="h-4 w-4" aria-hidden="true" />
          <span>Layers</span>
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
          aria-label="Close layers"
        >
          <FiX className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {LAYER_ORDER.map((key) => {
          const enabled = layers[key];
          return (
            <button
              key={key}
              type="button"
              className={layerRowClass(enabled)}
              onClick={() => onLayerToggle(key)}
              aria-pressed={enabled}
            >
              <div className={layerCheckboxClass(enabled)} aria-hidden="true">
                {enabled && <FiCheck className="h-4 w-4" aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <div
                  className={cx(
                    "text-sm font-semibold",
                    isDark ? "text-neutral-100" : "text-neutral-900"
                  )}
                >
                  {LAYER_LABELS[key]}
                </div>
                <div className={cx("mt-1 text-xs", isDark ? "text-neutral-400" : "text-neutral-600")}>
                  {LAYER_DESCRIPTIONS[key]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={cx("mt-3 text-xs", isDark ? "text-neutral-400" : "text-neutral-600")}>
        Toggle multiple layers to overlap them.
      </div>
    </div>
  );
}
