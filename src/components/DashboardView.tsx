import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
  TrendingUp,
  PieChart,
  BarChart3,
  BellRing
} from 'lucide-react';
import { WardData, Language, NavTab, CityConfig } from '../types';
import { LeafletMap } from './LeafletMap';
import { WardInfoPanel } from './WardInfoPanel';
import { RiskDistributionDonutChart, ZoneComparisonBarChart } from './PlotlyCharts';
import { evaluateWardAlerts } from '../services/alertEngine';
import { Info } from 'lucide-react';

interface DashboardViewProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  onNavigateToTab: (tab: NavTab) => void;
  selectedCity: CityConfig;
  onOpenPipelineModal?: () => void;
  onMapClick?: (lat: number, lon: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language,
  onNavigateToTab,
  selectedCity,
  onOpenPipelineModal,
  onMapClick
}) => {
  // Compute city-wide risk statistics
  const lowRiskWards = wards.filter(w => (w.normalized_hvi ?? 5.0) < 4.0);
  const modRiskWards = wards.filter(w => {
    const hvi = w.normalized_hvi ?? 5.0;
    return hvi >= 4.0 && hvi < 7.0;
  });
  const highRiskWards = wards.filter(w => (w.normalized_hvi ?? 5.0) >= 7.0);

  // Compute average HVI by zone
  const zoneMap: { [key: string]: { totalHvi: number; count: number } } = {};
  wards.forEach(w => {
    const z = w.zone_name;
    const hvi = w.normalized_hvi ?? 5.0;
    if (!zoneMap[z]) {
      zoneMap[z] = { totalHvi: 0, count: 0 };
    }
    zoneMap[z].totalHvi += hvi;
    zoneMap[z].count += 1;
  });

  const zoneComparisonData = Object.keys(zoneMap).map(zone => ({
    zone: zone,
    avgHvi: Math.round((zoneMap[zone].totalHvi / zoneMap[zone].count) * 100) / 100,
    count: zoneMap[zone].count
  }));

  // Recent high-priority alerts across the city
  const allAlerts = wards.flatMap(w => evaluateWardAlerts(w));
  const criticalAlerts = allAlerts
    .filter(a => a.level === 'RED' || a.level === 'AMBER')
    .slice(0, 4);

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-5">
      {/* Two Column Layout (Left: Map + Analytics, Right: Ward Information & SHAP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: ~68% (8 columns on lg) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Large City Ward Map */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <div className="flex items-center justify-between px-2 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  {selectedCity.name} Ward Risk Choropleth Map
                </h2>
                <p className="text-[11px] text-slate-500">
                  Full spatial coverage ({wards.length} zones & wards) with multi-spectral satellite thermal indices & demographic vulnerability
                </p>
              </div>
              <div className="text-right text-xs font-semibold text-slate-600 hidden sm:block">
                <span>Selected: </span>
                <strong className="text-blue-600">{selectedWard?.ward_name || 'None'}</strong>
              </div>
            </div>

            {/* Interactive Leaflet Map Component */}
            <LeafletMap
              wards={wards}
              selectedWard={selectedWard}
              onSelectWard={onSelectWard}
              language={language}
              heightClass="h-[520px]"
              selectedCity={selectedCity}
              onOpenPipelineModal={onOpenPipelineModal}
              onMapClick={onMapClick}
            />
          </div>

          {/* 2. KPI Summary Cards (4 Cards: Low, Moderate, High, Total) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Low Risk Wards */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Low Risk Wards
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {lowRiskWards.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">HVI &lt; 4.0</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Moderate Risk Wards */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Moderate Risk
                </div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  {modRiskWards.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">HVI 4.0 – 6.9</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* High Risk Wards */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  High Risk Wards
                </div>
                <div className="text-2xl font-extrabold text-red-600 mt-1">
                  {highRiskWards.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">HVI 7.0 – 10.0</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            {/* Total Wards Monitored */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Monitored
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {wards.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">{selectedCity.name} Wards</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 3. Analytics Grid (Risk Distribution + Zone Comparison + Recent Alerts) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Risk Distribution Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Risk Distribution
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">City Summary</span>
              </div>
              <RiskDistributionDonutChart
                lowCount={lowRiskWards.length}
                modCount={modRiskWards.length}
                highCount={highRiskWards.length}
                totalWards={wards.length}
              />
            </div>

            {/* Zone Comparison Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Zone Comparison
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Average HVI</span>
              </div>
              <ZoneComparisonBarChart zoneData={zoneComparisonData} />
            </div>
          </div>

          {/* 4. Recent Alerts Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recent Heatwave Advisories & Alerts
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('alerts')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View All ({allAlerts.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {criticalAlerts.map(alert => (
                <div
                  key={alert.alert_id}
                  onClick={() => {
                    const matchedWard = wards.find(w => w.ward_id === alert.ward_id);
                    if (matchedWard) onSelectWard(matchedWard);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-xs transition ${
                    alert.level === 'RED'
                      ? 'bg-red-50/60 border-red-200 hover:bg-red-50'
                      : 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        alert.level === 'RED'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {alert.level === 'RED' ? 'CRITICAL' : 'WARNING'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">{alert.ward_name}</span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    {language === 'te' ? alert.headline_te : alert.headline_en}
                  </p>
                  <div className="text-[10px] text-slate-500 mt-2 font-mono">
                    {alert.trigger_metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ~32% (4 columns on lg) */}
        <div className="lg:col-span-4">
          <WardInfoPanel
            ward={selectedWard}
            language={language}
            onNavigateToTab={onNavigateToTab}
            selectedCity={selectedCity}
          />
        </div>
      </div>
    </div>
  );
};
