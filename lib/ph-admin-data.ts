import rawRegions from "@/data/places/ph-regions.raw.json";
import rawProvinces from "@/data/places/ph-provinces.raw.json";
import {
  buildPlaceSelectionQuery,
  formatBarangayLabel,
  formatMunicipalityLabel,
  formatProvinceLabel,
  formatRegionLabel,
  type PlaceHierarchyData,
} from "@/lib/ph-admin";
import { getSelectionKey, type PlaceSelection } from "@/lib/places";

type RawRegion = {
  name: string;
  provinces: string[];
};

type RawProvinceRecord = {
  municipalities?: Record<
    string,
    {
      barangays?: string[];
    }
  >;
};

type RawProvinceMap = Record<string, RawProvinceRecord>;

const regions = rawRegions as RawRegion[];
const provinces = rawProvinces as RawProvinceMap;

function sortLabels(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

function buildPlaceHierarchy(): PlaceHierarchyData {
  const regionLabels: string[] = [];
  const provincesByRegion: Record<string, string[]> = {};
  const municipalitiesByRegionProvince: Record<string, string[]> = {};
  const barangaysByRegionProvinceMunicipality: Record<string, string[]> = {};

  for (const region of regions) {
    const regionLabel = formatRegionLabel(region.name);
    regionLabels.push(regionLabel);

    const provinceLabels = sortLabels(region.provinces.map((province) => formatProvinceLabel(province)));
    provincesByRegion[regionLabel] = provinceLabels;

    for (const rawProvince of region.provinces) {
      const provinceLabel = formatProvinceLabel(rawProvince);
      const provinceData = provinces[rawProvince];
      const municipalities = Object.keys(provinceData?.municipalities ?? {});
      const municipalityLabels = sortLabels(
        municipalities.map((municipality) => formatMunicipalityLabel(municipality))
      );

      municipalitiesByRegionProvince[
        getSelectionKey({
          region: regionLabel,
          province: provinceLabel,
          municipality: null,
          barangay: null,
        })
      ] = municipalityLabels;

      for (const rawMunicipality of municipalities) {
        const municipalityLabel = formatMunicipalityLabel(rawMunicipality);
        const barangayLabels = sortLabels(
          (provinceData?.municipalities?.[rawMunicipality]?.barangays ?? []).map((barangay) =>
            formatBarangayLabel(barangay)
          )
        );

        barangaysByRegionProvinceMunicipality[
          getSelectionKey({
            region: regionLabel,
            province: provinceLabel,
            municipality: municipalityLabel,
            barangay: null,
          })
        ] = barangayLabels;
      }
    }
  }

  return {
    regions: sortLabels(regionLabels),
    provincesByRegion,
    municipalitiesByRegionProvince,
    barangaysByRegionProvinceMunicipality,
  };
}

export const PH_PLACE_HIERARCHY = buildPlaceHierarchy();

export function describePlaceSelection(selection: PlaceSelection): string | null {
  return buildPlaceSelectionQuery(selection);
}
