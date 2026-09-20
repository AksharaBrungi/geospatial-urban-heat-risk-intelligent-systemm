import React, { useState, useMemo, useEffect } from 'react';
import { WardData, Language, StakeholderView, NavTab, CityId, LocationNode, CityConfig } from './types';
import { getCityConfig, getCityRawWards } from './data/citiesData';
import { computeCitywideHVI } from './services/pcaEngine';
import { evaluateWardAlerts } from './services/alertEngine';
import { buildDynamicCityConfig, fetchLiveWeather, reverseGeocodeLocation } from './services/locationService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { DashboardView } from './components/DashboardView';
import { InteractiveMapPage } from './components/InteractiveMapPage';
import { WardProfileView } from './components/WardProfileView';
import { ScenarioView } from './components/ScenarioView';
import { SocialVulnerabilityView } from './components/SocialVulnerabilityView';
import { WardComparisonView } from './components/WardComparisonView';
import { TrendsView } from './components/TrendsView';
import { RecommendationsView } from './components/RecommendationsView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { CHWView } from './components/CHWView';
import { MethodologyView } from './components/MethodologyView';
import { PdfReportModal } from './components/PdfReportModal';

export const App: React.FC = () => {
  // Selected City state (Generic city architecture with Hyderabad as default)
  const [selectedCityId, setSelectedCityId] = useState<CityId>('hyderabad');
  const [customCityConfig, setCustomCityConfig] = useState<CityConfig | null>(null);

  const selectedCity = useMemo<CityConfig>(() => {
    if (customCityConfig && customCityConfig.id === selectedCityId) {
      return customCityConfig;
    }
    return getCityConfig(selectedCityId) || getCityConfig('hyderabad')!;
  }, [selectedCityId, customCityConfig]);

  // Run PCA Engine dynamically on city wards dataset to compute exact research formula scores
  const enrichedWards = useMemo(() => {
    const rawWards = getCityRawWards(selectedCityId, selectedCity);
    const { enrichedWards } = computeCitywideHVI(rawWards);
    return enrichedWards;
  }, [selectedCityId, selectedCity]);

  const wards = enrichedWards;
  const [selectedWard, setSelectedWard] = useState<WardData>(enrichedWards[0]);
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [stakeholderView, setStakeholderView] = useState<StakeholderView>('PLANNER');
  const [language, setLanguage] = useState<Language>('en');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Filters state
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  // When city changes, reset selected ward and filters
  useEffect(() => {
    if (enrichedWards.length > 0) {
      setSelectedWard(enrichedWards[0]);
      setSelectedZone('ALL');
      setSelectedRisk('ALL');
    }
  }, [enrichedWards]);

  // Total active alerts across wards
  const totalAlertsCount = useMemo(() => {
    let count = 0;
    wards.forEach(w => {
      const alerts = evaluateWardAlerts(w);
      if (alerts.some(a => a.level === 'RED' || a.level === 'AMBER')) count++;
    });
    return count;
  }, [wards]);

  // Filtered wards according to selected zone and risk level
  const displayedWards = useMemo(() => {
    return wards.filter(w => {
      const matchZone = selectedZone === 'ALL' || w.zone_name === selectedZone;
      let matchRisk = true;
      if (selectedRisk === 'HIGH') matchRisk = (w.normalized_hvi ?? 5.0) >= 7.0;
      else if (selectedRisk === 'MODERATE') {
        const hvi = w.normalized_hvi ?? 5.0;
        matchRisk = hvi >= 4.0 && hvi < 7.0;
      } else if (selectedRisk === 'LOW') {
        matchRisk = (w.normalized_hvi ?? 5.0) < 4.0;
      }
      return matchZone && matchRisk;
    });
  }, [wards, selectedZone, selectedRisk]);

  const handleSelectWard = (w: WardData) => {
    setSelectedWard(w);
  };

  const handleOpenScenarioWithWard = (w: WardData) => {
    setSelectedWard(w);
    setCurrentTab('scenarios');
  };

  const handleResetFilters = () => {
    setSelectedZone('ALL');
    setSelectedRisk('ALL');
    if (enrichedWards.length > 0) {
      setSelectedWard(enrichedWards[0]);
    }
  };

  const handleCityChange = async (newCityId: CityId, customNode?: LocationNode) => {
    if (customNode) {
      const config = await buildDynamicCityConfig(customNode);
      setCustomCityConfig(config);
      setSelectedCityId(newCityId);

      // Asynchronously fetch live meteorological values
      const weather = await fetchLiveWeather(customNode.latitude, customNode.longitude, customNode.name);
      setCustomCityConfig(prev => (prev && prev.id === config.id ? { ...prev, weather } : prev));
    } else {
      setCustomCityConfig(null);
      setSelectedCityId(newCityId);
    }
  };

  const handleSelectWardFromLocation = (wardId: string) => {
    const found = wards.find(w => w.ward_id === wardId || w.ward_name.toLowerCase() === wardId.toLowerCase());
    if (found) {
      setSelectedWard(found);
    }
  };

  const handleMapClickLocation = async (lat: number, lon: number) => {
    try {
      const resolved = await reverseGeocodeLocation(lat, lon);
      if (resolved) {
        const node: LocationNode = {
          id: resolved.city.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'custom_location',
          name: resolved.city !== 'City / Municipality Not Available' ? resolved.city : resolved.state,
          country_code: resolved.countryCode,
          latitude: lat,
          longitude: lon,
          admin_level: 'city',
          admin_level_label: 'City / Municipality',
          place_type: 'city',
          parent_id: resolved.state,
          municipal_body: `${resolved.city} Municipal Administration`,
          description: resolved.formattedAddress
        };
        await handleCityChange(node.id, node);
      }
    } catch (e) {
      console.warn('Map click reverse geocode error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex antialiased">
      {/* 1. Left Fixed Dark Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        language={language}
        alertsCount={totalAlertsCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Light Content Area (offset by 16rem = 64 on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Global Clean Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          userRole={stakeholderView}
          onRoleChange={setStakeholderView}
          onOpenReportModal={() => setIsPdfModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          selectedWardTemp={selectedWard?.current_temp_celsius}
          selectedWardHumidity={selectedWard?.current_humidity_pct}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          onSelectWardFromLocation={handleSelectWardFromLocation}
        />

        {/* Global Search and Filter Bar */}
        <SearchBar
          wards={wards}
          selectedWard={selectedWard}
          onSelectWard={handleSelectWard}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
          selectedRisk={selectedRisk}
          onRiskChange={setSelectedRisk}
          onReset={handleResetFilters}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto">
          {stakeholderView === 'CHW' ? (
            /* Community Health Worker (CHW) Specialized Field View */
            <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
              <CHWView ward={selectedWard} language={language} />
            </div>
          ) : (
            /* Planner / Intelligent System Views */
            <>
              {currentTab === 'overview' && (
                <DashboardView
                  wards={displayedWards.length > 0 ? displayedWards : wards}
                  selectedWard={selectedWard}
                  onSelectWard={handleSelectWard}
                  language={language}
                  onNavigateToTab={setCurrentTab}
                  selectedCity={selectedCity}
                  onMapClick={handleMapClickLocation}
                />
              )}

              {currentTab === 'map' && (
                <InteractiveMapPage
                  wards={displayedWards.length > 0 ? displayedWards : wards}
                  selectedWard={selectedWard}
                  onSelectWard={handleSelectWard}
                  language={language}
                  onNavigateToTab={setCurrentTab}
                  selectedCity={selectedCity}
                  onMapClick={handleMapClickLocation}
                />
              )}

              {currentTab === 'profile' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <WardProfileView
                    ward={selectedWard}
                    language={language}
                    onOpenPdfReport={() => setIsPdfModalOpen(true)}
                    onOpenScenarioWithWard={handleOpenScenarioWithWard}
                  />
                </div>
              )}

              {currentTab === 'scenarios' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <ScenarioView
                    wards={wards}
                    selectedWard={selectedWard}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {(currentTab === 'social_vuln' || currentTab === 'social') && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <SocialVulnerabilityView
                    wards={wards}
                    selectedWard={selectedWard}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'comparison' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <WardComparisonView
                    wards={wards}
                    selectedWard={selectedWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'trends' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <TrendsView
                    wards={wards}
                    selectedWard={selectedWard}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'recommendations' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <RecommendationsView
                    wards={wards}
                    selectedWard={selectedWard}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'alerts' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <AlertsView
                    wards={wards}
                    selectedWard={selectedWard}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  wards={wards}
                  selectedWard={selectedWard}
                  onSelectWard={handleSelectWard}
                  language={language}
                  onOpenPdfReport={() => setIsPdfModalOpen(true)}
                  selectedCity={selectedCity}
                />
              )}

              {currentTab === 'methodology' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <MethodologyView language={language} />
                </div>
              )}
            </>
          )}
        </main>

        {/* Clean Modern Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              Geospatial Urban Heat Risk Intelligent System
            </span>
            <span>&bull;</span>
            <span>{selectedCity.name} ({wards.length} Wards {selectedCity.dataset_status === 'COMPLETE' ? 'Calibrated' : 'Development Dataset'})</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-500">
            <span>Landsat 8/9 TIRS & OLI</span>
            <span>&bull;</span>
            <span>PCA Dimensionality Reduction</span>
            <span>&bull;</span>
            <span>SHAP Explainability</span>
            <span>&bull;</span>
            <span>IMD AWS Synchronized</span>
          </div>
        </footer>
      </div>

      {/* PDF Export Modal */}
      <PdfReportModal
        ward={selectedWard}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        language={language}
        selectedCity={selectedCity}
      />
    </div>
  );
};

export default App;
