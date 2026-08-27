import pytest
from fastapi.testclient import TestClient
from api.main import app

def test_prometheus_metrics_endpoint():
    """Verify that the /metrics endpoint is correctly exposed for Prometheus scraping."""
    with TestClient(app) as client:
        response = client.get("/metrics")
        # Ensure the endpoint exists and returns successfully
        assert response.status_code == 200
        
        # Ensure it returns Prometheus formatted metrics
        assert "http_requests_total" in response.text
        assert "http_request_size_bytes" in response.text
        assert "http_response_size_bytes" in response.text

def test_health_check_endpoint():
    """Verify the /health endpoint still functions correctly after instrumentation."""
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "environment" in data
