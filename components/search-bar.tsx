"use client";

import { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

type SearchSuggestion = {
  id: string;
  kind: "local-city" | "local-barangay" | "mapbox";
  title: string;
  subtitle: string;
  lng: number;
  lat: number;
  zoom?: number;
  bbox?: [number, number, number, number];
};

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  isFocused: boolean;
  onFocusChange: (focused: boolean) => void;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  isDark: boolean;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function SearchBar({
  query,
  onQueryChange,
  isFocused,
  onFocusChange,
  suggestions,
  isLoading,
  onSuggestionSelect,
  isDark,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedQuery = query.trim();
  const visibleSuggestions = suggestions.slice(0, 10);
  const effectiveActiveIndex =
    visibleSuggestions.length === 0
      ? -1
      : activeIndex < 0
        ? -1
        : Math.min(activeIndex, visibleSuggestions.length - 1);

  const inputClass = cx(
    "h-10 w-full rounded-full border px-10 text-sm outline-none transition",
    isDark
      ? "border-white/10 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:border-white/20"
      : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-300"
  );

  const suggestionContainerClass = cx(
    "absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-xl",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  return (
    <div className="relative min-w-0 flex-1">
      <FiSearch
        className={cx(
          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
          isDark ? "text-neutral-500" : "text-neutral-500"
        )}
        aria-hidden="true"
      />
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => onFocusChange(true)}
        onBlur={() =>
          setTimeout(() => {
            onFocusChange(false);
          }, 160)
        }
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (visibleSuggestions.length === 0) return;
            setActiveIndex((current) => {
              const next = current < 0 ? 0 : current + 1;
              return next >= visibleSuggestions.length ? 0 : next;
            });
            return;
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (visibleSuggestions.length === 0) return;
            setActiveIndex((current) => {
              if (current < 0) return visibleSuggestions.length - 1;
              return current <= 0 ? visibleSuggestions.length - 1 : current - 1;
            });
            return;
          }

          if (e.key === "Escape") {
            onFocusChange(false);
            return;
          }

          if (e.key !== "Enter") return;
          if (visibleSuggestions.length === 0) return;
          e.preventDefault();
          const selected =
            effectiveActiveIndex >= 0
              ? visibleSuggestions[effectiveActiveIndex]
              : visibleSuggestions[0];
          if (selected) onSuggestionSelect(selected);
        }}
        placeholder="Search places"
        className={inputClass}
        aria-label="Search"
      />
      {query.length > 0 && (
        <button
          type="button"
          className={cx(
            "absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full",
            isDark ? "text-neutral-300 hover:bg-white/10" : "text-neutral-600 hover:bg-black/5"
          )}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setActiveIndex(-1);
            onQueryChange("");
          }}
          aria-label="Clear search"
        >
          <FiX className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {isFocused && normalizedQuery.length > 0 && (
        <div className={suggestionContainerClass}>
          {visibleSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              className={cx(
                "w-full border-b px-3 py-3 text-left transition last:border-b-0",
                isDark ? "border-white/5 hover:bg-white/5" : "border-neutral-100 hover:bg-black/5",
                index === effectiveActiveIndex && (isDark ? "bg-white/10" : "bg-black/5")
              )}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => onSuggestionSelect(suggestion)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                  {suggestion.title}
                </div>
                {suggestion.kind !== "mapbox" && (
                  <span className={cx("text-[10px] font-semibold uppercase", isDark ? "text-emerald-300" : "text-emerald-700")}>
                    Local
                  </span>
                )}
              </div>
              <div className={cx("text-xs", isDark ? "text-neutral-400" : "text-neutral-600")}>
                {suggestion.subtitle}
              </div>
            </button>
          ))}

          <div className={cx("px-3 py-2 text-xs", isDark ? "text-neutral-400" : "text-neutral-500")}>
            {isLoading
              ? "Searching..."
              : visibleSuggestions.length === 0
                ? "No results"
                : `${visibleSuggestions.length} result${visibleSuggestions.length === 1 ? "" : "s"}`}
          </div>
        </div>
      )}
    </div>
  );
}
