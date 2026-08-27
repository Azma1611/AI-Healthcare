# Deployment & Release Readiness Checklist

This document serves as the operational guide for deploying the AI Healthcare prototype to a generic Docker Compose environment.

> [!WARNING]
> This system is an **educational prototype**. It is **not clinically validated** and **not HIPAA/GDPR/DPDP compliant**. Do not deploy this to a public URL handling real patient data without extensive security audits, legal compliance checks, and a medically validated ML model.

## Prerequisites

1. **Docker Environment**: A host machine running Docker and Docker Compose.
2. **Resource Requirements**: At least 4GB of RAM and 2 vCPUs recommended to comfortably run PostgreSQL, Redis, the FastAPI backend (with ML models loaded in memory), and the Streamlit dashboard.
3. **Network Configuration**: Port `8000` (API) and Port `8501` (Dashboard) must be routed/exposed appropriately.

## Pre-Deployment Checklist

Before running `docker-compose up -d`, verify the following:

- [ ] `.env` file exists and is populated.
- [ ] `JWT_SECRET_KEY` is a cryptographically strong, random string (e.g., generated via `openssl rand -hex 32`).
- [ ] `ENVIRONMENT` is set to `production`.
- [ ] `POSTGRES_USER` and `POSTGRES_PASSWORD` are strong and unique.
- [ ] `CORS_ORIGINS` is restricted to the specific domain hosting the Streamlit dashboard (e.g., `["https://dashboard.yourdomain.com"]`).
- [ ] Model files (`.joblib` or `.pt`) exist in the local `./models` directory so they can be mounted.

## Deployment Steps

1. Clone the repository to the production server.
2. Place the verified `.env` file in the root directory.
3. Ensure the `./models` directory contains the production-ready model files.
4. **(Optional but recommended) Run local tests**: 
   ```bash
   pip install -r requirements-dev.txt
   pytest
   ```
5. Build and start the services:
   ```bash
   docker-compose up --build -d
   ```
6. Check logs to ensure services started correctly:
   ```bash
   docker-compose logs -f
   ```

## Post-Deployment Health Checks

After deployment, run the following verifications against the API:

1. **Overall Health Check**
   ```bash
   curl -s http://localhost:8000/health
   ```
   *Expected Response:* `{"status":"ok","models_status":"ok","db_status":"ok","redis_status":"ok"}`

2. **Metrics Endpoint (Prometheus)**
   ```bash
   curl -s http://localhost:8000/metrics | grep healthcare_api
   ```
   *Expected:* Output containing `patient_feature_distribution` and `prediction_confidence_distribution` histograms without any PII.

3. **Dashboard Access**
   Navigate to `http://<server-ip>:8501` in a browser and verify the login screen loads.

## Rollback Strategy

If a deployment introduces critical bugs or regressions:

1. **Revert the code**: 
   ```bash
   git checkout <previous_stable_commit>
   ```
2. **Rebuild and restart**:
   ```bash
   docker-compose up --build -d
   ```
3. **Database Rollback** (If a breaking schema migration occurred):
   - Restore the PostgreSQL volume from the latest automated backup. *Note: Automated volume backups must be configured separately by the infrastructure provider.*

## Monitoring & Operations
Refer to [runbook.md](./runbook.md) for detailed operational procedures on handling database failures, cache degradation, and data drift monitoring.
