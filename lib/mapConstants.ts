export const POPUP_PROPERTY_KEYS = {
  TITLE: "name",
  DESCRIPTION: ["population", "place"] as const,
} as const;

export type StyleLayer = {
  id: string;
  type: string;
};

export type LayerCategory = {
  name: string;
  layers: string[];
};

export const LAYER_CATEGORIES: LayerCategory[] = [
  {
    name: "Hazards",
    layers: [
      "active fault",
      "landslide-bukidnon",
      "Camiguin",
      "Lanao",
      "Misamis Oriental",
      "Misamis Occidental",
    ],
  },
  {
    name: "Transportation",
    layers: ["road", "traffic"],
  },
  {
    name: "Infrastructure",
    layers: ["building", "Schools", "education facilities"],
  },
  {
    name: "Population",
    layers: ["populated areas"],
  },
  {
    name: "Environment",
    layers: ["landuse"],
  },
];
