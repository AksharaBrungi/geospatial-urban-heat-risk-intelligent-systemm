import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Flame,
  MapPin,
  Sun,
  Droplets,
  Calendar,
  Languages,
  UserCheck,
  Download,
  Menu,
  ChevronDown,
  Check,
  Building,
  Globe2,
  Search,
  ArrowRight,
  Layers,
  Loader2
} from 'lucide-react';
import { Language, UserRole, CityConfig, CityId, LocationNode } from '../types';
import { CITIES_REGISTRY } from '../data/citiesData';
import {
  GLOBAL_COUNTRIES,
  getCountries,
  getRegions,
  getDistricts,
  getCities,
  getAreas,
  searchLocation,
  resolveLocation,
  searchGlobalLocations,
  reverseGeocodeLocation
} from '../services/locationService';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenReportModal: () => void;
  onOpenMobileMenu: () => void;
  selectedCity: CityConfig;
  onCityChange: (cityId: CityId, customNode?: LocationNode) => void;
  onSelectWardFromLocation?: (wardId: string) => void;
  selectedWardTemp?: number;
  selectedWardHumidity?: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  userRole,
  onRoleChange,
  onOpenReportModal,
  onOpenMobileMenu,
  selectedCity,
  onCityChange,
  onSelectWardFromLocation,
  selectedWardTemp,
  selectedWardHumidity
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [activeDropdownTab, setActiveDropdownTab] = useState<'hierarchy' | 'featured'>('hierarchy');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Geographic Lists
  const [countriesList, setCountriesList] = useState<LocationNode[]>(GLOBAL_COUNTRIES);
  const [regionsList, setRegionsList] = useState<LocationNode[]>([]);
  const [districtsList, setDistrictsList] = useState<LocationNode[]>([]);
  const [citiesList, setCitiesList] = useState<LocationNode[]>([]);
  const [areasList, setAreasList] = useState<LocationNode[]>([]);

  // Loading States
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState<boolean>(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState<boolean>(false);

  // Dependent Hierarchy Selection State
  const [selCountry, setSelCountry] = useState<string>('IN');
  const [selRegion, setSelRegion] = useState<string>('IN-TG');
  const [selDistrict, setSelDistrict] = useState<string>('IN-TG-HYD');
  const [selCity, setSelCity] = useState<string>('hyderabad');
  const [selArea, setSelArea] = useState<string>('');

  // Error States
  const [regionsError, setRegionsError] = useState<string | null>(null);
  const [districtsError, setDistrictsError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [areasError, setAreasError] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      setCurrentDateTime(now.toLocaleDateString(language === 'te' ? 'te-IN' : 'en-IN', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [language]);

  // Initial load: Fetch real countries and seed initial Telangana/Hyderabad hierarchy
  useEffect(() => {
    let isMounted = true;
    console.log('[Geo] Loading countries');
    getCountries().then(list => {
      if (isMounted && list.length > 0) setCountriesList(list);
    });

    getRegions('IN').then(regs => {
      if (!isMounted) return;
      setRegionsList(regs);
      getDistricts('IN-TG', 'IN', 'Telangana').then(dists => {
        if (!isMounted) return;
        setDistrictsList(dists);
        getCities('IN-TG-HYD', 'Hyderabad District', 'Telangana', 'IN').then(cts => {
          if (!isMounted) return;
          setCitiesList(cts);
          getAreas('hyderabad', 'Hyderabad', 'Hyderabad District', 'IN').then(ars => {
            if (!isMounted) return;
            setAreasList(ars);
          });
        });
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cascading Selection Handlers
  const handleCountrySelect = async (countryCode: string) => {
    if (!countryCode) {
      setSelCountry('');
      setSelRegion('');
      setSelDistrict('');
      setSelCity('');
      setSelArea('');
      setRegionsList([]);
      setDistrictsList([]);
      setCitiesList([]);
      setAreasList([]);
      return;
    }

    const countryObj = countriesList.find(c => c.id === countryCode || c.country_code === countryCode);
    const cName = countryObj?.name || countryCode;
    const cCode = countryObj?.country_code || countryCode;

    console.log('[Geo] Country selected:', cName);
    console.log('[Geo] Country ID:', countryCode);

    setSelCountry(countryCode);
    setSelRegion('');
    setSelDistrict('');
    setSelCity('');
    setSelArea('');

    setRegionsList([]);
    setDistrictsList([]);
    setCitiesList([]);
    setAreasList([]);

    setRegionsError(null);
    setDistrictsError(null);
    setCitiesError(null);
    setAreasError(null);

    setIsLoadingRegions(true);

    try {
      const regs = await getRegions(cCode, countryObj?.place_id || countryObj?.placeId, cName);
      if (regs && regs.length > 0) {
        setRegionsList(regs);
      } else {
        setRegionsError('No detailed regions are available for this location.');
      }
    } catch (e) {
      setRegionsError('Unable to load geographic data. Please try again.');
    } finally {
      setIsLoadingRegions(false);
    }
  };

  const handleRegionSelect = async (regionId: string) => {
    if (!regionId) {
      setSelRegion('');
      setSelDistrict('');
      setSelCity('');
      setSelArea('');
      setDistrictsList([]);
      setCitiesList([]);
      setAreasList([]);
      return;
    }

    const regObj = regionsList.find(r => r.id === regionId);
    const rName = regObj?.name || regionId;

    console.log('[Geo] Region selected:', rName);
    console.log('[Geo] Region ID:', regionId);

    setSelRegion(regionId);
    setSelDistrict('');
    setSelCity('');
    setSelArea('');

    setDistrictsList([]);
    setCitiesList([]);
    setAreasList([]);

    setDistrictsError(null);
    setCitiesError(null);
    setAreasError(null);

    setIsLoadingDistricts(true);

    try {
      const dists = await getDistricts(regionId, selCountry, rName, regObj?.place_id || regObj?.placeId);
      if (dists && dists.length > 0) {
        setDistrictsList(dists);
      } else {
        setDistrictsError('No detailed districts are available for this region.');
      }
    } catch (e) {
      setDistrictsError('Unable to load geographic data. Please try again.');
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const handleDistrictSelect = async (districtId: string) => {
    if (!districtId) {
      setSelDistrict('');
      setSelCity('');
      setSelArea('');
      setCitiesList([]);
      setAreasList([]);
      return;
    }

    const distObj = districtsList.find(d => d.id === districtId);
    const dName = distObj?.name || districtId;
    const regObj = regionsList.find(r => r.id === selRegion);

    console.log('[Geo] District selected:', dName);
    console.log('[Geo] District ID:', districtId);

    setSelDistrict(districtId);
    setSelCity('');
    setSelArea('');

    setCitiesList([]);
    setAreasList([]);

    setCitiesError(null);
    setAreasError(null);

    setIsLoadingCities(true);

    try {
      const cts = await getCities(
        districtId,
        dName,
        regObj?.name,
        selCountry,
        distObj?.latitude,
        distObj?.longitude,
        distObj?.place_id || distObj?.placeId
      );
      if (cts && cts.length > 0) {
        setCitiesList(cts);
      } else {
        setCitiesError('No detailed cities are available for this district.');
      }
    } catch (e) {
      setCitiesError('Unable to load geographic data. Please try again.');
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleCitySelect = async (cityId: string) => {
    if (!cityId) {
      setSelCity('');
      setSelArea('');
      setAreasList([]);
      return;
    }

    const cityObj = citiesList.find(c => c.id === cityId);
    const ctyName = cityObj?.name || cityId;
    const distObj = districtsList.find(d => d.id === selDistrict);

    console.log('[Geo] City selected:', ctyName);
    console.log('[Geo] City ID:', cityId);

    setSelCity(cityId);
    setSelArea('');
    setAreasList([]);

    setAreasError(null);

    setIsLoadingAreas(true);

    try {
      const ars = await getAreas(
        cityId,
        ctyName,
        distObj?.name,
        selCountry,
        cityObj?.latitude,
        cityObj?.longitude,
        cityObj?.place_id || cityObj?.placeId
      );
      if (ars && ars.length > 0) {
        setAreasList(ars);
      } else {
        setAreasError('No detailed local areas are available for this location.');
      }
    } catch (e) {
      setAreasError('Unable to load geographic data. Please try again.');
    } finally {
      setIsLoadingAreas(false);
    }

    if (cityObj) {
      onCityChange(cityObj.id, cityObj);
    }
  };

  const handleAreaSelect = (areaId: string) => {
    if (!areaId) {
      setSelArea('');
      return;
    }

    const areaObj = areasList.find(a => a.id === areaId);
    const countryObj = countriesList.find(c => c.id === selCountry || c.country_code === selCountry);
    const regObj = regionsList.find(r => r.id === selRegion);
    const distObj = districtsList.find(d => d.id === selDistrict);
    const cityObj = citiesList.find(c => c.id === selCity);

    const finalLoc = {
      country: countryObj?.name || selCountry,
      countryCode: countryObj?.country_code || selCountry,
      region: regObj?.name || selRegion,
      district: distObj?.name || selDistrict,
      city: cityObj?.name || selCity,
      municipality: cityObj?.name || selCity,
      locality: areaObj?.name || areaId,
      ward: areaObj?.name || areaId,
      latitude: areaObj?.latitude || cityObj?.latitude || 0,
      longitude: areaObj?.longitude || cityObj?.longitude || 0,
      providerId: areaObj?.id || areaId
    };

    console.log('[Geo] Final location:', finalLoc);

    setSelArea(areaId);

    if (areaObj) {
      const node: LocationNode = {
        id: areaObj.id,
        name: areaObj.name,
        country_code: countryObj?.country_code || 'IN',
        latitude: areaObj.latitude,
        longitude: areaObj.longitude,
        admin_level: 'ward',
        admin_level_label: 'Locality / Ward',
        place_type: 'locality',
        parent_id: cityObj?.id,
        description: `${areaObj.name}, ${cityObj?.name}, ${regObj?.name}`
      };
      onCityChange(node.id, node);
      if (onSelectWardFromLocation) {
        onSelectWardFromLocation(areaObj.id);
      }
    }
  };

  const displayTemp = selectedWardTemp ?? selectedCity.weather.temp_celsius;
  const displayHumidity = selectedWardHumidity ?? selectedCity.weather.humidity_pct;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-xs select-none">
      <div className="px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Toggle + System Title */}
        <div className="flex items-center gap-3">
          <button
            id="btn-mobile-menu"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                Geospatial Urban Heat Risk Intelligent System
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block leading-tight">
                Ward-Level Geospatial Intelligent System
              </p>
            </div>
          </div>
        </div>

        {/* Right: City Selector, Weather, Language, Role, Report */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
          {/* Global Location Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="btn-city-selector-header"
              onClick={() => setIsCityDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300 transition text-xs shadow-xs"
              title="Select Global Location / Municipal Jurisdiction"
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="hidden sm:inline text-slate-500 font-normal">Location:</span>
              <span className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                {selectedCity.full_label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-3.5 px-4 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  GLOBAL GEOGRAPHIC LOCATION
                </div>
                <div className="text-xs font-semibold text-slate-700 mb-3.5 pb-2 border-b border-slate-100">
                  Select Country → State → District → City → Ward
                </div>

                <div className="space-y-3 text-xs">
                  {/* 1. COUNTRY / NATION */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      1. COUNTRY / NATION
                    </label>
                    <select
                      id="select-country"
                      value={selCountry}
                      onChange={e => handleCountrySelect(e.target.value)}
                      disabled={isLoadingCountries}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select Country</option>
                      {isLoadingCountries ? (
                        <option value="" disabled>Loading countries...</option>
                      ) : (
                        countriesList.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.country_code || c.id})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* 2. STATE / PROVINCE / REGION */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      2. STATE / PROVINCE / REGION
                    </label>
                    <select
                      id="select-region"
                      value={selRegion}
                      onChange={e => handleRegionSelect(e.target.value)}
                      disabled={!selCountry || isLoadingRegions}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select State / Province / Region</option>
                      {isLoadingRegions ? (
                        <option value="" disabled>Loading regions...</option>
                      ) : regionsError ? (
                        <option value="" disabled>{regionsError}</option>
                      ) : !isLoadingRegions && !regionsError && regionsList.length === 0 && selCountry ? (
                        <option value="" disabled>No detailed regional data is available for this country.</option>
                      ) : (
                        regionsList.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* 3. DISTRICT / COUNTY / DIVISION */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      3. DISTRICT / COUNTY / DIVISION
                    </label>
                    <select
                      id="select-district"
                      value={selDistrict}
                      onChange={e => handleDistrictSelect(e.target.value)}
                      disabled={!selRegion || isLoadingDistricts}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select District / County / Division</option>
                      {isLoadingDistricts ? (
                        <option value="" disabled>Loading districts...</option>
                      ) : districtsError ? (
                        <option value="" disabled>{districtsError}</option>
                      ) : !isLoadingDistricts && !districtsError && districtsList.length === 0 && selRegion ? (
                        <option value="" disabled>No detailed district data is available for this region.</option>
                      ) : (
                        districtsList.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* 4. CITY / MUNICIPALITY */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      4. CITY / MUNICIPALITY
                    </label>
                    <select
                      id="select-city"
                      value={selCity}
                      onChange={e => handleCitySelect(e.target.value)}
                      disabled={!selDistrict || isLoadingCities}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select City / Municipality</option>
                      {isLoadingCities ? (
                        <option value="" disabled>Loading cities...</option>
                      ) : citiesError ? (
                        <option value="" disabled>{citiesError}</option>
                      ) : !isLoadingCities && !citiesError && citiesList.length === 0 && selDistrict ? (
                        <option value="" disabled>No detailed city data is available for this district.</option>
                      ) : (
                        citiesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* 5. WARD / LOCALITY / AREA */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      5. WARD / LOCALITY / AREA
                    </label>
                    <select
                      id="select-area"
                      value={selArea}
                      onChange={e => handleAreaSelect(e.target.value)}
                      disabled={!selCity || isLoadingAreas}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select Ward / Locality / Area</option>
                      {isLoadingAreas ? (
                        <option value="" disabled>Loading local areas...</option>
                      ) : areasError ? (
                        <option value="" disabled>{areasError}</option>
                      ) : !isLoadingAreas && !areasError && areasList.length === 0 && selCity ? (
                        <option value="" disabled>Detailed ward/local-area data is not available for this location.</option>
                      ) : (
                        areasList.map(a => (
                          <option key={a.id} value={a.id}>{a.official_name || a.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Microclimate Weather Feed */}
          <div
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 font-medium"
            title={`Live Observatory: ${selectedCity.weather.station_name}`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="font-bold">{displayTemp.toFixed(1)}°C</span>
            <span className="text-amber-400">&bull;</span>
            <div className="flex items-center gap-1 text-slate-600">
              <Droplets className="w-3 h-3 text-sky-600" />
              <span>{displayHumidity}%</span>
            </div>
          </div>

          {/* DateTime */}
          <div className="hidden xl:flex items-center gap-1.5 text-slate-500 px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateTime}</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              id="btn-lang-en"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                language === 'en' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              id="btn-lang-te"
              onClick={() => onLanguageChange('te')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                language === 'te' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              తెలుగు
            </button>
          </div>

          {/* Stakeholder Role Selector */}
          <div className="relative">
            <select
              id="select-user-role"
              value={userRole}
              onChange={e => onRoleChange(e.target.value as UserRole)}
              className="pl-2 pr-7 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 appearance-none cursor-pointer transition"
              title="Switch Stakeholder View"
            >
              <option value="PLANNER">Urban Planner (Technical)</option>
              <option value="CHW">Health Worker (Simplified)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Download Official Action Plan Button */}
          <button
            id="btn-export-pdf"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-xs"
            title="Download Official Municipal Heat Action Plan PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Action Plan</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
