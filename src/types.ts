export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH';
export type VulnerabilityTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AlertLevel = 'RED' | 'AMBER' | 'YELLOW';
export type Language = 'en' | 'te';
export type StakeholderView = 'PLANNER' | 'CHW'; // Planner (Technical) vs Community Health Worker (Simplified)
export type UserRole = StakeholderView;

export type NavTab =
  | 'overview'
  | 'map'
  | 'profile'
  | 'scenarios'
  | 'social_vuln'
  | 'social'
  | 'comparison'
  | 'trends'
  | 'recommendations'
  | 'alerts'
  | 'reports'
  | 'methodology';

export type CityId = string;

export type AdminLevel = 'country' | 'region' | 'district' | 'city' | 'area' | 'ward';

export interface LocationNode {
  id: string;
  name: string;
  official_name?: string;
  country_code: string;
  parent_id?: string;
  place_id?: string;
  placeId?: string;
  admin_level: AdminLevel;
  admin_level_label?: string; // e.g. "State", "Province", "Prefecture", "County", "Municipality", "Ward", "Neighborhood"
  place_type: string;
  latitude: number;
  longitude: number;
  bounding_box?: [number, number, number, number]; // [minLat, minLon, maxLat, maxLon]
  postal_code?: string;
  dataset_status?: DatasetStatus;
  has_wards?: boolean;
  weather?: CityWeatherConfig;
  zones?: string[];
  municipal_body?: string;
  description?: string;
  osm_id?: number | string;
  osm_type?: string;
}

export interface GlobalHierarchyState {
  country: LocationNode | null;
  region: LocationNode | null;
  district: LocationNode | null;
  city: LocationNode | null;
  area: LocationNode | null;
}

export interface LocationSearchResult {
  id: string;
  display_name: string;
  name: string;
  place_id?: string;
  placeId?: string;
  type: string;
  category: string;
  country_code: string;
  country_name: string;
  region_name?: string;
  district_name?: string;
  city_name?: string;
  area_name?: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  bounding_box?: [number, number, number, number];
  ward_id?: string;
  is_ward?: boolean;
  raw_data?: any;
}

export interface ResolvedLocation {
  formatted_address: string;
  country: string;
  country_code: string;
  state_region: string;
  district_county: string;
  city_municipality: string;
  area_ward: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  bounding_box?: [number, number, number, number];
  place_type: string;
  hierarchy: {
    country: LocationNode;
    region?: LocationNode;
    district?: LocationNode;
    city?: LocationNode;
    area?: LocationNode;
  };
}

export interface CityWeatherConfig {
  temp_celsius: number;
  humidity_pct: number;
  condition: string;
  station_name: string;
  wind_kmh: number;
}

export type DatasetStatus = 'COMPLETE' | 'DATASET_REQUIRED';

export interface CityConfig {
  id: CityId;
  name: string;
  state: string;
  full_label: string;
  municipal_body: string; // e.g., 'Greater Hyderabad Municipal Corporation (GHMC)'
  dataset_status: DatasetStatus;
  status_label: string;
  center: [number, number]; // [lat, lon]
  default_zoom: number;
  weather: CityWeatherConfig;
  zones: string[];
  description: string;
  total_wards?: number;
  bbox?: [number, number, number, number];
}

export interface WardGeoCoordinates {
  lat: number;
  lon: number;
}

export interface WardData {
  ward_id: string;
  ward_name: string;
  zone_name: string;
  pin_codes: string[];
  landmarks: string[];
  centroid: [number, number]; // [lat, lon]
  area_sq_km: number;
  population: number;
  population_density: number; // persons / sq.km
  lst_celsius: number; // Land Surface Temperature
  ndvi: number; // Normalized Difference Vegetation Index (-1 to +1)
  ndwi: number; // Normalized Difference Water Index (-1 to +1)
  building_density_pct: number; // Built-up surface %
  lulc_class: string;
  children_0_6_pct: number;
  female_pct: number;
  sc_population_pct: number;
  st_population_pct: number;
  literacy_pct: number;
  elderly_60_plus_pct: number;
  low_income_slum_pct: number;
  outdoor_workers_count: number;
  social_vulnerability_score: number; // 1 to 10
  uhc_name: string;
  uhc_distance_km: number;
  current_temp_celsius: number;
  current_humidity_pct: number;
  coordinates: [number, number][]; // Polygon vertices [lat, lon]
  // Computed HVI metrics
  exposure_score?: number;
  sensitivity_score?: number;
  adaptive_capacity_score?: number;
  raw_hvi?: number;
  normalized_hvi?: number;
  risk_category?: RiskCategory;
}

export interface PCADomainDetail {
  eigenvalues: number[];
  variance_explained_pct: number[];
  loadings: Record<string, number>;
  pc1_variance: number;
}

export interface HVIResult {
  ward_id: string;
  ward_name: string;
  exposure_score: number;
  sensitivity_score: number;
  adaptive_capacity_score: number;
  raw_hvi: number;
  normalized_hvi: number;
  risk_category: RiskCategory;
  pca_details: {
    exposure: PCADomainDetail;
    sensitivity: PCADomainDetail;
    adaptive_capacity: PCADomainDetail;
  };
}

export interface MLPrediction {
  ward_id: string;
  rf_predicted_score: number;
  xgb_predicted_score: number;
  ensemble_predicted_score: number;
  predicted_risk_category: RiskCategory;
  validation: {
    imd_station: string;
    variance_to_imd_station_celsius: number;
    model_confidence_pct: number;
  };
}

export interface SHAPFeatureContribution {
  feature: string;
  feature_key: string;
  value: string;
  shap_value: number;
  domain: 'EXPOSURE' | 'SENSITIVITY' | 'ADAPTIVE_CAPACITY';
}

export interface SHAPExplanation {
  base_value: number;
  features: SHAPFeatureContribution[];
  ranked_drivers: SHAPFeatureContribution[];
  top_positive_risk_drivers: SHAPFeatureContribution[];
  top_mitigating_drivers: SHAPFeatureContribution[];
  plain_english_explanation: string;
  plain_telugu_explanation: string;
}

export interface ScenarioSimulationResult {
  ward_id: string;
  ward_name: string;
  baseline: {
    hvi: number;
    risk_category: RiskCategory;
    lst_celsius: number;
    ndvi: number;
    building_density_pct: number;
  };
  parameters_applied: {
    delta_green_cover_pct: number;
    delta_urban_expansion_pct: number;
    delta_cool_roof_pct: number;
  };
  simulated: {
    hvi: number;
    risk_category: RiskCategory;
    lst_celsius: number;
    ndvi: number;
    building_density_pct: number;
  };
  delta: {
    hvi_change: number;
    lst_change_celsius: number;
    ndvi_change: number;
  };
  impact_summary_en: string;
  impact_summary_te: string;
}

export interface RecommendationItem {
  id: string;
  domain: string;
  trigger: string;
  title_en: string;
  title_te: string;
  action_en: string;
  action_te: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  feasibility_months: number;
  responsible_agency: string;
}

export interface AlertItem {
  alert_id: string;
  ward_id: string;
  ward_name: string;
  level: AlertLevel;
  headline_en: string;
  headline_te: string;
  trigger_metric: string;
  advisory_en: string;
  advisory_te: string;
  issued_at: string;
}

export interface SocialVulnerabilityProfile {
  ward_id: string;
  ward_name: string;
  social_vulnerability_score: number;
  vulnerability_tier: VulnerabilityTier;
  groups: {
    group: string;
    percentage: number;
    estimated_count: number;
    risk_rationale: string;
  }[];
  demographic_summary: {
    female_proportion: string;
    literacy_rate: string;
    total_high_vulnerability_residents: number;
  };
}

export interface HistoricalTrendPoint {
  year: number;
  lst_mean: number;
  hvi: number;
  ndvi: number;
}
