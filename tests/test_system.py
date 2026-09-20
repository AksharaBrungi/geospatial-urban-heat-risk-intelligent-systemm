"""
System Verification Tests
Tests:
1. PCA HVI mathematical engine & 1-10 scaling
2. Random Forest & XGBoost risk predictions
3. SHAP feature attribution & bilingual plain-language explanations
4. Scenario simulation delta calculations
5. Recommendation trigger rules
6. Alert threshold rules
"""

import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services.hvi_pca_service import HVIPCAService
from backend.services.ml_prediction_service import MLPredictionService
from backend.services.shap_explainer_service import SHAPExplainerService
from backend.services.scenario_service import ScenarioService
from backend.services.recommendation_service import RecommendationEngine
from backend.services.alert_service import AlertService


def run_tests():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample', 'wards_dataset.json')
    with open(data_path, 'r') as f:
        wards = json.load(f)

    print(f"Loaded {len(wards)} sample wards.")

    # 1. PCA Test
    pca = HVIPCAService()
    hvi_results = pca.compute_ward_hvi(wards)
    assert len(hvi_results) == len(wards), "HVI results length mismatch"
    for r in hvi_results:
        assert 1.0 <= r["normalized_hvi"] <= 10.0, f"HVI out of bounds: {r['normalized_hvi']}"
        assert r["risk_category"] in ["LOW", "MODERATE", "HIGH"], "Invalid category"
    print("✓ PCA HVI Engine: Verified (scores scaled 1.0 - 10.0, Low/Mod/High classified)")

    # 2. ML Prediction Test
    ml = MLPredictionService()
    ml.train_models(wards)
    pred = ml.predict_ward_risk(wards[0])
    assert "ensemble_predicted_score" in pred
    assert 1.0 <= pred["ensemble_predicted_score"] <= 10.0
    print(f"✓ ML Prediction (RF + XGBoost): Verified (Ward 0: {pred['ensemble_predicted_score']})")

    # 3. SHAP Explainer Test
    shap_svc = SHAPExplainerService()
    shap_res = shap_svc.calculate_ward_shap(wards[0])
    assert len(shap_res["ranked_drivers"]) > 0
    assert "plain_english_explanation" in shap_res
    assert "plain_telugu_explanation" in shap_res
    print("✓ Explainable AI (SHAP): Verified with English & Telugu narratives")

    # 4. Scenario Simulation Test
    sim_svc = ScenarioService()
    sim_res = sim_svc.simulate(wards[0], delta_green_cover_pct=25.0)
    assert sim_res["delta"]["hvi_change"] < 0, "Expected green cover to reduce HVI"
    print(f"✓ Scenario Simulation: Verified (+25% green cover reduced HVI by {sim_res['delta']['hvi_change']})")

    # 5. Recommendation Engine Test
    rec_engine = RecommendationEngine()
    recs = rec_engine.generate_recommendations(wards[0])
    assert len(recs) > 0, "No recommendations generated"
    print(f"✓ Recommendation Engine: Verified ({len(recs)} ward-specific mitigations)")

    # 6. Alert System Test
    alert_svc = AlertService()
    alerts = alert_svc.evaluate_ward_alerts(wards[0])
    assert len(alerts) > 0
    print(f"✓ Alert System: Verified ({alerts[0]['level']} Alert for {wards[0]['ward_name']})")

    print("\nAll 6 verification checks PASSED successfully.")


if __name__ == "__main__":
    run_tests()
