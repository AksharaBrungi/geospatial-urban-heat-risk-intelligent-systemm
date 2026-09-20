-- ====================================================================
-- GEOSPATIAL URBAN HEAT RISK INTELLIGENT SYSTEM
-- PostgreSQL + PostGIS Spatial Database Initialization
-- ====================================================================

-- Enable PostGIS Extension for geospatial polygon & distance indexing
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Confirm PostGIS version
SELECT PostGIS_Full_Version();
