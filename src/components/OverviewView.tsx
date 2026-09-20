import React from 'react';
import {
  Flame,
  ThermometerSun,
  ShieldAlert,
  Trees,
  Users,
  MapPin,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { WardData, Language, StakeholderView } from '../types';
import { getTranslation } from '../services/i18n';
import { LeafletMap } from './LeafletMap';

interface OverviewViewProps {
  wards: WardData[];
  selectedWard: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  onNavigateTab: (tab: any) => void;
  onOpenPdfReport: () => void;
  onMapClick?: (lat: number, lon: number) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language,
  onNavigateTab,
  onOpenPdfReport,
  onMapClick
}) => {
  const t = getTranslation(language);

  const highRiskWards = wards.filter(w => w.risk_category === 'HIGH');
  const moderateRiskWards = wards.filter(w => w.risk_category === 'MODERATE');
  const lowRiskWards = wards.filter(w => w.risk_category === 'LOW');

  const meanLST = (
    wards.reduce((acc, w) => acc + w.lst_celsius, 0) / wards.length
  ).toFixed(1);

  const totalPop = wards.reduce((acc, w) => acc + w.population, 0);

  return (
    <div className="space-y-6">
      {/* Real-time Atmospheric Telemetry Banner */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-rose-950/40 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 flex-shrink-0">
            <ThermometerSun className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>Hyderabad Urban Agglomeration &bull; IMD Synoptic Alert</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Current Ambient Temp: <strong className="text-white">40.8°C</strong> | Heat Index: <strong className="text-rose-400">44.6°C</strong> | Peak Warning Period: 11:30 AM – 4:30 PM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('alerts')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-950/50"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Active Heat Alerts</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Monitored */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Monitored Wards</div>
          <div className="text-2xl font-black font-mono text-white mt-1">{wards.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">150 GHMC Zones</div>
        </div>

        {/* High Risk */}
        <div className="bg-slate-900 border border-rose-900/40 p-4 rounded-xl shadow-md">
          <div className="text-[11px] font-semibold text-rose-400 uppercase">High Risk Wards</div>
          <div className="text-2xl font-black font-mono text-rose-500 mt-1">{highRiskWards.length}</div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">HVI &ge; 7.0 / 10</div>
        </div>

        {/* Moderate Risk */}
        <div className="bg-slate-900 border border-amber-900/40 p-4 rounded-xl shadow-md">
          <div className="text-[11px] font-semibold text-amber-400 uppercase">Moderate Risk</div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">{moderateRiskWards.length}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">HVI 4.0 – 6.9</div>
        </div>

        {/* Low Risk */}
        <div className="bg-slate-900 border border-emerald-900/40 p-4 rounded-xl shadow-md">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase">Low Risk Buffer</div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{lowRiskWards.length}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">HVI &lt; 4.0</div>
        </div>

        {/* Mean LST */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Mean Surface LST</div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">{meanLST}°C</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Landsat 8/9 Thermal</div>
        </div>

        {/* Population Monitored */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Citizens</div>
          <div className="text-2xl font-black font-mono text-white mt-1">{(totalPop / 1000).toFixed(0)}k</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sample Coverage</div>
        </div>
      </div>

      {/* Main Interactive Map Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Geospatial Ward Heat Risk Map
            </h3>
            <p className="text-xs text-slate-400">
              Interactive Leaflet choropleth map. Click on any ward polygon to inspect detailed profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('map')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Full Screen Map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <LeafletMap
          wards={wards}
          selectedWard={selectedWard}
          onSelectWard={onSelectWard}
          language={language}
          onMapClick={onMapClick}
        />
      </div>

      {/* Quick Ward Cards Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            Monitored Wards Heat Vulnerability Roster
          </h3>
          <span className="text-xs text-slate-400">Click to inspect</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {wards.map(w => {
            const isSelected = w.ward_id === selectedWard.ward_id;
            const badgeBg =
              w.risk_category === 'HIGH'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : w.risk_category === 'MODERATE'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={w.ward_id}
                onClick={() => onSelectWard(w)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {w.ward_name}
                    </span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border ${badgeBg}`}>
                      {w.normalized_hvi}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{w.zone_name}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-amber-400 font-bold">{w.lst_celsius}°C</span>
                  <span className="text-slate-400 font-mono">NDVI: {w.ndvi}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
