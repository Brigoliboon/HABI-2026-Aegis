# FeatureDialog Economy Filtering - Implementation Plan

## Objective
Lower the admin level hierarchy for economy data in FeatureDialog. When a barangay/village is clicked, show the provincial economy data instead of falling back to national average.

## Status: ✅ COMPLETED

## Implementation Summary

### Changes Made to `components/FeatureDialog.tsx`:

1. **Added `IncomeData` type** for strong typing of income data structure

2. **Updated `findIncomeData()` function** with hierarchy support:
   - Parses address to extract province from Mapbox reverse geocoding
   - Searches provinces array within regions for matching province
   - Returns provincial data marked with "(Provincial)" label for barangay/municipal clicks
   - Maintains backward compatibility with existing behavior

3. **Updated Economy tab UI**:
   - Shows "(Provincial)" badge when displaying provincial-level data for lower admin areas
   - Added user-friendly descriptions below each metric

4. **Aligned colors with GeoDotica brand palette**:
   - Avg Income: #2FB290 (Mint - success state)
   - Income Growth sparkline: #2A94A0 (Teal - interactive)
   - Income Inequality: #2A94A0 (Teal)
   - Income Range sparkline: #70D2AE (Light Mint)
   - Distribution bars: #2A94A0, #2FB290, #70D2AE

## Admin Level Hierarchy (Philippines)
```
1. Barangay/Village (smallest) → Shows Provincial Economy
2. Municipality/City → Shows Provincial Economy  
3. Province → Shows Provincial Economy
4. Region → Shows Regional Economy
5. Philippines/National (fallback)
```

## Key Code Changes

### Address Parsing
```typescript
// Parse: "Brgy Poblacion, Tubay, Agusan del Norte, PHILIPPINES"
// parts[2] = province, parts[3] = region/country
```

### Province-Level Search
When address contains a province name, the function searches the `provinces` array in income.json within each region to find matching provincial data, returning it with "(Provincial)" suffix.

## Testing Checklist
- [x] Barangay click shows provincial economy with "(Provincial)" label
- [x] Municipality click shows provincial economy
- [x] Province click shows provincial economy
- [x] Region click shows regional economy
- [x] National click shows national economy
- [x] Unknown location falls back to national gracefully
- [x] TypeScript compilation passes