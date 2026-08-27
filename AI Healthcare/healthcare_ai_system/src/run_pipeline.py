import sys
import os
import argparse
import logging
from src.data_preprocessing.data_loader import DataLoader
from src.data_preprocessing.cleaner import DataCleaner
from src.feature_engineering.feature_builder import FeatureBuilder
from src.data_preprocessing.preprocessor import DataPreprocessor

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run(dataset_id: str = None):
    logger.info("Starting Module 2 Pipeline: Data Collection & Preprocessing")
    
    # 1. Load Data
    loader = DataLoader()
    if dataset_id:
        logger.info(f"Loading existing dataset version: {dataset_id}")
        df_clean = loader.load_versioned_dataset(dataset_id)
    else:
        logger.info("No dataset_id provided. Simulating IRB drop and ingestion...")
        raw_df = loader.download_public_dataset()
        df_clean, dataset_id = loader.ingest_irb_dataset(raw_df)
    
    logger.info(f"Using Dataset ID: {dataset_id}")
    logger.info(f"Raw Dataset Shape: {df_clean.shape}")
    logger.info(f"Target Distribution:\n{df_clean['target'].value_counts()}")
    logger.info(f"Missing Values: {df_clean.isnull().sum().sum()}")
    
    # 2. Clean Data
    cleaner = DataCleaner()
    df_clean = cleaner.remove_duplicates(df_clean)
    df_clean = cleaner.handle_missing_values(df_clean)
    cleaner.detect_invalid_values(df_clean)
    
    # 3. Feature Engineering
    fb = FeatureBuilder()
    df_features = fb.generate_features(df_clean)
    
    logger.info(f"Features after engineering: {df_features.shape[1]}")
    
    # 4. Split Data
    preprocessor = DataPreprocessor()
    train_df, val_df, test_df = preprocessor.split_data(df_features, test_size=0.2, val_size=0.1)
    
    # 5. Prevent Data Leakage (Fit only on Train, Transform all)
    train_processed = preprocessor.fit_transform(train_df)
    val_processed = preprocessor.transform(val_df)
    test_processed = preprocessor.transform(test_df)
    
    # 6. Save Artifacts and Processed Datasets
    preprocessor.save_artifacts()
    loader.save_split_data(train_processed, 'train')
    loader.save_split_data(val_processed, 'validation')
    loader.save_split_data(test_processed, 'test')
    
    # We should persist the dataset_id for the next module (Model Training)
    with open("data/latest_dataset_id.txt", "w") as f:
        f.write(dataset_id)
        
    logger.info("Module 2 Pipeline completed successfully.")
    
    # Output stats for documentation
    print("\n--- DATASET STATISTICS FOR REPORT ---")
    print(f"Total Records (Original): {len(df_clean)}")
    print(f"Features Count (Engineered): {df_features.shape[1] - 1}")
    print(f"Class Distribution:\n{df_clean['target'].value_counts().to_dict()}")
    print(f"Train Records: {len(train_processed)}")
    print(f"Validation Records: {len(val_processed)}")
    print(f"Test Records: {len(test_processed)}")
    print("-------------------------------------")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset-id", type=str, default=None, help="Use specific dataset version")
    args = parser.parse_args()
    
    if not os.path.exists("data"):
        os.makedirs("data")
    run(dataset_id=args.dataset_id)
