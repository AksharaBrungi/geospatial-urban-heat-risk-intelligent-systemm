import { Language } from '../types';

export const TRANSLATIONS = {
  en: {
    // App Header & Branding
    appName: 'Geospatial Urban Heat Risk Intelligent System',
    appSubtitle: 'Ward-Level Geospatial AI Intelligent Platform',
    liveTelemetry: 'Live Telemetry Active',
    viewRolePlanner: 'Urban Planner / Technical View',
    viewRoleCHW: 'Community Health Worker View',
    languageSelector: 'Language',
    searchPlaceholder: 'Search by PIN Code (e.g. 500002), Ward Name, or Landmark (e.g. Charminar)...',

    // Navigation Tabs
    navOverview: 'Overview',
    navHeatMap: 'Interactive Ward Map',
    navWardProfile: 'Ward Intelligence Profile',
    navScenarios: 'Scenario Simulator',
    navSocialVuln: 'Social Vulnerability',
    navComparison: 'Ward-vs-Ward Comparison',
    navTrends: 'Trends & Analytics',
    navRecommendations: 'Actionable Mitigations',
    navAlerts: 'Threshold Alerts',
    navMethodology: 'Methodology & Tech Stack',

    // Status & KPI Cards
    totalWardsMonitored: 'Total Wards Monitored',
    highRiskWards: 'High Risk Wards (HVI 7-10)',
    moderateRiskWards: 'Moderate Risk (HVI 4-6)',
    lowRiskWards: 'Low Risk (HVI 1-3)',
    cityMeanLST: 'City-Wide Mean LST',
    activeAlertsCount: 'Critical Heat Alerts',

    // Indicators
    hviScore: 'Heat Vulnerability Index (HVI)',
    exposureDomain: 'Exposure Domain',
    sensitivityDomain: 'Sensitivity Domain',
    adaptiveCapacityDomain: 'Adaptive Capacity Domain',
    lstIndicator: 'Land Surface Temperature (LST)',
    ndviIndicator: 'Vegetation Canopy (NDVI)',
    ndwiIndicator: 'Water Bodies Index (NDWI)',
    popDensity: 'Population Density',
    buildingDensity: 'Built-up Surface Density',
    uhcProximity: 'Nearest Urban Health Center',
    weatherTemp: 'Current Ambient Temp',
    weatherHumidity: 'Relative Humidity',
    heatIndex: 'Heat Index (Feels Like)',

    // Actions & Buttons
    downloadPdf: 'Download PDF Report',
    selectWard: 'Select Ward',
    simulateScenarioBtn: 'Run Scenario Simulation',
    resetScenario: 'Reset Parameters',
    compareWardsBtn: 'Compare Wards',
    viewProfileBtn: 'View Detailed Profile',
    applyFilters: 'Apply Map Filters',

    // Risk Categories
    riskHigh: 'High Risk',
    riskModerate: 'Moderate Risk',
    riskLow: 'Low Risk',

    // Explainable AI & SHAP
    shapTitle: 'Explainable AI — SHAP Feature Driver Attribution',
    shapSubtitle: 'Mathematically grounded feature importance explaining why this ward has this heat risk score',
    positiveDrivers: 'Positive Risk Drivers (Elevates Risk)',
    negativeDrivers: 'Mitigating Protective Factors (Lowers Risk)',
    groundedNarrative: 'Factor-Grounded Plain Language Explanation',

    // Scenario Analysis
    scenarioTitle: 'What-If Scenario Simulation Engine',
    scenarioSubtitle: 'Model future environmental interventions and evaluate quantitative changes in Heat Vulnerability',
    paramGreenCover: 'Increase Green Canopy Cover (NDVI)',
    paramUrbanExpansion: 'Urban Concrete Expansion (Built-up)',
    paramCoolRoofs: 'Cool Roofs & High-Albedo Retrofit',
    currentBaseline: 'Current Baseline',
    simulatedFuture: 'Simulated Future',
    netDeltaChange: 'Net HVI Impact',

    // Social Vulnerability
    socialVulnTitle: 'Social & Demographic Heat Vulnerability Assessment',
    socialVulnSubtitle: 'Identification and protection planning for sensitive populations',
    elderlyGroup: 'Elderly Individuals (Aged 60+)',
    childrenGroup: 'Children (Aged 0–6)',
    workersGroup: 'Outdoor Daily-Wage Workers',
    slumGroup: 'Low-Income Slum Households',
    marginalizedGroup: 'Scheduled Caste & Scheduled Tribe (SC/ST)',

    // Community Health Worker View
    chwTitle: 'Community Health Worker Field Action Dashboard',
    chwSubtitle: 'Simplified heat risk warnings, vulnerable citizen counts, hydration advisories, and emergency contacts',
    symptomsToWatch: 'Heat Illness Symptoms to Monitor',
    emergencyContact: 'Emergency Medical Contacts',
    coolingCentresAvailable: 'Public Air-Cooled Respite Shelters',

    // Map Controls
    mapLayerHVI: 'Heat Vulnerability Index (HVI)',
    mapLayerLST: 'Thermal Radiation (LST °C)',
    mapLayerNDVI: 'Vegetation Canopy (NDVI)',
    mapLayerHealth: 'Health Centers (UHC)'
  },
  te: {
    // App Header & Branding
    appName: 'జియోస్పేషియల్ అర్బన్ హీట్ రిస్క్ ఇంటెలిజెంట్ సిస్టమ్',
    appSubtitle: 'వార్డు స్థాయి ఉష్ణ తీవ్రత మరియు ఉపశమన ఇంటెలిజెంట్ వ్యవస్థ',
    liveTelemetry: 'ప్రత్యక్ష వాతావరణ సమాచారం చురుకుగా ఉంది',
    viewRolePlanner: 'పట్టణ ప్రణాళికా నిపుణుల వీక్షణ (Technical Planner)',
    viewRoleCHW: 'కమ్యూనిటీ హెల్త్ వర్కర్ వీక్షణ (CHW View)',
    languageSelector: 'భాష',
    searchPlaceholder: 'పిన్ కోడ్ (ఉదా: 500002), వార్డు పేరు లేదా ల్యాండ్‌మార్క్ (చార్మినార్) ద్వారా వెతకండి...',

    // Navigation Tabs
    navOverview: 'ప్రధాన వివరాలు',
    navHeatMap: 'ఇంటరాక్టివ్ వార్డు మ్యాప్',
    navWardProfile: 'వార్డు సమగ్ర ప్రొఫైల్',
    navScenarios: 'సిమ్యులేషన్ విశ్లేషణ',
    navSocialVuln: 'సామాజిక ఉష్ణ ముప్పు',
    navComparison: 'వార్డుల పోలిక',
    navTrends: 'కాలక్రమ ధోరణులు',
    navRecommendations: 'ఉపశమన చర్యలు',
    navAlerts: 'ఉష్ణ హెచ్చరికలు (Alerts)',
    navMethodology: 'పరిశోధన పద్ధతి & టెక్నాలజీ',

    // Status & KPI Cards
    totalWardsMonitored: 'మొత్తం వార్డులు',
    highRiskWards: 'అత్యధిక ముప్పు వార్డులు (HVI 7-10)',
    moderateRiskWards: 'మధ్యస్థ ముప్పు (HVI 4-6)',
    lowRiskWards: 'తక్కువ ముప్పు (HVI 1-3)',
    cityMeanLST: 'నగర సగటు ఉపరితల ఉష్ణోగ్రత',
    activeAlertsCount: 'తీవ్ర ఉష్ణ హెచ్చరికలు',

    // Indicators
    hviScore: 'హీట్ వల్నరబిలిటీ ఇండెక్స్ (HVI)',
    exposureDomain: 'ఎక్స్‌పోజర్ స్కోర్ (ఉష్ణ ప్రభావం)',
    sensitivityDomain: 'సెన్సిటివిటీ స్కోర్ (ప్రభావిత జనాభా)',
    adaptiveCapacityDomain: 'అడాప్టివ్ కెపాసిటీ (తట్టుకునే సామర్థ్యం)',
    lstIndicator: 'భూ ఉపరితల ఉష్ణోగ్రత (LST)',
    ndviIndicator: 'పచ్చదనం సూచిక (NDVI)',
    ndwiIndicator: 'జల వనరుల సూచిక (NDWI)',
    popDensity: 'జనసాంద్రత (చ.కి.మీ)',
    buildingDensity: 'కాంక్రీట్ భవనాల సాంద్రత',
    uhcProximity: 'సమీప పట్టణ ఆరోగ్య కేంద్రం',
    weatherTemp: 'ప్రస్తుత ఉష్ణోగ్రత',
    weatherHumidity: 'గాలిలో తేమ శాతం',
    heatIndex: 'హీట్ ఇండెక్స్ (అనుభవమయ్యే వేడి)',

    // Actions & Buttons
    downloadPdf: 'PDF నివేదిక డౌన్‌లోడ్',
    selectWard: 'వార్డును ఎంచుకోండి',
    simulateScenarioBtn: 'సిమ్యులేషన్ అమలు చేయండి',
    resetScenario: 'మళ్లీ మొదటికి మార్చు',
    compareWardsBtn: 'వార్డులను పోల్చండి',
    viewProfileBtn: 'పూర్తి వివరాలు చూడండి',
    applyFilters: 'మ్యాప్ ఫిల్టర్లు వర్తింపజేయి',

    // Risk Categories
    riskHigh: 'తీవ్ర ప్రమాదం (High)',
    riskModerate: 'మధ్యస్థ ప్రమాదం (Moderate)',
    riskLow: 'తక్కువ ప్రమాదం (Low)',

    // Explainable AI & SHAP
    shapTitle: 'వివరణాత్మక AI (SHAP) — ప్రమాద కారకాల విశ్లేషణ',
    shapSubtitle: 'ఈ వార్డులో ఉష్ణ ముప్పు ఎక్కువగా ఉండటానికి ఖచ్చితమైన కారణాలను మోడల్ వివరిస్తుంది',
    positiveDrivers: 'రిస్క్ పెంచే ప్రధాన కారకాలు',
    negativeDrivers: 'వేడిని తగ్గించే రక్షిత కారకాలు',
    groundedNarrative: 'సరళ భాషా వివరణ (Plain Language Explanation)',

    // Scenario Analysis
    scenarioTitle: 'భవిష్యత్ దృశ్యాల సిమ్యులేషన్ (Scenario Analysis)',
    scenarioSubtitle: 'చెట్ల పెంపకం లేదా కాంక్రీట్ విస్తరణ వలన ఉష్ణ తీవ్రత ఎలా మారుతుందో అంచనా వేయండి',
    paramGreenCover: 'పచ్చదనం / చెట్ల విస్తీర్ణం పెంపు (NDVI)',
    paramUrbanExpansion: 'కాంక్రీట్ నగర విస్తరణ (Built-up)',
    paramCoolRoofs: 'కూల్ రూఫ్ పూతలు మరియు జల వనరులు',
    currentBaseline: 'ప్రస్తుత పరిస్థితి (Baseline)',
    simulatedFuture: 'సిమ్యులేటెడ్ భవిష్యత్తు',
    netDeltaChange: 'HVI మార్పు (Delta Impact)',

    // Social Vulnerability
    socialVulnTitle: 'సామాజిక మరియు జనాభా ఉష్ణ ముప్పు విశ్లేషణ',
    socialVulnSubtitle: 'వేడి వల్ల తీవ్రంగా నష్టపోయే సున్నిత ప్రజల రక్షణ ప్రణాళిక',
    elderlyGroup: 'వృద్ధులు (60 సం. పైబడినవారు)',
    childrenGroup: 'చిన్నపిల్లలు (0–6 సంవత్సరాలు)',
    workersGroup: 'బహిరంగ దినసరి కూలీలు & వీధి వ్యాపారులు',
    slumGroup: 'బస్తీలు / తక్కువ ఆదాయ వర్గాలు',
    marginalizedGroup: 'ఎస్సీ మరియు ఎస్టీ వర్గాలు (SC/ST)',

    // Community Health Worker View
    chwTitle: 'ఆశా / కమ్యూనిటీ హెల్త్ వర్కర్ ఫీల్డ్ డాష్‌బోర్డ్',
    chwSubtitle: 'సులభమైన ప్రమాద హెచ్చరికలు, సున్నిత ప్రజల సంఖ్య, ఆరోగ్య జాగ్రత్తలు మరియు అత్యవసర నంబర్లు',
    symptomsToWatch: 'వడదెబ్బ లక్షణాలు & తక్షణ చికిత్స',
    emergencyContact: 'అత్యవసర వైద్య పరిచయాలు',
    coolingCentresAvailable: 'ప్రభుత్వ కూలింగ్ రిలీఫ్ కేంద్రాలు',

    // Map Controls
    mapLayerHVI: 'హీట్ వల్నరబిలిటీ ఇండెక్స్ (HVI)',
    mapLayerLST: 'థర్మల్ ఉష్ణోగ్రత (LST °C)',
    mapLayerNDVI: 'పచ్చదనం సూచిక (NDVI)',
    mapLayerHealth: 'ఆరోగ్య కేంద్రాలు (UHC)'
  }
};

export function getTranslation(lang: Language) {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
