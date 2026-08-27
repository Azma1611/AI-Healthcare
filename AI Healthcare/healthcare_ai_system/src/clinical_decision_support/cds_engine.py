import logging
import pandas as pd
from typing import Dict, Any, Optional
from src.nlp.nlp_processor import NLPProcessor
from src.disease_prediction.predictor import PredictorService
from src.medical_image_analysis.image_processor import ImageAnalyzer

logger = logging.getLogger(__name__)

class ClinicalDecisionSupportEngine:
    """
    Clinical Decision Support (CDS) Engine.
    Integrates ML predictions (structured data) with NLP extracted findings (unstructured data).
    Provides educational decision-support suggestions and safety disclaimers.
    """
    
    def __init__(self):
        self.nlp_processor = NLPProcessor()
        self.predictor_service = PredictorService()
        self.predictor_service.load_artifacts()
        
        # Load the image analyzer. This can be slow, but it's done once at startup.
        try:
            self.image_analyzer = ImageAnalyzer()
        except Exception as e:
            logger.error(f"Failed to load ImageAnalyzer: {e}")
            self.image_analyzer = None

    def get_suggestions(self, risk_level: str) -> list:
        """Returns standard considerations based on the risk level."""
        if risk_level == "Low Risk":
            return [
                "Routine annual screening.",
                "Patient reassurance based on current structured metrics.",
                "Monitor any new or changing symptoms."
            ]
        elif risk_level == "Medium Risk":
            return [
                "Schedule follow-up appointment within 3-6 months.",
                "Consider additional imaging (e.g., MRI or Ultrasound) to confirm findings.",
                "Review family history and NLP notes carefully."
            ]
        else:
            return [
                "High priority clinical review recommended.",
                "Consider biopsy or specialist consultation.",
                "Review top influential ML features against patient imaging.",
                "Discuss potential care pathways with a multidisciplinary team."
            ]

    def evaluate_case(self, patient_features: pd.DataFrame, medical_note: str, image_bytes: Optional[bytes] = None) -> Dict[str, Any]:
        """
        Evaluates a patient case combining ML, NLP, and optionally Image Analysis.
        """
        logger.info("Evaluating case via CDS Engine...")
        
        # 1. NLP Processing
        nlp_results = self.nlp_processor.process(medical_note)
        
        # 2. ML Prediction
        ml_results = self.predictor_service.predict(patient_features)
        
        # 3. Decision Support Synthesis
        predicted_condition = "Malignant" if ml_results["prediction_class"] == 1 else "Benign"
        risk_level = ml_results["risk_category"]
        
        # Adjust risk context manually if NLP detects severe positive findings but ML is Low Risk (Heuristic)
        nlp_positive = nlp_results.get("positive_findings", [])
        if risk_level == "Low Risk" and ("mass" in nlp_positive or "lump" in nlp_positive):
            escalation_note = "Note: ML Risk is Low, but NLP detected 'mass'/'lump'. Recommend clinical correlation."
        else:
            escalation_note = "ML and NLP findings are aligned."
            
        # 3b. Image Analysis (if provided)
        image_results = None
        if image_bytes and self.image_analyzer:
            image_results = self.image_analyzer.analyze(image_bytes)
            if image_results.get("image_prediction") == "Abnormal Lesion Detected":
                escalation_note = "WARNING: CNN detected an abnormal lesion in the scan. Cross-check immediately."
                if risk_level == "Low Risk":
                    risk_level = "Medium Risk" # Heuristic escalation
        
        suggestions = self.get_suggestions(risk_level)
        
        low_confidence = ml_results.get("low_confidence_warning", False)
        if low_confidence:
            suggestions.insert(0, "⚠️ LOW AI CONFIDENCE: Request further clinical testing due to ambiguous ML probability.")
            
        # 4. Construct Final Report Payload
        report = {
            "status": "Success",
            "clinical_decision_support_summary": {
                "predicted_condition": predicted_condition,
                "confidence_score": f"{ml_results['confidence_score'] * 100:.2f}%",
                "low_confidence_warning": low_confidence,
                "overall_risk_level": risk_level,
            },
            "nlp_extracted_insights": nlp_results,
            "ml_influential_factors": ml_results["top_influential_features"],
            "image_analysis": image_results,
            "cross_analysis": escalation_note,
            "next_step_considerations": suggestions,
            "safety_disclaimer": (
                "WARNING: This system is an educational AI prototype. "
                "It MUST NOT be used to replace a doctor, provide a definitive diagnosis, "
                "or independently prescribe medication/treatment."
            )
        }
        
        logger.info("CDS Engine evaluation complete.")
        return report
