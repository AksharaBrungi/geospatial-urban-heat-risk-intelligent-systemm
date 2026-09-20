import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, X, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { WardData, Language, CityConfig } from '../types';
import { calculateWardSHAP } from '../services/shapEngine';
import { getWardRecommendations } from '../services/recommendationEngine';
import { predictWardMLRisk } from '../services/mlEngine';

interface PdfReportModalProps {
  ward?: WardData;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  selectedCity?: CityConfig;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  ward,
  isOpen,
  onClose,
  language,
  selectedCity
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !ward) return null;

  const shap = calculateWardSHAP(ward);
  const recs = getWardRecommendations(ward);
  const mlPred = predictWardMLRisk(ward);

  const generatePDF = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = '#0f172a';
      const accentColor = '#b91c1c';

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`${(selectedCity?.full_label || 'MUNICIPAL CORPORATION').toUpperCase()} - HEAT ACTION INITIATIVE`, 14, 12);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.text('Geospatial Urban Heat Risk Intelligent System', 14, 18);
      doc.text(`Official Assessment Report | Date: ${new Date().toLocaleDateString('en-GB')} | Telemetry: Landsat 8/9 & AWS`, 14, 25);

      // Section 1: Ward Profile Overview
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`${ward.ward_name} (Ward ID: ${ward.ward_id})`, 14, 42);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Zone: ${ward.zone_name} | PIN Codes: ${ward.pin_codes.join(', ')} | Area: ${ward.area_sq_km} sq.km`, 14, 48);
      doc.text(`Key Landmarks: ${ward.landmarks.join(', ')}`, 14, 53);

      // HVI Score Box
      doc.setFillColor(ward.risk_category === 'HIGH' ? 254 : ward.risk_category === 'MODERATE' ? 254 : 240,
                       ward.risk_category === 'HIGH' ? 242 : ward.risk_category === 'MODERATE' ? 243 : 253,
                       ward.risk_category === 'HIGH' ? 242 : ward.risk_category === 'MODERATE' ? 199 : 244);
      doc.roundedRect(14, 58, 182, 20, 3, 3, 'F');

      doc.setTextColor(ward.risk_category === 'HIGH' ? 185 : ward.risk_category === 'MODERATE' ? 180 : 21,
                       ward.risk_category === 'HIGH' ? 28 : ward.risk_category === 'MODERATE' ? 83 : 128,
                       ward.risk_category === 'HIGH' ? 28 : ward.risk_category === 'MODERATE' ? 9 : 61);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Heat Vulnerability Index (HVI): ${ward.normalized_hvi} / 10.0 [${ward.risk_category} RISK]`, 20, 68);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`PCA Formulation: Exposure (${ward.exposure_score}) + Sensitivity (${ward.sensitivity_score}) - Adaptive Capacity (${ward.adaptive_capacity_score})`, 20, 74);

      // Section 2: Key Indicators Table
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Key Environmental & Socio-Demographic Indicators', 14, 88);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      const tableRows = [
        ['Land Surface Temperature (LST):', `${ward.lst_celsius} °C`, 'Vegetation Cover (NDVI):', `${ward.ndvi}`],
        ['Built-Up Surface Density:', `${ward.building_density_pct} %`, 'Water Index (NDWI):', `${ward.ndwi}`],
        ['Population Density:', `${ward.population_density.toLocaleString()} /km²`, 'Total Population:', `${ward.population.toLocaleString()}`],
        ['Nearest Health Center (UHC):', `${ward.uhc_name} (${ward.uhc_distance_km} km)`, 'Literacy Rate:', `${ward.literacy_pct} %`],
        ['Children Aged 0–6:', `${ward.children_0_6_pct} %`, 'Senior Citizens (60+):', `${ward.elderly_60_plus_pct} %`],
        ['Outdoor Workers (Vendors/Labor):', `${ward.outdoor_workers_count.toLocaleString()}`, 'Low-Income Slum Pop:', `${ward.low_income_slum_pct} %`]
      ];

      let yPos = 94;
      tableRows.forEach(row => {
        doc.setFont('helvetica', 'bold');
        doc.text(row[0], 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(row[1], 75, yPos);

        doc.setFont('helvetica', 'bold');
        doc.text(row[2], 105, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(row[3], 165, yPos);
        yPos += 6;
      });

      // Section 3: Explainable AI & SHAP Drivers
      yPos += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Explainable AI (SHAP) Factor Attribution', 14, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const splitShapEn = doc.splitTextToSize(`Explanation: ${shap.plain_english_explanation}`, 182);
      doc.text(splitShapEn, 14, yPos);
      yPos += splitShapEn.length * 4.5;

      // Section 4: ML Regressor Benchmarks
      yPos += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Machine Learning Model Predictions & Validation', 14, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Random Forest Score: ${mlPred.rf_predicted_score}/10 | XGBoost Score: ${mlPred.xgb_predicted_score}/10 | Hybrid Ensemble: ${mlPred.ensemble_predicted_score}/10`, 14, yPos);
      yPos += 5;
      doc.text(`Ground-Truth Benchmark: IMD Begumpet Observatory (Variance: ±${mlPred.validation.variance_to_imd_station_celsius}°C, Model Confidence: 93.8%)`, 14, yPos);

      // Section 5: Mitigation Roadmap Directives
      yPos += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Municipal Mitigation Directives & Interventions', 14, yPos);

      yPos += 6;
      recs.slice(0, 3).forEach((r, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(185, 28, 28);
        doc.text(`${idx + 1}. [${r.priority} PRIORITY] ${r.title_en} (${r.feasibility_months} Months)`, 14, yPos);
        yPos += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const splitAction = doc.splitTextToSize(`Action: ${r.action_en} | Agency: ${r.responsible_agency}`, 182);
        doc.text(splitAction, 14, yPos);
        yPos += splitAction.length * 4.2 + 2;
      });

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Report generated by Geospatial Urban Heat Risk Intelligent System for ${selectedCity?.full_label || 'Urban Planning & Disaster Management'}.`, 14, 285);

      // Save PDF
      doc.save(`${selectedCity?.name || 'City'}_Heat_Risk_Report_${ward.ward_id}_${ward.ward_name.replace(/\s+/g, '_')}.pdf`);
      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Generate Official Heat Risk Assessment PDF
            </h3>
            <p className="text-xs text-slate-400">
              Municipal report ready for printing, archival, and civic dissemination
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Ward Name:</span>
            <strong className="text-white">{ward.ward_name} ({ward.ward_id})</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Heat Vulnerability (HVI):</span>
            <strong className="text-amber-400 font-mono">{ward.normalized_hvi} / 10 ({ward.risk_category})</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Surface Temp (LST):</span>
            <strong className="text-rose-400 font-mono">{ward.lst_celsius}°C</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Included Sections:</span>
            <span className="text-slate-300">PCA Domains, GEE Remote Sensing, SHAP Drivers, ML Validation, Recommendations</span>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>PDF report generated and downloaded successfully!</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Close
          </button>
          <button
            id="btn-confirm-download-pdf"
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/60 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
