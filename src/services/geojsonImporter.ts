import { WardData, RiskCategory, CityConfig } from '../types';
import { computeCitywideHVI } from './pcaEngine';

export interface GeoJSONValidationResult {
  success: boolean;
  message: string;
  wardsCount: number;
  cityId?: string;
  wards?: WardData[];
  errors?: string[];
}

/**
 * Parses, validates, and ingests an RFC 7946 GeoJSON FeatureCollection of municipal wards.
 * Calculates spatial centroids and executes the PCA engine to assign HVI risk scores.
 */
export function parseAndIngestWardGeoJSON(
  geojsonTextOrObj: string | any,
  targetCityId: string,
  cityConfig?: CityConfig
): GeoJSONValidationResult {
  try {
    let data: any;
    if (typeof geojsonTextOrObj === 'string') {
      data = JSON.parse(geojsonTextOrObj);
    } else {
      data = geojsonTextOrObj;
    }

    if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      return {
        success: false,
        message: 'Invalid GeoJSON: Root object must be a FeatureCollection with a features array.',
        wardsCount: 0
      };
    }

    if (data.features.length === 0) {
      return {
        success: false,
        message: 'Empty FeatureCollection: The GeoJSON file contains 0 features.',
        wardsCount: 0
      };
    }

    const rawWards: WardData[] = [];
    const errors: string[] = [];

    data.features.forEach((feat: any, idx: number) => {
      if (!feat || !feat.geometry) {
        errors.push(`Feature at index ${idx} is missing a geometry definition.`);
        return;
      }

      const geomType = feat.geometry.type;
      if (geomType !== 'Polygon' && geomType !== 'MultiPolygon') {
        errors.push(`Feature at index ${idx} has unsupported geometry type '${geomType}'. Expected Polygon or MultiPolygon.`);
        return;
      }

      // Convert GeoJSON [lon, lat] coordinates to Leaflet [lat, lon]
      let leafletCoordinates: [number, number][] = [];
      if (geomType === 'Polygon') {
        const ring = feat.geometry.coordinates[0]; // Exterior ring
        if (!Array.isArray(ring) || ring.length < 3) {
          errors.push(`Feature ${idx}: Polygon exterior ring must contain at least 3 coordinate points.`);
          return;
        }
        leafletCoordinates = ring.map((pt: any) => [Number(pt[1]), Number(pt[0])]);
      } else if (geomType === 'MultiPolygon') {
        const firstPolyRing = feat.geometry.coordinates[0]?.[0];
        if (!Array.isArray(firstPolyRing) || firstPolyRing.length < 3) {
          errors.push(`Feature ${idx}: MultiPolygon first polygon ring has invalid points.`);
          return;
        }
        leafletCoordinates = firstPolyRing.map((pt: any) => [Number(pt[1]), Number(pt[0])]);
      }

      // Calculate centroid from polygon vertices if not provided
      let sumLat = 0;
      let sumLon = 0;
      leafletCoordinates.forEach(([lat, lon]) => {
        sumLat += lat;
        sumLon += lon;
      });
      const centroid: [number, number] = [
        sumLat / leafletCoordinates.length,
        sumLon / leafletCoordinates.length
      ];

      const props = feat.properties || {};
      const wardId = String(props.ward_id || props.id || props.OBJECTID || `WARD-${String(idx + 1).padStart(3, '0')}`);
      const wardName = String(props.ward_name || props.name || props.NAME || props.Ward_Name || `Ward ${idx + 1}`);
      const zoneName = String(props.zone_name || props.zone || props.Zone || `${cityConfig?.name || targetCityId} Zone`);
      
      const pinCodes: string[] = Array.isArray(props.pin_codes)
        ? props.pin_codes.map(String)
        : props.pin_code
        ? [String(props.pin_code)]
        : ['342001'];

      const landmarks: string[] = Array.isArray(props.landmarks)
        ? props.landmarks.map(String)
        : props.landmark
        ? [String(props.landmark)]
        : [`${wardName} Municipal Office`, 'Local Community Center'];

      const areaSqKm = Number(props.area_sq_km || props.area_km2 || props.area || 4.2);
      const population = Number(props.population || props.pop || props.total_pop || 45000);
      const popDensity = Number(props.population_density || (population / Math.max(0.5, areaSqKm)));

      const lst = Number(props.lst_celsius || props.lst || (cityConfig ? cityConfig.weather.temp_celsius + 4.5 : 42.0));
      const ndvi = Number(props.ndvi !== undefined ? props.ndvi : 0.125);
      const ndwi = Number(props.ndwi !== undefined ? props.ndwi : -0.16);
      const buildingDensity = Number(props.building_density_pct || props.builtup_pct || 72);
      const lulcClass = String(props.lulc_class || props.lulc || 'Dense Mixed Urban Core');

      const ward: WardData = {
        ward_id: wardId,
        ward_name: wardName,
        zone_name: zoneName,
        pin_codes: pinCodes,
        landmarks: landmarks,
        centroid: centroid,
        area_sq_km: Math.round(areaSqKm * 100) / 100,
        population: Math.round(population),
        population_density: Math.round(popDensity),
        lst_celsius: Math.round(lst * 10) / 10,
        ndvi: Math.round(ndvi * 1000) / 1000,
        ndwi: Math.round(ndwi * 1000) / 1000,
        building_density_pct: Math.round(buildingDensity),
        lulc_class: lulcClass,
        children_0_6_pct: Number(props.children_0_6_pct || 10.2),
        female_pct: Number(props.female_pct || 48.2),
        sc_population_pct: Number(props.sc_population_pct || 12.5),
        st_population_pct: Number(props.st_population_pct || 2.4),
        literacy_pct: Number(props.literacy_pct || 76.5),
        elderly_60_plus_pct: Number(props.elderly_60_plus_pct || 11.5),
        low_income_slum_pct: Number(props.low_income_slum_pct || 34),
        outdoor_workers_count: Number(props.outdoor_workers_count || 3200),
        social_vulnerability_score: Number(props.social_vulnerability_score || 6.2),
        uhc_name: String(props.uhc_name || `UPHC ${wardName} Dispensary`),
        uhc_distance_km: Number(props.uhc_distance_km || 1.2),
        current_temp_celsius: Number(props.current_temp_celsius || (cityConfig ? cityConfig.weather.temp_celsius : 41.5)),
        current_humidity_pct: Number(props.current_humidity_pct || (cityConfig ? cityConfig.weather.humidity_pct : 35)),
        coordinates: leafletCoordinates
      };

      rawWards.push(ward);
    });

    if (rawWards.length === 0) {
      return {
        success: false,
        message: 'No valid ward polygons could be constructed from the GeoJSON features.',
        wardsCount: 0,
        errors
      };
    }

    // Run PCA engine over the loaded wards to assign HVI scores
    const { enrichedWards } = computeCitywideHVI(rawWards);

    return {
      success: true,
      message: `Successfully ingested ${enrichedWards.length} municipal administrative ward boundary polygons with PCA HVI calculation.`,
      wardsCount: enrichedWards.length,
      cityId: targetCityId,
      wards: enrichedWards
    };
  } catch (err: any) {
    return {
      success: false,
      message: `GeoJSON parsing failed: ${err.message || 'Malformed JSON format'}`,
      wardsCount: 0
    };
  }
}
