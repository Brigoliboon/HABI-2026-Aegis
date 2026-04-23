"use client";

import { FiChevronDown, FiEye, FiEyeOff, FiLayers, FiHome, FiUsers, FiMap, FiDroplet, FiMaximize2, FiAlertTriangle } from "react-icons/fi";

type StyleLayer = {
  id: string;
  type: string;
};

type Props = {
  styleLayers: StyleLayer[];
  activeStyleLayerIds: Set<string>;
  onActiveStyleLayerIdsChange: (ids: Set<string>) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  isDark: boolean;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function MapLayersPanel({
  styleLayers,
  activeStyleLayerIds,
  onActiveStyleLayerIdsChange,
  isCollapsed,
  onToggleCollapsed,
  isDark,
}: Props) {
  // Try to pick a relevant icon and color based on layer ID name
  const getIconAndColor = (id: string) => {
    const lLower = id.toLowerCase();
    if (lLower.includes("school") || lLower.includes("education")) return { icon: FiHome, bg: "bg-blue-500", text: "text-white" };
    if (lLower.includes("income") || lLower.includes("poverty")) return { icon: FiUsers, bg: "bg-orange-500", text: "text-white" };
    if (lLower.includes("distance")) return { icon: FiMap, bg: "bg-purple-500", text: "text-white" };
    if (lLower.includes("flood") || lLower.includes("water") || lLower.includes("hazard")) return { icon: FiDroplet, bg: "bg-blue-600", text: "text-white" };
    if (lLower.includes("road") || lLower.includes("transport")) return { icon: FiMaximize2, bg: "bg-gray-500", text: "text-white" };
    if (lLower.includes("population")) return { icon: FiUsers, bg: "bg-green-500", text: "text-white" };
    if (lLower.includes("dropout") || lLower.includes("risk")) return { icon: FiAlertTriangle, bg: "bg-red-500", text: "text-white" };
    return { icon: FiLayers, bg: "bg-blue-500", text: "text-white" };
  };

  return (
    <section className={cx(
      "overflow-hidden rounded-xl border shadow-lg transition-[width] duration-200 ease-out",
      isCollapsed ? "w-32" : "w-72",
      isDark ? "bg-neutral-900 border-white/10" : "bg-white border-neutral-200"
    )} aria-label="Map layers panel">
      <div className={cx("flex items-center justify-between gap-2 border-b border-inherit", isCollapsed ? "px-2 py-2" : "px-4 py-3")}>
        <button
          type="button"
          className={cx("flex min-w-0 flex-1 items-center gap-2 text-left", isCollapsed && "justify-center")}
          onClick={onToggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-controls="map-layers-panel-body"
          aria-label={isCollapsed ? "Expand map layers" : "Collapse map layers"}
        >
          <FiLayers className={cx("h-5 w-5 shrink-0", isDark ? "text-neutral-300" : "text-neutral-700")} aria-hidden="true" />
          {isCollapsed ? (
            <span className={cx("text-sm font-semibold", isDark ? "text-neutral-300" : "text-neutral-700")}>
              Layers
            </span>
          ) : (
            <>
              <h3 className={cx("font-semibold text-sm", isDark ? "text-white" : "text-neutral-900")}>Map Layers</h3>
              <FiChevronDown className={cx("ml-auto h-4 w-4 shrink-0", isDark ? "text-neutral-400" : "text-neutral-500")} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div id="map-layers-panel-body" className="max-h-[320px] overflow-auto p-2 py-3">
          {styleLayers.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-neutral-500">Loading layers...</div>
          ) : (
            <div className="space-y-1">
              {styleLayers.map((layer) => {
                const isActive = activeStyleLayerIds.has(layer.id);
                const { icon: Icon, bg, text } = getIconAndColor(layer.id);

                return (
                  <div key={layer.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded", bg, text)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={cx("truncate text-sm font-medium", isDark ? "text-neutral-200" : "text-neutral-700")}>
                        {layer.id}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Set(activeStyleLayerIds);
                          if (next.has(layer.id)) next.delete(layer.id);
                          else next.add(layer.id);
                          onActiveStyleLayerIdsChange(next);
                        }}
                        className={cx(
                          "relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          isActive ? "bg-blue-600" : isDark ? "bg-neutral-700" : "bg-neutral-200"
                        )}
                        aria-label={`${isActive ? "Hide" : "Show"} layer ${layer.id}`}
                        aria-pressed={isActive}
                      >
                        <span
                          className={cx(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            isActive ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>

                      <span className={cx("transition", isActive ? "text-blue-500" : isDark ? "text-neutral-500" : "text-neutral-400")}>
                        {isActive ? <FiEye className="h-4 w-4" aria-hidden="true" /> : <FiEyeOff className="h-4 w-4" aria-hidden="true" />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
