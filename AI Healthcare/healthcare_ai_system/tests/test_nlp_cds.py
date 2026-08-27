import pytest
import pandas as pd
from src.nlp.nlp_processor import NLPProcessor
from src.clinical_decision_support.cds_engine import ClinicalDecisionSupportEngine

def test_text_cleaning():
    nlp = NLPProcessor()
    text = "Patient has PAIN!!  "
    assert nlp.clean_text(text) == "patient has pain!!"

def test_sentence_segmentation():
    nlp = NLPProcessor()
    text = "First sentence. Second sentence! Third sentence?"
    sentences = nlp.segment_sentences(text)
    assert len(sentences) == 3
    assert sentences[0] == "First sentence"
    assert sentences[1] == "Second sentence"
    assert sentences[2] == "Third sentence"

def test_nlp_extraction_and_negation():
    nlp = NLPProcessor()
    text = "Patient denies pain. There is a palpable mass. No history of cancer."
    findings = nlp.extract_findings(text)
    
    assert "mass" in findings["positive_findings"]
    assert "pain" in findings["negated_findings"]
    assert "history" in findings["negated_findings"]
    assert "pain" not in findings["positive_findings"]

def test_invalid_input_nlp():
    nlp = NLPProcessor()
    findings = nlp.process(None)
    assert "error" in findings

def test_cds_engine_integration(monkeypatch):
    """Mock the PredictorService to test the CDS Engine logic."""
    class MockPredictor:
        def load_artifacts(self):
            pass
        def predict(self, features):
                return {
                    "prediction_class": 1,
                    "disease_likelihood": 0.85,
                    "confidence_score": 0.85,
                    "low_confidence_warning": False,
                    "risk_category": "High Risk",
                    "top_influential_features": {"mock_feature": 1.5}
                }

    monkeypatch.setattr("src.clinical_decision_support.cds_engine.PredictorService", MockPredictor)
    
    cds = ClinicalDecisionSupportEngine()
    mock_df = pd.DataFrame({"dummy": [1]})
    mock_note = "Patient presents with a mass. Denies pain."
    
    report = cds.evaluate_case(mock_df, mock_note)
    
    assert report["status"] == "Success"
    assert report["clinical_decision_support_summary"]["predicted_condition"] == "Malignant"
    assert report["clinical_decision_support_summary"]["overall_risk_level"] == "High Risk"
    assert "mass" in report["nlp_extracted_insights"]["positive_findings"]
    assert "pain" in report["nlp_extracted_insights"]["negated_findings"]
    assert "WARNING" in report["safety_disclaimer"]
