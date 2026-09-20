import React, { useState } from 'react';
import {
  ThermometerSun,
  Trees,
  Droplets,
  Users,
  Building,
  HeartPulse,
  Wind,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';
import { WardData, Language, NavTab, CityConfig } from '../types';
import { calculateWardSHAP } from '../services/shapEngine';
import { getTranslation } from '../services/i18n';

interface WardInfoPanelProps {
  ward?: WardData;
  language: Language;
  onNavigateToTab: (tab: NavTab) => void;
  selectedCity?: CityConfig;
}

export const WardInfoPanel: React.FC<WardInfoPanelProps> = ({
  ward,
  language,
  onNavigateToTab,
  selectedCity
}) => {
  const t = getTranslation(language);
  const [activeSubTab, setActiveSubTab] = useState<
    'indicators' | 'demographics' | 'environmental' | 'weather' | 'recommendations'
  >('indicators');

  if (!ward) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-3 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Building className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Ward Selected</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Select an administrative ward from the map or ingest municipal boundaries to inspect thermal indicators and SHAP vulnerability drivers.
        </p>
      </div>
    );
  }

  const shapData = calculateWardSHAP(ward);
  const sortedDrivers = shapData.ranked_drivers || shapData.features;

  const riskBadge =
    ward.risk_category === 'HIGH'
      ? { label: 'High Risk', bg: 'bg-red-50 text-red-700 border-red-200' }
      : ward.risk_category === 'MODERATE'
      ? { label: 'Moderate Risk', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
      : { label: 'Low Risk', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

  return (
    <div className="space-y-4">
      {/* 1. Primary Ward Information Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        {/* Ward Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {ward.zone_name} • PIN {ward.pin_codes[0]}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {ward.ward_name}{' '}
              <span className="text-xs font-medium text-slate-500">({ward.ward_id})</span>
            </h2>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full border ${riskBadge.bg}`}
          >
            {riskBadge.label}
          </span>
        </div>

        {/* 4 Core KPI Mini-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">HVI Score</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {ward.normalized_hvi ?? '5.0'}
              <span className="text-[10px] text-slate-400 font-normal">/10</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Exposure</div>
            <div className="text-base font-extrabold text-rose-600 mt-0.5">
              {ward.exposure_score ? ward.exposure_score.toFixed(1) : '5.2'}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Sensitivity</div>
            <div className="text-base font-extrabold text-amber-600 mt-0.5">
              {ward.sensitivity_score ? ward.sensitivity_score.toFixed(1) : '6.1'}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Adaptive Cap.</div>
            <div className="text-base font-extrabold text-emerald-600 mt-0.5">
              {ward.adaptive_capacity_score
                ? ward.adaptive_capacity_score.toFixed(1)
                : '4.8'}
            </div>
          </div>
        </div>

        {/* Action Link: View Full Profile */}
        <button
          id="btn-view-full-profile"
          onClick={() => onNavigateToTab('profile')}
          className="w-full py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <span>View Full Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Ward Indicator Details & Sub-Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        {/* Sub-Tabs Header */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveSubTab('indicators')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeSubTab === 'indicators'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Key Indicators
          </button>
          <button
            onClick={() => setActiveSubTab('demographics')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeSubTab === 'demographics'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Demographics
          </button>
          <button
            onClick={() => setActiveSubTab('environmental')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeSubTab === 'environmental'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Environmental
          </button>
          <button
            onClick={() => setActiveSubTab('weather')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeSubTab === 'weather'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Weather
          </button>
          <button
            onClick={() => setActiveSubTab('recommendations')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeSubTab === 'recommendations'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Actions
          </button>
        </div>

        {/* Tab 1: Key Indicators Grid (Compact 2x4) */}
        {activeSubTab === 'indicators' && (
          <div className="grid grid-cols-2 gap-2.5 pt-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-rose-100 text-rose-600">
                <ThermometerSun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">LST Surface</div>
                <div className="text-xs font-bold text-slate-900">{ward.lst_celsius}°C</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600">
                <Trees className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">NDVI Green</div>
                <div className="text-xs font-bold text-slate-900">{ward.ndvi}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-sky-100 text-sky-600">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">NDWI Water</div>
                <div className="text-xs font-bold text-slate-900">{ward.ndwi}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-purple-100 text-purple-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Pop Density</div>
                <div className="text-xs font-bold text-slate-900">
                  {ward.population_density.toLocaleString()}/km²
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-amber-100 text-amber-600">
                <ThermometerSun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Current Temp</div>
                <div className="text-xs font-bold text-slate-900">{ward.current_temp_celsius}°C</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Humidity</div>
                <div className="text-xs font-bold text-slate-900">{ward.current_humidity_pct}%</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-slate-200 text-slate-700">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Built-up</div>
                <div className="text-xs font-bold text-slate-900">{ward.building_density_pct}%</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-teal-100 text-teal-600">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">UHC Proximity</div>
                <div className="text-xs font-bold text-slate-900">{ward.uhc_distance_km} km</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Demographics Breakdown */}
        {activeSubTab === 'demographics' && (
          <div className="space-y-2.5 pt-3 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600">Total Ward Population</span>
              <span className="font-bold text-slate-900">{ward.population.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600">Children (0–6 years)</span>
              <span className="font-bold text-slate-900">{ward.children_0_6_pct}%</span>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600">Elderly Population (60+)</span>
              <span className="font-bold text-slate-900">{ward.elderly_60_plus_pct}%</span>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600">Low-Income / Slum Ratio</span>
              <span className="font-bold text-slate-900">{ward.low_income_slum_pct}%</span>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600">Outdoor Daily Wage Workers</span>
              <span className="font-bold text-slate-900">
                {ward.outdoor_workers_count.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Literacy Rate</span>
              <span className="font-bold text-slate-900">{ward.literacy_pct}%</span>
            </div>
          </div>
        )}

        {/* Tab 3: Environmental Details */}
        {activeSubTab === 'environmental' && (
          <div className="space-y-2.5 pt-3 text-xs">
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-semibold text-slate-500">LULC Land Classification</div>
              <div className="font-bold text-slate-900 mt-0.5">{ward.lulc_class}</div>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600">Ward Geographic Area</span>
              <span className="font-bold text-slate-900">{ward.area_sq_km} sq km</span>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600">Primary Ward Landmark</span>
              <span className="font-bold text-slate-900">{ward.landmarks[0]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Satellite Source</span>
              <span className="font-bold text-slate-900">Landsat 8/9 TIRS (30m)</span>
            </div>
          </div>
        )}

        {/* Tab 4: Weather & Heat Index */}
        {activeSubTab === 'weather' && (
          <div className="space-y-2.5 pt-3 text-xs">
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60">
              <div className="text-[10px] font-bold text-amber-800 uppercase">
                Steadman Heat Index (Feels Like)
              </div>
              <div className="text-lg font-extrabold text-amber-900 mt-0.5">
                {(ward.current_temp_celsius + (ward.current_humidity_pct / 100) * 5.2).toFixed(1)}°C
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Caution Level: Mandatory outdoor breaks and continuous hydration required.
              </p>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600">Nearest Weather Station</span>
              <span className="font-bold text-slate-900">{selectedCity?.weather?.station_name || 'IMD Regional Observatory'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Serving Dispensary</span>
              <span className="font-bold text-slate-900 truncate max-w-[180px]">
                {ward.uhc_name}
              </span>
            </div>
          </div>
        )}

        {/* Tab 5: Recommendations Preview */}
        {activeSubTab === 'recommendations' && (
          <div className="space-y-2 pt-3 text-xs">
            <div className="p-2 rounded bg-blue-50 text-blue-900 border border-blue-100">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Cool Roofs & High-Albedo Retrofit
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Prioritize white elastomeric coating on tin-roofed slum clusters and municipal schools.
              </p>
            </div>
            <div className="p-2 rounded bg-emerald-50 text-emerald-900 border border-emerald-100">
              <div className="font-bold flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-emerald-600" />
                Urban Green Canopy Expansion
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Target 20% micro-park tree planting around bus corridors and open plazas.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('recommendations')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 pt-1"
            >
              <span>View All Ward Interventions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 3. SHAP Feature Attribution Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top Contributing Factors (SHAP)
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('profile')}
            className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-0.5"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
          Feature contribution to heat risk score relative to {selectedCity?.name || 'city'}-wide baseline:
        </p>

        {/* Contribution Bars */}
        <div className="space-y-2">
          {sortedDrivers.slice(0, 5).map(driver => {
            const isPositive = driver.shap_value >= 0;
            const widthPct = Math.min(100, Math.abs(driver.shap_value) * 35);

            return (
              <div key={driver.feature_key} className="text-xs">
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-medium text-slate-700 truncate max-w-[190px]">
                    {driver.feature}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isPositive ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {isPositive ? `+${driver.shap_value}` : `${driver.shap_value}`}
                  </span>
                </div>
                {/* Horizontal Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPositive ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(8, widthPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Plain Language Grounded Explanation */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800">
            {language === 'te' ? 'విశ్లేషణ సారాంశం: ' : 'Model Interpretation: '}
          </span>
          {language === 'te' ? shapData.plain_telugu_explanation : shapData.plain_english_explanation}
        </div>
      </div>
    </div>
  );
};
