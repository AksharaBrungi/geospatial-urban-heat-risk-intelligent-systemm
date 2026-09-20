-- ====================================================================
-- GEOSPATIAL URBAN HEAT RISK INTELLIGENT SYSTEM
-- Relational & Spatial Database Schema (PostgreSQL 15+ & PostGIS 3+)
-- ====================================================================

-- 1. Wards Master Table
CREATE TABLE IF NOT EXISTS wards (
    ward_id VARCHAR(20) PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    zone_name VARCHAR(50) NOT NULL,
    pin_codes TEXT[] NOT NULL,
    landmarks TEXT[] NOT NULL,
    area_sq_km NUMERIC(8, 3) NOT NULL,
    centroid_lat NUMERIC(9, 6) NOT NULL,
    centroid_lon NUMERIC(9, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ward Boundaries & Geometry (PostGIS Spatial Polygons)
CREATE TABLE IF NOT EXISTS ward_geometry (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) UNIQUE REFERENCES wards(ward_id) ON DELETE CASCADE,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    bounding_box BOX2D
);
CREATE INDEX IF NOT EXISTS idx_ward_geom_spatial ON ward_geometry USING GIST(geom);

-- 3. Environmental Indicators (Satellite-derived Landsat 8/9 & GEE)
CREATE TABLE IF NOT EXISTS environmental_indicators (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) REFERENCES wards(ward_id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    lst_celsius NUMERIC(5, 2) NOT NULL,
    ndvi NUMERIC(5, 3) NOT NULL,
    ndwi NUMERIC(5, 3) NOT NULL,
    building_density_pct NUMERIC(5, 2) NOT NULL,
    lulc_class VARCHAR(50) NOT NULL,
    satellite_source VARCHAR(50) DEFAULT 'Landsat 8/9 GEE Collection 2 Tier 1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_env_ward_date ON environmental_indicators(ward_id, observation_date);

-- 4. Demographics (Census & Municipal Data)
CREATE TABLE IF NOT EXISTS demographics (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) UNIQUE REFERENCES wards(ward_id) ON DELETE CASCADE,
    total_population INTEGER NOT NULL,
    population_density_per_sq_km NUMERIC(10, 2) NOT NULL,
    children_0_6_pct NUMERIC(5, 2) NOT NULL,
    female_pct NUMERIC(5, 2) NOT NULL,
    sc_population_pct NUMERIC(5, 2) NOT NULL,
    st_population_pct NUMERIC(5, 2) NOT NULL,
    literacy_pct NUMERIC(5, 2) NOT NULL
);

-- 5. Social Vulnerability Layer
CREATE TABLE IF NOT EXISTS social_vulnerability (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) UNIQUE REFERENCES wards(ward_id) ON DELETE CASCADE,
    elderly_60_plus_pct NUMERIC(5, 2) NOT NULL,
    low_income_slum_pct NUMERIC(5, 2) NOT NULL,
    outdoor_workers_count INTEGER NOT NULL,
    outdoor_worker_density_per_sq_km NUMERIC(8, 2) NOT NULL,
    social_vulnerability_score NUMERIC(4, 2) NOT NULL,
    vulnerability_tier VARCHAR(20) CHECK (vulnerability_tier IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL'))
);

-- 6. Urban Health Centers (UHC) & Proximity
CREATE TABLE IF NOT EXISTS health_centers (
    uhc_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    ward_id VARCHAR(20) REFERENCES wards(ward_id),
    location GEOMETRY(Point, 4326) NOT NULL,
    contact_phone VARCHAR(20),
    has_emergency_cooling BOOLEAN DEFAULT TRUE,
    daily_capacity INTEGER DEFAULT 150
);
CREATE INDEX IF NOT EXISTS idx_uhc_location ON health_centers USING GIST(location);

-- 7. Real-Time Weather Observations
CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) REFERENCES wards(ward_id),
    temperature_celsius NUMERIC(4, 1) NOT NULL,
    humidity_pct NUMERIC(4, 1) NOT NULL,
    heat_index_celsius NUMERIC(4, 1) NOT NULL,
    wind_speed_kmh NUMERIC(4, 1),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'Realtime Weather API'
);

-- 8. PCA-based Heat Vulnerability Index (HVI) Results
CREATE TABLE IF NOT EXISTS hvi_results (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) UNIQUE REFERENCES wards(ward_id) ON DELETE CASCADE,
    exposure_score NUMERIC(5, 3) NOT NULL,
    sensitivity_score NUMERIC(5, 3) NOT NULL,
    adaptive_capacity_score NUMERIC(5, 3) NOT NULL,
    raw_hvi NUMERIC(6, 4) NOT NULL,
    normalized_hvi NUMERIC(4, 2) NOT NULL CHECK (normalized_hvi >= 1.0 AND normalized_hvi <= 10.0),
    risk_category VARCHAR(20) NOT NULL CHECK (risk_category IN ('LOW', 'MODERATE', 'HIGH')),
    pca_exposure_pc1_variance NUMERIC(5, 2),
    pca_sensitivity_pc1_variance NUMERIC(5, 2),
    pca_adaptive_pc1_variance NUMERIC(5, 2),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Machine Learning Predictions (Random Forest & XGBoost)
CREATE TABLE IF NOT EXISTS ml_predictions (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) REFERENCES wards(ward_id) ON DELETE CASCADE,
    rf_predicted_risk NUMERIC(4, 2) NOT NULL,
    xgb_predicted_risk NUMERIC(4, 2) NOT NULL,
    ensemble_score NUMERIC(4, 2) NOT NULL,
    predicted_category VARCHAR(20) NOT NULL,
    model_version VARCHAR(30) DEFAULT 'v2.4-hybrid-ensemble',
    validation_ground_truth_delta NUMERIC(4, 2),
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Explainable AI (SHAP Contributions)
CREATE TABLE IF NOT EXISTS shap_explanations (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) REFERENCES wards(ward_id) ON DELETE CASCADE,
    base_value NUMERIC(5, 3) NOT NULL,
    shap_lst NUMERIC(5, 3) NOT NULL,
    shap_ndvi NUMERIC(5, 3) NOT NULL,
    shap_ndwi NUMERIC(5, 3) NOT NULL,
    shap_pop_density NUMERIC(5, 3) NOT NULL,
    shap_children NUMERIC(5, 3) NOT NULL,
    shap_sc_st NUMERIC(5, 3) NOT NULL,
    shap_uhc_dist NUMERIC(5, 3) NOT NULL,
    shap_social_vuln NUMERIC(5, 3) NOT NULL,
    plain_english_explanation TEXT NOT NULL,
    plain_telugu_explanation TEXT NOT NULL,
    top_drivers JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Scenario Simulations
CREATE TABLE IF NOT EXISTS scenario_results (
    scenario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id VARCHAR(20) REFERENCES wards(ward_id),
    name VARCHAR(100) NOT NULL,
    delta_green_cover_pct NUMERIC(5, 2) DEFAULT 0.0,
    delta_urban_expansion_pct NUMERIC(5, 2) DEFAULT 0.0,
    delta_cool_roof_pct NUMERIC(5, 2) DEFAULT 0.0,
    baseline_hvi NUMERIC(4, 2) NOT NULL,
    simulated_hvi NUMERIC(4, 2) NOT NULL,
    hvi_reduction NUMERIC(4, 2) NOT NULL,
    simulated_by VARCHAR(50) DEFAULT 'Urban Planner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Contextual Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) REFERENCES wards(ward_id),
    domain VARCHAR(50) NOT NULL, -- 'VEGETATION', 'HEAT_EXPOSURE', 'HEALTHCARE', 'COMMUNITY'
    trigger_condition VARCHAR(100) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    title_te VARCHAR(200) NOT NULL,
    action_en TEXT NOT NULL,
    action_te TEXT NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    feasibility_months INTEGER DEFAULT 6
);

-- 13. Threshold Alerts & Notifications
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    ward_id VARCHAR(20) REFERENCES wards(ward_id),
    alert_level VARCHAR(20) CHECK (alert_level IN ('RED', 'AMBER', 'YELLOW')),
    headline_en VARCHAR(200) NOT NULL,
    headline_te VARCHAR(200) NOT NULL,
    trigger_metric VARCHAR(100) NOT NULL,
    advisory_en TEXT NOT NULL,
    advisory_te TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Spatial Location Search Audit Log
CREATE TABLE IF NOT EXISTS search_queries (
    id SERIAL PRIMARY KEY,
    query_text VARCHAR(200) NOT NULL,
    query_type VARCHAR(20) CHECK (query_type IN ('PIN', 'WARD_NAME', 'LANDMARK')),
    resolved_ward_id VARCHAR(20) REFERENCES wards(ward_id),
    queried_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Query Helpers
-- Find ward containing a given coordinate (Lat, Lon):
-- SELECT ward_id, ward_name FROM wards JOIN ward_geometry USING(ward_id)
-- WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(78.4747, 17.3616), 4326));

-- Calculate shortest distance from ward centroid to nearest Urban Health Center:
-- SELECT w.ward_id, MIN(ST_Distance(ST_SetSRID(ST_MakePoint(w.centroid_lon, w.centroid_lat), 4326)::geography, h.location::geography)) AS min_distance_meters
-- FROM wards w CROSS JOIN health_centers h GROUP BY w.ward_id;
