"use client";

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
  const normalizedQuery = query.trim();

  const inputClass = cx(
    "h-10 w-full rounded-full border px-10 text-sm outline-none transition",
    isDark
      ? "border-white/10 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:border-white/20"
      : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-300"
  );

  const suggestionContainerClass = cx(
    "mt-2 overflow-hidden rounded-xl border",
    isDark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white"
  );

  const suggestionRowClass = cx(
    "w-full border-b px-3 py-3 text-left transition last:border-b-0",
    isDark
      ? "border-white/5 hover:bg-white/5"
      : "border-neutral-100 hover:bg-black/5"
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
          }, 150)
        }
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          if (suggestions.length === 0) return;
          e.preventDefault();
          onSuggestionSelect(suggestions[0]);
        }}
        placeholder="Search the map"
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
          onClick={() => onQueryChange("")}
          aria-label="Clear search"
        >
          <FiX className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {isFocused && normalizedQuery.length > 0 && (
        <div className={suggestionContainerClass}>
          {suggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className={suggestionRowClass}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSuggestionSelect(suggestion)}
            >
              <div className={cx("text-sm font-semibold", isDark ? "text-neutral-100" : "text-neutral-900")}>
                {suggestion.title}
              </div>
              <div className={cx("text-xs", isDark ? "text-neutral-400" : "text-neutral-600")}>
                {suggestion.subtitle}
              </div>
            </button>
          ))}

          <div className={cx("px-3 py-2 text-xs", isDark ? "text-neutral-400" : "text-neutral-500")}>
            {isLoading
              ? "Searching…"
              : normalizedQuery.length < 2
                ? "Type at least 2 characters"
                : suggestions.length === 0
                  ? "No results"
                  : `${suggestions.length} result${suggestions.length === 1 ? "" : "s"}`}
          </div>
        </div>
      )}
    </div>
  );
}
