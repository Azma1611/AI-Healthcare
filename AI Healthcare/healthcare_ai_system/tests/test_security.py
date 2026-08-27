import pytest
import math
from fastapi.testclient import TestClient
from api.main import app
from app import ALL_FEATURES

def get_admin_token(client):
    response = client.post(
        "/auth/token",
        data={"username": "admin_user", "password": "admin_password_456"}
    )
    return response.json()["access_token"]

def get_clinician_token(client):
    response = client.post(
        "/auth/token",
        data={"username": "dr_smith", "password": "secure_password_123"}
    )
    return response.json()["access_token"]

def test_unauthorized_access_to_admin():
    """Clinician should not be able to access admin routes"""
    with TestClient(app) as client:
        token = get_clinician_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.post("/admin/ingest-dataset", headers=headers)
        assert response.status_code == 403
        
        response = client.post("/admin/promote-model", json={"version_id": "test", "environment": "prod"}, headers=headers)
        assert response.status_code == 403

def test_admin_access_to_admin_route():
    """Admin should be able to access admin routes, even if it fails later due to logic"""
    with TestClient(app) as client:
        token = get_admin_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Missing payload will be 422, but that proves 403 is bypassed!
        response = client.post("/admin/promote-model", headers=headers)
        assert response.status_code == 422



def test_predict_rejects_out_of_bounds_high():
    """Predict should reject values outside [0, 1000000] (high)"""
    payload = {feat: 0.5 for feat in ALL_FEATURES}
    payload[ALL_FEATURES[0]] = 1000001.0
    
    with TestClient(app) as client:
        token = get_clinician_token(client)
        response = client.post("/predict", json={"features": payload}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 422
        assert "out of clinical bounds" in response.text

def test_predict_rejects_out_of_bounds_negative():
    """Predict should reject negative values (must be >= 0)"""
    payload = {feat: 0.5 for feat in ALL_FEATURES}
    payload[ALL_FEATURES[0]] = -1.0
    
    with TestClient(app) as client:
        token = get_clinician_token(client)
        response = client.post("/predict", json={"features": payload}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 422
        assert "out of clinical bounds" in response.text
