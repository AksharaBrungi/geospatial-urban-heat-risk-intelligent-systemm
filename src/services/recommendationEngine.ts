import { WardData, RecommendationItem } from '../types';

export function getWardRecommendations(ward: WardData): RecommendationItem[] {
  const recs: RecommendationItem[] = [];

  // 1. Low vegetation / canopy deficit
  if (ward.ndvi < 0.22) {
    recs.push({
      id: 'REC-VEG-01',
      domain: 'VEGETATION & GREEN INFRASTRUCTURE',
      trigger: `Low Vegetation Index (NDVI ${ward.ndvi} < 0.22 threshold)`,
      title_en: 'Accelerated Miyawaki Pocket Forests & Street Shading Canopies',
      title_te: 'మియావాకి చిట్టడవులు మరియు వీధి నీడ చెట్ల పెంపకం',
      action_en: 'Deploy dense native micro-forests along road medians, public schools, and open spaces to establish shade corridors and lower radiant surface temperatures by 2.0–3.5°C.',
      action_te: 'రోడ్ల డివైడర్లు, పాఠశాలలు మరియు ప్రభుత్వ ఖాళీ స్థలాల్లో స్థానిక చెట్లతో చిట్టడవులు పెంచి, స్థానిక ఉపరితల ఉష్ణోగ్రతను 2.0–3.5°C తగ్గించాలి.',
      priority: 'HIGH',
      feasibility_months: 4,
      responsible_agency: 'GHMC Urban Biodiversity Wing'
    });
  }

  // 2. High Land Surface Temperature (LST)
  if (ward.lst_celsius >= 40.0) {
    recs.push({
      id: 'REC-COOL-02',
      domain: 'COOL SURFACES & REFLECTIVE ROOFS',
      trigger: `High Land Surface Temperature (${ward.lst_celsius}°C >= 40.0°C threshold)`,
      title_en: 'Targeted High-Albedo Cool Roof Coating Initiative',
      title_te: 'కూల్ రూఫ్ మరియు అధిక ప్రతిబింబ పూతల కార్యక్రమం',
      action_en: 'Subsidize and mandate solar reflective coatings (Solar Reflectance Index > 78) across residential clusters, informal tin roofs, and commercial terraces.',
      action_te: 'రేకుల ఇళ్లు మరియు భవనాల పైకప్పులపై సూర్యరశ్మిని ప్రతిబింబించే కూల్ రూఫ్ రంగులు వేయించి, గదుల లోపల ఉష్ణోగ్రతను 3-5°C తగ్గించాలి.',
      priority: 'HIGH',
      feasibility_months: 2,
      responsible_agency: 'Telangana Cool Roof Policy Directorate'
    });
  }

  // 3. Extended Distance to Urban Health Center (UHC)
  if (ward.uhc_distance_km > 1.3) {
    recs.push({
      id: 'REC-HLTH-03',
      domain: 'HEALTHCARE & EMERGENCY RELIEF',
      trigger: `Extended UHC Distance (${ward.uhc_distance_km} km > 1.3 km limit)`,
      title_en: 'Mobile Heat-Relief Medical Vans & Public Cooling Respite Shelters',
      title_te: 'మొబైల్ హీట్ రిలీఫ్ క్లినిక్‌లు మరియు పబ్లిక్ కూలింగ్ కేంద్రాలు',
      action_en: 'Convert community halls, bus stations, and municipal libraries into active air-cooled respite stations equipped with ORS, IV fluids, and paramedical teams during peak hours (12:00 PM – 4:30 PM).',
      action_te: 'కమ్యూనిటీ హాళ్లు మరియు బస్టాండ్లను మధ్యాహ్నం 12 నుండి సాయంత్రం 4:30 వరకు చల్లని ఉపశమన కేంద్రాలుగా మార్చి, ORS మరియు ప్రథమ చికిత్స అందించాలి.',
      priority: ward.uhc_distance_km > 2.0 ? 'HIGH' : 'MEDIUM',
      feasibility_months: 1,
      responsible_agency: 'District Medical & Health Office (DMHO)'
    });
  }

  // 4. Dense outdoor workforce (street vendors, construction, gig workers)
  if (ward.outdoor_workers_count > 2200) {
    recs.push({
      id: 'REC-WRK-04',
      domain: 'LABOR PROTECTION & HYDRATION',
      trigger: `High Outdoor Workforce (${ward.outdoor_workers_count.toLocaleString()} workers)`,
      title_en: 'Mandatory Shaded Rest Pavilions & Free Hydration Hubs (Chalit Chalivendram)',
      title_te: 'నీడ విశ్రాంతి స్థలాలు మరియు ఉచిత మంచినీటి కేంద్రాలు',
      action_en: 'Enforce peak afternoon rest breaks (12:00 PM – 3:00 PM) for construction laborers, erect 15 shaded water kiosks with chilled electrolytes at traffic junctions and major markets.',
      action_te: 'మధ్యాహ్నం 12 నుండి 3 గంటల వరకు బహిరంగ పనులను నిలిపివేసి, ప్రధాన కూడళ్లలో ఉచిత మంచినీటి చలివేంద్రాలు మరియు ORS పంపిణీ కేంద్రాలను ఏర్పాటు చేయాలి.',
      priority: 'HIGH',
      feasibility_months: 1,
      responsible_agency: 'Department of Labor & Municipal Administration'
    });
  }

  // 5. Dense low-income settlements / slums
  if (ward.low_income_slum_pct > 25.0) {
    recs.push({
      id: 'REC-SLUM-05',
      domain: 'VULNERABLE SETTLEMENT RETROFIT',
      trigger: `Substantial Low-Income / Slum Population (${ward.low_income_slum_pct}%)`,
      title_en: 'Passive Thermal Insulation & Green Shading Screens',
      title_te: 'సహజ ఉష్ణ నిరోధకత మరియు ఆకుపచ్చ నీడ కర్టన్లు',
      action_en: 'Distribute bamboo-mesh shading screens and agro-shade nets for narrow lanes, and conduct door-to-door heat risk education for pregnant mothers, elderly citizens, and young children.',
      action_te: 'ఇరుకైన బస్తీ సందులలో ఆకుపచ్చ నీడ నెట్లను అమర్చాలి మరియు వృద్ధులు, గర్భిణీలు, చిన్న పిల్లల ఆరోగ్య రక్షణ కోసం ఇంటింటికీ వెళ్లి అవగాహన కల్పించాలి.',
      priority: 'MEDIUM',
      feasibility_months: 3,
      responsible_agency: 'MEPMA (Mission for Elimination of Poverty in Municipal Areas)'
    });
  }

  return recs;
}
