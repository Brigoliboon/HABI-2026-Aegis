"use client";

import { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";

type OptionTabKey = "display" | "styling" | "export";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function OptionsPanel({ isOpen, onClose, isDark }: Props) {
  const [activeTab, setActiveTab] = useState<OptionTabKey>("display");

  const tabClass = (isActive: boolean) =>
    cx(
      "px-4 py-2 text-sm font-semibold border-b-2 transition",
      isActive
        ? isDark
          ? "border-white text-white"
          : "border-neutral-900 text-neutral-900"
        : isDark
          ? "border-transparent text-neutral-400 hover:text-neutral-200"
          : "border-transparent text-neutral-500 hover:text-neutral-700"
    );

  const panelClass = cx(
    "fixed right-0 top-0 h-screen bg-neutral-950 border-l border-white/10 shadow-lg transition-transform duration-200 ease-out w-96",
    isDark ? "bg-neutral-950 text-neutral-100" : "bg-white text-neutral-900",
    isOpen ? "translate-x-0" : "translate-x-full"
  );

  const contentClass = cx(
    "rounded-xl border p-4 space-y-3",
    isDark ? "border-white/10 bg-neutral-900/50" : "border-neutral-200 bg-white"
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} aria-hidden="true" />
      )}

      <div className={cx(panelClass, "z-40")}>
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <div className="text-sm font-semibold">Plot Options</div>
          <button
            type="button"
            className={cx(
              "grid h-9 w-9 place-items-center rounded-lg border transition",
              isDark
                ? "border-white/10 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
            )}
            onClick={onClose}
            aria-label="Close options"
          >
            <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex border-b border-white/10 px-4">
          <button
            type="button"
            className={tabClass(activeTab === "display")}
            onClick={() => setActiveTab("display")}
          >
            Display
          </button>
          <button
            type="button"
            className={tabClass(activeTab === "styling")}
            onClick={() => setActiveTab("styling")}
          >
            Styling
          </button>
          <button
            type="button"
            className={tabClass(activeTab === "export")}
            onClick={() => setActiveTab("export")}
          >
            Export
          </button>
        </div>

        <div className="overflow-auto h-[calc(100vh-120px)] px-4 py-4">
          {activeTab === "display" && (
            <div className={contentClass}>
              <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                Display Options
              </div>
              <p className={cx("text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Configure what data to display on the map.
              </p>
            </div>
          )}

          {activeTab === "styling" && (
            <div className={contentClass}>
              <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                Styling Options
              </div>
              <p className={cx("text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Customize colors, sizes, and appearance of map elements.
              </p>
            </div>
          )}

          {activeTab === "export" && (
            <div className={contentClass}>
              <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                Export Options
              </div>
              <p className={cx("text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Download map data or images in various formats.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
