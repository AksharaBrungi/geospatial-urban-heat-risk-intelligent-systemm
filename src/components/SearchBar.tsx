import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, RotateCcw, Filter, Building, ChevronDown, Globe2, Sparkles, Loader2 } from 'lucide-react';
import { WardData, CityConfig, CityId, LocationSearchResult, LocationNode } from '../types';
import { CITIES_REGISTRY } from '../data/citiesData';
import { searchLocation, resolveLocation } from '../services/locationService';

interface SearchBarProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  selectedCity: CityConfig;
  onCityChange: (cityId: CityId, customNode?: LocationNode) => void;
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  selectedRisk: string;
  onRiskChange: (risk: string) => void;
  onReset: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  selectedCity,
  onCityChange,
  selectedZone,
  onZoneChange,
  selectedRisk,
  onRiskChange,
  onReset
}) => {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live asynchronous global location search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocation(query);
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = async (item: LocationSearchResult) => {
    setIsOpen(false);
    setQuery('');

    // If item is a specific local ward in current or known dataset
    if (item.is_ward && item.ward_id) {
      const match = wards.find(w => w.ward_id === item.ward_id);
      if (match) {
        onSelectWard(match);
        return;
      }
    }

    // Resolve full hierarchy and coordinates
    const resolved = await resolveLocation(item.name || item.display_name);
    if (resolved) {
      const cityNode = resolved.hierarchy.city || {
        id: item.city_name?.toLowerCase() || item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: item.city_name || item.name,
        country_code: item.country_code,
        admin_level: 'city',
        place_type: item.type,
        latitude: item.latitude,
        longitude: item.longitude,
        dataset_status: 'COMPLETE'
      };

      onCityChange(cityNode.id, cityNode);

      if (resolved.hierarchy.area && item.ward_id) {
        const match = wards.find(w => w.ward_id === item.ward_id);
        if (match) onSelectWard(match);
      }
    } else {
      // Direct city node
      onCityChange(item.city_name?.toLowerCase() || item.name.toLowerCase(), {
        id: item.city_name?.toLowerCase() || item.name.toLowerCase(),
        name: item.name,
        country_code: item.country_code,
        admin_level: item.type === 'ward' ? 'ward' : 'city',
        place_type: item.type,
        latitude: item.latitude,
        longitude: item.longitude,
        dataset_status: 'COMPLETE'
      });
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectResult(suggestions[0]);
      } else {
        const resolved = await resolveLocation(query.trim());
        if (resolved) {
          const cityNode = resolved.hierarchy.city || {
            id: resolved.city_municipality.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: resolved.city_municipality,
            country_code: resolved.country_code,
            admin_level: 'city',
            place_type: 'city',
            latitude: resolved.latitude,
            longitude: resolved.longitude,
            dataset_status: 'COMPLETE'
          };
          onCityChange(cityNode.id, cityNode);
          setQuery('');
          setIsOpen(false);
        }
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onReset();
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 shadow-2xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Global Search Input with Autocomplete */}
        <div ref={dropdownRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="input-ward-search"
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search by country, city, ward, landmark, PIN code (e.g. Tokyo, London, Kapra, 500062)..."
              className="w-full pl-9 pr-14 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition"
            />
            {isLoading && (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin absolute right-8 pointer-events-none" />
            )}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Global Geographic Matches</span>
                <span className="text-slate-400 font-normal">Press Enter to select</span>
              </div>
              {suggestions.map(item => {
                const isCurrentWard = selectedWard && item.ward_id === selectedWard.ward_id;
                const isCurrentCity = selectedCity && item.name.toLowerCase() === selectedCity.name.toLowerCase();

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className={`px-3 py-2.5 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between transition ${
                      isCurrentWard || isCurrentCity ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-xs text-slate-900 truncate">{item.name}</span>
                        {item.postal_code && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                            {item.postal_code}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate pl-5.5">
                        {item.display_name}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {item.category || item.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Filters and City Selector */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* City Selector */}
          <div className="relative">
            <select
              id="select-city"
              value={selectedCity.id}
              onChange={e => onCityChange(e.target.value as CityId)}
              className="pl-2.5 pr-8 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 appearance-none cursor-pointer transition max-w-[160px] sm:max-w-[200px] truncate"
            >
              <option value={selectedCity.id}>
                {selectedCity.name}, {selectedCity.state}
              </option>
              {CITIES_REGISTRY.filter(c => c.id !== selectedCity.id).map(city => (
                <option key={city.id} value={city.id}>
                  {city.full_label} {city.dataset_status === 'COMPLETE' ? `(${city.total_wards ?? 150} Wards)` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Risk Filter */}
          <div className="relative">
            <select
              id="select-risk-filter"
              value={selectedRisk}
              onChange={e => onRiskChange(e.target.value)}
              className="pl-2.5 pr-7 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk (HVI ≥ 7)</option>
              <option value="MODERATE">Moderate Risk (HVI 4–6.9)</option>
              <option value="LOW">Low Risk (HVI &lt; 4)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Zone Filter (Dynamic per selected city) */}
          <div className="relative">
            <select
              id="select-zone-filter"
              value={selectedZone}
              onChange={e => onZoneChange(e.target.value)}
              className="pl-2.5 pr-7 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer"
            >
              <option value="ALL">All Zones ({selectedCity.name})</option>
              {selectedCity.zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          <button
            id="btn-reset-filters"
            onClick={handleClear}
            title="Reset Search and Filters"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg transition shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

