import pytest
import io
from PIL import Image
import json
from fastapi.testclient import TestClient
from api.main import app
from app import ALL_FEATURES

def get_auth_token(client):
    response = client.post(
        "/auth/token",
        data={"username": "dr_smith", "password": "secure_password_123"}
    )
    return response.json()["access_token"]

def create_dummy_image() -> bytes:
    """Creates a simple 224x224 RGB image in memory and returns bytes."""
    img = Image.new('RGB', (224, 224), color=(73, 109, 137))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

def test_image_processor():
    """Unit test for the ImageAnalyzer directly."""
    from src.medical_image_analysis.image_processor import ImageAnalyzer
    analyzer = ImageAnalyzer()
    
    img_bytes = create_dummy_image()
    result = analyzer.analyze(img_bytes)
    
    assert "image_prediction" in result
    assert "image_confidence" in result
    assert result["image_prediction"] in ["Normal Scan", "Abnormal Lesion Detected"]
    assert 0.0 <= result["image_confidence"] <= 1.0

def test_api_analyze_scan_endpoint():
    """Integration test for the /analyze-scan endpoint."""
    payload = {feat: 0.5 for feat in ALL_FEATURES}
    medical_note = "Patient states they feel fine. No mass found."
    img_bytes = create_dummy_image()
    
    with TestClient(app) as client:
        token = get_auth_token(client)
        
        # We need to send as multipart/form-data
        response = client.post(
            "/analyze-scan",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "patient_features_json": json.dumps(payload),
                "medical_note": medical_note
            },
            files={
                "file": ("scan.jpg", img_bytes, "image/jpeg")
            }
        )
        
        assert response.status_code == 200, response.text
        
        data = response.json()
        assert "image_analysis" in data
        assert data["image_analysis"] is not None
        assert "image_prediction" in data["image_analysis"]
