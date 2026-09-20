import { WardData, HVIResult, PCADomainDetail, RiskCategory } from '../types';

/**
 * Exact Research Paper PCA-Based Heat Vulnerability Index (HVI) Engine:
 * 1. Standardizes indicators using z-scores
 * 2. Computes domain-specific covariance matrices
 * 3. Extracts principal components, eigenvalues, % variance explained, and loadings
 * 4. Derives domain composite scores (Exposure, Sensitivity, Adaptive Capacity)
 * 5. Applies research formula: HVI = Exposure + Sensitivity - Adaptive Capacity
 * 6. Normalizes to 1 - 10 scale (1-3: Low, 4-6: Moderate, 7-10: High)
 */

function calculateZScores(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  const mean = values.reduce((acc, v) => acc + v, 0) / n;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const std = Math.sqrt(variance) || 1e-6;
  return values.map(v => (v - mean) / std);
}

function computeDomainPCA(
  dataMatrix: number[][],
  varNames: string[]
): { scores: number[]; detail: PCADomainDetail } {
  const nRows = dataMatrix.length;
  const nCols = varNames.length;

  // Standardize each column
  const standardizedCols: number[][] = [];
  for (let c = 0; c < nCols; c++) {
    const colValues = dataMatrix.map(row => row[c]);
    standardizedCols.push(calculateZScores(colValues));
  }

  // Compute Covariance / Correlation Matrix (nCols x nCols)
  const cov: number[][] = Array.from({ length: nCols }, () => Array(nCols).fill(0));
  for (let i = 0; i < nCols; i++) {
    for (let j = 0; j < nCols; j++) {
      let sum = 0;
      for (let r = 0; r < nRows; r++) {
        sum += standardizedCols[i][r] * standardizedCols[j][r];
      }
      cov[i][j] = sum / (nRows - 1 || 1);
    }
  }

  // Power iteration method to compute dominant eigenvector & eigenvalue (PC1)
  let v = Array(nCols).fill(1 / Math.sqrt(nCols));
  let eigenvalue = 1.0;
  for (let iter = 0; iter < 40; iter++) {
    const nextV = Array(nCols).fill(0);
    for (let i = 0; i < nCols; i++) {
      for (let j = 0; j < nCols; j++) {
        nextV[i] += cov[i][j] * v[j];
      }
    }
    const norm = Math.sqrt(nextV.reduce((acc, val) => acc + val * val, 0)) || 1e-6;
    eigenvalue = norm;
    v = nextV.map(val => val / norm);
  }

  // Ensure positive alignment with primary vulnerability driver
  let signCheck = 0;
  for (let r = 0; r < nRows; r++) {
    let rowScore = 0;
    for (let c = 0; c < nCols; c++) {
      rowScore += standardizedCols[c][r] * v[c];
    }
    signCheck += rowScore * standardizedCols[0][r];
  }
  if (signCheck < 0) {
    v = v.map(val => -val);
  }

  // Project data onto PC1
  const scores: number[] = [];
  for (let r = 0; r < nRows; r++) {
    let rowScore = 0;
    for (let c = 0; c < nCols; c++) {
      rowScore += standardizedCols[c][r] * v[c];
    }
    scores.push(rowScore);
  }

  // Total variance is trace of correlation matrix = nCols
  const totalVariance = nCols;
  const varianceExplained = (eigenvalue / totalVariance) * 100;

  const loadings: Record<string, number> = {};
  varNames.forEach((name, idx) => {
    loadings[name] = Math.round(v[idx] * 1000) / 1000;
  });

  return {
    scores,
    detail: {
      eigenvalues: [Math.round(eigenvalue * 1000) / 1000],
      variance_explained_pct: [Math.round(varianceExplained * 10) / 10],
      loadings,
      pc1_variance: Math.round(varianceExplained * 10) / 10
    }
  };
}

function scaleToRange(values: number[], minTarget = 0, maxTarget = 10): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => (minTarget + maxTarget) / 2);
  return values.map(v => minTarget + ((v - min) / (max - min)) * (maxTarget - minTarget));
}

export function computeCitywideHVI(wards: WardData[]): {
  hviResults: HVIResult[];
  enrichedWards: WardData[];
} {
  // 1. Exposure Variables: LST, Population Density
  const expVars = ['lst_celsius', 'population_density'];
  const expMatrix = wards.map(w => [w.lst_celsius, w.population_density]);
  const expPCA = computeDomainPCA(expMatrix, expVars);
  const expScaled = scaleToRange(expPCA.scores, 0, 10);

  // 2. Sensitivity Variables: Children 0-6 %, Female %, SC %, ST %
  const sensVars = ['children_0_6_pct', 'female_pct', 'sc_population_pct', 'st_population_pct'];
  const sensMatrix = wards.map(w => [
    w.children_0_6_pct,
    w.female_pct,
    w.sc_population_pct,
    w.st_population_pct
  ]);
  const sensPCA = computeDomainPCA(sensMatrix, sensVars);
  const sensScaled = scaleToRange(sensPCA.scores, 0, 10);

  // 3. Adaptive Capacity Variables: NDVI, NDWI, Literacy, UHC Proximity (1 / distance)
  const adaptVars = ['ndvi', 'ndwi', 'literacy_pct', 'uhc_proximity'];
  const adaptMatrix = wards.map(w => [
    w.ndvi,
    w.ndwi,
    w.literacy_pct,
    1.0 / (w.uhc_distance_km + 0.1)
  ]);
  const adaptPCA = computeDomainPCA(adaptMatrix, adaptVars);
  const adaptScaled = scaleToRange(adaptPCA.scores, 0, 10);

  // 4. Research Base Formula: HVI = Exposure + Sensitivity - Adaptive Capacity
  const rawHVI = wards.map((_, i) => expScaled[i] + sensScaled[i] - adaptScaled[i]);

  // 5. Standardized 1 - 10 Rescaling (Research Specification)
  const normalizedHVI = scaleToRange(rawHVI, 1.0, 10.0);

  const hviResults: HVIResult[] = wards.map((w, i) => {
    const normHVI = Math.round(normalizedHVI[i] * 10) / 10;
    let cat: RiskCategory = 'MODERATE';
    if (normHVI < 4.0) cat = 'LOW';
    else if (normHVI >= 7.0) cat = 'HIGH';

    return {
      ward_id: w.ward_id,
      ward_name: w.ward_name,
      exposure_score: Math.round(expScaled[i] * 10) / 10,
      sensitivity_score: Math.round(sensScaled[i] * 10) / 10,
      adaptive_capacity_score: Math.round(adaptScaled[i] * 10) / 10,
      raw_hvi: Math.round(rawHVI[i] * 100) / 100,
      normalized_hvi: normHVI,
      risk_category: cat,
      pca_details: {
        exposure: expPCA.detail,
        sensitivity: sensPCA.detail,
        adaptive_capacity: adaptPCA.detail
      }
    };
  });

  const enrichedWards: WardData[] = wards.map((w, i) => ({
    ...w,
    exposure_score: hviResults[i].exposure_score,
    sensitivity_score: hviResults[i].sensitivity_score,
    adaptive_capacity_score: hviResults[i].adaptive_capacity_score,
    raw_hvi: hviResults[i].raw_hvi,
    normalized_hvi: hviResults[i].normalized_hvi,
    risk_category: hviResults[i].risk_category
  }));

  return { hviResults, enrichedWards };
}
