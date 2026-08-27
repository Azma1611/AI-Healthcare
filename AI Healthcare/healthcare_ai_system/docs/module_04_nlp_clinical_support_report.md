# Module 4: NLP and Clinical Decision Support Report

## Overview
This document summarizes the development of the Natural Language Processing (NLP) pipeline and the Clinical Decision Support (CDS) Engine.

> [!WARNING]
> This system is an **educational AI prototype**. The recommendations are strictly decision-support suggestions and MUST NOT be used to replace a doctor, provide a definitive diagnosis, or independently prescribe medication.

## Methodology

### 1. NLP Pipeline (`nlp_processor.py`)
To ensure the prototype remains lightweight and performs fast without heavy deep-learning dependencies, a robust rule-based NLP pipeline was implemented:
- **Text Normalization:** Lowercasing and multiple space reduction.
- **Sentence Segmentation:** Splitting unstructured text by punctuation marks (`.!?`).
- **Entity & Keyword Extraction:** Scanning normalized text for an extensible dictionary of clinical markers (e.g., "lump", "mass", "lesion", "abnormal").
- **Negation Detection:** Proximity window algorithm that scans 4 words preceding a detected symptom to identify negation triggers (e.g., "no", "not", "denies").

### 2. Clinical Decision Support Engine (`cds_engine.py`)
The CDS Engine serves as the central integration hub mapping unstructured clinical notes (from NLP) and structured predictions (from Module 3):
- Uses `PredictorService` to load the serialized ML models.
- Synthesizes an overall Patient Risk Level (`Low Risk`, `Medium Risk`, `High Risk`).
- Identifies disparities (e.g., "ML Risk is Low, but NLP detected a 'lump'") prompting physician correlation.
- Retrieves actionable, educational Next Step Considerations.

## Example Integration & Output

### Input
- **Structured Data:** Patient test record (Index 5)
- **Unstructured Clinical Note:** 
  > "Patient presents with a palpable lump in the upper quadrant. She denies pain or discharge. No family history of breast cancer. Ultrasound showed an abnormal lesion with asymmetry."

### Extracted NLP Insights
- **Positive Findings:** `abnormal`, `lesion`, `lump`, `asymmetry`
- **Negated Findings:** `pain`, `discharge`, `history`

### Output Payload
```json
{
    "status": "Success",
    "clinical_decision_support_summary": {
        "predicted_condition": "Benign",
        "confidence_score": "0.00%",
        "overall_risk_level": "Low Risk"
    },
    "nlp_extracted_insights": {
        "positive_findings": [
            "abnormal",
            "lesion",
            "lump",
            "asymmetry"
        ],
        "negated_findings": [
            "pain",
            "discharge",
            "history"
        ]
    },
    "ml_influential_factors": {
        "worst concave points": 1.0632172776240683,
        "worst texture": 1.0429718245464632,
        "radius error": 0.9580004486439712,
        "worst radius": 0.9253548176459343,
        "worst area": 0.9192327720634218
    },
    "cross_analysis": "Note: ML Risk is Low, but NLP detected 'mass'/'lump'. Recommend clinical correlation.",
    "next_step_considerations": [
        "Routine annual screening.",
        "Patient reassurance based on current structured metrics.",
        "Monitor any new or changing symptoms."
    ],
    "safety_disclaimer": "WARNING: This system is an educational AI prototype. It MUST NOT be used to replace a doctor, provide a definitive diagnosis, or independently prescribe medication/treatment."
}
```
