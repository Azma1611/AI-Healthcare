# Module 5: Interactive Dashboard & API Integration Report

## Overview
This document summarizes the development of the final presentation and integration layers for the **AI-Powered Intelligent Healthcare Diagnosis and Clinical Decision Support System**. It includes a professional Streamlit dashboard for interactive use and a FastAPI backend for programmatic integration.

> [!WARNING]
> This system is an **educational AI prototype**. The recommendations are strictly decision-support suggestions and MUST NOT be used to replace a doctor, provide a definitive diagnosis, or independently prescribe medication.

## 1. FastAPI Backend (`api/main.py`)
A robust, lightweight REST API was developed using FastAPI to expose the Machine Learning and NLP models programmatically.

### Endpoints
- `GET /health`: Returns the health status of the API and verifies that ML models (`best_model.joblib`, `preprocessor.joblib`) are correctly loaded into memory.
- `POST /predict`: Accepts a structured JSON payload of patient features and returns the raw ML prediction (Condition, Probability, Risk Level).
- `POST /analyze-report`: The primary Clinical Decision Support endpoint. Accepts both patient features and unstructured medical notes, routes them through the CDS Engine, and returns a unified JSON payload containing ML predictions, NLP insights, and next-step considerations.

### Reliability Features
- **Input Validation**: Enforced using Pydantic models (`PatientFeatures`, `ReportRequest`). Invalid inputs automatically trigger HTTP 422 Unprocessable Entity errors.
- **Graceful Degradation**: If models fail to load from disk, the API starts but returns HTTP 503 Service Unavailable for prediction routes rather than crashing completely.
- **Logging**: Added comprehensive server-side logging for prediction events and errors.

## 2. Streamlit Dashboard (`app.py`)
An interactive, professional web application was built to simulate a doctor's interface for the CDS system.

### Key Features
- **Patient Input Sidebar**: Allows manual entry of the top 5 most influential clinical metrics (e.g., Worst Concave Points, Worst Texture, Worst Radius). To optimize UX, the remaining 25 features are automatically padded with baseline dataset means, preventing the user from needing to manually type 30 floats.
- **Medical Report Upload**: A large text area for pasting unstructured clinical observations.
- **Visual Analytics**: 
  - Dynamic metric cards for Predicted Condition and Confidence Score.
  - Color-coded Risk Level indicators (Red for High, Orange for Medium, Green for Low).
  - Clear separation of NLP Insights (Positive vs. Negated findings).
  - A DataFrame table displaying the exact influence score of the top ML features driving the decision.
- **Report Generation**: A one-click `Download JSON Report` button allowing the user to export the full analysis for external record keeping.
- **Safety Disclaimer**: A prominent, non-dismissible warning is displayed at both the top and bottom of the application.

## 3. Testing and Validation
- Integration tests (`tests/test_api.py`) were built utilizing FastAPI's `TestClient` and `httpx`.
- Tests verify HTTP status codes, Pydantic validation rejection rules, and successful CDS JSON generation.
- **All 19 tests across Modules 1-5 passed successfully.**

## 4. Execution Commands
To run the API Server:
```bash
uvicorn api.main:app --reload
```
To run the Dashboard:
```bash
streamlit run app.py
```
