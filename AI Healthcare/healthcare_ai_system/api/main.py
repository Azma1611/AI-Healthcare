import logging
from pythonjsonlogger import jsonlogger
import os
import hashlib
import json
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from functools import lru_cache
from datetime import timedelta
from contextlib import asynccontextmanager
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter, Histogram

from api.config import settings
from api.auth import create_access_token, verify_password, get_user, RequireRole, get_current_user, hash_password
from api.audit import AuditLogger
from api.rate_limiter import rate_limiter
from api.database import engine, get_db, Base
from api.cache import cache
from api import models
from sqlalchemy.orm import Session
from sqlalchemy import text

# Setup logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
logHandler.setFormatter(formatter)
logging.basicConfig(level=settings.log_level, handlers=[logHandler])
logger = logging.getLogger(__name__)

# Import existing ML & CDS logic
try:
    from src.clinical_decision_support.cds_engine import ClinicalDecisionSupportEngine
    from src.disease_prediction.predictor import PredictorService
    CDS_AVAILABLE = True
except ImportError as e:
    logger.error(f"Failed to import core logic. Ensure PYTHONPATH is set. {e}")
    CDS_AVAILABLE = False

# Global engines
cds_engine = None
predictor_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global cds_engine, predictor_service
    
    # Initialize Database
    logger.info("Initializing Database...")
    try:
        Base.metadata.create_all(bind=engine)
        
        # Seed mock users if empty
        with Session(engine) as db:
            if db.query(models.User).count() == 0:
                logger.info("Seeding initial mock users...")
                dr_smith = models.User(name="Dr. Smith", email="dr_smith@example.com", password_hash=hash_password("secure_password_123"), role="clinician")
                admin_user = models.User(name="Admin User", email="admin@example.com", password_hash=hash_password("admin_password_456"), role="admin")
                db.add(dr_smith)
                db.add(admin_user)
                db.commit()
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

    if not CDS_AVAILABLE:
        logger.warning("Core logic not available. API will not function correctly.")
    else:
        try:
            logger.info("Initializing Predictor and CDS Engines...")
            predictor_service = PredictorService()
            predictor_service.load_artifacts()
            
            cds_engine = ClinicalDecisionSupportEngine()
            
            if predictor_service.model is None:
                logger.error("Failed to load model file. Please ensure Module 3 has run.")
            else:
                logger.info("Engines loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load models. {e}")
    yield
    # Cleanup logic would go here if needed

app = FastAPI(
    title=settings.api_title,
    description="Educational AI Clinical Decision Support Prototype API (Secured)",
    version="1.2.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Metrics
Instrumentator().instrument(app).expose(app)

# Custom Prometheus Metrics
prediction_requests_total = Counter(
    "prediction_requests_total",
    "Total number of prediction requests",
    ["risk_level"]
)

prediction_confidence_distribution = Histogram(
    "prediction_confidence_distribution",
    "Distribution of AI confidence scores",
    buckets=[0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99, 1.0]
)

patient_feature_distribution = Histogram(
    "patient_feature_distribution",
    "Distribution of incoming patient features (anonymous)",
    ["feature_name"],
    buckets=[0.0, 0.1, 0.5, 1.0, 5.0, 10.0, 50.0, 100.0, 500.0, 1000.0]
)

# Global engines
cds_engine = None
predictor_service = None

import math
from pydantic import BaseModel, Field, field_validator

class PatientFeatures(BaseModel):
    features: Dict[str, float] = Field(
        ..., 
        description="A dictionary of continuous features representing the patient's clinical metrics. Values must be reasonable floats."
    )
    
    @field_validator('features')
    @classmethod
    def check_features(cls, v):
        for key, val in v.items():
            if math.isnan(val) or math.isinf(val):
                raise ValueError(f"Feature '{key}' contains invalid NaN or Infinity.")
            # Basic sanity bounds for clinical metrics (all physical properties in this dataset are positive)
            if val < 0 or val > 1000000:
                raise ValueError(f"Feature '{key}' is out of clinical bounds (must be >= 0 and <= 1,000,000).")
        return v

class ReportRequest(BaseModel):
    patient_data: PatientFeatures
    # Max length prevents massive DDOS or NLP buffer overruns
    medical_note: str = Field(..., min_length=5, max_length=10000, description="The unstructured medical report text.")

class PredictionResponse(BaseModel):
    prediction_class: int
    disease_likelihood: float
    confidence_score: float
    low_confidence_warning: bool
    risk_category: str
    top_influential_features: Dict[str, float]
    model_version: str
    is_mock_data: bool
    disclaimer: str

class CDSSummary(BaseModel):
    predicted_condition: str
    confidence_score: str
    low_confidence_warning: bool
    overall_risk_level: str

class AnalyzeReportResponse(BaseModel):
    status: str
    clinical_decision_support_summary: CDSSummary
    nlp_extracted_insights: Dict[str, Any]
    ml_influential_factors: Dict[str, float]
    image_analysis: Optional[Dict[str, Any]] = None
    cross_analysis: str
    next_step_considerations: List[str]
    safety_disclaimer: str

def _hash_features(features: Dict[str, float]) -> str:
    """Helper to create a cache key from features."""
    serialized = json.dumps(features, sort_keys=True)
    return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

@app.get("/health")
def health_check():
    """Health check endpoint to ensure API, DB, Redis, and models are loaded."""
    models_status = "loaded" if predictor_service and predictor_service.model is not None else "missing"
    
    # Check DB connection
    db_status = "disconnected"
    try:
        with Session(engine) as db:
            db.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as e:
        logger.error(f"Health check DB error: {e}")

    # Check Redis connection
    redis_status = "disconnected"
    try:
        if cache.redis_client and cache.redis_client.ping():
            redis_status = "connected"
    except Exception as e:
        logger.error(f"Health check Redis error: {e}")

    if models_status == "missing":
        raise HTTPException(status_code=503, detail="Models not loaded. Please run model training pipeline.")
    if db_status == "disconnected":
        raise HTTPException(status_code=503, detail="Database connection failed.")
        
    return {
        "status": "ok", 
        "db_status": db_status,
        "redis_status": redis_status,
        "models_status": models_status, 
        "environment": settings.environment
    }

@app.post("/auth/token")
def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db),
    _=Depends(rate_limiter)
):
    """OAuth2 compatible token login, required to access protected routes."""
    # form_data.username will contain the email provided from frontend
    user = get_user(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        AuditLogger.log_event("LOGIN_FAILED", form_data.username, "Failure", "Invalid credentials")
        raise HTTPException(status_code=401, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    AuditLogger.log_event("LOGIN_SUCCESS", user.email, "Success", f"Role: {user.role}")
    return {"access_token": access_token, "token_type": "bearer"}

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "patient"
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None

@app.post("/auth/register")
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user. If role is 'patient', also creates a patient profile."""
    existing_user = get_user(db, req.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = hash_password(req.password)
    new_user = models.User(
        name=req.name,
        email=req.email,
        password_hash=hashed_pwd,
        role=req.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if req.role == "patient":
        new_patient = models.Patient(
            user_id=new_user.id,
            age=req.age,
            gender=req.gender,
            phone=req.phone
        )
        db.add(new_patient)
        db.commit()
        
    AuditLogger.log_event("USER_REGISTERED", req.email, "Success", f"Role: {req.role}")
    return {"status": "success", "message": "User registered successfully"}

@app.post("/predict", response_model=PredictionResponse, dependencies=[Depends(rate_limiter)])
def predict(
    data: PatientFeatures, 
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates a prediction strictly from structured patient features. Available to clinicians and patients."""
    if not predictor_service or predictor_service.model is None:
        raise HTTPException(status_code=503, detail="Predictor service unavailable or model missing.")
        
    try:
        # Check cache (disabled caching for patients to ensure DB save logic runs, or handle carefully. 
        # For simplicity, we bypass cache if it's a patient to ensure we log their prediction, or we just save after cache hit.
        cache_key = _hash_features(data.features)
        cached_result = cache.get(cache_key)
        
        if cached_result:
            logger.info("Serving prediction from cache.")
            result = cached_result
        else:
            # Convert dictionary to single-row dataframe
            df = pd.DataFrame([data.features])
            result = predictor_service.predict(df)
            
            # Save to cache
            cache.set(cache_key, result)
            
            # Increment metric
            prediction_requests_total.labels(risk_level=result.get("risk_category", "Unknown")).inc()
            prediction_confidence_distribution.observe(result.get("confidence_score", 0.0))
            
            # Track feature drift anonymously (track mean radius and worst area for lightweight monitoring)
            if "mean radius" in data.features:
                patient_feature_distribution.labels(feature_name="mean_radius").observe(data.features["mean radius"])
            if "worst area" in data.features:
                patient_feature_distribution.labels(feature_name="worst_area").observe(data.features["worst area"])
        
        username = current_user.get("email") or current_user.get("username", "unknown")
        AuditLogger.log_prediction(username, "Success", result.get("risk_category", "Unknown"))
        
        # Save to database if it's a patient
        if current_user.get("role") == "patient":
            patient_record = db.query(models.Patient).filter(models.Patient.user_id == current_user["id"]).first()
            if patient_record:
                new_prediction = models.Prediction(
                    patient_id=patient_record.id,
                    disease="Breast Cancer", # Assuming breast cancer based on features like mean radius
                    prediction=result.get("risk_category", "Unknown"),
                    confidence=result.get("confidence_score", 0.0)
                )
                db.add(new_prediction)
                db.commit()
                
        return result
    except Exception as e:
        logger.error(f"Prediction error occurred: {e}")
        username = current_user.get("email") or current_user.get("username", "unknown")
        AuditLogger.log_prediction(username, "Failure")
        raise HTTPException(status_code=400, detail="Invalid input features or prediction failure.")

@app.post("/analyze-report", response_model=AnalyzeReportResponse, dependencies=[Depends(rate_limiter)])
def analyze_report(
    request_data: ReportRequest,
    request: Request,
    current_user: dict = Depends(RequireRole("clinician"))
):
    """Runs the full Clinical Decision Support Engine combining NLP and ML. Requires 'clinician' role."""
    if not cds_engine or cds_engine.predictor_service.model is None:
        raise HTTPException(status_code=503, detail="CDS Engine unavailable or model missing.")
        
    try:
        # We do not cache analyze-report to ensure we process fresh NLP findings always
        df = pd.DataFrame([request_data.patient_data.features])
        
        # Enforce max length explicitly again for safety
        if len(request_data.medical_note) > 10000:
            raise ValueError("Note too long.")
            
        result = cds_engine.evaluate_case(df, request_data.medical_note)
        
        # Metrics
        summary = result.get("clinical_decision_support_summary", {})
        conf_str = summary.get("confidence_score", "0%")
        conf_val = float(conf_str.strip('%')) / 100.0 if '%' in conf_str else 0.0
        prediction_confidence_distribution.observe(conf_val)
        
        AuditLogger.log_report_analysis(current_user["username"], "Success")
        return result
    except Exception as e:
        logger.error("Analysis error occurred. Details suppressed for data privacy.")
        AuditLogger.log_report_analysis(current_user["username"], "Failure")
        raise HTTPException(status_code=400, detail="Invalid input data for report analysis.")

@app.post("/analyze-scan", response_model=AnalyzeReportResponse, dependencies=[Depends(rate_limiter)])
async def analyze_scan(
    request: Request,
    patient_features_json: str = Form(..., description="JSON string of patient features dictionary"),
    medical_note: str = Form(..., description="Unstructured medical report text"),
    file: UploadFile = File(...),
    current_user: dict = Depends(RequireRole("clinician"))
):
    """Runs the full CDS engine including Image Analysis via CNN. Requires 'clinician' role."""
    if not cds_engine or cds_engine.predictor_service.model is None:
        raise HTTPException(status_code=503, detail="CDS Engine unavailable or model missing.")
    
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are supported.")
        
    try:
        features_dict = json.loads(patient_features_json)
        df = pd.DataFrame([features_dict])
        
        if len(medical_note) > 10000:
            raise ValueError("Note too long.")
            
        image_bytes = await file.read()
        result = cds_engine.evaluate_case(df, medical_note, image_bytes=image_bytes)
        
        # Metrics
        summary = result.get("clinical_decision_support_summary", {})
        conf_str = summary.get("confidence_score", "0%")
        conf_val = float(conf_str.strip('%')) / 100.0 if '%' in conf_str else 0.0
        prediction_confidence_distribution.observe(conf_val)
        
        AuditLogger.log_report_analysis(current_user["username"], "Success")
        return result
    except Exception as e:
        logger.error("Scan analysis error occurred. Details suppressed for data privacy.")
        AuditLogger.log_report_analysis(current_user["username"], "Failure")
        raise HTTPException(status_code=400, detail="Invalid input data for scan analysis.")

class PromoteRequest(BaseModel):
    version_id: str
    environment: str

@app.post("/admin/ingest-dataset", dependencies=[Depends(rate_limiter)])
def admin_ingest_dataset(current_user: dict = Depends(RequireRole("admin"))):
    """Admin endpoint to ingest IRB dataset from drop folder and run preprocessing pipeline."""
    try:
        from src.run_pipeline import run as run_pipeline_task
        run_pipeline_task()
        AuditLogger.log_event("DATASET_INGESTION", current_user["username"], "Success", "Triggered dataset ingestion pipeline.")
        return {"status": "success", "message": "Dataset ingested and preprocessing pipeline completed."}
    except Exception as e:
        logger.error("Admin dataset ingestion error. Details suppressed for data privacy.")
        AuditLogger.log_event("DATASET_INGESTION", current_user["username"], "Failure", "Pipeline failed.")
        raise HTTPException(status_code=500, detail="Pipeline failed.")

@app.post("/admin/train-model", dependencies=[Depends(rate_limiter)])
def admin_train_model(current_user: dict = Depends(RequireRole("admin"))):
    """Admin endpoint to train a new model on the latest dataset."""
    try:
        from src.run_module_3 import run as run_training_task
        run_training_task()
        # Reload PredictorService since run_module_3 promotes to production by default right now
        if predictor_service:
            predictor_service.load_artifacts()
            
        AuditLogger.log_event("MODEL_TRAINING", current_user["username"], "Success", "Triggered model training pipeline.")
        return {"status": "success", "message": "Model trained and saved."}
    except Exception as e:
        logger.error("Admin model training error. Details suppressed for data privacy.")
        AuditLogger.log_event("MODEL_TRAINING", current_user["username"], "Failure", "Training pipeline failed.")
        raise HTTPException(status_code=500, detail="Training failed.")

@app.post("/admin/promote-model", dependencies=[Depends(rate_limiter)])
def admin_promote_model(req: PromoteRequest, current_user: dict = Depends(RequireRole("admin"))):
    """Admin endpoint to promote a model version to a specific environment (e.g. 'production')."""
    try:
        from src.ml_models.model_registry import ModelRegistry
        registry = ModelRegistry()
        registry.promote_model(req.version_id, req.environment)
        
        # Reload PredictorService if it's currently production
        if req.environment == "production" and predictor_service:
            predictor_service.load_artifacts()
            
        AuditLogger.log_event("MODEL_PROMOTION", current_user["username"], "Success", f"Promoted {req.version_id} to {req.environment}.")
        return {"status": "success", "message": f"Model {req.version_id} promoted to {req.environment}."}
    except Exception as e:
        logger.error("Admin model promotion error. Details suppressed for data privacy.")
        AuditLogger.log_event("MODEL_PROMOTION", current_user["username"], "Failure", "Promotion failed.")
        raise HTTPException(status_code=500, detail="Promotion failed.")

@app.get("/evaluation-metrics", dependencies=[Depends(rate_limiter)])
def get_evaluation_metrics(current_user: dict = Depends(get_current_user)):
    """Retrieve the latest model evaluation metrics JSON."""
    metrics_path = "models/evaluation_metrics.json"
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Evaluation metrics not found.")

# --- Patient Specific Endpoints ---

@app.get("/api/predictions")
def get_patient_predictions(current_user: dict = Depends(RequireRole("patient")), db: Session = Depends(get_db)):
    """Fetch prediction history strictly for the authenticated patient."""
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user["id"]).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    predictions = db.query(models.Prediction).filter(models.Prediction.patient_id == patient.id).order_by(models.Prediction.created_at.desc()).all()
    return predictions

@app.get("/api/patient/profile")
def get_patient_profile(current_user: dict = Depends(RequireRole("patient")), db: Session = Depends(get_db)):
    """Fetch patient profile for the authenticated patient."""
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user["id"]).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    user = db.query(models.User).filter(models.User.id == current_user["id"]).first()
    return {
        "id": patient.id,
        "name": user.name,
        "email": user.email,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone
    }

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None

@app.put("/api/patient/profile")
def update_patient_profile(req: ProfileUpdateRequest, current_user: dict = Depends(RequireRole("patient")), db: Session = Depends(get_db)):
    """Update patient profile for the authenticated patient."""
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user["id"]).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    user = db.query(models.User).filter(models.User.id == current_user["id"]).first()
    
    if req.name is not None:
        user.name = req.name
    if req.age is not None:
        patient.age = req.age
    if req.gender is not None:
        patient.gender = req.gender
    if req.phone is not None:
        patient.phone = req.phone
        
    db.commit()
    return {"status": "success", "message": "Profile updated"}

class MedicalRecordRequest(BaseModel):
    record_type: str
    description: str

@app.get("/api/medical_records")
def get_medical_records(current_user: dict = Depends(RequireRole("patient")), db: Session = Depends(get_db)):
    """Fetch medical records strictly for the authenticated patient."""
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user["id"]).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    records = db.query(models.MedicalRecord).filter(models.MedicalRecord.patient_id == patient.id).order_by(models.MedicalRecord.created_at.desc()).all()
    return records

@app.post("/api/medical_records")
def add_medical_record(req: MedicalRecordRequest, current_user: dict = Depends(RequireRole("patient")), db: Session = Depends(get_db)):
    """Add a medical record strictly for the authenticated patient."""
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user["id"]).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    new_record = models.MedicalRecord(
        patient_id=patient.id,
        record_type=req.record_type,
        description=req.description
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record
