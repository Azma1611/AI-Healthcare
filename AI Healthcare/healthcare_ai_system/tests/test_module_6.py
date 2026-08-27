import pytest
from fastapi.testclient import TestClient
from api.main import app, _hash_features

# 30 dummy features
ALL_FEATURES = [f"feat_{i}" for i in range(30)] # Just dummy names for length in this test scope
# The actual app expects the actual breast cancer names, but for schema validation tests, we just pass what pydantic expects.
# Pydantic just expects a Dict[str, float].
from app import ALL_FEATURES

def get_auth_token(client):
    response = client.post(
        "/auth/token",
        data={"username": "dr_smith", "password": "secure_password_123"}
    )
    return response.json()["access_token"]

def test_api_predict_caching():
    payload = {feat: 0.5 for feat in ALL_FEATURES}
    
    with TestClient(app) as client:
        token = get_auth_token(client)
        # First request
        resp1 = client.post("/predict", json={"features": payload}, headers={"Authorization": f"Bearer {token}"})
        assert resp1.status_code == 200
        
        # Second identical request (should hit cache)
        resp2 = client.post("/predict", json={"features": payload}, headers={"Authorization": f"Bearer {token}"})
        assert resp2.status_code == 200
        assert resp1.json() == resp2.json()

def test_api_predict_invalid_input():
    # Send a string instead of a dictionary for features
    with TestClient(app) as client:
        token = get_auth_token(client)
        resp = client.post("/predict", json={"features": "not a dictionary"}, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 422

def test_api_analyze_report_large_note_limit():
    payload = {feat: 0.5 for feat in ALL_FEATURES}
    # Exceed the 10000 max_length character limit to test security constraint
    massive_note = "A" * 10001
    
    req_body = {
        "patient_data": {"features": payload},
        "medical_note": massive_note
    }
    
    with TestClient(app) as client:
        token = get_auth_token(client)
        resp = client.post("/analyze-report", json=req_body, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 422
        assert "String should have at most 10000 characters" in resp.text

def test_api_analyze_report_short_note_limit():
    payload = {feat: 0.5 for feat in ALL_FEATURES}
    # Below the 5 min_length character limit
    tiny_note = "Hi"
    
    req_body = {
        "patient_data": {"features": payload},
        "medical_note": tiny_note
    }
    
    with TestClient(app) as client:
        token = get_auth_token(client)
        resp = client.post("/analyze-report", json=req_body, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 422
        assert "String should have at least 5 characters" in resp.text
