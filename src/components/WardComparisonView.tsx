import React, { useState } from 'react';
import { GitCompare, Plus, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { WardData, Language } from '../types';
import { getTranslation } from '../services/i18n';
import { WardComparisonChart } from './PlotlyCharts';

interface WardComparisonViewProps {
  wards: WardData[];
  selectedWard?: WardData;
  language: Language;
}

export const WardComparisonView: React.FC<WardComparisonViewProps> = ({
  wards,
  selectedWard,
  language
}) => {
  const t = getTranslation(language);

  // Initialize with selected ward + high risk ward + low risk ward
  const [selectedWardIds, setSelectedWardIds] = useState<string[]>(() => {
    if (!selectedWard || wards.length === 0) return [];
    return [
      selectedWard.ward_id,
      wards.find(w => w.ward_id !== selectedWard.ward_id && w.risk_category === 'HIGH')?.ward_id || wards[0]?.ward_id,
      wards.find(w => w.risk_category === 'LOW')?.ward_id || wards[1]?.ward_id
    ].filter(Boolean) as string[];
  });

  if (!selectedWard || wards.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
        <GitCompare className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Wards Available for Comparison</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select a city with complete municipal ward boundaries or ingest a GeoJSON layer to compare ward metrics.
        </p>
      </div>
    );
  }

  const activeWards = wards.filter(w => selectedWardIds.includes(w.ward_id));

  const handleAddWard = (wardId: string) => {
    if (!selectedWardIds.includes(wardId) && selectedWardIds.length < 4) {
      setSelectedWardIds([...selectedWardIds, wardId]);
    }
  };

  const handleRemoveWard = (wardId: string) => {
    if (selectedWardIds.length > 2) {
      setSelectedWardIds(selectedWardIds.filter(id => id !== wardId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Selector Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4 text-amber-400" />
              Comparative Geospatial Analytics Matrix
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t.navComparison}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side indicator benchmarking across GHMC wards for equitable resource allocation
            </p>
          </div>

          {/* Add Ward Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Add Ward (Max 4):</span>
            <select
              onChange={e => {
                if (e.target.value) {
                  handleAddWard(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:border-amber-500 focus:ring-0"
              defaultValue=""
            >
              <option value="" disabled>Select a ward to compare...</option>
              {wards
                .filter(w => !selectedWardIds.includes(w.ward_id))
                .map(w => (
                  <option key={w.ward_id} value={w.ward_id}>
                    + {w.ward_name} ({w.ward_id})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plotly Multi-Bar Comparative Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-2">
          Key Indicator Cross-Comparison
        </h3>
        <WardComparisonChart wards={activeWards} />
      </div>

      {/* Side-by-Side Comprehensive Indicator Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Granular Demographic & Geospatial Indicators
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {activeWards.length} Wards Benchmarked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-1/4">Indicator / Metric</th>
                {activeWards.map(w => (
                  <th key={w.ward_id} className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-white font-bold">{w.ward_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{w.ward_id}</div>
                      </div>
                      {activeWards.length > 2 && (
                        <button
                          onClick={() => handleRemoveWard(w.ward_id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {/* Row 1: HVI */}
              <tr className="bg-slate-900/40">
                <td className="py-3 px-4 font-bold text-slate-200">Heat Vulnerability Index (HVI)</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono font-bold text-base">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        w.risk_category === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : w.risk_category === 'MODERATE'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {w.normalized_hvi} / 10 ({w.risk_category})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 2: LST */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Land Surface Temp (LST)</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono font-bold text-amber-400">
                    {w.lst_celsius}°C
                  </td>
                ))}
              </tr>

              {/* Row 3: NDVI */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Vegetation Canopy (NDVI)</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {w.ndvi}
                  </td>
                ))}
              </tr>

              {/* Row 4: Population Density */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Population Density</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono">
                    {w.population_density.toLocaleString()} /km²
                  </td>
                ))}
              </tr>

              {/* Row 5: Built-up Density */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Built-Up Density</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono">
                    {w.building_density_pct}%
                  </td>
                ))}
              </tr>

              {/* Row 6: Nearest UHC Distance */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Distance to UHC</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono">
                    {w.uhc_distance_km} km
                  </td>
                ))}
              </tr>

              {/* Row 7: Children 0-6 */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Children Aged 0–6</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono">
                    {w.children_0_6_pct}%
                  </td>
                ))}
              </tr>

              {/* Row 8: Outdoor Workers */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Outdoor Laborers</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono font-bold text-slate-200">
                    {w.outdoor_workers_count.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Row 9: Slum Population % */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Slum Settlements %</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono">
                    {w.low_income_slum_pct}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
