// Place hierarchy: region -> province -> municipality -> barangay
export type PlaceHierarchy = {
  [region: string]: {
    [province: string]: {
      [municipality: string]: string[];
    };
  };
};

export const PLACE_HIERARCHY: PlaceHierarchy = {
  "Region IX": {
    "Zamboanga del Sur": {
      "Zamboanga City": ["Barangay 1", "Barangay 2", "Barangay 3"],
      "Pagadian City": ["Brgy Upper", "Brgy Lower"],
    },
    "Zamboanga del Norte": {
      "Dipolog City": ["Brgy Central", "Brgy North"],
    },
  },
  "Region X": {
    "Misamis Oriental": {
      "Cagayan de Oro City": ["Brgy 1", "Brgy 2", "Brgy 3"],
      "Gingoog City": ["Brgy A", "Brgy B"],
    },
    "Bukidnon": {
      "Malaybalay City": ["Brgy 1", "Brgy 2"],
    },
  },
};
