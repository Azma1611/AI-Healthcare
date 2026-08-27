import os
import pandas as pd
import logging
import json
import uuid
import glob
from datetime import datetime
from sklearn.datasets import load_breast_cancer
from src.data_preprocessing.anonymizer import Anonymizer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataLoader:
    """Handles dataset collection, saving to raw, and loading."""
    
    def __init__(self, raw_data_path: str = "data/raw/dataset.csv", irb_drop_path: str = "data/irb_approved/drop/"):
        self.raw_data_path = raw_data_path
        self.irb_drop_path = irb_drop_path
        self.anonymizer = Anonymizer()

    def download_public_dataset(self) -> pd.DataFrame:
        """
        Downloads a safe, publicly available healthcare dataset (Breast Cancer Wisconsin).
        Note: This is an educational dataset and predictions must not be used for real medical diagnosis.
        Now it acts as a mock IRB dataset source for pipeline testing.
        """
        logger.info("Downloading UCI Breast Cancer dataset from sklearn to simulate IRB drop...")
        data = load_breast_cancer()
        df = pd.DataFrame(data.data, columns=data.feature_names)
        df['target'] = data.target
        # Inject mock PII for anonymizer testing
        df['patient_name'] = [f"MockPatient_{i}" for i in range(len(df))]
        df['ssn'] = [f"000-00-{i:04d}" for i in range(len(df))]
        return df

    def get_dataset_from_drop_folder(self) -> pd.DataFrame:
        """
        Reads the first available CSV dataset from the IRB drop folder.
        """
        if not os.path.exists(self.irb_drop_path):
            os.makedirs(self.irb_drop_path, exist_ok=True)
            
        csv_files = glob.glob(os.path.join(self.irb_drop_path, "*.csv"))
        if not csv_files:
            logger.warning(f"No datasets found in {self.irb_drop_path}. Falling back to public mock dataset.")
            return self.download_public_dataset()
            
        latest_file = max(csv_files, key=os.path.getctime)
        logger.info(f"Loading dataset from drop folder: {latest_file}")
        return pd.read_csv(latest_file)
        
    def ingest_irb_dataset(self, df: pd.DataFrame = None, dataset_id: str = None) -> pd.DataFrame:
        """
        Ingests an IRB-approved dataset, applies anonymization, and generates metadata.
        If no df is provided, it attempts to load from the drop folder.
        """
        if df is None:
            df = self.get_dataset_from_drop_folder()
            
        dataset_id = dataset_id or f"ds_{uuid.uuid4().hex[:8]}"
        logger.info(f"Ingesting IRB dataset with ID: {dataset_id}")
        
        # Anonymize
        df_clean = self.anonymizer.anonymize(df)
        
        # Save raw anonymized data
        version_dir = f"data/versions/{dataset_id}"
        os.makedirs(version_dir, exist_ok=True)
        
        # Update raw_data_path to point to the new version
        self.raw_data_path = os.path.join(version_dir, "raw_dataset.csv")
        self.save_raw_data(df_clean)
        
        # Generate metadata
        metadata = {
            "dataset_id": dataset_id,
            "ingestion_date": datetime.utcnow().isoformat(),
            "irb_approval_id": "MOCK-IRB-2026-001",
            "row_count": len(df_clean),
            "features": list(df_clean.columns),
            "contains_pii_post_anonymization": False
        }
        
        meta_path = os.path.join(version_dir, "dataset_metadata.json")
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=4)
        
        logger.info(f"Generated dataset metadata at {meta_path}")
        return df_clean, dataset_id

    def save_raw_data(self, df: pd.DataFrame) -> None:
        """Saves the dataframe to the raw data path."""
        os.makedirs(os.path.dirname(self.raw_data_path), exist_ok=True)
        df.to_csv(self.raw_data_path, index=False)
        logger.info(f"Raw data saved to {self.raw_data_path}")

    def load_versioned_dataset(self, dataset_id: str) -> pd.DataFrame:
        """Loads a specific versioned dataset by ID."""
        version_dir = f"data/versions/{dataset_id}"
        file_path = os.path.join(version_dir, "raw_dataset.csv")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Versioned dataset not found at {file_path}")
            
        logger.info(f"Loading versioned dataset {dataset_id} from {file_path}")
        self.raw_data_path = file_path
        return pd.read_csv(file_path)

    def load_data(self, path: str = None) -> pd.DataFrame:
        """Loads data from a given CSV path."""
        load_path = path if path else self.raw_data_path
        if not os.path.exists(load_path):
            raise FileNotFoundError(f"Data file not found at {load_path}")
        logger.info(f"Loading data from {load_path}")
        return pd.read_csv(load_path)

    def save_split_data(self, df: pd.DataFrame, split_name: str, base_dir: str = "data") -> str:
        """Saves a data split to its respective folder (train/validation/test)."""
        path = os.path.join(base_dir, split_name, f"{split_name}.csv")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        df.to_csv(path, index=False)
        logger.info(f"{split_name.capitalize()} data saved to {path}")
        return path
