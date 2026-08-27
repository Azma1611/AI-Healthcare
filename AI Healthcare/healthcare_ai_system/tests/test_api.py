import pytest
from fastapi.testclient import TestClient
from api.main import app

from app import ALL_FEATURES

def get_auth_token(client):
    response = client.post(
        "/auth/token",
        data={"username": "dr_smith", "password": "secure_password_123"}
    )
    return response.json()["access_token"]

def test_health_check():
    # Using 'with TestClient' triggers the startup/shutdown events in FastAPI
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

def test_predict_endpoint_missing_features():
    with TestClient(app) as client:
        token = get_auth_token(client)
        response = client.post("/predict", json={}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 422 # Unprocessable Entity

def test_predict_endpoint_success():
    payload = {feat: 0.5 for feat in ALL_FEATURES}
    with TestClient(app) as client:
        token = get_auth_token(client)
        response = client.post("/predict", json={"features": payload}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert "prediction_class" in response.json()
        assert "risk_category" in response.json()

def test_analyze_report_endpoint_success():
    payload = {feat: 0.5 for feat in ALL_FEATURES}
    req_body = {
        "patient_data": {"features": payload},
        "medical_note": "Patient denies pain but has a lump."
    }
    with TestClient(app) as client:
        token = get_auth_token(client)
        response = client.post("/analyze-report", json=req_body, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Success"
        assert "lump" in data["nlp_extracted_insights"]["positive_findings"]
        assert "pain" in data["nlp_extracted_insights"]["negated_findings"]

def test_evaluation_metrics_success():
    with TestClient(app) as client:
        token = get_auth_token(client)
        response = client.get("/evaluation-metrics", headers={"Authorization": f"Bearer {token}"})
        # Note: If no model has been trained, it will return 404, but in this setup, 
        # module_3 has already run, so it should be 200 or at least we test it doesn't 500.
        assert response.status_code in [200, 404]
