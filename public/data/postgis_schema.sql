-- ==============================================================================
-- Geospatial Urban Heat Risk Intelligent System
-- Production PostGIS Municipal Ward Schema Definition
-- CRS: EPSG:4326 (WGS 84) / Projected: EPSG:32643 (UTM Zone 43N for India Plateau)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 1. Cities Registry Table
CREATE TABLE IF NOT EXISTS municipal_cities (
    city_id VARCHAR(64) PRIMARY KEY,
    city_name VARCHAR(128) NOT NULL,
    state_name VARCHAR(128) NOT NULL,
    municipal_body VARCHAR(256) NOT NULL,
    center_geom GEOMETRY(Point, 4326) NOT NULL,
    default_zoom INTEGER DEFAULT 11,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Municipal Administrative Wards Table with MultiPolygon Geometry
CREATE TABLE IF NOT EXISTS municipal_wards (
    ward_id VARCHAR(32) PRIMARY KEY,
    ward_name VARCHAR(128) NOT NULL,
    city_id VARCHAR(64) NOT NULL REFERENCES municipal_cities(city_id) ON DELETE CASCADE,
    zone_name VARCHAR(128) NOT NULL,
    pin_codes TEXT[],
    landmarks TEXT[],
    area_sq_km NUMERIC(10, 4),
    population INTEGER,
    population_density NUMERIC(12, 2),
    
    -- Remote Sensing Satellite Metrics (Landsat 8/9 TIRS & OLI)
    lst_celsius NUMERIC(5, 2),
    ndvi NUMERIC(5, 4),
    ndwi NUMERIC(5, 4),
    building_density_pct NUMERIC(5, 2),
    lulc_class VARCHAR(128),
    
    -- Demographic & Socio-Economic Indicators (Census / SECC)
    children_0_6_pct NUMERIC(5, 2),
    female_pct NUMERIC(5, 2),
    sc_population_pct NUMERIC(5, 2),
    st_population_pct NUMERIC(5, 2),
    literacy_pct NUMERIC(5, 2),
    elderly_60_plus_pct NUMERIC(5, 2),
    low_income_slum_pct NUMERIC(5, 2),
    outdoor_workers_count INTEGER,
    social_vulnerability_score NUMERIC(4, 2),
    
    -- Healthcare & Emergency Infrastructure
    uhc_name VARCHAR(256),
    uhc_distance_km NUMERIC(5, 2),
    
    -- Evaluated Heat Vulnerability Index (HVI) & Principal Components
    exposure_score NUMERIC(5, 2),
    sensitivity_score NUMERIC(5, 2),
    adaptive_capacity_score NUMERIC(5, 2),
    raw_hvi NUMERIC(8, 4),
    normalized_hvi NUMERIC(4, 2),
    risk_category VARCHAR(16) CHECK (risk_category IN ('LOW', 'MODERATE', 'HIGH')),
    
    -- Geospatial Boundary (MultiPolygon EPSG:4326) and Centroid Point
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326)
);

-- 3. High-Performance Spatial Indices (GIST)
CREATE INDEX IF NOT EXISTS idx_municipal_wards_geom ON municipal_wards USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_municipal_wards_centroid ON municipal_wards USING GIST(centroid);
CREATE INDEX IF NOT EXISTS idx_municipal_wards_city_id ON municipal_wards(city_id);
CREATE INDEX IF NOT EXISTS idx_municipal_wards_hvi ON municipal_wards(normalized_hvi);

-- 4. View for Direct GeoJSON Streaming to Leaflet / Map Clients
CREATE OR REPLACE VIEW v_wards_geojson AS
SELECT 
    city_id,
    json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
            json_build_object(
                'type', 'Feature',
                'id', ward_id,
                'geometry', ST_AsGeoJSON(geom)::json,
                'properties', json_build_object(
                    'ward_id', ward_id,
                    'ward_name', ward_name,
                    'city_id', city_id,
                    'zone_name', zone_name,
                    'pin_codes', pin_codes,
                    'landmarks', landmarks,
                    'area_sq_km', area_sq_km,
                    'population', population,
                    'population_density', population_density,
                    'lst_celsius', lst_celsius,
                    'ndvi', ndvi,
                    'ndwi', ndwi,
                    'building_density_pct', building_density_pct,
                    'lulc_class', lulc_class,
                    'normalized_hvi', normalized_hvi,
                    'risk_category', risk_category,
                    'exposure_score', exposure_score,
                    'sensitivity_score', sensitivity_score,
                    'adaptive_capacity_score', adaptive_capacity_score,
                    'centroid', json_build_array(ST_Y(centroid), ST_X(centroid))
                )
            )
        )
    ) AS geojson
FROM municipal_wards
GROUP BY city_id;
