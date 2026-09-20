import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Database,
  Code2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FolderOpen,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CityConfig, WardData } from '../types';
import { parseAndIngestWardGeoJSON, GeoJSONValidationResult } from '../services/geojsonImporter';

interface GeoJsonPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: CityConfig;
  onIngestSuccess: (cityId: string, wards: WardData[]) => void;
}

export const GeoJsonPipelineModal: React.FC<GeoJsonPipelineModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onIngestSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'postgis' | 'python'>('upload');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<GeoJSONValidationResult | null>(null);
  const [isCopiedSql, setIsCopiedSql] = useState<boolean>(false);
  const [isCopiedPython, setIsCopiedPython] = useState<boolean>(false);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setFileContent(text);
      const res = parseAndIngestWardGeoJSON(text, selectedCity.id, selectedCity);
      setValidationResult(res);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setFileContent(text);
      const res = parseAndIngestWardGeoJSON(text, selectedCity.id, selectedCity);
      setValidationResult(res);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleJodhpur = async () => {
    try {
      setIsLoadingSample(true);
      const res = await fetch('/data/jodhpur_wards.geojson');
      if (!res.ok) throw new Error('Could not load /data/jodhpur_wards.geojson');
      const text = await res.text();
      setFileName('jodhpur_wards.geojson');
      setFileContent(text);
      const val = parseAndIngestWardGeoJSON(text, selectedCity.id, selectedCity);
      setValidationResult(val);
    } catch (err: any) {
      alert(`Error loading sample: ${err.message}`);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleApplyWards = () => {
    if (validationResult && validationResult.success && validationResult.wards) {
      onIngestSuccess(selectedCity.id, validationResult.wards);
      onClose();
    }
  };

  const postgisSql = `-- Production PostGIS Municipal Ward Schema (EPSG:4326)
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS municipal_wards (
    ward_id VARCHAR(32) PRIMARY KEY,
    ward_name VARCHAR(128) NOT NULL,
    city_id VARCHAR(64) NOT NULL,
    zone_name VARCHAR(128),
    area_sq_km NUMERIC(10, 4),
    population INTEGER,
    population_density NUMERIC(12, 2),
    lst_celsius NUMERIC(5, 2),
    ndvi NUMERIC(5, 4),
    ndwi NUMERIC(5, 4),
    building_density_pct NUMERIC(5, 2),
    social_vulnerability_score NUMERIC(4, 2),
    uhc_distance_km NUMERIC(5, 2),
    normalized_hvi NUMERIC(4, 2),
    risk_category VARCHAR(16) CHECK (risk_category IN ('LOW', 'MODERATE', 'HIGH')),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_wards_geom ON municipal_wards USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_wards_city ON municipal_wards(city_id);

-- Stream GeoJSON FeatureCollection to Leaflet
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
                    'zone_name', zone_name,
                    'normalized_hvi', normalized_hvi,
                    'risk_category', risk_category,
                    'lst_celsius', lst_celsius,
                    'ndvi', ndvi
                )
            )
        )
    ) AS geojson
FROM municipal_wards
GROUP BY city_id;`;

  const pythonScript = `#!/usr/bin/env python3
"""
Automated GeoJSON / Shapefile Ingestion Script for PostGIS & PCA Pipeline
"""
import json, sys
import geopandas as gpd
from sqlalchemy import create_engine

def import_wards_to_postgis(filepath, city_id, db_uri):
    print(f"[*] Reading GIS layer from {filepath}...")
    gdf = gpd.read_file(filepath)
    
    # Ensure EPSG:4326 WGS 84
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)
        
    gdf['city_id'] = city_id
    engine = create_engine(db_uri)
    gdf.to_postgis("municipal_wards", engine, if_exists="append", index=False)
    print(f"[✓] Successfully ingested {len(gdf)} ward boundary polygons for {city_id}!")

if __name__ == "__main__":
    import_wards_to_postgis("jodhpur_wards.geojson", "jodhpur", "postgresql://user:pass@localhost:5432/heatrisk_db")`;

  const copyToClipboard = (text: string, type: 'sql' | 'python') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setIsCopiedSql(true);
      setTimeout(() => setIsCopiedSql(false), 2000);
    } else {
      setIsCopiedPython(true);
      setTimeout(() => setIsCopiedPython(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Municipal Ward Boundary & PostGIS Pipeline
              </h2>
              <p className="text-xs text-slate-500">
                Target City: <strong className="text-slate-700">{selectedCity.full_label}</strong> ({selectedCity.municipal_body})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-slate-50/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>GeoJSON Ingestion</span>
          </button>
          <button
            onClick={() => setActiveTab('postgis')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'postgis'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>PostGIS DDL Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'python'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Python / GDAL Pipeline</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition cursor-pointer relative"
              >
                <input
                  type="file"
                  accept=".geojson,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Drop RFC 7946 Municipal Ward GeoJSON here
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Upload an official FeatureCollection with Polygon or MultiPolygon coordinates. The PCA engine will automatically calculate HVI risk categories upon load.
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                  Browse .geojson / .json files
                </span>
              </div>

              {/* Sample Loader Shortcut */}
              <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Available Municipal Research Boundary Layer
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Load validated research polygon boundary dataset for JMC administrative wards.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleJodhpur}
                  disabled={isLoadingSample}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg text-xs shadow-2xs transition shrink-0"
                >
                  {isLoadingSample ? 'Loading...' : 'Load Research GeoJSON'}
                </button>
              </div>

              {/* Validation Feedback */}
              {validationResult && (
                <div
                  className={`rounded-xl p-4 border text-xs ${
                    validationResult.success
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {validationResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-sm">
                        {validationResult.success
                          ? 'GeoJSON Ingestion & Validation Succeeded'
                          : 'GeoJSON Ingestion Failed'}
                      </div>
                      <p className="mt-1 text-slate-700 leading-relaxed">
                        {validationResult.message}
                      </p>
                      {validationResult.success && validationResult.wards && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
                          <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                            <span className="text-slate-500 block">Wards Ingested:</span>
                            <span className="font-bold text-slate-900 text-sm">
                              {validationResult.wards.length}
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                            <span className="text-slate-500 block">Risk Evaluation:</span>
                            <span className="font-bold text-emerald-700 text-sm">
                              PCA Engine Complete
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                            <span className="text-slate-500 block">Geospatial CRS:</span>
                            <span className="font-bold text-slate-900 text-sm">
                              EPSG:4326 (WGS84)
                            </span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                            <span className="text-slate-500 block">Geometry Type:</span>
                            <span className="font-bold text-slate-900 text-sm">
                              MultiPolygon / Polygon
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'postgis' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Production PostgreSQL / PostGIS DDL with Spatial GIST Indexing:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(postgisSql, 'sql')}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                >
                  {isCopiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedSql ? 'Copied' : 'Copy DDL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-slate-700">
                {postgisSql}
              </pre>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Automated GeoPandas / SQLAlchemy Ingestion Script:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pythonScript, 'python')}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                >
                  {isCopiedPython ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedPython ? 'Copied' : 'Copy Python'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-slate-700">
                {pythonScript}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {fileName ? `File: ${fileName}` : 'Strict geospatial integrity: no fabricated shapes.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            {activeTab === 'upload' && validationResult?.success && (
              <button
                onClick={handleApplyWards}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Render All Wards on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
