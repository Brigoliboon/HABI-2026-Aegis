export type MapLayerCategory = {
  name: string;
  layers: string[];
};

export const MAP_LAYER_CATEGORIES: MapLayerCategory[] = [
  {
    name: "Hazards",
    layers: [
      "Bukidnon Landslide",
      "Misamis Occidental Landslide",
      "Misamis Oriental Landslide",
      "Lanao Landslide",
      "Camiguin Landslide",
      "Active Fault",
    ],
  },
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
];

export const MAP_LAYER_IDS = {
  HAZARDS: {
    BUKIDNON_LANDSLIDE: "Bukidnon Landslide",
    MISAMIS_OCCIDENTAL_LANDSLIDE: "Misamis Occidental Landslide",
    MISAMIS_ORIENTAL_LANDSLIDE: "Misamis Oriental Landslide",
    LANAO_LANDSLIDE: "Lanao Landslide",
    CAMIGUIN_LANDSLIDE: "Camiguin Landslide",
    ACTIVE_FAULT: "Active Fault",
  },
  POPULATION: {
    POPULATED_AREAS: "Populated Areas",
  },
  INFRASTRUCTURES: {
    SCHOOLS: "Schools",
    BUILDINGS: "Buildings",
  },
  TRANSPORT_ACCESS: {
    ROAD: "Road",
    UNPAVED_ROAD: "Unpaved Road",
    TRAFFIC: "Traffic",
  },
  LAND_PROFILE: {
    LAND_USE: "Land Use",
  },
} as const;

export const ALL_MAP_LAYER_IDS = Object.values(MAP_LAYER_IDS).flatMap((category) =>
  Object.values(category)
);