import React from 'react';
import {
  UserCheck,
  PhoneCall,
  HeartPulse,
  Droplets,
  AlertOctagon,
  Building,
  Baby,
  Users,
  Compass,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { WardData, Language } from '../types';
import { getTranslation } from '../services/i18n';

interface CHWViewProps {
  ward: WardData;
  language: Language;
}

export const CHWView: React.FC<CHWViewProps> = ({ ward, language }) => {
  const t = getTranslation(language);

  const childrenCount = Math.round((ward.population * ward.children_0_6_pct) / 100);
  const elderlyCount = Math.round((ward.population * ward.elderly_60_plus_pct) / 100);

  const isHighRisk = ward.risk_category === 'HIGH';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Field Worker Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 uppercase tracking-widest mb-1">
              <UserCheck className="w-4 h-4" />
              {t.chwTitle}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {ward.ward_name} ({ward.ward_id})
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {t.chwSubtitle}
            </p>
          </div>

          {/* Big High-Contrast Risk Alert Badge */}
          <div
            className={`px-5 py-3 rounded-xl text-center border-2 shadow-lg ${
              isHighRisk
                ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                : 'bg-amber-950/80 border-amber-500 text-amber-200'
            }`}
          >
            <div className="text-[11px] font-black tracking-wider uppercase">Field Risk Status</div>
            <div className="text-xl sm:text-2xl font-black tracking-wide mt-0.5">
              {isHighRisk ? '🚨 RED ALERT' : '⚠️ ELEVATED HEAT'}
            </div>
            <div className="text-xs font-mono font-bold mt-0.5">
              HVI: {ward.normalized_hvi}/10 | LST: {ward.lst_celsius}°C
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Emergency Contacts Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <PhoneCall className="w-4 h-4 text-rose-500" />
          {t.emergencyContact} (Toll-Free & 24/7 Control Rooms)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-slate-400 font-semibold">108 Emergency Ambulance</div>
              <div className="text-lg font-mono font-bold text-rose-400">108</div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 bg-emerald-950/50 rounded">
              Active Dispatch
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-slate-400 font-semibold">GHMC Heat Control Room</div>
              <div className="text-base font-mono font-bold text-amber-400">040-21111111</div>
            </div>
            <span className="text-[10px] text-slate-400 px-2 py-1 bg-slate-900 rounded">
              Toll-Free
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-slate-400 font-semibold">Nearest UHC Dispensary</div>
              <div className="text-xs font-bold text-white truncate max-w-[150px]">{ward.uhc_name}</div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {ward.uhc_distance_km} km away
            </span>
          </div>
        </div>
      </div>

      {/* Target Vulnerable Citizens in This Ward */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-amber-400" />
          Vulnerable Citizen Counts Requiring Door-to-Door Monitoring
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-center">
            <Baby className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <span className="text-slate-400">Infants & Toddlers (0–6)</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ~{childrenCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-rose-400 font-semibold">Monitor hydration closely</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-center">
            <HeartPulse className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-slate-400">Senior Citizens (60+)</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ~{elderlyCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-400 font-semibold">Check blood pressure / electrolytes</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-center">
            <Droplets className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <span className="text-slate-400">Outdoor Laborers / Vendors</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {ward.outdoor_workers_count.toLocaleString()}
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold">Direct to shade between 12-4 PM</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-center">
            <Building className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <span className="text-slate-400">Low-Income Slum Homes</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {ward.low_income_slum_pct}% of ward
            </div>
            <span className="text-[10px] text-indigo-300 font-semibold">High tin roof indoor heat</span>
          </div>
        </div>
      </div>

      {/* Heat Stroke Signs & Field Triage Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heat Exhaustion vs Heat Stroke Symptoms */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            {t.symptomsToWatch}
          </h4>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-amber-950/30 p-2.5 rounded border border-amber-800/40">
              <strong className="text-amber-300 font-bold block">1. Heat Exhaustion (ఉష్ణ నిస్సత్తువ):</strong>
              <span>Heavy sweating, dizziness, pale/clammy skin, rapid weak pulse, muscle cramps. Move to cool shade immediately and provide cold oral rehydration (ORS).</span>
            </div>
            <div className="bg-rose-950/40 p-2.5 rounded border border-rose-800/50">
              <strong className="text-rose-300 font-bold block">2. Severe Heat Stroke (తీవ్ర వడదెబ్బ - EMERGENCY):</strong>
              <span>High body temperature (&gt; 40°C), dry hot skin (no sweating), confusion, slurred speech, loss of consciousness. Call 108 immediately. Cool the patient with wet cloths and ice packs on armpits and neck.</span>
            </div>
          </div>
        </div>

        {/* Public Respite & Cooling Shelters in this Ward */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-400" />
            {t.coolingCentresAvailable}
          </h4>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <strong className="text-white font-semibold block">{ward.uhc_name} (Air-Cooled Dispensary)</strong>
              <span className="text-slate-400 block">Distance: {ward.uhc_distance_km} km | Hours: 8:00 AM – 7:00 PM</span>
              <span className="text-emerald-400 text-[11px] font-semibold mt-1 inline-block">✓ Free ORS sachets, IV fluids & chilled drinking water available</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <strong className="text-white font-semibold block">GHMC Community Hall & Shaded Chalivendram Hub</strong>
              <span className="text-slate-400 block">Location: Near {ward.landmarks[0] || 'Ward Secretariat'}</span>
              <span className="text-emerald-400 text-[11px] font-semibold mt-1 inline-block">✓ Misting fans, chairs & shade for outdoor workers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
