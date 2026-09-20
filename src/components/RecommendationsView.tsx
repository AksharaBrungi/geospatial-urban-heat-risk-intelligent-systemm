import React, { useState } from 'react';
import { ShieldAlert, Filter, CheckCircle2, Clock, Building2, Sparkles } from 'lucide-react';
import { WardData, Language, RecommendationItem } from '../types';
import { getTranslation } from '../services/i18n';
import { getWardRecommendations } from '../services/recommendationEngine';

interface RecommendationsViewProps {
  wards: WardData[];
  selectedWard: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language
}) => {
  const t = getTranslation(language);
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [selectedWardOnly, setSelectedWardOnly] = useState<boolean>(false);

  // Compile all recommendations across wards
  let allRecs: { ward: WardData; rec: RecommendationItem }[] = [];
  const targetWards = selectedWardOnly ? [selectedWard] : wards;

  targetWards.forEach(w => {
    const recs = getWardRecommendations(w);
    recs.forEach(r => {
      allRecs.push({ ward: w, rec: r });
    });
  });

  // Filter
  if (filterDomain !== 'ALL') {
    allRecs = allRecs.filter(item => item.rec.domain.includes(filterDomain));
  }
  if (filterPriority !== 'ALL') {
    allRecs = allRecs.filter(item => item.rec.priority === filterPriority);
  }

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Actionable Heat Risk Mitigation Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t.navRecommendations}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Factor-grounded policy, structural, and public health interventions tailored to ward vulnerability drivers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold bg-slate-950 px-3 py-2 rounded-lg border border-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedWardOnly}
                onChange={e => setSelectedWardOnly(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Show {selectedWard.ward_name} Only</span>
            </label>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" />
            Filters:
          </span>

          <select
            value={filterDomain}
            onChange={e => setFilterDomain(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-0 focus:border-amber-500"
          >
            <option value="ALL">All Domains</option>
            <option value="VEGETATION">Vegetation & Canopy</option>
            <option value="COOL SURFACES">Cool Surfaces & Roofs</option>
            <option value="HEALTHCARE">Healthcare & Respite</option>
            <option value="LABOR">Labor Protection & Water</option>
            <option value="SETTLEMENT">Vulnerable Settlements</option>
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-0 focus:border-amber-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority Only</option>
            <option value="MEDIUM">Medium Priority Only</option>
          </select>

          <span className="text-slate-500 ml-auto">
            Showing <strong>{allRecs.length}</strong> Interventions
          </span>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allRecs.map(({ ward, rec }, idx) => (
          <div
            key={`${ward.ward_id}-${rec.id}-${idx}`}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => onSelectWard(ward)}
                      className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      {ward.ward_name} ({ward.ward_id})
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                      {rec.domain}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {rec.title_en}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    rec.priority === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {rec.priority} PRIORITY
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {rec.action_en}
              </p>

              {language === 'te' && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <p className="text-xs text-amber-200/90 font-sans leading-relaxed">
                    {rec.action_te}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Feasibility: <strong>{rec.feasibility_months} Months</strong>
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Agency: <strong className="text-slate-300">{rec.responsible_agency}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
