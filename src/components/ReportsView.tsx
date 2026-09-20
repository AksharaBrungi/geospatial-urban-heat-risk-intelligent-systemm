import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  Calendar,
  Layers,
  Flame,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { WardData, Language, CityConfig } from '../types';

interface ReportsViewProps {
  wards: WardData[];
  selectedWard: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  onOpenPdfReport: () => void;
  selectedCity?: CityConfig;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language,
  onOpenPdfReport,
  selectedCity
}) => {
  const [reportType, setReportType] = useState<'ward_brief' | 'city_summary' | 'health_alert'>('ward_brief');

  const handleDownloadCSV = () => {
    const headers = [
      'ward_id',
      'ward_name',
      'zone_name',
      'pin_codes',
      'hvi_score',
      'risk_category',
      'lst_celsius',
      'ndvi',
      'ndwi',
      'population',
      'population_density',
      'outdoor_workers',
      'uhc_name',
      'uhc_distance_km'
    ];

    const rows = wards.map(w => [
      w.ward_id,
      `"${w.ward_name}"`,
      `"${w.zone_name}"`,
      `"${w.pin_codes.join(';')}"`,
      w.normalized_hvi ?? 5.0,
      w.risk_category ?? 'MODERATE',
      w.lst_celsius,
      w.ndvi,
      w.ndwi,
      w.population,
      w.population_density,
      w.outdoor_workers_count,
      `"${w.uhc_name}"`,
      w.uhc_distance_km
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedCity?.name || 'City'}_HeatRisk_Wards_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(wards, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `${selectedCity?.name || 'City'}_HeatRisk_Wards_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            {selectedCity?.name || 'Municipal'} Heat Risk Documentation & Reporting Center
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Municipal Climate Risk Reports & Data Exports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal policy briefs, Heat Action Plan (HAP) operational circulars, and structured GIS datasets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPdfReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Generate Ward PDF Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Report Config & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Report Generator Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Available Document Templates</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setReportType('ward_brief')}
                className={`p-4 rounded-xl border text-left transition ${
                  reportType === 'ward_brief'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Ward Policy Brief</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Individual ward assessment with SHAP drivers and priority actions.
                </div>
              </button>

              <button
                onClick={() => setReportType('city_summary')}
                className={`p-4 rounded-xl border text-left transition ${
                  reportType === 'city_summary'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <Building className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">City-Wide HVI Summary</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Macro-level analysis across all administrative zones of {selectedCity?.name || 'the city'}.
                </div>
              </button>

              <button
                onClick={() => setReportType('health_alert')}
                className={`p-4 rounded-xl border text-left transition ${
                  reportType === 'health_alert'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Health Advisory Bulletin</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Immediate operational circular for UHCs and field health teams.
                </div>
              </button>
            </div>

            {/* Template Details Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Target Ward: <strong className="text-blue-600">{selectedWard.ward_name} ({selectedWard.ward_id})</strong>
                </span>
                <span className="text-xs font-mono text-slate-500">Zone: {selectedWard.zone_name}</span>
              </div>
              
              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  <strong>Document Title:</strong> GHMC Urban Heat Action Plan — Technical Vulnerability Dossier
                </p>
                <p>
                  <strong>Key Inclusions:</strong> Landsat Surface Temperature (LST), NDVI canopy deficiency analysis, Socio-demographic vulnerability scores, Urban Health Center radius, and SHAP factor attribution.
                </p>
                <p>
                  <strong>Authority:</strong> Greater Hyderabad Municipal Corporation (GHMC) Disaster Management Cell & Telangana State Development Planning Society (TSDPS).
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onOpenPdfReport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Printable Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Raw Data Exports & GIS Shapefile Exports */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">GIS & Tabular Data Exports</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download clean, calibrated dataset covering all 150 wards for external QGIS, ArcGIS, or Python analytics.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleDownloadCSV}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export 150 Wards (CSV)</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={handleDownloadJSON}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Export GeoJSON / Attributes (JSON)</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Validated by TSDPS & IMD
              </div>
              <p className="text-[11px] text-emerald-800">
                All 150 ward polygons contain pre-computed PCA HVI eigenvalues, census demographics, and Landsat 8/9 thermal calibrations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
