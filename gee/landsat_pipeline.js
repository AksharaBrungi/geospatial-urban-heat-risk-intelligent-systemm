// ====================================================================
// Google Earth Engine (GEE) JavaScript Code Editor Script
// Geospatial Urban Heat Risk Intelligent System - Ward Zonal Analytics
// ====================================================================

// 1. Define Ward Boundary Asset / FeatureCollection
var wards = ee.FeatureCollection("users/urbanheat/hyderabad_ghmc_wards_150");

// 2. Filter Pre-Monsoon Peak Summer Landsat 8/9 Images
var summerCollection = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(wards)
  .filterDate('2024-03-01', '2024-05-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 10));

// 3. Compute LST, NDVI, NDWI
var calculateIndices = function(img) {
  var optical = img.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'])
                   .multiply(0.0000275).add(-0.2);
                   
  // Land Surface Temperature (Celsius)
  var lst = img.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15).rename('LST_Celsius');
  
  // Normalized Difference Vegetation Index
  var ndvi = optical.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
  
  // Normalized Difference Water Index
  var ndwi = optical.normalizedDifference(['SR_B3', 'SR_B5']).rename('NDWI');
  
  return img.addBands([lst, ndvi, ndwi]);
};

var composite = summerCollection.map(calculateIndices).median().clip(wards);

// 4. Compute Ward-Level Zonal Means
var wardStats = composite.select(['LST_Celsius', 'NDVI', 'NDWI']).reduceRegions({
  collection: wards,
  reducer: ee.Reducer.mean(),
  scale: 30
});

// 5. Visualization Palette
var lstVis = {min: 32, max: 48, palette: ['blue', 'cyan', 'yellow', 'orange', 'red']};
var ndviVis = {min: 0.0, max: 0.6, palette: ['brown', 'yellow', 'green', 'darkgreen']};

Map.centerObject(wards, 11);
Map.addLayer(composite.select('LST_Celsius'), lstVis, 'Land Surface Temperature (°C)');
Map.addLayer(composite.select('NDVI'), ndviVis, 'Vegetation Index (NDVI)');
Map.addLayer(wards.style({color: 'white', fillColor: '00000000'}), {}, 'Ward Boundaries');

// Export to PostGIS CSV / Asset
Export.table.toDrive({
  collection: wardStats,
  description: 'Ward_Level_Heat_Indices_Landsat',
  fileFormat: 'CSV'
});
