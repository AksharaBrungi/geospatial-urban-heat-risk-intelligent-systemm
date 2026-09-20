import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Trees,
  Building,
  SunMedium,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { WardData, Language } from '../types';
import { getTranslation } from '../services/i18n';
import { simulateScenario } from '../services/scenarioEngine';
import { ScenarioDeltaChart } from './PlotlyCharts';

interface ScenarioViewProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language
}) => {
  const t = getTranslation(language);

  const [deltaGreen, setDeltaGreen] = useState<number>(20); // +20% green cover
  const [deltaUrban, setDeltaUrban] = useState<number>(0); // 0% urban expansion
  const [deltaCoolRoof, setDeltaCoolRoof] = useState<number>(15); // +15% cool roofs

  if (!selectedWard) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
        <Sliders className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Ward Selected for Simulation</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select an administrative ward to test climate intervention scenarios like urban afforestation and cool roofs.
        </p>
      </div>
    );
  }

  const simulation = simulateScenario(selectedWard, deltaGreen, deltaUrban, deltaCoolRoof);

  const handleReset = () => {
    setDeltaGreen(0);
    setDeltaUrban(0);
    setDeltaCoolRoof(0);
  };

  const handlePresetGreening = () => {
    setDeltaGreen(35);
    setDeltaUrban(0);
    setDeltaCoolRoof(25);
  };

  const handlePresetUncontrolledUrban = () => {
    setDeltaGreen(0);
    setDeltaUrban(30);
    setDeltaCoolRoof(0);
  };

  return (
    <div className="space-y-6">
      {/* Title & Ward Selection Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4 text-amber-400" />
              What-If Urban Planning Simulator
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t.scenarioTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.scenarioSubtitle}
            </p>
          </div>

          {/* Ward Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Target Ward:</span>
            <select
              value={selectedWard.ward_id}
              onChange={e => {
                const target = wards.find(w => w.ward_id === e.target.value);
                if (target) onSelectWard(target);
              }}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:border-amber-500 focus:ring-0"
            >
              {wards.map(w => (
                <option key={w.ward_id} value={w.ward_id}>
                  {w.ward_name} ({w.ward_id}) - HVI: {w.normalized_hvi}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preset Intervention Quick Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Scenarios:</span>
        <button
          onClick={handlePresetGreening}
          className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 text-xs font-semibold transition flex items-center gap-1.5"
        >
          <Trees className="w-3.5 h-3.5 text-emerald-400" />
          Aggressive Urban Greening & Cool Roofs (+35% Green, +25% Cool Roof)
        </button>
        <button
          onClick={handlePresetUncontrolledUrban}
          className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-700/60 hover:bg-rose-900 text-xs font-semibold transition flex items-center gap-1.5"
        >
          <Building className="w-3.5 h-3.5 text-rose-400" />
          Uncontrolled Concrete Growth (+30% Built-up)
        </button>
        <button
          onClick={handleReset}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Baseline
        </button>
      </div>

      {/* Interactive Controls & Live Outcome Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Intervention Parameters
          </h3>

          {/* Slider 1: Green Canopy Cover */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-emerald-400" />
                {t.paramGreenCover}
              </label>
              <span className="font-mono font-bold text-emerald-400 text-sm">+{deltaGreen}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={deltaGreen}
              onChange={e => setDeltaGreen(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (No change)</span>
              <span>+25% (Miyawaki Parks)</span>
              <span>+50% (Dense Corridors)</span>
            </div>
          </div>

          {/* Slider 2: Urban Expansion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Building className="w-4 h-4 text-rose-400" />
                {t.paramUrbanExpansion}
              </label>
              <span className="font-mono font-bold text-rose-400 text-sm">+{deltaUrban}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={deltaUrban}
              onChange={e => setDeltaUrban(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Protected)</span>
              <span>+20% (Moderate Sprawl)</span>
              <span>+40% (Intense Densification)</span>
            </div>
          </div>

          {/* Slider 3: Cool Roofs & High-Albedo Retrofit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <SunMedium className="w-4 h-4 text-cyan-400" />
                {t.paramCoolRoofs}
              </label>
              <span className="font-mono font-bold text-cyan-400 text-sm">+{deltaCoolRoof}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={deltaCoolRoof}
              onChange={e => setDeltaCoolRoof(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Standard concrete)</span>
              <span>+15% (Telangana Cool Roof Pilot)</span>
              <span>+30% (City-Wide Mandate)</span>
            </div>
          </div>

          {/* Quantitative Impact Narrative Card */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Info className="w-3.5 h-3.5" />
              Projected Outcome:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {simulation.impact_summary_en}
            </p>
            {language === 'te' && (
              <p className="text-xs text-amber-200/90 leading-relaxed font-sans pt-1 border-t border-slate-800">
                {simulation.impact_summary_te}
              </p>
            )}
          </div>
        </div>

        {/* Outcome Cards & Delta Plotly Visualization */}
        <div className="lg:col-span-7 space-y-4">
          {/* Side-by-side Baseline vs Simulated Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Baseline Card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t.currentBaseline}
              </div>
              <div className="text-2xl font-black font-mono text-slate-200 mt-1">
                {simulation.baseline.hvi} / 10
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                {simulation.baseline.risk_category}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-mono">
                LST: {simulation.baseline.lst_celsius}°C | NDVI: {simulation.baseline.ndvi}
              </div>
            </div>

            {/* Simulated Future Card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center relative overflow-hidden">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {t.simulatedFuture}
              </div>
              <div
                className={`text-2xl font-black font-mono mt-1 ${
                  simulation.simulated.hvi < simulation.baseline.hvi ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {simulation.simulated.hvi} / 10
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">
                {simulation.simulated.risk_category}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-mono">
                LST: {simulation.simulated.lst_celsius}°C | NDVI: {simulation.simulated.ndvi}
              </div>
            </div>

            {/* Net Delta Impact Card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t.netDeltaChange}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {simulation.delta.hvi_change < 0 ? (
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                ) : simulation.delta.hvi_change > 0 ? (
                  <TrendingUp className="w-5 h-5 text-rose-400" />
                ) : null}
                <span
                  className={`text-2xl font-black font-mono ${
                    simulation.delta.hvi_change < 0 ? 'text-emerald-400' : simulation.delta.hvi_change > 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  {simulation.delta.hvi_change > 0 ? `+${simulation.delta.hvi_change}` : `${simulation.delta.hvi_change}`}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                LST Shift: {simulation.delta.lst_change_celsius > 0 ? `+${simulation.delta.lst_change_celsius}` : `${simulation.delta.lst_change_celsius}`}°C
              </div>
            </div>
          </div>

          {/* Plotly Delta Comparison Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Comparative Impact Metrics (Baseline vs Simulated)
            </h4>
            <ScenarioDeltaChart result={simulation} />
          </div>
        </div>
      </div>
    </div>
  );
};
