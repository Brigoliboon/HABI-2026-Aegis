/**
 * FeatureDialog – Modular Orchestration Layer
 *
 * This file re-exports from the new modular architecture.
 * All functionality has been extracted into:
 *
 *   - `components/dialog/FeatureDialog.tsx` (orchestrator)
 *   - `components/dialog/hooks/` (4 custom hooks)
 *   - `components/dialog/tabs/` (4 tab components)
 *   - `components/dialog/shared/` (reusable UI components)
 *   - `lib/incomeLookup.ts` (business logic)
 *   - `lib/hazardScanner.ts` (hazard logic)
 *   - `lib/facilityFinder.ts` (facility logic)
 *
 * See: FEATURE_DIALOG_REFACTORING.md for full documentation.
 */

export { default } from "./dialog/FeatureDialog";
