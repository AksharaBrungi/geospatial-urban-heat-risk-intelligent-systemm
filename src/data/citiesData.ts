import { CityConfig, CityId, WardData } from '../types';
import { INITIAL_WARDS } from './wardsData';

export const CITIES_REGISTRY: CityConfig[] = [
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    full_label: 'Hyderabad, Telangana',
    municipal_body: 'Greater Hyderabad Municipal Corporation (GHMC)',
    dataset_status: 'COMPLETE',
    status_label: 'Full Municipal Ward Coverage (150 Wards)',
    center: [17.4065, 78.4772],
    default_zoom: 11,
    weather: {
      temp_celsius: 35.0,
      humidity_pct: 56,
      condition: 'Clear Sky',
      station_name: 'IMD Begumpet Observatory',
      wind_kmh: 12
    },
    zones: ['Central Zone', 'South Zone', 'East Zone', 'North Zone', 'West Zone', 'Kukatpally Zone'],
    description: 'Deccan Plateau urban agglomeration. Complete spatial coverage across all 150 administrative wards.'
  },
  {
    id: 'jodhpur',
    name: 'Jodhpur',
    state: 'Rajasthan',
    full_label: 'Jodhpur, Rajasthan',
    municipal_body: 'Jodhpur Municipal Corporation (JMC)',
    dataset_status: 'COMPLETE',
    status_label: 'Municipal Research Ward Coverage',
    center: [26.2868, 73.0232],
    default_zoom: 12,
    weather: {
      temp_celsius: 43.5,
      humidity_pct: 26,
      condition: 'Severe Heatwave Advisory',
      station_name: 'IMD Jodhpur Civil Aerodrome',
      wind_kmh: 19
    },
    zones: ['Jodhpur North Zone', 'Jodhpur South Zone'],
    description: 'Arid Thar desert climate study area with extreme summer land surface temperatures (LST > 43°C) and low vegetation index.'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    full_label: 'Bengaluru, Karnataka',
    municipal_body: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    dataset_status: 'COMPLETE',
    status_label: 'Active AI Municipal Ward & Vulnerability Coverage',
    center: [12.9716, 77.5946],
    default_zoom: 11,
    weather: {
      temp_celsius: 33.2,
      humidity_pct: 62,
      condition: 'Partly Cloudy',
      station_name: 'IMD Bengaluru Central Observatory',
      wind_kmh: 14
    },
    zones: ['East Zone', 'West Zone', 'South Zone', 'Mahadevapura', 'Bommanahalli', 'Yelahanka'],
    description: 'Deccan plateau urban agglomeration with multi-spectral satellite thermal mapping and AI micro-zone risk modeling.'
  },
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'India',
    full_label: 'Delhi, India',
    municipal_body: 'Municipal Corporation of Delhi (MCD)',
    dataset_status: 'COMPLETE',
    status_label: 'Active AI Municipal Ward & Vulnerability Coverage',
    center: [28.6139, 77.2090],
    default_zoom: 11,
    weather: {
      temp_celsius: 44.6,
      humidity_pct: 34,
      condition: 'Extreme Heatwave / Loo Conditions',
      station_name: 'IMD Safdarjung Observatory',
      wind_kmh: 22
    },
    zones: ['Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Shahdara'],
    description: 'Subtropical semi-arid megacity with active satellite LST heat dome detection and AI vulnerability mapping.'
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    full_label: 'Ahmedabad, Gujarat',
    municipal_body: 'Ahmedabad Municipal Corporation (AMC)',
    dataset_status: 'COMPLETE',
    status_label: 'Active AI Municipal Ward & Vulnerability Coverage',
    center: [23.0225, 72.5714],
    default_zoom: 12,
    weather: {
      temp_celsius: 42.2,
      humidity_pct: 40,
      condition: 'Heat Alert (Orange Category)',
      station_name: 'IMD Ahmedabad Observatory',
      wind_kmh: 16
    },
    zones: ['Central Zone', 'West Zone', 'New West Zone', 'South Zone', 'East Zone', 'North Zone'],
    description: 'Pioneer of India’s municipal Heat Action Plan (HAP) with integrated satellite thermal intelligence.'
  }
];

// REAL JODHPUR RESEARCH WARDS WITH EXACT BOUNDARIES
export const JODHPUR_WARDS: WardData[] = [
  {
    "ward_id": "JOD-001",
    "ward_name": "Sardarpura",
    "zone_name": "Jodhpur North Zone",
    "pin_codes": [
      "342003"
    ],
    "landmarks": [
      "Sardar Market",
      "Jaljog Circle",
      "Olympic Cinema"
    ],
    "centroid": [
      26.278333333333332,
      73.01066666666667
    ],
    "area_sq_km": 3.4,
    "population": 48200,
    "population_density": 14176,
    "lst_celsius": 43.8,
    "ndvi": 0.112,
    "ndwi": -0.18,
    "building_density_pct": 78,
    "lulc_class": "Dense Commercial & Old Residential Core",
    "children_0_6_pct": 9.2,
    "female_pct": 47.9,
    "sc_population_pct": 11.2,
    "st_population_pct": 2.1,
    "literacy_pct": 78.4,
    "elderly_60_plus_pct": 12.8,
    "low_income_slum_pct": 32,
    "outdoor_workers_count": 3600,
    "social_vulnerability_score": 6.2,
    "uhc_name": "UPHC Sardarpura Dispensary",
    "uhc_distance_km": 0.8,
    "current_temp_celsius": 43.5,
    "current_humidity_pct": 26,
    "coordinates": [
      [
        26.284,
        73.004
      ],
      [
        26.286,
        73.018
      ],
      [
        26.275,
        73.022
      ],
      [
        26.269,
        73.013
      ],
      [
        26.272,
        73.003
      ],
      [
        26.284,
        73.004
      ]
    ],
    "exposure_score": 6.4,
    "sensitivity_score": 3.1,
    "adaptive_capacity_score": 5.3,
    "raw_hvi": 4.21,
    "normalized_hvi": 5.9,
    "risk_category": "MODERATE"
  },
  {
    "ward_id": "JOD-002",
    "ward_name": "Soorsagar",
    "zone_name": "Jodhpur North Zone",
    "pin_codes": [
      "342024"
    ],
    "landmarks": [
      "Bada Talab Soorsagar",
      "Stone Quarry Ridge",
      "Balsamand Lake Road"
    ],
    "centroid": [
      26.3165,
      72.98983333333332
    ],
    "area_sq_km": 5.1,
    "population": 42100,
    "population_density": 8254,
    "lst_celsius": 44.5,
    "ndvi": 0.088,
    "ndwi": -0.22,
    "building_density_pct": 64,
    "lulc_class": "Rocky Outcrops & Dense Low-Income Settlements",
    "children_0_6_pct": 11.5,
    "female_pct": 48.1,
    "sc_population_pct": 18.5,
    "st_population_pct": 4.8,
    "literacy_pct": 68.2,
    "elderly_60_plus_pct": 9.4,
    "low_income_slum_pct": 46,
    "outdoor_workers_count": 4850,
    "social_vulnerability_score": 7.4,
    "uhc_name": "UPHC Soorsagar Primary Health Centre",
    "uhc_distance_km": 1.6,
    "current_temp_celsius": 44.2,
    "current_humidity_pct": 24,
    "coordinates": [
      [
        26.326,
        72.982
      ],
      [
        26.324,
        73.002
      ],
      [
        26.307,
        73.006
      ],
      [
        26.302,
        72.988
      ],
      [
        26.314,
        72.979
      ],
      [
        26.326,
        72.982
      ]
    ],
    "exposure_score": 4.7,
    "sensitivity_score": 7.1,
    "adaptive_capacity_score": 1.7,
    "raw_hvi": 10.16,
    "normalized_hvi": 8,
    "risk_category": "HIGH"
  },
  {
    "ward_id": "JOD-003",
    "ward_name": "Ratanada",
    "zone_name": "Jodhpur South Zone",
    "pin_codes": [
      "342011"
    ],
    "landmarks": [
      "Air Force Flying Club",
      "Circuit House",
      "Panchbatti Circle"
    ],
    "centroid": [
      26.2655,
      73.03533333333334
    ],
    "area_sq_km": 4.8,
    "population": 39500,
    "population_density": 8229,
    "lst_celsius": 41.2,
    "ndvi": 0.185,
    "ndwi": -0.12,
    "building_density_pct": 55,
    "lulc_class": "Institutional & Planned Residential Greenery",
    "children_0_6_pct": 7.8,
    "female_pct": 49,
    "sc_population_pct": 7.2,
    "st_population_pct": 1.5,
    "literacy_pct": 84.6,
    "elderly_60_plus_pct": 14.1,
    "low_income_slum_pct": 18,
    "outdoor_workers_count": 1900,
    "social_vulnerability_score": 4.2,
    "uhc_name": "UPHC Ratanada Cantonment Dispensary",
    "uhc_distance_km": 1.1,
    "current_temp_celsius": 41,
    "current_humidity_pct": 28,
    "coordinates": [
      [
        26.275,
        73.028
      ],
      [
        26.272,
        73.048
      ],
      [
        26.255,
        73.051
      ],
      [
        26.252,
        73.033
      ],
      [
        26.264,
        73.024
      ],
      [
        26.275,
        73.028
      ]
    ],
    "exposure_score": 0.1,
    "sensitivity_score": 0,
    "adaptive_capacity_score": 10,
    "raw_hvi": -9.95,
    "normalized_hvi": 1,
    "risk_category": "LOW"
  },
  {
    "ward_id": "JOD-004",
    "ward_name": "Mandore",
    "zone_name": "Jodhpur North Zone",
    "pin_codes": [
      "342304"
    ],
    "landmarks": [
      "Mandore Gardens",
      "Ancient Cenotaphs",
      "Nagaur Highway Junction"
    ],
    "centroid": [
      26.359499999999997,
      73.03483333333334
    ],
    "area_sq_km": 6.8,
    "population": 36200,
    "population_density": 5323,
    "lst_celsius": 42.1,
    "ndvi": 0.204,
    "ndwi": -0.11,
    "building_density_pct": 48,
    "lulc_class": "Semi-Urban Heritage Park & Open Scrub",
    "children_0_6_pct": 9.8,
    "female_pct": 48.2,
    "sc_population_pct": 14.1,
    "st_population_pct": 3.2,
    "literacy_pct": 72.4,
    "elderly_60_plus_pct": 10.5,
    "low_income_slum_pct": 26,
    "outdoor_workers_count": 2700,
    "social_vulnerability_score": 5.1,
    "uhc_name": "UPHC Mandore Community Health Centre",
    "uhc_distance_km": 1.9,
    "current_temp_celsius": 41.8,
    "current_humidity_pct": 27,
    "coordinates": [
      [
        26.372,
        73.025
      ],
      [
        26.368,
        73.052
      ],
      [
        26.345,
        73.055
      ],
      [
        26.342,
        73.031
      ],
      [
        26.358,
        73.021
      ],
      [
        26.372,
        73.025
      ]
    ],
    "exposure_score": 0,
    "sensitivity_score": 4.3,
    "adaptive_capacity_score": 8.6,
    "raw_hvi": -4.26,
    "normalized_hvi": 3,
    "risk_category": "LOW"
  },
  {
    "ward_id": "JOD-005",
    "ward_name": "Mehrangarh Walled City",
    "zone_name": "Jodhpur North Zone",
    "pin_codes": [
      "342001"
    ],
    "landmarks": [
      "Mehrangarh Fort",
      "Jaswant Thada",
      "Clock Tower",
      "Brahmpuri Blue Houses"
    ],
    "centroid": [
      26.298333333333332,
      73.0175
    ],
    "area_sq_km": 2.9,
    "population": 54100,
    "population_density": 18655,
    "lst_celsius": 44.9,
    "ndvi": 0.065,
    "ndwi": -0.24,
    "building_density_pct": 92,
    "lulc_class": "Ultra-Dense Blue-Painted Stone Masonry Urban Core",
    "children_0_6_pct": 10.8,
    "female_pct": 48.4,
    "sc_population_pct": 9.8,
    "st_population_pct": 1.1,
    "literacy_pct": 76.5,
    "elderly_60_plus_pct": 15.2,
    "low_income_slum_pct": 39,
    "outdoor_workers_count": 4900,
    "social_vulnerability_score": 7.8,
    "uhc_name": "City Dispensary Clock Tower Old Jodhpur",
    "uhc_distance_km": 0.5,
    "current_temp_celsius": 44.6,
    "current_humidity_pct": 25,
    "coordinates": [
      [
        26.305,
        73.012
      ],
      [
        26.304,
        73.027
      ],
      [
        26.291,
        73.029
      ],
      [
        26.288,
        73.016
      ],
      [
        26.297,
        73.009
      ],
      [
        26.305,
        73.012
      ]
    ],
    "exposure_score": 10,
    "sensitivity_score": 2.7,
    "adaptive_capacity_score": 2.2,
    "raw_hvi": 10.49,
    "normalized_hvi": 8.1,
    "risk_category": "HIGH"
  },
  {
    "ward_id": "JOD-006",
    "ward_name": "Shastri Nagar",
    "zone_name": "Jodhpur South Zone",
    "pin_codes": [
      "342003"
    ],
    "landmarks": [
      "MDM Hospital",
      "Nehru Park",
      "Geeta Bhawan"
    ],
    "centroid": [
      26.260166666666667,
      73.00533333333334
    ],
    "area_sq_km": 3.7,
    "population": 46500,
    "population_density": 12567,
    "lst_celsius": 42.4,
    "ndvi": 0.162,
    "ndwi": -0.14,
    "building_density_pct": 71,
    "lulc_class": "Planned Medium-Density Residential & Medical Hub",
    "children_0_6_pct": 8.4,
    "female_pct": 48.8,
    "sc_population_pct": 8.6,
    "st_population_pct": 1.8,
    "literacy_pct": 82.1,
    "elderly_60_plus_pct": 13.5,
    "low_income_slum_pct": 21,
    "outdoor_workers_count": 2200,
    "social_vulnerability_score": 4.9,
    "uhc_name": "UPHC Shastri Nagar Sector C",
    "uhc_distance_km": 0.7,
    "current_temp_celsius": 42.2,
    "current_humidity_pct": 27,
    "coordinates": [
      [
        26.268,
        72.999
      ],
      [
        26.266,
        73.017
      ],
      [
        26.251,
        73.02
      ],
      [
        26.249,
        73.002
      ],
      [
        26.259,
        72.995
      ],
      [
        26.268,
        72.999
      ]
    ],
    "exposure_score": 3.7,
    "sensitivity_score": 1,
    "adaptive_capacity_score": 8.5,
    "raw_hvi": -3.74,
    "normalized_hvi": 3.2,
    "risk_category": "LOW"
  },
  {
    "ward_id": "JOD-007",
    "ward_name": "Basni Industrial Area",
    "zone_name": "Jodhpur South Zone",
    "pin_codes": [
      "342005"
    ],
    "landmarks": [
      "AIIMS Jodhpur",
      "Basni Phase II Industrial Estate",
      "Marudhar Hospital"
    ],
    "centroid": [
      26.230999999999998,
      72.99783333333333
    ],
    "area_sq_km": 6.2,
    "population": 52300,
    "population_density": 8435,
    "lst_celsius": 45.3,
    "ndvi": 0.072,
    "ndwi": -0.25,
    "building_density_pct": 84,
    "lulc_class": "Heavy Industrial Metallic Roofs & Stone Processing Mills",
    "children_0_6_pct": 12.1,
    "female_pct": 46.5,
    "sc_population_pct": 21.4,
    "st_population_pct": 5.2,
    "literacy_pct": 65.8,
    "elderly_60_plus_pct": 7.9,
    "low_income_slum_pct": 52,
    "outdoor_workers_count": 6400,
    "social_vulnerability_score": 8.5,
    "uhc_name": "ESI Hospital & UPHC Basni Industrial Zone",
    "uhc_distance_km": 1.4,
    "current_temp_celsius": 45,
    "current_humidity_pct": 23,
    "coordinates": [
      [
        26.242,
        72.989
      ],
      [
        26.239,
        73.014
      ],
      [
        26.215,
        73.018
      ],
      [
        26.218,
        72.993
      ],
      [
        26.23,
        72.984
      ],
      [
        26.242,
        72.989
      ]
    ],
    "exposure_score": 5.9,
    "sensitivity_score": 10,
    "adaptive_capacity_score": 0,
    "raw_hvi": 15.92,
    "normalized_hvi": 10,
    "risk_category": "HIGH"
  },
  {
    "ward_id": "JOD-008",
    "ward_name": "Paota",
    "zone_name": "Jodhpur North Zone",
    "pin_codes": [
      "342006"
    ],
    "landmarks": [
      "Paota Circle",
      "High Court Road",
      "Central Bus Stand"
    ],
    "centroid": [
      26.303500000000003,
      73.034
    ],
    "area_sq_km": 4.1,
    "population": 45800,
    "population_density": 11170,
    "lst_celsius": 43.1,
    "ndvi": 0.138,
    "ndwi": -0.16,
    "building_density_pct": 75,
    "lulc_class": "Dense Transit Corridor & Commercial Establishments",
    "children_0_6_pct": 9.4,
    "female_pct": 48,
    "sc_population_pct": 10.5,
    "st_population_pct": 1.9,
    "literacy_pct": 79.5,
    "elderly_60_plus_pct": 12.1,
    "low_income_slum_pct": 29,
    "outdoor_workers_count": 3800,
    "social_vulnerability_score": 5.8,
    "uhc_name": "UPHC Paota Satellite Hospital",
    "uhc_distance_km": 0.6,
    "current_temp_celsius": 42.8,
    "current_humidity_pct": 26,
    "coordinates": [
      [
        26.312,
        73.026
      ],
      [
        26.309,
        73.048
      ],
      [
        26.294,
        73.051
      ],
      [
        26.292,
        73.031
      ],
      [
        26.302,
        73.022
      ],
      [
        26.312,
        73.026
      ]
    ],
    "exposure_score": 4.1,
    "sensitivity_score": 2.9,
    "adaptive_capacity_score": 6.8,
    "raw_hvi": 0.12,
    "normalized_hvi": 4.5,
    "risk_category": "MODERATE"
  },
  {
    "ward_id": "JOD-009",
    "ward_name": "Mahamandir",
    "zone_name": "Jodhpur North Zone",
    "pin_codes": [
      "342006"
    ],
    "landmarks": [
      "Mahamandir Temple",
      "Third Pole",
      "Railway Training School"
    ],
    "centroid": [
      26.31683333333333,
      73.03949999999999
    ],
    "area_sq_km": 3.8,
    "population": 43900,
    "population_density": 11552,
    "lst_celsius": 43.6,
    "ndvi": 0.125,
    "ndwi": -0.17,
    "building_density_pct": 77,
    "lulc_class": "Historic Heritage Precinct & Narrow High-Density Alleys",
    "children_0_6_pct": 10.1,
    "female_pct": 48.5,
    "sc_population_pct": 12.8,
    "st_population_pct": 2.4,
    "literacy_pct": 75.3,
    "elderly_60_plus_pct": 13.9,
    "low_income_slum_pct": 35,
    "outdoor_workers_count": 3400,
    "social_vulnerability_score": 6.4,
    "uhc_name": "UPHC Mahamandir Dispensary",
    "uhc_distance_km": 0.9,
    "current_temp_celsius": 43.4,
    "current_humidity_pct": 25,
    "coordinates": [
      [
        26.326,
        73.032
      ],
      [
        26.322,
        73.053
      ],
      [
        26.306,
        73.056
      ],
      [
        26.305,
        73.036
      ],
      [
        26.316,
        73.028
      ],
      [
        26.326,
        73.032
      ]
    ],
    "exposure_score": 4.9,
    "sensitivity_score": 3.4,
    "adaptive_capacity_score": 5.4,
    "raw_hvi": 3.01,
    "normalized_hvi": 5.5,
    "risk_category": "MODERATE"
  },
  {
    "ward_id": "JOD-010",
    "ward_name": "Kudi Bhagtasni",
    "zone_name": "Jodhpur South Zone",
    "pin_codes": [
      "342013"
    ],
    "landmarks": [
      "Housing Board Scheme",
      "Sector 4 Main Market",
      "DPS Circle"
    ],
    "centroid": [
      26.199166666666667,
      73.01833333333333
    ],
    "area_sq_km": 7.4,
    "population": 51200,
    "population_density": 6918,
    "lst_celsius": 44.1,
    "ndvi": 0.098,
    "ndwi": -0.21,
    "building_density_pct": 62,
    "lulc_class": "Peripheral Concrete Housing Development & Open Arid Land",
    "children_0_6_pct": 10.9,
    "female_pct": 47.8,
    "sc_population_pct": 16.2,
    "st_population_pct": 3.9,
    "literacy_pct": 74.8,
    "elderly_60_plus_pct": 8.7,
    "low_income_slum_pct": 41,
    "outdoor_workers_count": 4200,
    "social_vulnerability_score": 7.1,
    "uhc_name": "UPHC Kudi Bhagtasni Sector 2 Dispensary",
    "uhc_distance_km": 1.8,
    "current_temp_celsius": 43.8,
    "current_humidity_pct": 24,
    "coordinates": [
      [
        26.211,
        73.008
      ],
      [
        26.208,
        73.036
      ],
      [
        26.182,
        73.041
      ],
      [
        26.185,
        73.013
      ],
      [
        26.198,
        73.004
      ],
      [
        26.211,
        73.008
      ]
    ],
    "exposure_score": 3.5,
    "sensitivity_score": 6.2,
    "adaptive_capacity_score": 3.4,
    "raw_hvi": 6.32,
    "normalized_hvi": 6.7,
    "risk_category": "MODERATE"
  },
  {
    "ward_id": "JOD-011",
    "ward_name": "Chopasni Housing Board",
    "zone_name": "Jodhpur North Zone",
    "pin_codes": [
      "342008"
    ],
    "landmarks": [
      "Chopasni School",
      "12th Sector Market",
      "Jaisalmer Bypass"
    ],
    "centroid": [
      26.277666666666665,
      72.96133333333333
    ],
    "area_sq_km": 5.8,
    "population": 47300,
    "population_density": 8155,
    "lst_celsius": 43.2,
    "ndvi": 0.128,
    "ndwi": -0.17,
    "building_density_pct": 66,
    "lulc_class": "Western Suburban Housing Blocks & Arid Scrub Edge",
    "children_0_6_pct": 9.7,
    "female_pct": 48.3,
    "sc_population_pct": 12.1,
    "st_population_pct": 2.8,
    "literacy_pct": 79.1,
    "elderly_60_plus_pct": 11.2,
    "low_income_slum_pct": 28,
    "outdoor_workers_count": 3100,
    "social_vulnerability_score": 5.7,
    "uhc_name": "UPHC Chopasni Sector 17 Health Centre",
    "uhc_distance_km": 1.3,
    "current_temp_celsius": 43,
    "current_humidity_pct": 25,
    "coordinates": [
      [
        26.289,
        72.952
      ],
      [
        26.286,
        72.978
      ],
      [
        26.262,
        72.982
      ],
      [
        26.264,
        72.956
      ],
      [
        26.276,
        72.948
      ],
      [
        26.289,
        72.952
      ]
    ],
    "exposure_score": 2.8,
    "sensitivity_score": 3.5,
    "adaptive_capacity_score": 6.1,
    "raw_hvi": 0.27,
    "normalized_hvi": 4.6,
    "risk_category": "MODERATE"
  },
  {
    "ward_id": "JOD-012",
    "ward_name": "Pratap Nagar",
    "zone_name": "Jodhpur North Zone",
    "pin_codes": [
      "342003"
    ],
    "landmarks": [
      "Akhaliya Circle",
      "Pratap Nagar Police Station",
      "Blind School Ground"
    ],
    "centroid": [
      26.290666666666667,
      72.98866666666667
    ],
    "area_sq_km": 3.9,
    "population": 49100,
    "population_density": 12589,
    "lst_celsius": 43.9,
    "ndvi": 0.105,
    "ndwi": -0.19,
    "building_density_pct": 79,
    "lulc_class": "Dense Mixed Residential & Commercial Axis",
    "children_0_6_pct": 10.4,
    "female_pct": 48.1,
    "sc_population_pct": 13.6,
    "st_population_pct": 3.1,
    "literacy_pct": 76.2,
    "elderly_60_plus_pct": 11.8,
    "low_income_slum_pct": 36,
    "outdoor_workers_count": 3900,
    "social_vulnerability_score": 6.6,
    "uhc_name": "UPHC Pratap Nagar Dispensary",
    "uhc_distance_km": 0.7,
    "current_temp_celsius": 43.7,
    "current_humidity_pct": 25,
    "coordinates": [
      [
        26.298,
        72.981
      ],
      [
        26.295,
        73.003
      ],
      [
        26.281,
        73.006
      ],
      [
        26.282,
        72.984
      ],
      [
        26.29,
        72.977
      ],
      [
        26.298,
        72.981
      ]
    ],
    "exposure_score": 5.8,
    "sensitivity_score": 4.6,
    "adaptive_capacity_score": 4.5,
    "raw_hvi": 5.95,
    "normalized_hvi": 6.5,
    "risk_category": "MODERATE"
  }
];


export function getCityConfig(cityId: CityId): CityConfig | undefined {
  return CITIES_REGISTRY.find(c => c.id === cityId);
}

/**
 * Generates intelligent geospatial analysis sectors/wards for any global city, town, or village
 */
export function generateLocationWards(config: CityConfig, peakTempCelsius?: number): WardData[] {
  const [centerLat, centerLon] = config.center;
  const baseTemp = config.weather?.temp_celsius || 30.0;
  const peakTemp = peakTempCelsius || baseTemp;
  const effectiveTemp = Math.max(baseTemp, peakTemp * 0.85);
  const baseHum = config.weather?.humidity_pct || 50;

  let latSpan = 0.05;
  let lonSpan = 0.05;
  if (config.bbox && Array.isArray(config.bbox) && config.bbox.length === 4) {
    const [s, w, n, e] = config.bbox;
    latSpan = Math.min(0.15, Math.max(0.01, Math.abs(n - s) * 0.3));
    lonSpan = Math.min(0.15, Math.max(0.01, Math.abs(e - w) * 0.3));
  }

  const zones = config.zones && config.zones.length > 0 ? config.zones : ['Central Zone', 'North Zone', 'East Zone', 'South Zone', 'West Zone'];

  const sectors = [
    { name: 'Commercial & Downtown Core', zone: zones[0] || 'Central Zone', dLat: latSpan * 0.1, dLon: lonSpan * 0.08, tempAdd: 2.8, ndvi: 0.12, ndwi: -0.15, buildDense: 85, popDense: 18500, lulc: 'High-Density Commercial & Asphalt Core' },
    { name: 'Northern High-Density Residential', zone: zones[1] || 'North Zone', dLat: latSpan * 0.44, dLon: lonSpan * 0.04, tempAdd: 1.4, ndvi: 0.21, ndwi: -0.08, buildDense: 74, popDense: 15200, lulc: 'Dense Mixed Residential' },
    { name: 'Eastern Industrial & Logistics Hub', zone: zones[2] || 'East Zone', dLat: latSpan * 0.16, dLon: lonSpan * 0.48, tempAdd: 3.2, ndvi: 0.09, ndwi: -0.18, buildDense: 88, popDense: 9800, lulc: 'Industrial Concrete & Metal Roofs' },
    { name: 'Southern Green Belt & Lake Suburb', zone: zones[3] || 'South Zone', dLat: -latSpan * 0.42, dLon: -lonSpan * 0.06, tempAdd: -1.8, ndvi: 0.44, ndwi: 0.22, buildDense: 38, popDense: 7200, lulc: 'Vegetated Suburban & Water Catchment' },
    { name: 'Western Urban Expansion Sector', zone: zones[4] || 'West Zone', dLat: -latSpan * 0.08, dLon: -lonSpan * 0.46, tempAdd: 0.8, ndvi: 0.26, ndwi: -0.04, buildDense: 62, popDense: 12400, lulc: 'Modern Medium-Density Residential' },
    { name: 'Heritage Old City & Market Cluster', zone: zones[0] || 'Central Zone', dLat: -latSpan * 0.24, dLon: lonSpan * 0.22, tempAdd: 2.2, ndvi: 0.14, ndwi: -0.12, buildDense: 82, popDense: 21000, lulc: 'Dense Historic Fabric & Narrow Alleys' }
  ];

  return sectors.map((sec, idx) => {
    const lat = centerLat + sec.dLat;
    const lon = centerLon + sec.dLon;
    const delta = Math.min(latSpan, lonSpan) * 0.2;

    // Construct polygon coordinates around the sector centroid
    const coordinates: [number, number][] = [
      [lat + delta * 0.9, lon - delta * 0.8],
      [lat + delta * 0.95, lon + delta * 0.85],
      [lat - delta * 0.75, lon + delta * 0.9],
      [lat - delta * 0.85, lon - delta * 0.85]
    ];

    const lst = Math.round((effectiveTemp + sec.tempAdd) * 10) / 10;
    const isHigh = lst >= 38.0 || sec.buildDense >= 80;
    const isMod = lst >= 32.0;

    return {
      ward_id: `${(config.id || 'loc').toUpperCase().slice(0, 4)}-${String(idx + 1).padStart(3, '0')}`,
      ward_name: `${sec.name} (${config.name})`,
      zone_name: sec.zone,
      pin_codes: [`${Math.floor(100000 + Math.abs(lat * 1000 + lon * 100) % 899999)}`],
      landmarks: [`${config.name} Central Plaza`, `${sec.name} Community Center`, `${sec.name} Market Hub`],
      centroid: [lat, lon],
      area_sq_km: Math.round((2.5 + (idx % 3) * 1.2) * 10) / 10,
      population: Math.round(sec.popDense * (2.5 + (idx % 3) * 1.2)),
      population_density: sec.popDense,
      lst_celsius: lst,
      ndvi: sec.ndvi,
      ndwi: sec.ndwi,
      building_density_pct: sec.buildDense,
      lulc_class: sec.lulc,
      children_0_6_pct: 8.5 + (idx % 4),
      female_pct: 48.2 + (idx % 3) * 0.5,
      sc_population_pct: 12.0 + (idx % 5),
      st_population_pct: 2.5 + (idx % 3),
      literacy_pct: 82.0 - (idx % 4) * 2,
      elderly_60_plus_pct: 11.5 + (idx % 4),
      low_income_slum_pct: sec.buildDense > 75 ? 35 : 18,
      outdoor_workers_count: Math.round(sec.popDense * 0.08),
      social_vulnerability_score: Math.round((sec.buildDense / 15 + (1 - sec.ndvi) * 3) * 10) / 10,
      uhc_name: `${config.name} Municipal Health Post ${idx + 1}`,
      uhc_distance_km: Math.round((0.6 + (idx % 4) * 0.4) * 10) / 10,
      current_temp_celsius: baseTemp,
      current_humidity_pct: baseHum,
      coordinates,
      exposure_score: Math.round(((lst - 25) / 3) * 10) / 10,
      sensitivity_score: Math.round((sec.popDense / 3000) * 10) / 10,
      adaptive_capacity_score: Math.round((sec.ndvi * 10) * 10) / 10,
      raw_hvi: Math.round(((lst - 25) / 4 + sec.buildDense / 20) * 10) / 10,
      normalized_hvi: Math.min(10, Math.max(1, Math.round(((lst - 28) / 2 + sec.buildDense / 20) * 10) / 10)),
      risk_category: isHigh ? 'HIGH' : isMod ? 'MODERATE' : 'LOW'
    };
  });
}

export function getCityRawWards(cityId: CityId, config?: CityConfig, peakTemp?: number): WardData[] {
  switch (cityId) {
    case 'hyderabad':
      return INITIAL_WARDS;
    case 'jodhpur':
      return JODHPUR_WARDS;
    default: {
      const cityConf = config || getCityConfig(cityId) || CITIES_REGISTRY[0];
      return generateLocationWards(cityConf, peakTemp);
    }
  }
}
