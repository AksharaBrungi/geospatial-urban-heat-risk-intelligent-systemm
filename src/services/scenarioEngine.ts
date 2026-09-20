import { WardData, ScenarioSimulationResult, RiskCategory } from '../types';

/**
 * Scenario Analysis Engine:
 * Simulates user-driven interventions:
 * 1. Increase green cover / urban vegetation (NDVI +5% to +50%)
 * 2. Urban expansion / concrete built-up growth (+5% to +40%)
 * 3. Land use cool roof retrofitting & water body restoration (+5% to +30%)
 * Reruns mathematical heat risk formulas and outputs comparative delta analysis.
 */

export function simulateScenario(
  ward: WardData,
  deltaGreenPct: number,
  deltaUrbanPct: number,
  deltaCoolRoofPct: number
): ScenarioSimulationResult {
  const currLST = ward.lst_celsius;
  const currNDVI = ward.ndvi;
  const currBuilding = ward.building_density_pct;
  const baseHVI = ward.normalized_hvi ?? 6.5;

  // Physical surface temperature impacts
  // +10% NDVI drops LST by ~0.85°C
  // +10% cool roof coverage drops LST by ~0.95°C
  // +10% concrete expansion increases LST by ~1.15°C
  const lstDropGreen = -(deltaGreenPct / 10.0) * 0.85;
  const lstDropCoolRoof = -(deltaCoolRoofPct / 10.0) * 0.95;
  const lstRiseUrban = (deltaUrbanPct / 10.0) * 1.15;

  const simLST = Math.round(Math.max(26.0, Math.min(52.0, currLST + lstDropGreen + lstDropCoolRoof + lstRiseUrban)) * 10) / 10;
  const simNDVI = Math.round(Math.max(0.02, Math.min(0.85, currNDVI + (deltaGreenPct / 100.0) * 0.35 - (deltaUrbanPct / 100.0) * 0.08)) * 1000) / 1000;
  const simBuilding = Math.round(Math.max(15.0, Math.min(98.0, currBuilding + deltaUrbanPct - deltaGreenPct * 0.15)) * 10) / 10;

  // Compute Delta on HVI (1 - 10 scale)
  const deltaLST = simLST - currLST;
  const deltaNDVIVal = simNDVI - currNDVI;
  const deltaBuildingVal = simBuilding - currBuilding;

  const hviShift = deltaLST * 0.28 - deltaNDVIVal * 4.2 + deltaBuildingVal * 0.015;
  const simHVI = Math.round(Math.max(1.0, Math.min(10.0, baseHVI + hviShift)) * 10) / 10;
  const netHVIChange = Math.round((simHVI - baseHVI) * 10) / 10;

  let simCat: RiskCategory = 'MODERATE';
  if (simHVI < 4.0) simCat = 'LOW';
  else if (simHVI >= 7.0) simCat = 'HIGH';

  let impactEn = '';
  let impactTe = '';
  if (netHVIChange < 0) {
    impactEn = `Proposed interventions achieve a substantial ${Math.abs(netHVIChange)} point reduction in heat vulnerability. Estimated surface temperature falls by ${Math.abs(Math.round(deltaLST * 10) / 10)}°C with greener canopy.`;
    impactTe = `ప్రతిపాదిత చర్యల ద్వారా ఉష్ణ తీవ్రత సూచిక ${Math.abs(netHVIChange)} పాయింట్లు తగ్గింది. పచ్చదనం పెరిగి ఉపరితల ఉష్ణోగ్రత ${Math.abs(Math.round(deltaLST * 10) / 10)}°C తగ్గుతుంది.`;
  } else if (netHVIChange > 0) {
    impactEn = `Unrestricted concrete growth escalates vulnerability by +${netHVIChange} points, raising local surface temperature by +${Math.round(deltaLST * 10) / 10}°C.`;
    impactTe = `నియంత్రణ లేని కాంక్రీట్ విస్తరణ వలన ఉష్ణ తీవ్రత +${netHVIChange} పాయింట్లు పెరిగి, ఉపరితల ఉష్ణోగ్రత +${Math.round(deltaLST * 10) / 10}°C పెరుగుతుంది.`;
  } else {
    impactEn = 'Balanced interventions maintain the current heat vulnerability equilibrium.';
    impactTe = 'ప్రస్తుత ఉష్ణ తీవ్రతలో పెద్దగా మార్పు కనిపించదు.';
  }

  return {
    ward_id: ward.ward_id,
    ward_name: ward.ward_name,
    baseline: {
      hvi: baseHVI,
      risk_category: ward.risk_category ?? 'MODERATE',
      lst_celsius: currLST,
      ndvi: currNDVI,
      building_density_pct: currBuilding
    },
    parameters_applied: {
      delta_green_cover_pct: deltaGreenPct,
      delta_urban_expansion_pct: deltaUrbanPct,
      delta_cool_roof_pct: deltaCoolRoofPct
    },
    simulated: {
      hvi: simHVI,
      risk_category: simCat,
      lst_celsius: simLST,
      ndvi: simNDVI,
      building_density_pct: simBuilding
    },
    delta: {
      hvi_change: netHVIChange,
      lst_change_celsius: Math.round(deltaLST * 10) / 10,
      ndvi_change: Math.round(deltaNDVIVal * 1000) / 1000
    },
    impact_summary_en: impactEn,
    impact_summary_te: impactTe
  };
}
