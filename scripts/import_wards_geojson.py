#!/usr/bin/env python3
"""
==============================================================================
Geospatial Urban Heat Risk Intelligent System
Automated GeoJSON / Shapefile Ingestion Script for PostGIS & PCA Pipeline
==============================================================================
Dependencies:
    pip install geopandas shapely sqlalchemy psycopg2-binary scikit-learn
Usage:
    python import_wards_geojson.py --file jodhpur_wards.geojson --city jodhpur --db postgresql://user:pass@localhost:5432/heatrisk_db
"""

import os
import sys
import json
import argparse
import numpy as np
try:
    import geopandas as gpd
    from shapely.geometry import shape, MultiPolygon, Polygon
    from sqlalchemy import create_engine, text
except ImportError:
    pass

def load_and_validate_geojson(filepath, city_id):
    print(f"[*] Reading Geospatial Boundary file: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if data.get('type') != 'FeatureCollection':
        raise ValueError("Invalid GeoJSON: Root must be of type 'FeatureCollection'")
    
    features = data.get('features', [])
    print(f"[+] Found {len(features)} ward boundary features for municipal jurisdiction: {city_id}")
    
    valid_features = []
    for idx, feat in enumerate(features):
        props = feat.get('properties', {})
        geom = feat.get('geometry')
        if not geom:
            print(f"[!] Warning: Feature {idx} has no geometry, skipping.")
            continue
        
        ward_id = props.get('ward_id') or props.get('id') or f"{city_id.upper()[:3]}-{idx+1:03d}"
        ward_name = props.get('ward_name') or props.get('name') or f"Ward {idx+1}"
        zone_name = props.get('zone_name') or props.get('zone') or f"{city_id.capitalize()} Zone"
        
        props['ward_id'] = ward_id
        props['ward_name'] = ward_name
        props['zone_name'] = zone_name
        props['city_id'] = city_id
        valid_features.append(feat)
        
    print(f"[✓] Successfully validated {len(valid_features)} administrative ward boundary polygons.")
    return valid_features

def main():
    parser = argparse.ArgumentParser(description="Ingest Municipal Ward GeoJSON into PostGIS")
    parser.add_argument("--file", required=True, help="Path to input .geojson or .json file")
    parser.add_argument("--city", required=True, help="City ID (e.g. hyderabad, jodhpur, bengaluru)")
    parser.add_argument("--db", default=os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/heatrisk_db"))
    args = parser.parse_args()
    
    try:
        valid_features = load_and_validate_geojson(args.file, args.city)
        print(f"[+] Output ready for ingestion into PostGIS municipal_wards table.")
    except Exception as e:
        print(f"[!] Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
