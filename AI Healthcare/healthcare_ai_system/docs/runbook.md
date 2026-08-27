# Operational Runbook: AI Healthcare Prototype

This document outlines the standard operating procedures, health checks, and monitoring strategies for the AI Healthcare Clinical Decision Support system.

## 1. Health Checks

The system exposes a comprehensive health endpoint that verifies API, Database, Redis, and Model inference status.

**Endpoint:** `GET /health`
**Expected Response:** `200 OK`
```json
{
  "status": "ok",
  "db_status": "connected",
  "redis_status": "connected",
  "models_status": "loaded",
  "environment": "production"
}
```

If `db_status` or `models_status` is not healthy, the API will return a `503 Service Unavailable`. 
Note: If Redis is disconnected, the API will still return `200 OK` (with `redis_status: "disconnected"`) because the system gracefully degrades rate limiting to in-memory tracking.

## 2. Observability & Monitoring

The system exposes Prometheus metrics at `GET /metrics`.

**Key Metrics to Monitor (in Grafana):**
- `prediction_requests_total`: Tracks overall throughput of predictions, segmented by `risk_level`.
- `prediction_confidence_distribution`: A Histogram tracking AI confidence scores. A sudden shift towards 0.5 (50%) indicates the model is struggling to make clear decisions.
- `patient_feature_distribution`: A Histogram tracking the anonymous statistical distribution of incoming clinical features (e.g., `mean_radius`, `worst_area`). This acts as our lightweight **Data Drift** detector.

> [!NOTE]
> **Performance Monitoring Limitation:** True ML performance monitoring (Accuracy, F1-Score) requires ground-truth labels. Because clinical outcomes are not fed back into this prototype, we cannot calculate live performance metrics. We rely on Data Drift as a proxy for performance degradation.

## 3. Audit Logging

All security, administrative, and inference events are audited.
- **Log Format:** JSON structured logging is enforced for machine readability.
- **Destination:** Logs are sent to `stdout` and stored in the PostgreSQL `audit_logs` table.
- **Privacy:** `AuditLogger` is strictly programmed to NEVER log raw patient features, unstructured medical notes, or PII.

## 4. Common Failures & Recovery

### 4.1 Database Connection Lost
- **Symptoms:** `503 Service Unavailable` on `/health`, `500 Internal Server Error` on API endpoints.
- **Mitigation:** SQLAlchemy is configured with `pool_pre_ping=True`, meaning transient network drops are handled automatically by recycling stale connections. 
- **Recovery:** Restart the `postgres` container if it has fully crashed: `docker-compose restart postgres`.

### 4.2 Redis Cache Failure
- **Symptoms:** `redis_status: disconnected` in `/health`. Log warnings indicating `Redis rate limiting failed`.
- **Mitigation:** The system gracefully degrades. Rate limiting shifts to local in-memory tracking. Cache reads for predictions will miss and fallback to live inference.
- **Recovery:** Restart the `redis` container: `docker-compose restart redis`.

### 4.3 Models Missing
- **Symptoms:** `models_status: missing` in `/health`. `503` on `/predict`.
- **Cause:** The ML artifacts in `./models` were deleted, or the system was started on a fresh instance without running the training pipeline.
- **Recovery:** Log in as an `admin` and trigger the training pipeline via `POST /admin/train-model`, or manually run `python src/run_module_3.py`.

## 5. Development vs Production Configuration

- **Development:** `ENVIRONMENT=development`. Uses SQLite by default. Secrets can be hardcoded (for prototyping only).
- **Production:** `ENVIRONMENT=production`. Must use PostgreSQL. The system will throw a fatal error on startup if the default insecure `jwt_secret_key` is used. Always inject secrets via `.env`.
