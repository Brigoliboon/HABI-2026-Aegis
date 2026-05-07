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
    name: "Population",
    layers: ["Populated Areas"],
  },
  {
    name: "Infrastructures",
    layers: ["Schools", "Buildings"],
  },
  {
    name: "Transport Access",
    layers: ["Road", "Unpaved Road", "Traffic"],
  },
  {
    name: "Land Profile",
    layers: ["Land Use"],
  },
  {
    name: "Hazards",
    layers: [
      "Bukidnon Landslide",
      "Misamis Occidental Landslide",
      "Misamis Oriental Landslide",
      "Lanao Landslide",
      "Camiguin Landslide",
      "Active Fault",
      "volcanoes",
    ],
  },
];
