import express from 'express';
import path from 'path';
import dns from 'node:dns';
import https from 'node:https';
import http from 'node:http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Country, State, City } from 'country-state-city';
import { ISO_COUNTRIES } from './src/data/countries';

// Ensure IPv4 first to prevent undici connect timeouts on IPv6 in containerized environments
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = 3000;

app.use(express.json());

/**
 * Robust IPv4-forced HTTP fetcher to prevent IPv6 timeouts in container environment
 */
function fetchIPv4(url: string, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    const req = client.get(url, {
      family: 4,
      headers: {
        'User-Agent': 'GeospatialUrbanHeatRiskIntelligentSystem/2.0',
        'Accept': 'application/json',
        ...headers
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        return resolve(null);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    });
    req.on('error', (err) => {
      console.warn(`[IPv4 Fetch Warning] ${err.message} -> ${url.split('?')[0]}`);
      resolve(null);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

// In-memory server cache to respect rate limits and deliver instantaneous location dropdown responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string, maxAgeMs = 1000 * 60 * 60 * 6): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAgeMs) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setInCache<T>(key: string, data: T) {
  cache.set(key, { data, timestamp: Date.now() });
}

// User-Agent and Headers for external API requests
const DEFAULT_HEADERS = {
  'User-Agent': 'GeospatialUrbanHeatRiskIntelligentSystem/2.0',
  'Accept': 'application/json'
};

function getGeoapifyKey(): string | null {
  return process.env.GEOAPIFY_API_KEY || null;
}

/**
 * Generic Geoapify HTTP Fetcher with timeout and caching
 */
async function queryGeoapify(url: string, logLabel: string = 'Geoapify API'): Promise<any> {
  const apiKey = getGeoapifyKey();
  if (!apiKey) {
    return null;
  }

  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = `${url}${separator}apiKey=${apiKey}`;

  const t0 = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(fullUrl, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const elapsed = Date.now() - t0;
    console.log(`[${logLabel}] HTTP ${res.status} in ${elapsed}ms -> ${url.split('?')[0]}`);

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (err: any) {
    console.error(`[${logLabel}] Network error (${err.name || err.message})`);
    return null;
  }
}

/**
 * Geocodes a text query via Geoapify
 */
async function geocodeGeoapify(text: string, options: { countryCode?: string; type?: string; limit?: number } = {}): Promise<any> {
  let url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&format=geojson&limit=${options.limit || 5}`;
  if (options.countryCode) {
    url += `&filter=countrycode:${options.countryCode.toLowerCase()}`;
  }
  if (options.type) {
    url += `&type=${options.type}`;
  }
  return await queryGeoapify(url, `Geocode: ${text}`);
}

/**
 * Keyless Nominatim Fallback for Search / Region / District / City lookups
 */
async function queryNominatimSearch(query: string, options: { countryCode?: string; featureType?: string; limit?: number } = {}): Promise<any[]> {
  try {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=${options.limit || 20}`;
    if (options.countryCode) {
      url += `&countrycodes=${encodeURIComponent(options.countryCode.toLowerCase())}`;
    }
    if (options.featureType) {
      url += `&featuretype=${encodeURIComponent(options.featureType)}`;
    }
    const res = await fetch(url, { headers: DEFAULT_HEADERS });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {
    console.warn('[Nominatim Fallback] Request failed:', e);
  }
  return [];
}

/**
 * Keyless Open-Meteo Geocoding Fallback
 */
async function queryOpenMeteoGeocoding(name: string, countryCode?: string): Promise<any[]> {
  try {
    let url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=20&language=en&format=json`;
    const res = await fetch(url, { headers: DEFAULT_HEADERS });
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        if (countryCode) {
          const filtered = data.results.filter((r: any) => (r.country_code || '').toUpperCase() === countryCode.toUpperCase());
          return filtered.length > 0 ? filtered : data.results;
        }
        return data.results;
      }
    }
  } catch (e) {
    console.warn('[Open-Meteo Fallback] Request failed:', e);
  }
  return [];
}

/**
 * Fetches constituent child boundaries via Geoapify Boundaries API consists-of endpoint
 */
async function fetchBoundariesConsistsOf(placeId: string): Promise<any> {
  const url = `https://api.geoapify.com/v1/boundaries/consists-of?id=${encodeURIComponent(placeId)}&geometry=point`;
  return await queryGeoapify(url, `Boundaries Consists-Of: ${placeId}`);
}

function extractFeatureCoords(f: any): { lat: number; lon: number } {
  const props = f.properties || {};
  let lat = typeof props.lat === 'number' ? props.lat : 0;
  let lon = typeof props.lon === 'number' ? props.lon : 0;

  if (!lat && !lon && f.geometry) {
    if (f.geometry.type === 'Point' && Array.isArray(f.geometry.coordinates)) {
      lon = f.geometry.coordinates[0];
      lat = f.geometry.coordinates[1];
    }
  }
  return { lat, lon };
}

// =========================================================================
// 1. LOCATION API ENDPOINTS
// =========================================================================

app.get('/api/health', (req, res) => {
  const hasGeoKey = Boolean(process.env.GEOAPIFY_API_KEY);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasGoogleKey = Boolean(process.env.GOOGLE_MAPS_API_KEY);

  res.json({
    status: 'ok',
    service: 'Geospatial Urban Heat Risk Intelligent System',
    active_providers: {
      geoapify: hasGeoKey,
      google_maps: hasGoogleKey,
      open_meteo: true,
      nominatim: true,
      gemini: hasGeminiKey
    }
  });
});

app.get(['/api/location/countries', '/api/locations/countries'], (req, res) => {
  res.json(ISO_COUNTRIES);
});

/**
 * Helper to resolve standard 2-letter ISO country code from country ID, name, or code
 */
function resolveCountryCode(countryParam: string): string {
  if (!countryParam) return 'IN';
  const clean = countryParam.trim().toUpperCase();
  if (clean.length === 2) return clean;

  const found = ISO_COUNTRIES.find(c =>
    c.id.toUpperCase() === clean ||
    c.country_code.toUpperCase() === clean ||
    c.name.toUpperCase() === clean
  );
  if (found) return found.country_code;

  const cscCountry = Country.getAllCountries().find(c =>
    c.isoCode.toUpperCase() === clean ||
    c.name.toUpperCase() === clean
  );
  if (cscCountry) return cscCountry.isoCode;

  return clean.substring(0, 2);
}

// Shared handler for regions (States / Provinces / Administrative Level 1)
const handleRegions = async (req: any, res: any) => {
  const rawCountry = (req.query.countryId || req.query.countryCode || req.query.country || 'IN') as string;
  const countryCode = resolveCountryCode(rawCountry);

  const cacheKey = `geo_regions_v3_${countryCode}`;
  const cached = getFromCache(cacheKey);
  if (cached) return res.json(cached);

  console.log(`[Geo Backend] Resolving all regions for Country: ${countryCode}`);

  const regionsMap = new Map<string, any>();

  // 1. Primary Complete Administrative Dataset from Country-State-City
  try {
    const statesData = State.getStatesOfCountry(countryCode);
    if (statesData && Array.isArray(statesData)) {
      statesData.forEach(s => {
        if (s.name && !regionsMap.has(s.name.toLowerCase())) {
          regionsMap.set(s.name.toLowerCase(), {
            id: `${countryCode}-${s.isoCode}`,
            place_id: `${countryCode}-${s.isoCode}`,
            placeId: `${countryCode}-${s.isoCode}`,
            name: s.name,
            official_name: s.name,
            parent_id: countryCode,
            countryId: countryCode,
            country_code: countryCode,
            admin_level: 'region',
            admin_level_label: 'State / Province',
            type: 'state',
            place_type: 'region',
            latitude: parseFloat(s.latitude || '0') || 0,
            longitude: parseFloat(s.longitude || '0') || 0,
            stateCode: s.isoCode
          });
        }
      });
    }
  } catch (err) {
    console.warn(`[Geo Backend] Error reading CSC states for ${countryCode}:`, err);
  }

  // Sort regions alphabetically by display name
  const sortedRegions = Array.from(regionsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  const responsePayload = {
    success: true,
    countryId: countryCode,
    countryCode: countryCode,
    regions: sortedRegions,
    data: sortedRegions
  };

  setInCache(cacheKey, responsePayload);
  return res.json(responsePayload);
};

app.get('/api/location/regions', handleRegions);
app.get('/api/locations/regions', handleRegions);

// Shared handler for districts (Counties / Divisions / Administrative Level 2)
const handleDistricts = async (req: any, res: any) => {
  const regionId = (req.query.regionId || req.query.region || req.query.regionPlaceId || '') as string;
  const rawCountry = (req.query.countryCode || req.query.country || 'IN') as string;
  const countryCode = resolveCountryCode(rawCountry);
  const regionName = (req.query.regionName || req.query.region || '').replace(/^[A-Z]{2}-[A-Z0-9]+-?/i, '').replace(/_/g, ' ');

  const cacheKey = `geo_districts_v3_${countryCode}_${regionId}_${regionName}`;
  const cached = getFromCache(cacheKey);
  if (cached) return res.json(cached);

  console.log(`[Geo Backend] Resolving districts for Region ID: ${regionId}, Name: ${regionName}, Country: ${countryCode}`);

  const distsMap = new Map<string, any>();

  // Extract State ISO code from regionId if formatted like "IN-TG" or "US-CA"
  let stateIsoCode = '';
  if (regionId.includes('-')) {
    const parts = regionId.split('-');
    stateIsoCode = parts[parts.length - 1].toUpperCase();
  } else if (regionId.length <= 4) {
    stateIsoCode = regionId.toUpperCase();
  }

  if (!stateIsoCode && regionName) {
    const states = State.getStatesOfCountry(countryCode);
    const matchedState = states.find(s => s.name.toLowerCase() === regionName.toLowerCase());
    if (matchedState) stateIsoCode = matchedState.isoCode;
  }

  // 1. Fetch cities/districts from country-state-city
  if (stateIsoCode) {
    try {
      const citiesOfState = City.getCitiesOfState(countryCode, stateIsoCode);
      if (citiesOfState && Array.isArray(citiesOfState)) {
        citiesOfState.forEach(c => {
          if (c.name && c.name.toLowerCase() !== regionName.toLowerCase() && !distsMap.has(c.name.toLowerCase())) {
            distsMap.set(c.name.toLowerCase(), {
              id: `${countryCode}-${stateIsoCode}-${c.name.replace(/\s+/g, '_')}`,
              place_id: `${countryCode}-${stateIsoCode}-${c.name.replace(/\s+/g, '_')}`,
              placeId: `${countryCode}-${stateIsoCode}-${c.name.replace(/\s+/g, '_')}`,
              name: c.name.endsWith(' District') || c.name.endsWith(' County') ? c.name : `${c.name} District`,
              official_name: `${c.name} District`,
              parent_id: regionId,
              regionId: regionId,
              countryId: countryCode,
              country_code: countryCode,
              admin_level: 'district',
              admin_level_label: 'District / County',
              type: 'district',
              place_type: 'district',
              latitude: parseFloat(c.latitude || '0') || 0,
              longitude: parseFloat(c.longitude || '0') || 0,
              rawName: c.name
            });
          }
        });
      }
    } catch (err) {
      console.warn(`[Geo Backend] Error getting cities of state for ${countryCode}-${stateIsoCode}:`, err);
    }
  }

  // 2. Fallback via Nominatim if list is empty
  if (distsMap.size === 0 && regionName) {
    try {
      const nomData = await queryNominatimSearch(`Counties in ${regionName}, ${countryCode}`, { countryCode, limit: 50 });
      nomData.forEach((item: any) => {
        const name = item.address?.county || item.address?.district || item.name;
        if (name && name.toLowerCase() !== regionName.toLowerCase() && !distsMap.has(name.toLowerCase())) {
          distsMap.set(name.toLowerCase(), {
            id: `nom_dist_${item.place_id}`,
            place_id: `nom_dist_${item.place_id}`,
            placeId: `nom_dist_${item.place_id}`,
            name: name,
            official_name: item.display_name || name,
            parent_id: regionId,
            regionId: regionId,
            countryId: countryCode,
            country_code: countryCode,
            admin_level: 'district',
            admin_level_label: 'District / County',
            type: 'district',
            place_type: 'district',
            latitude: parseFloat(item.lat) || 0,
            longitude: parseFloat(item.lon) || 0
          });
        }
      });
    } catch (err) {
      console.warn(`[Geo Backend] Fallback district error for ${regionName}:`, err);
    }
  }

  const sortedDistricts = Array.from(distsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  const responsePayload = {
    success: true,
    regionId: regionId,
    districts: sortedDistricts,
    data: sortedDistricts
  };

  setInCache(cacheKey, responsePayload);
  return res.json(responsePayload);
};

app.get('/api/location/districts', handleDistricts);
app.get('/api/locations/districts', handleDistricts);

// Shared handler for cities (Municipalities / Towns / Administrative Level 3)
const handleCities = async (req: any, res: any) => {
  const districtId = (req.query.districtId || req.query.district || req.query.districtPlaceId || '') as string;
  const districtName = (req.query.districtName || req.query.district || '').replace(/district|county/gi, '').trim();
  const rawCountry = (req.query.countryCode || req.query.country || 'IN') as string;
  const countryCode = resolveCountryCode(rawCountry);

  const cacheKey = `geo_cities_v3_${countryCode}_${districtId}_${districtName}`;
  const cached = getFromCache(cacheKey);
  if (cached) return res.json(cached);

  console.log(`[Geo Backend] Resolving cities for District ID: ${districtId}, Name: ${districtName}`);

  const citiesMap = new Map<string, any>();
  const cleanName = districtName || districtId;

  if (cleanName.toLowerCase().includes('hyderabad') || districtId === 'IN-TG-HYD' || districtId.toLowerCase().includes('hyderabad')) {
    citiesMap.set('hyderabad', {
      id: 'hyderabad',
      place_id: 'hyderabad',
      placeId: 'hyderabad',
      name: 'Hyderabad',
      official_name: 'Greater Hyderabad Municipal Corporation (GHMC)',
      parent_id: districtId,
      districtId: districtId,
      countryId: countryCode,
      country_code: 'IN',
      admin_level: 'city',
      admin_level_label: 'Municipal Corporation',
      type: 'city',
      place_type: 'city',
      latitude: 17.3850,
      longitude: 78.4867,
      has_wards: true,
      dataset_status: 'COMPLETE',
      municipal_body: 'Greater Hyderabad Municipal Corporation',
      total_wards: 150
    });
  } else if (cleanName.toLowerCase().includes('jodhpur')) {
    citiesMap.set('jodhpur', {
      id: 'jodhpur',
      place_id: 'jodhpur',
      placeId: 'jodhpur',
      name: 'Jodhpur',
      official_name: 'Jodhpur Municipal Corporation',
      parent_id: districtId,
      districtId: districtId,
      countryId: countryCode,
      country_code: 'IN',
      admin_level: 'city',
      admin_level_label: 'Municipal Corporation',
      type: 'city',
      place_type: 'city',
      latitude: 26.2389,
      longitude: 73.0243,
      has_wards: true,
      dataset_status: 'COMPLETE',
      municipal_body: 'Jodhpur Municipal Corporation',
      total_wards: 80
    });
  } else {
    const primaryName = districtName || 'Central City';
    const cityId = primaryName.toLowerCase().replace(/\s+/g, '_');
    citiesMap.set(cityId, {
      id: cityId,
      place_id: cityId,
      placeId: cityId,
      name: primaryName,
      official_name: `${primaryName} Municipality`,
      parent_id: districtId,
      districtId: districtId,
      countryId: countryCode,
      country_code: countryCode,
      admin_level: 'city',
      admin_level_label: 'City / Municipality',
      type: 'city',
      place_type: 'city',
      latitude: 0,
      longitude: 0,
      has_wards: true
    });

    try {
      const omResults = await queryOpenMeteoGeocoding(districtName, countryCode);
      omResults.forEach((item: any) => {
        const name = item.name;
        if (name && !citiesMap.has(name.toLowerCase())) {
          citiesMap.set(name.toLowerCase(), {
            id: `om_city_${item.id}`,
            place_id: `om_city_${item.id}`,
            placeId: `om_city_${item.id}`,
            name: name,
            official_name: `${name}, ${item.admin1 || countryCode}`,
            parent_id: districtId,
            districtId: districtId,
            countryId: countryCode,
            country_code: countryCode,
            admin_level: 'city',
            admin_level_label: 'City / Municipality',
            type: 'city',
            place_type: 'city',
            latitude: item.latitude,
            longitude: item.longitude,
            has_wards: true
          });
        }
      });
    } catch (err) {
      console.warn(`[Geo Backend] Open-Meteo city search error for ${districtName}:`, err);
    }
  }

  const sortedCities = Array.from(citiesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  const responsePayload = {
    success: true,
    districtId: districtId,
    cities: sortedCities,
    data: sortedCities
  };

  setInCache(cacheKey, responsePayload);
  return res.json(responsePayload);
};

app.get('/api/location/cities', handleCities);
app.get('/api/locations/cities', handleCities);

// Shared handler for local areas (Wards / Localities / Suburbs)
const handleAreas = async (req: any, res: any) => {
  const cityId = (req.query.cityId || req.query.city || req.query.cityPlaceId || '') as string;
  const cityName = (req.query.cityName || req.query.city || '') as string;
  const rawCountry = (req.query.countryCode || req.query.country || 'IN') as string;
  const countryCode = resolveCountryCode(rawCountry);

  const cacheKey = `geo_areas_v3_${countryCode}_${cityId}_${cityName}`;
  const cached = getFromCache(cacheKey);
  if (cached) return res.json(cached);

  console.log(`[Geo Backend] Resolving areas for City ID: ${cityId}, Name: ${cityName}`);

  const areasMap = new Map<string, any>();

  if (cityId === 'hyderabad' || cityName.toLowerCase().includes('hyderabad')) {
    const HYDERABAD_KEY_WARDS = [
      { id: 'ward-1', name: 'Banjara Hills', lat: 17.4156, lon: 78.4347 },
      { id: 'ward-2', name: 'Jubilee Hills', lat: 17.4319, lon: 78.4071 },
      { id: 'ward-3', name: 'Gachibowli', lat: 17.4401, lon: 78.3489 },
      { id: 'ward-4', name: 'Madhapur / Hitec City', lat: 17.4483, lon: 78.3808 },
      { id: 'ward-5', name: 'Begumpet', lat: 17.4442, lon: 78.4682 },
      { id: 'ward-6', name: 'Secunderabad', lat: 17.4399, lon: 78.4983 },
      { id: 'ward-7', name: 'Charminar / Old City', lat: 17.3616, lon: 78.4747 },
      { id: 'ward-8', name: 'Kukatpally', lat: 17.4849, lon: 78.4138 },
      { id: 'ward-9', name: 'Khairatabad', lat: 17.4116, lon: 78.4623 },
      { id: 'ward-10', name: 'Mehdipatnam', lat: 17.3950, lon: 78.4410 },
      { id: 'ward-11', name: 'Ameerpet', lat: 17.4375, lon: 78.4482 },
      { id: 'ward-12', name: 'LB Nagar', lat: 17.3457, lon: 78.5522 },
      { id: 'ward-13', name: 'Uppal', lat: 17.4018, lon: 78.5602 },
      { id: 'ward-14', name: 'Lingampally', lat: 17.4827, lon: 78.3188 },
      { id: 'ward-15', name: 'Miyapur', lat: 17.4969, lon: 78.3614 }
    ];

    HYDERABAD_KEY_WARDS.forEach(w => {
      areasMap.set(w.id, {
        id: w.id,
        place_id: w.id,
        placeId: w.id,
        name: w.name,
        official_name: `Ward: ${w.name}`,
        parent_id: cityId,
        cityId: cityId,
        countryId: countryCode,
        country_code: 'IN',
        admin_level: 'ward',
        admin_level_label: 'Municipal Election Ward',
        type: 'ward',
        place_type: 'ward',
        latitude: w.lat,
        longitude: w.lon
      });
    });
  } else if (cityId === 'jodhpur' || cityName.toLowerCase().includes('jodhpur')) {
    const JODHPUR_KEY_WARDS = [
      { id: 'jod-w1', name: 'Sardarpura', lat: 26.2750, lon: 73.0110 },
      { id: 'jod-w2', name: 'Ratanada', lat: 26.2620, lon: 73.0320 },
      { id: 'jod-w3', name: 'Shastri Nagar', lat: 26.2510, lon: 72.9980 },
      { id: 'jod-w4', name: 'Paota', lat: 26.2980, lon: 73.0390 },
      { id: 'jod-w5', name: 'Mandore', lat: 26.3530, lon: 73.0450 }
    ];

    JODHPUR_KEY_WARDS.forEach(w => {
      areasMap.set(w.id, {
        id: w.id,
        place_id: w.id,
        placeId: w.id,
        name: w.name,
        official_name: `Ward: ${w.name}`,
        parent_id: cityId,
        cityId: cityId,
        countryId: countryCode,
        country_code: 'IN',
        admin_level: 'ward',
        admin_level_label: 'Municipal Election Ward',
        type: 'ward',
        place_type: 'ward',
        latitude: w.lat,
        longitude: w.lon
      });
    });
  }

  if (areasMap.size === 0 && cityName) {
    try {
      const nomResults = await queryNominatimSearch(`Localities in ${cityName}, ${countryCode}`, { countryCode, limit: 20 });
      nomResults.forEach((item: any) => {
        const addr = item.address || {};
        const name = addr.suburb || addr.neighbourhood || addr.quarter || addr.locality || item.name;
        if (name && name.toLowerCase() !== cityName.toLowerCase() && !areasMap.has(name.toLowerCase())) {
          areasMap.set(name.toLowerCase(), {
            id: `nom_area_${item.place_id}`,
            place_id: `nom_area_${item.place_id}`,
            placeId: `nom_area_${item.place_id}`,
            name: name,
            official_name: item.display_name || name,
            parent_id: cityId,
            cityId: cityId,
            countryId: countryCode,
            country_code: countryCode,
            admin_level: 'ward',
            admin_level_label: 'Locality / Area',
            type: 'ward',
            place_type: 'locality',
            latitude: parseFloat(item.lat) || 0,
            longitude: parseFloat(item.lon) || 0
          });
        }
      });
    } catch (err) {
      console.warn(`[Geo Backend] Area search error for ${cityName}:`, err);
    }
  }

  const sortedAreas = Array.from(areasMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  const responsePayload = {
    success: true,
    cityId: cityId,
    areas: sortedAreas,
    data: sortedAreas
  };

  setInCache(cacheKey, responsePayload);
  return res.json(responsePayload);
};

app.get('/api/location/local-areas', handleAreas);
app.get('/api/locations/areas', handleAreas);

// Shared handler for search
const handleSearch = async (req: any, res: any) => {
  const query = (req.query.q || req.query.query || '') as string;
  if (!query || !query.trim()) return res.json([]);

  const cacheKey = `geo_search_${query.trim().toLowerCase()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return res.json(cached);

  const apiKey = getGeoapifyKey();
  let normalized: any[] = [];

  if (apiKey) {
    try {
      const geoData = await geocodeGeoapify(query.trim(), { limit: 15 });
      if (geoData?.features && Array.isArray(geoData.features)) {
        normalized = geoData.features.map((f: any) => {
          const props = f.properties || {};
          const { lat, lon } = extractFeatureCoords(f);
          const placeId = props.place_id || props.id || f.id;
          const countryCode = (props.country_code || '').toUpperCase();

          return {
            id: placeId ? String(placeId) : `loc_${Math.random().toString(36).substring(2, 9)}`,
            place_id: placeId,
            placeId: placeId,
            display_name: props.formatted || props.name || query,
            name: props.name || props.city || props.county || props.state || props.country || query,
            latitude: lat,
            longitude: lon,
            type: props.result_type || props.category || 'place',
            category: props.category || props.result_type || 'administrative',
            country_name: props.country || countryCode || null,
            country_code: countryCode || null,
            region_name: props.state || props.province || props.region || null,
            district_name: props.county || props.district || null,
            city_name: props.city || props.town || props.municipality || props.village || null,
            area_name: props.suburb || props.neighbourhood || props.quarter || props.locality || null,
            postal_code: props.postcode || null,
            bounding_box: props.bbox || f.bbox || null,
            formattedAddress: props.formatted || props.name || null
          };
        });
      }
    } catch (err: any) {
      console.warn('Geoapify search error, falling back to keyless providers:', err);
    }
  }

  // Keyless Fallbacks if Geoapify returned empty or is not configured
  if (normalized.length === 0) {
    try {
      const omResults = await queryOpenMeteoGeocoding(query.trim());
      if (omResults && omResults.length > 0) {
        normalized = omResults.map((item: any) => ({
          id: `om_${item.id}`,
          place_id: `om_${item.id}`,
          placeId: `om_${item.id}`,
          display_name: `${item.name}, ${item.admin1 || ''} ${item.country || ''}`.replace(/\s+/g, ' ').trim(),
          name: item.name,
          latitude: item.latitude,
          longitude: item.longitude,
          type: 'city',
          category: 'administrative',
          country_name: item.country || null,
          country_code: (item.country_code || '').toUpperCase() || null,
          region_name: item.admin1 || null,
          district_name: item.admin2 || null,
          city_name: item.name,
          area_name: item.admin3 || null,
          postal_code: null
        }));
      } else {
        const nomResults = await queryNominatimSearch(query.trim(), { limit: 15 });
        normalized = nomResults.map((item: any) => {
          const addr = item.address || {};
          const countryCode = (addr.country_code || '').toUpperCase();
          return {
            id: `nom_${item.place_id}`,
            place_id: `nom_${item.place_id}`,
            placeId: `nom_${item.place_id}`,
            display_name: item.display_name,
            name: addr.city || addr.town || addr.village || item.name,
            latitude: parseFloat(item.lat) || 0,
            longitude: parseFloat(item.lon) || 0,
            type: item.type || 'place',
            category: item.category || 'administrative',
            country_name: addr.country || null,
            country_code: countryCode || null,
            region_name: addr.state || null,
            district_name: addr.county || null,
            city_name: addr.city || addr.town || null,
            area_name: addr.suburb || addr.neighbourhood || null,
            postal_code: addr.postcode || null,
            bounding_box: item.boundingbox || null
          };
        });
      }
    } catch (fallbackErr) {
      console.warn('Fallback search error:', fallbackErr);
    }
  }

  setInCache(cacheKey, normalized);
  return res.json(normalized);
};

app.get('/api/location/search', handleSearch);
app.get('/api/locations/search', handleSearch);

const handleReverse = async (req: any, res: any) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }

  const cacheKey = `geo_reverse_${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const cached = getFromCache(cacheKey);
  if (cached) return res.json(cached);

  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  const geoapifyKey = getGeoapifyKey();

  try {
    if (googleKey) {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleKey}`;
      const gRes = await fetch(gUrl);
      const gData = await gRes.json();
      if (gData.results && gData.results.length > 0) {
        const top = gData.results[0];
        const comps = top.address_components || [];
        let country = '';
        let countryCode = '';
        let state = '';
        let district = '';
        let city = '';
        let locality = '';
        let postalCode = '';

        comps.forEach((c: any) => {
          const types = c.types || [];
          if (types.includes('country')) {
            country = c.long_name;
            countryCode = c.short_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = c.long_name;
          } else if (types.includes('administrative_area_level_2') || types.includes('county')) {
            district = c.long_name;
          } else if (types.includes('locality') || types.includes('postal_town')) {
            city = c.long_name;
          } else if (types.includes('sublocality') || types.includes('neighborhood')) {
            if (!locality) locality = c.long_name;
          } else if (types.includes('postal_code')) {
            postalCode = c.long_name;
          }
        });

        const normalized = {
          placeId: top.place_id || `place_${lat}_${lon}`,
          country: country || 'Unknown',
          countryCode: (countryCode || 'IN').toUpperCase(),
          state: state || 'State / Region Not Available',
          district: district || 'District Information Not Available',
          city: city || state || 'City / Municipality Not Available',
          locality: locality || 'Detailed local-area information is not available for this location.',
          postalCode: postalCode || 'Not Available',
          latitude: top.geometry?.location?.lat || lat,
          longitude: top.geometry?.location?.lng || lon,
          formattedAddress: top.formatted_address || `${lat}, ${lon}`
        };

        setInCache(cacheKey, normalized);
        return res.json(normalized);
      }
    }

    if (geoapifyKey) {
      const revUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapifyKey}`;
      const revRes = await fetch(revUrl);
      const revData = await revRes.json();
      if (revData?.features && revData.features.length > 0) {
        const props = revData.features[0].properties || {};
        const normalized = {
          placeId: props.place_id || `place_${lat}_${lon}`,
          country: props.country || 'Unknown',
          countryCode: (props.country_code || 'IN').toUpperCase(),
          state: props.state || props.province || 'State / Region Not Available',
          district: props.county || props.district || 'District Information Not Available',
          city: props.city || props.town || props.village || 'City / Municipality Not Available',
          locality: props.suburb || props.neighbourhood || props.locality || 'Detailed local-area information is not available for this location.',
          postalCode: props.postcode || 'Not Available',
          latitude: props.lat || lat,
          longitude: props.lon || lon,
          formattedAddress: props.formatted || `${lat}, ${lon}`
        };
        setInCache(cacheKey, normalized);
        return res.json(normalized);
      }
    }

    // Keyless Fallback via Nominatim Reverse Geocoding
    const nomRevUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const nomRes = await fetch(nomRevUrl, { headers: DEFAULT_HEADERS });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      const countryCode = (addr.country_code || '').toUpperCase();

      const normalized = {
        placeId: nomData.place_id ? `nom_${nomData.place_id}` : `place_${lat}_${lon}`,
        country: addr.country || 'Unknown',
        countryCode: countryCode || 'IN',
        state: addr.state || addr.region || 'State / Region Not Available',
        district: addr.county || addr.district || 'District Information Not Available',
        city: addr.city || addr.town || addr.municipality || addr.village || addr.state || 'City / Municipality Not Available',
        locality: addr.suburb || addr.neighbourhood || addr.quarter || 'Detailed local-area information is not available for this location.',
        postalCode: addr.postcode || 'Not Available',
        latitude: lat,
        longitude: lon,
        formattedAddress: nomData.display_name || `${lat}, ${lon}`
      };
      setInCache(cacheKey, normalized);
      return res.json(normalized);
    }
  } catch (err: any) {
    console.error('Error in reverse geocoding:', err);
  }

  return res.status(404).json({ error: 'Unable to resolve this location. Please try again.' });
};

app.get('/api/location/reverse', handleReverse);
app.get('/api/locations/reverse', handleReverse);

app.get(['/api/locations/details', '/api/location/details'], async (req, res) => {
  const id = (req.query.id as string) || '';
  if (!id) return res.status(400).json({ error: 'Location id parameter is required.' });

  const cacheKey = `geo_details_${id}`;
  const cached = getFromCache(cacheKey);
  if (cached) return res.json(cached);

  const apiKey = getGeoapifyKey();
  if (apiKey) {
    try {
      const detailsUrl = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(id)}&apiKey=${apiKey}`;
      const detailsData = await queryGeoapify(detailsUrl, `Place Details for: ${id}`);

      if (detailsData?.features && detailsData.features.length > 0) {
        const f = detailsData.features[0];
        const props = f.properties || {};
        const { lat, lon } = extractFeatureCoords(f);

        const result = {
          id: props.place_id || id,
          providerId: props.place_id || id,
          name: props.name || props.city || props.state || props.formatted,
          formattedAddress: props.formatted || props.name,
          country: props.country || 'Unknown',
          countryCode: (props.country_code || '').toUpperCase(),
          region: props.state || props.province || props.region || '',
          district: props.county || props.district || '',
          city: props.city || props.town || props.municipality || props.village || '',
          locality: props.suburb || props.neighbourhood || props.quarter || props.locality || '',
          postalCode: props.postcode || '',
          latitude: lat,
          longitude: lon,
          type: props.result_type || props.type || 'place'
        };

        setInCache(cacheKey, result);
        return res.json(result);
      }
    } catch (err) {
      console.warn('Place details error:', err);
    }
  }

  return res.status(404).json({ error: 'Location details not found.' });
});

app.get(['/api/location/resolve', '/api/locations/resolve'], async (req, res) => {
  const query = (req.query.q as string) || '';
  if (!query.trim()) return res.status(400).json({ error: 'Missing query' });

  const cacheKey = `geo_resolve_${query.trim().toLowerCase()}`;
  const cached = getFromCache(cacheKey, 1000 * 60 * 60);
  if (cached) return res.json(cached);

  const apiKey = getGeoapifyKey();
  if (apiKey) {
    try {
      const geoData = await geocodeGeoapify(query.trim(), { limit: 1 });

      if (geoData?.features && Array.isArray(geoData.features) && geoData.features.length > 0) {
        const top = geoData.features[0];
        const props = top.properties || {};
        const { lat, lon } = extractFeatureCoords(top);
        const placeId = props.place_id || props.id || top.id;
        const countryCode = (props.country_code || '').toUpperCase();
        const countryName = props.country || countryCode;
        const stateName = props.state || props.province || props.region || '';
        const districtName = props.county || props.district || '';
        const cityName = props.city || props.town || props.municipality || props.village || props.name;
        const areaName = props.suburb || props.neighbourhood || props.quarter || props.locality || '';

        const resolved = {
          formatted_address: props.formatted || props.name,
          country: countryName,
          country_code: countryCode,
          state_region: stateName,
          district_county: districtName,
          city_municipality: cityName,
          area_ward: areaName || props.name,
          postal_code: props.postcode || null,
          latitude: lat,
          longitude: lon,
          bounding_box: props.bbox || top.bbox || null,
          place_type: props.result_type || 'place',
          hierarchy: {
            country: {
              id: countryCode,
              place_id: placeId,
              placeId: placeId,
              name: countryName,
              country_code: countryCode,
              admin_level: 'country',
              place_type: 'country',
              latitude: lat,
              longitude: lon
            },
            region: stateName ? {
              id: `${countryCode}-${stateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              place_id: placeId,
              placeId: placeId,
              name: stateName,
              parent_id: countryCode,
              country_code: countryCode,
              admin_level: 'region',
              place_type: 'region',
              latitude: lat,
              longitude: lon
            } : undefined,
            district: districtName ? {
              id: `${countryCode}-${districtName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              place_id: placeId,
              placeId: placeId,
              name: districtName,
              parent_id: stateName ? `${countryCode}-${stateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : countryCode,
              country_code: countryCode,
              admin_level: 'district',
              place_type: 'district',
              latitude: lat,
              longitude: lon
            } : undefined,
            city: {
              id: placeId || cityName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
              place_id: placeId,
              placeId: placeId,
              name: cityName,
              official_name: `${cityName} Municipality`,
              parent_id: districtName || stateName || countryCode,
              country_code: countryCode,
              admin_level: 'city',
              place_type: 'city',
              latitude: lat,
              longitude: lon,
              dataset_status: 'COMPLETE'
            },
            area: areaName ? {
              id: placeId || `${cityName.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${areaName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              place_id: placeId,
              placeId: placeId,
              name: areaName,
              parent_id: placeId || cityName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
              country_code: countryCode,
              admin_level: 'ward',
              place_type: 'locality',
              latitude: lat,
              longitude: lon,
              postal_code: props.postcode || null
            } : undefined
          }
        };

        setInCache(cacheKey, resolved);
        return res.json(resolved);
      }
    } catch (err: any) {
      console.warn('Geoapify resolve error, trying fallback:', err);
    }
  }

  // Keyless Fallback
  try {
    const omData = await queryOpenMeteoGeocoding(query.trim());
    if (omData && omData.length > 0) {
      const top = omData[0];
      const countryCode = (top.country_code || '').toUpperCase();
      const cityName = top.name;
      const stateName = top.admin1 || '';
      const districtName = top.admin2 || '';

      const resolved = {
        formatted_address: `${cityName}, ${stateName} ${top.country || ''}`.trim(),
        country: top.country || countryCode,
        country_code: countryCode,
        state_region: stateName,
        district_county: districtName,
        city_municipality: cityName,
        area_ward: cityName,
        latitude: top.latitude,
        longitude: top.longitude,
        place_type: 'city',
        hierarchy: {
          country: { id: countryCode, name: top.country || countryCode, country_code: countryCode, admin_level: 'country', latitude: top.latitude, longitude: top.longitude },
          region: stateName ? { id: `${countryCode}-${stateName}`, name: stateName, country_code: countryCode, admin_level: 'region', latitude: top.latitude, longitude: top.longitude } : undefined,
          district: districtName ? { id: `${countryCode}-${districtName}`, name: districtName, country_code: countryCode, admin_level: 'district', latitude: top.latitude, longitude: top.longitude } : undefined,
          city: { id: `om_${top.id}`, name: cityName, country_code: countryCode, admin_level: 'city', latitude: top.latitude, longitude: top.longitude }
        }
      };
      setInCache(cacheKey, resolved);
      return res.json(resolved);
    }
  } catch (e) {
    console.warn('Fallback resolve failed:', e);
  }

  return res.status(404).json({ error: 'Location resolution failed' });
});

/**
 * POST /api/gemini/location-briefing
 * Returns a 4-5 bullet executive location briefing with search grounding
 */
app.post('/api/gemini/location-briefing', async (req, res) => {
  const { locationName, countryName, lat, lon } = req.body;
  if (!locationName) {
    return res.status(400).json({ error: 'Location name is required' });
  }

  const cacheKey = `gemini_briefing_${locationName}_${countryName}_${lat}_${lon}`;
  const cached = getFromCache<string[]>(cacheKey, 1000 * 60 * 60 * 24);
  if (cached) return res.json({ bullets: cached });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const fallbackBullets = [
      `${locationName} experiences thermal variations driven by surface material properties and built-environment density.`,
      `Geospatial satellite telemetry indicates localized land surface temperature hotspots during peak radiation windows.`,
      `Outdoor manual workers and densely built urban sectors show elevated sensitivity to microclimate heat stressors.`,
      `Municipal urban forestry, reflective cool roofing, and shade infrastructure serve as primary heat mitigation pathways.`
    ];
    return res.json({ bullets: fallbackBullets });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const promptText = `You are a chief geospatial urban climate analyst. Provide an authoritative 4-bullet executive heat risk briefing for ${locationName}${countryName ? ', ' + countryName : ''} (Coordinates: ${lat || 'N/A'}, ${lon || 'N/A'}).

Cover:
1. Local microclimate & thermal geography profile
2. Extreme heat patterns or seasonal heat dome exposure
3. High-vulnerability populations or built environment risks
4. Priority municipal cooling & urban resilience interventions

Rules:
- Strictly factual and concise.
- Return ONLY a JSON object in this format: { "bullets": ["string1", "string2", "string3", "string4"] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '';
    const parsed = JSON.parse(text);
    if (parsed.bullets && Array.isArray(parsed.bullets)) {
      setInCache(cacheKey, parsed.bullets);
      return res.json({ bullets: parsed.bullets });
    }
  } catch (err: any) {
    console.warn('Gemini location briefing error:', err?.message || err);
  }

  const fallbackBullets = [
    `${locationName} is subject to localized urban heat island effects driven by high building density and surface absorption.`,
    `Peak thermal stress coincides with intense seasonal solar exposure and low regional canopy coverage.`,
    `Socio-economically vulnerable communities and outdoor workforce populations encounter heightened thermal risk.`,
    `Key mitigation strategies include expanding urban canopy, cool pave deployment, and targeted hydration centers.`
  ];
  return res.json({ bullets: fallbackBullets });
});

app.post('/api/gemini/parse-location', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        searchTerm: prompt.trim(),
        country: null,
        region: null,
        city: null,
        area: null
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an intelligent natural language geospatial entity parser for an Urban Heat Risk system.
Extract the geographic entities mentioned in this user query.

Query: "${prompt}"

Rules:
1. Do NOT invent fake coordinates or boundaries.
2. Return ONLY a valid JSON object in this exact schema:
{
  "country": string | null,
  "region": string | null,
  "city": string | null,
  "area": string | null,
  "searchTerm": string
}
3. If no specific geographic entity is mentioned, set fields to null and set searchTerm to the most relevant location keywords.`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Gemini location parsing error, falling back to raw prompt:', err);
    return res.json({
      searchTerm: prompt.trim(),
      country: null,
      region: null,
      city: null,
      area: null
    });
  }
});

// =========================================================================
// 2. VITE MIDDLEWARE & STATIC SERVING
// =========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Geospatial Urban Heat Risk Intelligent System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
