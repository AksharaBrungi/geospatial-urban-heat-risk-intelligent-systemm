import React, { useState } from 'react';
import {
  Layers,
  Filter,
  MapPin,
  Building,
  RotateCcw,
  Info,
  ThermometerSun,
  Trees,
  Droplets,
  Users,
  Eye,
  ArrowRight
} from 'lucide-react';
import { WardData, Language, NavTab, CityConfig } from '../types';
import { LeafletMap } from './LeafletMap';

interface InteractiveMapPageProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  onNavigateToTab: (tab: NavTab) => void;
  selectedCity: CityConfig;
  onOpenPipelineModal?: () => void;
  onMapClick?: (lat: number, lon: number) => void;
}

export const InteractiveMapPage: React.FC<InteractiveMapPageProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language,
  onNavigateToTab,
  selectedCity,
  onOpenPipelineModal,
  onMapClick
}) => {
  const [minHvi, setMinHvi] = useState<number>(1.0);
  const [maxHvi, setMaxHvi] = useState<number>(10.0);
  const [filterZone, setFilterZone] = useState<string>('ALL');

  const filteredWards = wards.filter(w => {
    const hvi = w.normalized_hvi ?? 5.0;
    const matchHvi = hvi >= minHvi && hvi <= maxHvi;
    const matchZone = filterZone === 'ALL' || w.zone_name === filterZone;
    return matchHvi && matchZone;
  });

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-4">
      {/* Top Header & GIS Toolset */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {selectedCity.name} Interactive Municipal Ward GIS Explorer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full spatial coverage of all {wards.length} municipal zones and wards with multi-spectral satellite layers
          </p>
        </div>

        {/* Quick Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Zone Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Zone:</span>
            <select
              value={filterZone}
              onChange={e => setFilterZone(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Zones ({selectedCity.name})</option>
              {selectedCity.zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* HVI Slider */}
          <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">HVI Range:</span>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={minHvi}
              onChange={e => setMinHvi(parseFloat(e.target.value))}
              className="w-24 accent-blue-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-800">{minHvi} – {maxHvi}</span>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setMinHvi(1.0);
              setMaxHvi(10.0);
              setFilterZone('ALL');
            }}
            title="Reset Map Filters"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas with Floating Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Full-Feature Map Surface */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
          <LeafletMap
            wards={filteredWards}
            selectedWard={selectedWard}
            onSelectWard={onSelectWard}
            language={language}
            heightClass="h-[680px]"
            selectedCity={selectedCity}
            onOpenPipelineModal={onOpenPipelineModal}
            onMapClick={onMapClick}
          />
        </div>

        {/* Selected Ward Quick Details Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {selectedWard ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Inspect Selected Ward
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {selectedWard.ward_name}
              </h3>
              <div className="text-xs text-slate-500 mt-0.5">
                {selectedWard.ward_id} • {selectedWard.zone_name}
              </div>

              {/* Risk Badge */}
              <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Thermal Vulnerability</span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    selectedWard.risk_category === 'HIGH'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : selectedWard.risk_category === 'MODERATE'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}
                >
                  HVI {selectedWard.normalized_hvi}/10
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="space-y-2 mt-4 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Surface Temp (LST)</span>
                  <span className="font-bold text-slate-900">{selectedWard.lst_celsius}°C</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Vegetation (NDVI)</span>
                  <span className="font-bold text-slate-900">{selectedWard.ndvi}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Water Index (NDWI)</span>
                  <span className="font-bold text-slate-900">{selectedWard.ndwi}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Population Density</span>
                  <span className="font-bold text-slate-900">
                    {selectedWard.population_density.toLocaleString()}/km²
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Nearest Dispensary</span>
                  <span className="font-bold text-slate-900 truncate max-w-[140px]">
                    {selectedWard.uhc_distance_km} km
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Landmarks</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                    {selectedWard.landmarks[0]}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab('profile')}
                className="w-full mt-4 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <span>View Full Ward Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-3 shadow-xs">
              <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Ward Selected</h3>
              <p className="text-xs text-slate-500">
                Click any polygon on the map to inspect its indicators.
              </p>
            </div>
          )}

          {/* Quick Guidance Box */}
          <div className="bg-blue-50/60 rounded-xl border border-blue-100 p-4 text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              GIS Layer Guide
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Click any ward polygon to inspect its thermal indicators, SHAP drivers, and emergency hydration plans. Use the layer switcher on the top left of the map to toggle thermal, canopy, or population density overlays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
