import argparse
import logging
from src.data_preprocessing.data_loader import DataLoader

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description="Ingest IRB Dataset from Drop Folder")
    parser.add_argument("--drop-folder", type=str, default="data/irb_approved/drop/", help="Path to IRB drop folder")
    parser.add_argument("--dataset-id", type=str, default=None, help="Optional custom dataset ID")
    
    args = parser.parse_args()
    
    loader = DataLoader(irb_drop_path=args.drop_folder)
    df_clean, dataset_id = loader.ingest_irb_dataset(dataset_id=args.dataset_id)
    
    logger.info(f"Successfully ingested dataset: {dataset_id}")
    logger.info(f"Rows: {len(df_clean)}, Columns: {len(df_clean.columns)}")

if __name__ == "__main__":
    main()
