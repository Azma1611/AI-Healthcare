import os
import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from src.ml_models.model_registry import ModelRegistry

logger = logging.getLogger(__name__)

class PredictorService:
    def __init__(self, version_id: str = "production"):
        self.version_id = version_id
        self.registry = ModelRegistry()
        self.preprocessor = None
        self.model = None
        self.metadata = None

    def load_artifacts(self):
        """Loads the saved preprocessor, model, and metadata via ModelRegistry."""
        try:
            self.model, self.preprocessor, self.metadata = self.registry.load_version(self.version_id)
            logger.info(f"Prediction artifacts (version {self.version_id}) loaded successfully.")
        except FileNotFoundError as e:
            logger.error(f"Failed to load model version {self.version_id}: {e}")
            raise FileNotFoundError("Model or Preprocessor artifact not found. Please train the model first.")

    def get_risk_category(self, probability: float) -> str:
        """Classifies risk based on prediction probability thresholds."""
        if probability < 0.30:
            return "Low Risk"
        elif probability < 0.70:
            return "Medium Risk"
        else:
            return "High Risk"

    def get_explainability(self, feature_names: List[str]) -> Dict[str, float]:
        """Returns the top 5 most influential features for the model."""
        importance_dict = {}
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            importance_dict = dict(zip(feature_names, importances))
        elif hasattr(self.model, 'coef_'):
            importances = np.abs(self.model.coef_[0])
            importance_dict = dict(zip(feature_names, importances))
        else:
            return {"Explainability": "Not available for this model type"}
            
        # Sort and get top 5
        sorted_importance = {k: v for k, v in sorted(importance_dict.items(), key=lambda item: item[1], reverse=True)[:5]}
        return sorted_importance

    def predict(self, patient_features: pd.DataFrame) -> Dict[str, Any]:
        """
        Runs the end-to-end prediction for a patient.
        Note: Educational prototype. Output is NOT a medical diagnosis.
        """
        if self.preprocessor is None or self.model is None:
            self.load_artifacts()

        # Transform features
        # Note: Depending on the dataset, missing values and feature engineering
        # would need to be applied here prior to scaling if the pipeline didn't encapsulate them.
        # For this prototype, we assume `patient_features` already has the required columns (e.g., interaction terms).
        
        # We wrap in a DataFrame to preserve feature names for sklearn
        X_scaled_array = self.preprocessor.transform(patient_features)
        if isinstance(X_scaled_array, np.ndarray):
            X_scaled = pd.DataFrame(X_scaled_array, columns=patient_features.columns)
        else:
            X_scaled = X_scaled_array

        # Predict
        predicted_class = int(self.model.predict(X_scaled)[0])
        probability = float(self.model.predict_proba(X_scaled)[0][1])
        
        # Confidence score is the probability of the *predicted* class
        confidence_score = probability if predicted_class == 1 else 1.0 - probability
        low_confidence_warning = True if confidence_score < 0.65 else False
        
        # Risk Categorization (Heuristic based on prototype requirements)
        risk = self.get_risk_category(probability)
        
        # Explainability
        explanation = self.get_explainability(list(patient_features.columns))
        
        # Fetch version ID from metadata
        version = self.metadata.get("version_id", f"{type(self.model).__name__}-v1.0.0") if self.metadata else f"{type(self.model).__name__}-unknown"
        
        return {
            "prediction_class": predicted_class,
            "disease_likelihood": probability,
            "confidence_score": confidence_score,
            "low_confidence_warning": low_confidence_warning,
            "risk_category": risk,
            "top_influential_features": explanation,
            "model_version": version,
            "is_mock_data": True,
            "disclaimer": "This is an educational AI prototype and MUST NOT be used for medical diagnosis."
        }
