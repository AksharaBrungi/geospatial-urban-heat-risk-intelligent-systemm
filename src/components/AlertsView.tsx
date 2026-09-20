import React, { useState } from 'react';
import { BellRing, Flame, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { WardData, Language, AlertItem } from '../types';
import { getTranslation } from '../services/i18n';
import { evaluateWardAlerts } from '../services/alertEngine';

interface AlertsViewProps {
  wards: WardData[];
  selectedWard: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language
}) => {
  const t = getTranslation(language);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'RED' | 'AMBER' | 'YELLOW'>('ALL');

  // Gather all active alerts
  const allAlerts: AlertItem[] = [];
  wards.forEach(w => {
    const wardAlerts = evaluateWardAlerts(w);
    allAlerts.push(...wardAlerts);
  });

  const filteredAlerts = filterLevel === 'ALL'
    ? allAlerts
    : allAlerts.filter(a => a.level === filterLevel);

  const redCount = allAlerts.filter(a => a.level === 'RED').length;
  const amberCount = allAlerts.filter(a => a.level === 'AMBER').length;
  const yellowCount = allAlerts.filter(a => a.level === 'YELLOW').length;

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
              <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />
              Municipal Heatwave Action Early-Warning Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t.navAlerts}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated thresholds evaluated against Steadman Heat Index, Landsat thermal emissivity, and vulnerable demographic clustering
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
              Active Monitoring: {wards.length} Wards
            </span>
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setFilterLevel('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterLevel === 'ALL' ? 'bg-slate-200 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            All Alerts ({allAlerts.length})
          </button>
          <button
            onClick={() => setFilterLevel('RED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              filterLevel === 'RED' ? 'bg-rose-500 text-white' : 'bg-rose-950/60 text-rose-300 border border-rose-800'
            }`}
          >
            <Flame className="w-3 h-3" />
            Critical Red Alerts ({redCount})
          </button>
          <button
            onClick={() => setFilterLevel('AMBER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              filterLevel === 'AMBER' ? 'bg-amber-500 text-slate-950' : 'bg-amber-950/60 text-amber-300 border border-amber-800'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Amber Warnings ({amberCount})
          </button>
          <button
            onClick={() => setFilterLevel('YELLOW')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              filterLevel === 'YELLOW' ? 'bg-yellow-500 text-slate-950' : 'bg-yellow-950/60 text-yellow-300 border border-yellow-800'
            }`}
          >
            <Info className="w-3 h-3" />
            Yellow Advisories ({yellowCount})
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const isRed = alert.level === 'RED';
          const isAmber = alert.level === 'AMBER';

          const cardBorder = isRed
            ? 'border-rose-600/70 bg-rose-950/20 shadow-rose-950/30'
            : isAmber
            ? 'border-amber-600/60 bg-amber-950/20'
            : 'border-yellow-600/40 bg-yellow-950/10';

          const badgeBg = isRed
            ? 'bg-rose-500 text-white'
            : isAmber
            ? 'bg-amber-500 text-slate-950'
            : 'bg-yellow-500 text-slate-950';

          return (
            <div
              key={alert.alert_id}
              className={`border rounded-xl p-4 shadow-lg transition ${cardBorder}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${badgeBg}`}>
                    {alert.level} LEVEL
                  </span>
                  <span
                    onClick={() => {
                      const w = wards.find(item => item.ward_id === alert.ward_id);
                      if (w) onSelectWard(w);
                    }}
                    className="text-xs font-bold text-white hover:text-amber-400 hover:underline cursor-pointer"
                  >
                    {alert.ward_name} ({alert.ward_id})
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {alert.issued_at}
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-1.5">
                {alert.headline_en}
              </h4>

              <div className="text-xs font-mono text-amber-400 bg-slate-950/70 px-2.5 py-1 rounded w-fit mb-2 border border-slate-800">
                Trigger Telemetry: {alert.trigger_metric}
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-slate-100">Municipal Protocol:</strong> {alert.advisory_en}
              </p>

              {language === 'te' && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <h5 className="text-xs font-bold text-amber-300 mb-1">
                    {alert.headline_te}
                  </h5>
                  <p className="text-xs text-amber-200/90 font-sans leading-relaxed">
                    <strong>కార్యాచరణ మార్గదర్శకం:</strong> {alert.advisory_te}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
