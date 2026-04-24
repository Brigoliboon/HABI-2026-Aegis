import React from "react";

type Props = {
  summary?: string;
};

export default function AISummary({ summary }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">AI Summary Report</h4>
        <span className="text-xs text-gray-500">Auto-generated</span>
      </div>
      <div className="text-xs text-gray-700 leading-relaxed">
        {summary ? (
          <p>{summary}</p>
        ) : (
          <>
            <p className="mb-2">Summary unavailable. Example summary:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Overall risk: 34 — Moderate; priority: Fault mitigation.</li>
              <li>Nearby hazards: Flood (850m), Landslide (1.2km), Fault (320m).</li>
              <li>Recommended actions: community awareness, early warning checks.</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
