"""
PCA-Based Heat Vulnerability Index (HVI) Service
Preserves the Research Base Paper's Exact Methodology:
1. Standardized indicators (z-scores)
2. Domain-specific PCA (Exposure, Sensitivity, Adaptive Capacity)
3. Principal components, eigenvalues, variance explained, factor loadings
4. Domain scores computation
5. HVI = Exposure Score + Sensitivity Score - Adaptive Capacity Score
6. Rescaling to standardized 1-10 scale (1-3 Low, 4-6 Moderate, 7-10 High)
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple


class HVIPCAService:
    def __init__(self):
        # Indicator names strictly following research paper specification:
        self.exposure_vars = ['lst_celsius', 'population_density']
        self.sensitivity_vars = ['children_0_6_pct', 'female_pct', 'sc_population_pct', 'st_population_pct']
        self.adaptive_capacity_vars = ['ndvi', 'ndwi', 'literacy_pct', 'uhc_proximity_score']

    def calculate_pca_domain(self, df_domain: pd.DataFrame) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Executes Domain-Specific Principal Component Analysis:
        - Z-score normalization: z = (x - mean) / std
        - Covariance/Correlation matrix computation
        - Eigenvalues & Eigenvectors decomposition
        - Variance explained calculation
        - Weighted composite score via PC1 / weighted PCs
        """
        X = df_domain.values
        # Z-score standardization
        means = np.mean(X, axis=0)
        stds = np.std(X, axis=0)
        stds[stds == 0] = 1e-6  # prevent div by zero
        X_standardized = (X - means) / stds

        # Covariance matrix
        cov_matrix = np.cov(X_standardized, rowvar=False)
        if cov_matrix.ndim == 0:
            cov_matrix = np.array([[cov_matrix]])
        elif cov_matrix.ndim == 1:
            cov_matrix = cov_matrix.reshape(1, 1)

        # Eigen decomposition
        eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
        # Sort descending
        idx = np.argsort(eigenvalues)[::-1]
        eigenvalues = eigenvalues[idx]
        eigenvectors = eigenvectors[:, idx]

        total_var = np.sum(eigenvalues)
        var_explained = (eigenvalues / total_var) * 100.0 if total_var > 0 else np.zeros_like(eigenvalues)

        # First Principal Component (PC1) captures highest variance
        pc1_loadings = eigenvectors[:, 0]
        # Adjust sign convention so higher values align with higher vulnerability
        pc1_scores = np.dot(X_standardized, pc1_loadings)
        if np.corrcoef(pc1_scores, X_standardized[:, 0])[0, 1] < 0:
            pc1_loadings = -pc1_loadings
            pc1_scores = -pc1_scores

        metadata = {
            "eigenvalues": [round(float(e), 4) for e in eigenvalues],
            "variance_explained_pct": [round(float(v), 2) for v in var_explained],
            "loadings": {col: round(float(loading), 4) for col, loading in zip(df_domain.columns, pc1_loadings)},
            "pc1_variance": round(float(var_explained[0]), 2)
        }

        return pc1_scores, metadata

    def compute_ward_hvi(self, ward_dataset: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Computes HVI for all wards across the city simultaneously using PCA.
        HVI = Exposure Score + Sensitivity Score - Adaptive Capacity Score
        """
        df = pd.DataFrame(ward_dataset)

        # Compute UHC proximity score (inverse of distance so higher is better adaptive capacity)
        if 'uhc_distance_km' in df.columns:
            df['uhc_proximity_score'] = 1.0 / (df['uhc_distance_km'] + 0.1)
        else:
            df['uhc_proximity_score'] = 1.0

        # 1. Domain-specific PCA
        exposure_scores, exp_meta = self.calculate_pca_domain(df[self.exposure_vars])
        sensitivity_scores, sens_meta = self.calculate_pca_domain(df[self.sensitivity_vars])
        adaptive_scores, adapt_meta = self.calculate_pca_domain(df[self.adaptive_capacity_vars])

        # Normalize domain scores to standard [0, 10] range
        def scale_0_10(scores):
            min_s, max_s = np.min(scores), np.max(scores)
            if max_s == min_s:
                return np.full_like(scores, 5.0)
            return ((scores - min_s) / (max_s - min_s)) * 10.0

        exp_scaled = scale_0_10(exposure_scores)
        sens_scaled = scale_0_10(sensitivity_scores)
        adapt_scaled = scale_0_10(adaptive_scores)

        # Raw Research Formula: HVI = Exposure + Sensitivity - Adaptive Capacity
        raw_hvi = exp_scaled + sens_scaled - adapt_scaled

        # Standardized 1-10 Rescaling (Research Specification)
        min_hvi, max_hvi = np.min(raw_hvi), np.max(raw_hvi)
        if max_hvi == min_hvi:
            normalized_hvi = np.full_like(raw_hvi, 5.0)
        else:
            normalized_hvi = 1.0 + ((raw_hvi - min_hvi) / (max_hvi - min_hvi)) * 9.0

        results = []
        for i, row in df.iterrows():
            norm_val = round(float(normalized_hvi[i]), 2)
            # Classification: 1-3 Low, 4-6 Moderate, 7-10 High
            if norm_val <= 3.99:
                category = "LOW"
            elif norm_val <= 6.99:
                category = "MODERATE"
            else:
                category = "HIGH"

            results.append({
                "ward_id": row["ward_id"],
                "ward_name": row["ward_name"],
                "exposure_score": round(float(exp_scaled[i]), 2),
                "sensitivity_score": round(float(sens_scaled[i]), 2),
                "adaptive_capacity_score": round(float(adapt_scaled[i]), 2),
                "raw_hvi": round(float(raw_hvi[i]), 2),
                "normalized_hvi": norm_val,
                "risk_category": category,
                "pca_details": {
                    "exposure": exp_meta,
                    "sensitivity": sens_meta,
                    "adaptive_capacity": adapt_meta
                }
            })

        return results
