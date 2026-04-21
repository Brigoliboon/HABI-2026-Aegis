// Place hierarchy: region -> province -> barangay
export type PlaceHierarchy = {
  [region: string]: {
    [province: string]: string[];
  };
};

export const PLACE_HIERARCHY: PlaceHierarchy = {
  "Region IX": {
    "Zamboanga del Sur": [
      "Barangay 1",
      "Barangay 2",
      "Barangay 3",
    ],
    "Zamboanga del Norte": [
      "Barangay A",
      "Barangay B",
    ],
  },
  "Region X": {
    Misamis: ["Brgy X-1", "Brgy X-2"],
    Agusan: ["Brgy Y-1"],
  },
};
