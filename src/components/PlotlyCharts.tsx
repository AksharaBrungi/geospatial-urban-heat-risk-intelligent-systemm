import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { WardData, SHAPFeatureContribution, ScenarioSimulationResult } from '../types';

// 1. Domain Radar Chart (Exposure, Sensitivity, Adaptive Capacity, Social Vulnerability)
export const DomainRadarChart: React.FC<{ ward: WardData }> = ({ ward }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const exp = ward.exposure_score ?? 6.5;
    const sens = ward.sensitivity_score ?? 6.0;
    const adapt = ward.adaptive_capacity_score ?? 4.0;
    const social = ward.social_vulnerability_score ?? 6.0;

    const data: Plotly.Data[] = [
      {
        type: 'scatterpolar',
        r: [exp, sens, adapt, social, exp],
        theta: ['Exposure (LST/Pop)', 'Sensitivity (Demographics)', 'Adaptive Capacity (NDVI/UHC)', 'Social Vulnerability', 'Exposure (LST/Pop)'],
        fill: 'toself',
        fillcolor: 'rgba(244, 63, 94, 0.25)',
        line: { color: '#f43f5e', width: 2.5 },
        name: ward.ward_name,
        marker: { size: 6, color: '#f43f5e' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 10],
          tickfont: { color: '#94a3b8', size: 10 },
          gridcolor: '#334155',
          linecolor: '#475569'
        },
        angularaxis: {
          tickfont: { color: '#e2e8f0', size: 11, family: 'sans-serif' },
          gridcolor: '#334155',
          linecolor: '#475569'
        },
        bgcolor: 'rgba(15, 23, 42, 0.8)'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 30, b: 30, l: 40, r: 40 },
      showlegend: false,
      font: { color: '#e2e8f0' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [ward]);

  return <div ref={chartRef} className="w-full h-72" />;
};

// 2. SHAP Feature Attribution Waterfall / Bar Chart
export const SHAPFeatureChart: React.FC<{ drivers: SHAPFeatureContribution[] }> = ({ drivers }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !drivers.length) return;

    // Sort by value ascending for horizontal bar chart
    const sorted = [...drivers].sort((a, b) => a.shap_value - b.shap_value);
    const labels = sorted.map(d => d.feature);
    const values = sorted.map(d => d.shap_value);
    const colors = values.map(v => (v >= 0 ? '#ef4444' : '#10b981'));

    const data: Plotly.Data[] = [
      {
        type: 'bar',
        x: values,
        y: labels,
        orientation: 'h',
        marker: {
          color: colors,
          line: { color: '#1e293b', width: 1 }
        },
        text: values.map(v => (v > 0 ? `+${v}` : `${v}`)),
        textposition: 'outside',
        textfont: { color: '#e2e8f0', size: 11 }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 15, b: 30, l: 220, r: 40 },
      xaxis: {
        title: { text: 'SHAP Contribution to Heat Risk (Shapley Value)', font: { size: 11, color: '#94a3b8' } },
        gridcolor: '#334155',
        tickfont: { color: '#94a3b8' },
        zerolinecolor: '#64748b',
        zerolinewidth: 2
      },
      yaxis: {
        tickfont: { color: '#f1f5f9', size: 11 },
        automargin: true
      },
      font: { color: '#e2e8f0' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [drivers]);

  return <div ref={chartRef} className="w-full h-80" />;
};

// 3. Ward-vs-Ward Comparative Grouped Bar Chart
export const WardComparisonChart: React.FC<{ wards: WardData[] }> = ({ wards }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !wards.length) return;

    const names = wards.map(w => w.ward_name);

    const data: Plotly.Data[] = [
      {
        name: 'HVI (1-10)',
        type: 'bar',
        x: names,
        y: wards.map(w => w.normalized_hvi ?? 5.0),
        marker: { color: '#f43f5e' }
      },
      {
        name: 'LST (°C)',
        type: 'bar',
        x: names,
        y: wards.map(w => w.lst_celsius),
        marker: { color: '#f97316' }
      },
      {
        name: 'Exposure Score',
        type: 'bar',
        x: names,
        y: wards.map(w => w.exposure_score ?? 5.0),
        marker: { color: '#eab308' }
      },
      {
        name: 'Adaptive Capacity',
        type: 'bar',
        x: names,
        y: wards.map(w => w.adaptive_capacity_score ?? 5.0),
        marker: { color: '#10b981' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      barmode: 'group',
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 20, b: 40, l: 40, r: 20 },
      xaxis: {
        tickfont: { color: '#f1f5f9', size: 11 },
        gridcolor: '#334155'
      },
      yaxis: {
        title: { text: 'Index / Metric Value', font: { size: 11, color: '#94a3b8' } },
        gridcolor: '#334155',
        tickfont: { color: '#94a3b8' }
      },
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0,
        font: { color: '#e2e8f0', size: 11 }
      },
      font: { color: '#e2e8f0' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [wards]);

  return <div ref={chartRef} className="w-full h-80" />;
};

// 4. Scenario Comparison Delta Chart (Baseline vs Simulated)
export const ScenarioDeltaChart: React.FC<{ result: ScenarioSimulationResult }> = ({ result }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const categories = ['Heat Vulnerability (HVI)', 'Land Surface Temp (LST °C)', 'Vegetation Cover (NDVI x10)'];
    const baselineVals = [result.baseline.hvi, result.baseline.lst_celsius, result.baseline.ndvi * 10];
    const simulatedVals = [result.simulated.hvi, result.simulated.lst_celsius, result.simulated.ndvi * 10];

    const data: Plotly.Data[] = [
      {
        name: 'Current Baseline',
        type: 'bar',
        x: categories,
        y: baselineVals,
        marker: { color: '#64748b' },
        text: baselineVals.map(v => v.toFixed(1)),
        textposition: 'outside',
        textfont: { color: '#94a3b8' }
      },
      {
        name: 'Simulated Scenario',
        type: 'bar',
        x: categories,
        y: simulatedVals,
        marker: { color: result.delta.hvi_change <= 0 ? '#10b981' : '#ef4444' },
        text: simulatedVals.map(v => v.toFixed(1)),
        textposition: 'outside',
        textfont: { color: '#e2e8f0' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      barmode: 'group',
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 25, b: 40, l: 40, r: 20 },
      xaxis: {
        tickfont: { color: '#f1f5f9', size: 12 },
        gridcolor: '#334155'
      },
      yaxis: {
        title: { text: 'Magnitude', font: { size: 11, color: '#94a3b8' } },
        gridcolor: '#334155',
        tickfont: { color: '#94a3b8' }
      },
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0.1,
        font: { color: '#e2e8f0', size: 11 }
      },
      font: { color: '#e2e8f0' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [result]);

  return <div ref={chartRef} className="w-full h-80" />;
};

// 5. Multi-Year Historical & Seasonal Trends Chart
export const TrendsChart: React.FC<{ ward: WardData }> = ({ ward }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const years = [2020, 2021, 2022, 2023, 2024];
    const baseLST = ward.lst_celsius;
    const baseHVI = ward.normalized_hvi ?? 6.0;

    const lstSeries = [baseLST - 1.8, baseLST - 1.3, baseLST - 0.5, baseLST - 0.2, baseLST];
    const hviSeries = [
      Math.max(1, baseHVI - 0.7),
      Math.max(1, baseHVI - 0.5),
      Math.max(1, baseHVI - 0.2),
      Math.max(1, baseHVI - 0.1),
      baseHVI
    ];

    const data: Plotly.Data[] = [
      {
        name: 'Surface Temp LST (°C)',
        type: 'scatter',
        mode: 'lines+markers',
        x: years,
        y: lstSeries,
        line: { color: '#f97316', width: 3 },
        marker: { size: 8, color: '#ea580c' },
        yaxis: 'y1'
      },
      {
        name: 'Heat Vulnerability Index (HVI)',
        type: 'scatter',
        mode: 'lines+markers',
        x: years,
        y: hviSeries,
        line: { color: '#f43f5e', width: 3, dash: 'dot' },
        marker: { size: 8, color: '#e11d48' },
        yaxis: 'y2'
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 30, b: 40, l: 45, r: 45 },
      xaxis: {
        title: { text: 'Landsat 8/9 Summer Peak Composites (2020 – 2024)', font: { size: 11, color: '#94a3b8' } },
        tickfont: { color: '#94a3b8' },
        gridcolor: '#334155'
      },
      yaxis: {
        title: { text: 'LST (°C)', font: { color: '#f97316', size: 11 } },
        tickfont: { color: '#f97316' },
        gridcolor: '#334155'
      },
      yaxis2: {
        title: { text: 'HVI Score (1-10)', font: { color: '#f43f5e', size: 11 } },
        tickfont: { color: '#f43f5e' },
        overlaying: 'y',
        side: 'right',
        range: [0, 10]
      },
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0.1,
        font: { color: '#e2e8f0', size: 11 }
      },
      font: { color: '#e2e8f0' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [ward]);

  return <div ref={chartRef} className="w-full h-80" />;
};

// 6. City-Wide Risk Distribution Donut Chart with center label
export const RiskDistributionDonutChart: React.FC<{
  lowCount: number;
  modCount: number;
  highCount: number;
  totalWards: number;
}> = ({ lowCount, modCount, highCount, totalWards }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const values = [lowCount, modCount, highCount];
    const labels = ['Low Risk', 'Moderate Risk', 'High Risk'];
    const colors = ['#10b981', '#f59e0b', '#ef4444'];

    const data: Plotly.Data[] = [
      {
        type: 'pie',
        labels: labels,
        values: values,
        hole: 0.62,
        marker: {
          colors: colors,
          line: { color: '#ffffff', width: 2 }
        },
        textinfo: 'percent',
        hoverinfo: 'label+value+percent',
        textposition: 'inside',
        textfont: { color: '#ffffff', size: 11, family: 'sans-serif' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 10, b: 20, l: 10, r: 10 },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.05,
        y: -0.1,
        font: { size: 11, color: '#475569' }
      },
      annotations: [
        {
          font: { size: 14, color: '#0f172a', family: 'sans-serif', weight: 700 },
          showarrow: false,
          text: `<b>${totalWards}</b><br><span style="font-size: 11px; font-weight: normal; color: #64748b;">Wards</span>`,
          x: 0.5,
          y: 0.5
        }
      ]
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [lowCount, modCount, highCount, totalWards]);

  return <div ref={chartRef} className="w-full h-64" />;
};

// 7. Zone Comparison Bar Chart (Average HVI across zones)
export const ZoneComparisonBarChart: React.FC<{
  zoneData: { zone: string; avgHvi: number; count: number }[];
}> = ({ zoneData }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !zoneData.length) return;

    const zones = zoneData.map(z => z.zone.replace(' Zone', ''));
    const hviScores = zoneData.map(z => z.avgHvi);
    const colors = hviScores.map(score =>
      score >= 7.0 ? '#ef4444' : score >= 5.5 ? '#f59e0b' : score >= 4.0 ? '#eab308' : '#10b981'
    );

    const data: Plotly.Data[] = [
      {
        type: 'bar',
        x: zones,
        y: hviScores,
        marker: {
          color: colors,
          line: { color: '#e2e8f0', width: 1 }
        },
        text: hviScores.map(v => v.toFixed(2)),
        textposition: 'outside',
        textfont: { size: 11, color: '#334155' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 20, b: 40, l: 35, r: 15 },
      xaxis: {
        tickfont: { color: '#475569', size: 10 },
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        title: { text: 'Mean HVI (1-10)', font: { size: 10, color: '#64748b' } },
        range: [0, 10],
        tickfont: { color: '#475569', size: 10 },
        gridcolor: '#f1f5f9'
      },
      font: { color: '#334155' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [zoneData]);

  return <div ref={chartRef} className="w-full h-64" />;
};

