import logging
import json
import pandas as pd
from src.clinical_decision_support.cds_engine import ClinicalDecisionSupportEngine

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run():
    logger.info("Starting Module 4 Pipeline: NLP & Clinical Decision Support")
    
    # 1. Load mock patient data (e.g., from the test set created in Module 2)
    try:
        test_df = pd.read_csv("data/test/test.csv")
    except FileNotFoundError:
        logger.error("Test data not found. Please run Module 2 pipeline first.")
        return
        
    # We will simulate a patient from the test set
    # Using index 5 as an example
    sample_patient_features = test_df.drop(columns=['target']).iloc[[5]]
    
    # 2. Mock Medical Doctor's Note
    medical_note = (
        "Patient presents with a palpable lump in the upper quadrant. "
        "She denies pain or discharge. "
        "No family history of breast cancer. "
        "Ultrasound showed an abnormal lesion with asymmetry."
    )
    
    # 3. Initialize and Run the CDS Engine
    try:
        cds = ClinicalDecisionSupportEngine()
        report = cds.evaluate_case(sample_patient_features, medical_note)
        
        # 4. Display the structured output payload
        print("\n" + "="*50)
        print(" CLINICAL DECISION SUPPORT (CDS) REPORT")
        print("="*50)
        print(json.dumps(report, indent=4))
        print("="*50 + "\n")
        
        logger.info("Module 4 Pipeline completed successfully.")
        
    except FileNotFoundError as e:
        logger.error(f"Failed to initialize CDS: {e}")
        logger.info("Please ensure Module 3 has been run to generate the ML artifacts.")

if __name__ == "__main__":
    run()
