import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Eye,
  Info,
  ThermometerSun,
  Trees,
  Building2,
  Droplets,
  Users,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Satellite,
  Compass,
  Database,
  Sparkles,
  Map as MapIcon
} from 'lucide-react';
import { WardData, Language, CityConfig } from '../types';
import { getTranslation } from '../services/i18n';

interface LeafletMapProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  heightClass?: string;
  selectedCity?: CityConfig;
  onOpenPipelineModal?: () => void;
  onMapClick?: (lat: number, lon: number) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language,
  heightClass = 'h-[540px]',
  selectedCity,
  onOpenPipelineModal,
  onMapClick
}) => {
  const t = getTranslation(language);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const uhcLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  const cityCenter: [number, number] = selectedCity?.center ?? [17.4065, 78.4772];
  const cityZoom: number = selectedCity?.default_zoom ?? 11;

  const [activeLayerMode, setActiveLayerMode] = useState<
    'HVI' | 'LST' | 'NDVI' | 'NDWI' | 'POP' | 'LULC'
  >('HVI');
  const [showUHCMarkers, setShowUHCMarkers] = useState<boolean>(false);
  const [basemapType, setBasemapType] = useState<'voyager' | 'satellite' | 'osm'>('voyager');

  // Dynamic feature coloring based on active layer mode
  const getFeatureColor = (ward: WardData): string => {
    if (activeLayerMode === 'HVI') {
      const hvi = ward.normalized_hvi ?? 5.0;
      if (hvi >= 7.0) return '#ef4444'; // Red (High Risk: 7-10)
      if (hvi >= 4.0) return '#f59e0b'; // Amber (Moderate Risk: 4-6)
      return '#10b981'; // Green (Low Risk: 1-3)
    } else if (activeLayerMode === 'LST') {
      const lst = ward.lst_celsius;
      if (lst >= 42.0) return '#b91c1c'; // Deep Red
      if (lst >= 40.0) return '#ea580c'; // Orange Red
      if (lst >= 38.0) return '#f59e0b'; // Yellow Amber
      return '#06b6d4'; // Cool Cyan
    } else if (activeLayerMode === 'NDVI') {
      const ndvi = ward.ndvi;
      if (ndvi >= 0.30) return '#059669'; // Lush Green
      if (ndvi >= 0.20) return '#84cc16'; // Moderate Green
      if (ndvi >= 0.14) return '#d97706'; // Sparse Amber
      return '#78350f'; // Barren / Concrete
    } else if (activeLayerMode === 'NDWI') {
      const ndwi = ward.ndwi;
      if (ndwi >= 0.05) return '#0284c7'; // High Moisture
      if (ndwi >= -0.08) return '#38bdf8'; // Moderate Moisture
      if (ndwi >= -0.16) return '#94a3b8'; // Dry Surface
      return '#d97706'; // Severe Moisture Deficit
    } else if (activeLayerMode === 'POP') {
      const den = ward.population_density;
      if (den >= 20000) return '#7c3aed'; // Ultra Dense
      if (den >= 14000) return '#a855f7'; // Dense
      if (den >= 8000) return '#38bdf8'; // Moderate
      return '#64748b'; // Low Density
    } else {
      // LULC
      const lulc = ward.lulc_class.toLowerCase();
      if (lulc.includes('industrial') || lulc.includes('stone')) return '#be123c';
      if (lulc.includes('commercial') || lulc.includes('dense')) return '#e11d48';
      if (lulc.includes('residential')) return '#f97316';
      if (lulc.includes('scrub') || lulc.includes('arid') || lulc.includes('rocky')) return '#ca8a04';
      if (lulc.includes('greenery') || lulc.includes('park') || lulc.includes('heritage')) return '#16a34a';
      return '#475569';
    }
  };

  // Basemap URLs
  const basemapUrls = {
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  // Helper: Fit bounds across ALL loaded ward geometries
  const fitCityBounds = () => {
    if (!mapInstanceRef.current) return;
    if (wards && wards.length > 0) {
      const bounds = L.latLngBounds([]);
      wards.forEach(w => {
        if (w.coordinates && w.coordinates.length > 0) {
          w.coordinates.forEach(([lat, lon]) => {
            bounds.extend([lat, lon]);
          });
        } else if (w.centroid) {
          bounds.extend(w.centroid);
        }
      });
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [24, 24],
          maxZoom: 13,
          animate: true
        });
        return;
      }
    }
    if (selectedCity) {
      mapInstanceRef.current.setView(selectedCity.center, selectedCity.default_zoom);
    }
  };

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: cityCenter,
      zoom: cityZoom,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false
    });

    const tileLayer = L.tileLayer(basemapUrls[basemapType], {
      attribution:
        basemapType === 'satellite'
          ? '&copy; Esri, Maxar, Earthstar Geographics'
          : '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    baseTileLayerRef.current = tileLayer;

    const polyGroup = L.layerGroup().addTo(map);
    const uhcGroup = L.layerGroup().addTo(map);

    polygonLayerGroupRef.current = polyGroup;
    uhcLayerGroupRef.current = uhcGroup;
    mapInstanceRef.current = map;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    // Automatic City-Wide Extent Calculation upon map load
    if (wards && wards.length > 0) {
      const bounds = L.latLngBounds([]);
      wards.forEach(w => {
        if (w.coordinates && w.coordinates.length > 0) {
          w.coordinates.forEach(([lat, lon]) => {
            bounds.extend([lat, lon]);
          });
        } else if (w.centroid) {
          bounds.extend(w.centroid);
        }
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
      }
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    baseTileLayerRef.current.setUrl(basemapUrls[basemapType]);
  }, [basemapType]);

  // Fit bounds when selectedCity or wards changes
  useEffect(() => {
    fitCityBounds();
  }, [selectedCity?.id, wards.length]);

  // Render All Ward Polygons (City-Wide Choropleth)
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerGroupRef.current) return;

    const polyGroup = polygonLayerGroupRef.current;
    polyGroup.clearLayers();

    wards.forEach(ward => {
      const isSelected = selectedWard && ward.ward_id === selectedWard.ward_id;
      const fillColor = getFeatureColor(ward);

      const polygon = L.polygon(ward.coordinates, {
        color: isSelected ? '#1d4ed8' : basemapType === 'satellite' ? '#ffffff' : '#475569',
        weight: isSelected ? 4.0 : 1.2,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.88 : basemapType === 'satellite' ? 0.70 : 0.65,
        dashArray: isSelected ? '' : '1, 1'
      });

      const riskLabel =
        ward.risk_category === 'HIGH'
          ? 'High Risk'
          : ward.risk_category === 'MODERATE'
          ? 'Moderate Risk'
          : 'Low Risk';

      // Interactive Rich Tooltip
      polygon.bindTooltip(
        `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 6px; font-size: 11px; line-height: 1.4; color: #0f172a;">
          <div style="font-weight: 700; color: #0f172a; font-size: 12px; margin-bottom: 2px;">
            ${ward.ward_name} <span style="font-weight: normal; color: #64748b;">(${ward.ward_id})</span>
          </div>
          <div style="color: #334155;">Zone: <strong>${ward.zone_name}</strong></div>
          <div style="color: #334155;">
            HVI: <strong style="color: ${
              ward.normalized_hvi && ward.normalized_hvi >= 7
                ? '#dc2626'
                : ward.normalized_hvi && ward.normalized_hvi >= 4
                ? '#d97706'
                : '#16a34a'
            };">${ward.normalized_hvi}/10</strong> (${riskLabel})
          </div>
          <div style="color: #475569;">LST: <strong>${ward.lst_celsius}°C</strong> | NDVI: <strong>${ward.ndvi}</strong></div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">
            Landmark: ${ward.landmarks[0] || `${selectedCity?.name || 'City'} Ward`}
          </div>
        </div>
        `,
        { sticky: true, opacity: 0.98 }
      );

      polygon.on('click', () => {
        onSelectWard(ward);
      });

      polygon.addTo(polyGroup);
    });
  }, [wards, selectedWard?.ward_id, activeLayerMode, basemapType, selectedCity]);

  // Update Healthcare / UHC Center Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !uhcLayerGroupRef.current) return;

    const uhcGroup = uhcLayerGroupRef.current;
    uhcGroup.clearLayers();

    if (showUHCMarkers) {
      wards.forEach(ward => {
        const uhcIcon = L.divIcon({
          className: 'custom-uhc-marker',
          html: `<div style="width: 18px; height: 18px; border-radius: 9999px; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">H</div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        const uhcLat = ward.centroid[0] + 0.0025;
        const uhcLon = ward.centroid[1] + 0.0025;

        const marker = L.marker([uhcLat, uhcLon], { icon: uhcIcon });
        marker.bindPopup(
          `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; font-size: 11px;">
            <strong style="color: #1d4ed8; font-size: 12px; display: block;">${ward.uhc_name}</strong>
            <div style="color: #475569; margin-top: 2px;">Serving: ${ward.ward_name} (${ward.zone_name})</div>
            <div style="color: #475569;">Distance to Ward Center: <strong>${ward.uhc_distance_km} km</strong></div>
            <div style="color: #15803d; font-weight: 600; margin-top: 4px;">✓ Heat Stress & Emergency ORS Centre</div>
          </div>
          `
        );
        marker.addTo(uhcGroup);
      });
    }
  }, [wards, showUHCMarkers]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 select-none`}
    >
      {/* Interactive Map Surface */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Humanized AI Telemetry Initialization */}
      {wards.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-xs text-white text-center">
          <div className="max-w-md bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Synchronizing Satellite Climate AI
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Evaluating multi-spectral surface heat radiation and vegetation canopy indices for <strong>{selectedCity?.name}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Top Floating Layer Switcher Bar */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-200 shadow-md flex items-center gap-1 text-xs max-w-[92%] overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1.5 flex items-center gap-1 shrink-0">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          Layer:
        </span>

        <button
          id="btn-layer-hvi"
          onClick={() => setActiveLayerMode('HVI')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition shrink-0 ${
            activeLayerMode === 'HVI'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          HVI Risk
        </button>

        <button
          id="btn-layer-lst"
          onClick={() => setActiveLayerMode('LST')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 shrink-0 ${
            activeLayerMode === 'LST'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ThermometerSun className="w-3 h-3" />
          LST Temp
        </button>

        <button
          id="btn-layer-ndvi"
          onClick={() => setActiveLayerMode('NDVI')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 shrink-0 ${
            activeLayerMode === 'NDVI'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Trees className="w-3 h-3" />
          NDVI Canopy
        </button>

        <button
          id="btn-layer-ndwi"
          onClick={() => setActiveLayerMode('NDWI')}
          className={`px-2 py-1 rounded text-xs font-semibold transition hidden sm:inline-flex items-center gap-1 shrink-0 ${
            activeLayerMode === 'NDWI'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Droplets className="w-3 h-3" />
          Water
        </button>

        <button
          id="btn-layer-pop"
          onClick={() => setActiveLayerMode('POP')}
          className={`px-2 py-1 rounded text-xs font-semibold transition hidden md:inline-flex items-center gap-1 shrink-0 ${
            activeLayerMode === 'POP'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3 h-3" />
          Density
        </button>

        <button
          id="btn-layer-lulc"
          onClick={() => setActiveLayerMode('LULC')}
          className={`px-2 py-1 rounded text-xs font-semibold transition hidden lg:inline-flex items-center gap-1 shrink-0 ${
            activeLayerMode === 'LULC'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3 h-3" />
          LULC
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block shrink-0" />

        <label className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-slate-700 hover:text-slate-900 cursor-pointer select-none text-[11px] font-medium shrink-0">
          <input
            type="checkbox"
            checked={showUHCMarkers}
            onChange={e => setShowUHCMarkers(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span>Health Centres</span>
        </label>
      </div>

      {/* Map Action Buttons (Basemap Toggle, Zoom & Reset City Extent) on Top Right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-md">
        <button
          id="btn-map-basemap"
          onClick={() =>
            setBasemapType(prev =>
              prev === 'voyager' ? 'satellite' : prev === 'satellite' ? 'osm' : 'voyager'
            )
          }
          title={`Switch Basemap (Current: ${basemapType.toUpperCase()})`}
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded hover:text-blue-600 transition flex items-center justify-center"
        >
          {basemapType === 'satellite' ? (
            <Satellite className="w-4 h-4 text-emerald-600" />
          ) : (
            <MapIcon className="w-4 h-4 text-slate-700" />
          )}
        </button>
        <button
          id="btn-map-zoom-in"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded hover:text-slate-900 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-map-zoom-out"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded hover:text-slate-900 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-map-reset-extent"
          onClick={fitCityBounds}
          title={`Fit Entire ${selectedCity?.name || 'City'} Extent`}
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded hover:text-blue-600 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Dynamic Legend on Bottom Left */}
      <div className="absolute bottom-7 left-3 z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-200 shadow-md text-xs text-slate-700 min-w-[200px]">
        <div className="font-bold text-slate-800 text-[11px] mb-1.5 flex items-center justify-between border-b border-slate-100 pb-1">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            {activeLayerMode === 'HVI' && 'Heat Risk Level (HVI)'}
            {activeLayerMode === 'LST' && 'Surface Temp (LST)'}
            {activeLayerMode === 'NDVI' && 'Vegetation Index (NDVI)'}
            {activeLayerMode === 'NDWI' && 'Water / Moisture (NDWI)'}
            {activeLayerMode === 'POP' && 'Population Density'}
            {activeLayerMode === 'LULC' && 'Land Use / Land Cover'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {selectedCity?.name || 'City'}
          </span>
        </div>

        {activeLayerMode === 'HVI' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500 shrink-0" />
                <span className="font-semibold text-slate-800">High Risk (7–10)</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">
                {wards.filter(w => (w.normalized_hvi ?? 0) >= 7).length} wards
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
                <span className="font-semibold text-slate-800">Moderate Risk (4–6)</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">
                {wards.filter(w => {
                  const h = w.normalized_hvi ?? 0;
                  return h >= 4 && h < 7;
                }).length} wards
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-800">Low Risk (1–3)</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">
                {wards.filter(w => (w.normalized_hvi ?? 0) < 4).length} wards
              </span>
            </div>
          </div>
        )}

        {activeLayerMode === 'LST' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-700 shrink-0" />
                <span>Extreme Heat</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">&ge; 42.0°C</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-600 shrink-0" />
                <span>Elevated Heat</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">40.0 – 41.9°C</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
                <span>Moderate Heat</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">38.0 – 39.9°C</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-cyan-500 shrink-0" />
                <span>Low Thermal Load</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">&lt; 38.0°C</span>
            </div>
          </div>
        )}

        {activeLayerMode === 'NDVI' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                <span>Lush Canopy</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">&ge; 0.30</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-lime-500 shrink-0" />
                <span>Moderate Green</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">0.20 – 0.29</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-600 shrink-0" />
                <span>Sparse Canopy</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">0.14 – 0.19</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-900 shrink-0" />
                <span>Impervious / Bare</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">&lt; 0.14</span>
            </div>
          </div>
        )}

        {activeLayerMode === 'NDWI' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-700 shrink-0" />
                <span>High Moisture / Water</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">&ge; 0.05</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-400 shrink-0" />
                <span>Moderate Moisture</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">-0.08 to 0.04</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-600 shrink-0" />
                <span>Moisture Deficit</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">&lt; -0.16</span>
            </div>
          </div>
        )}

        {activeLayerMode === 'POP' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-700 shrink-0" />
                <span>&ge; 20,000 /km²</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-400 shrink-0" />
                <span>14,000 – 19,999 /km²</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-400 shrink-0" />
                <span>8,000 – 13,999 /km²</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-500 shrink-0" />
                <span>&lt; 8,000 /km²</span>
              </div>
            </div>
          </div>
        )}

        {activeLayerMode === 'LULC' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-700 shrink-0" />
              <span>Industrial / High Thermal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-500 shrink-0" />
              <span>Residential Core</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
              <span>Semi-Arid Scrub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
              <span>Greenery / Heritage Park</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Map Status Bar */}
      <div className="absolute bottom-0 inset-x-0 z-10 bg-white/90 backdrop-blur-sm border-t border-slate-200 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span>Leaflet | &copy; OpenStreetMap contributors, CartoDB</span>
          <span className="h-3 w-px bg-slate-300 hidden sm:block" />
          <span className="hidden sm:inline">Basemap: <strong className="text-slate-700 uppercase">{basemapType}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Active Layer: <strong className="text-slate-700">{activeLayerMode}</strong></span>
          <span className="h-3 w-px bg-slate-300" />
          <span className="text-blue-600 font-bold">Total Wards: {wards.length}</span>
        </div>
      </div>
    </div>
  );
};
