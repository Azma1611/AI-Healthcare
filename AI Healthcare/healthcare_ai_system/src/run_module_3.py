import sys
import os
import logging
import pandas as pd
from src.eda.visualizer import EDAVisualizer
from src.ml_models.model_trainer import ModelTrainer
from src.ml_models.model_registry import ModelRegistry
from src.ml_models.model_validator import ModelValidator
from src.disease_prediction.predictor import PredictorService
import joblib

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run():
    logger.info("Starting Module 3 Pipeline: EDA & ML Disease Prediction")
    
    # 1. Load Processed Data
    train_path = "data/train/train.csv"
    val_path = "data/validation/validation.csv"
    test_path = "data/test/test.csv"
    
    if not os.path.exists(train_path):
        logger.error("Processed data not found. Please run Module 2 (src/run_pipeline.py) first.")
        return

    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    test_df = pd.read_csv(test_path)
    
    X_train = train_df.drop(columns=['target'])
    y_train = train_df['target']
    X_val = val_df.drop(columns=['target'])
    y_val = val_df['target']
    X_test = test_df.drop(columns=['target'])
    y_test = test_df['target']
    
    # 2. Exploratory Data Analysis (EDA)
    logger.info("Generating EDA visualizations...")
    visualizer = EDAVisualizer()
    eda_df = pd.concat([train_df, val_df])
    visualizer.plot_target_distribution(eda_df)
    visualizer.plot_feature_distributions(eda_df)
    visualizer.plot_correlation_matrix(eda_df)
    visualizer.plot_important_relationships(eda_df)
    
    # 3. Model Training
    trainer = ModelTrainer()
    trained_models = trainer.train_models(X_train, y_train)
    
    # 4. Preliminary Model Selection (on Val)
    metrics = trainer.evaluate_models(trained_models, X_val, y_val)
    best_name, best_model, hyperparameters = trainer.select_best_model(metrics, primary_metric='f1')
    
    # We load the preprocessor that was saved during Module 2
    try:
        preprocessor = joblib.load("models/preprocessor.joblib")
    except FileNotFoundError:
        logger.error("preprocessor.joblib not found. Did Module 2 run?")
        return

    # 5. Model Validation (on Test set)
    validator = ModelValidator()
    # Check for leakage across Train, Val, Test
    if validator.check_data_leakage(train_df, val_df, test_df, id_column=None):
        logger.error("Validation aborted due to data leakage.")
        return
        
    # 6. Version and Save to Registry
    registry = ModelRegistry()
    dataset_id = "ds_latest_mock"
    dataset_id_path = "data/latest_dataset_id.txt"
    if os.path.exists(dataset_id_path):
        with open(dataset_id_path, "r") as f:
            dataset_id = f.read().strip()
            
    version_id = registry.save_version(
        model=best_model, 
        preprocessor=preprocessor, 
        metrics=metrics[best_name], 
        dataset_id=dataset_id,
        hyperparameters=hyperparameters
    )
    
    # Promote best model directly to production for now
    registry.promote_model(version_id, "production")
    
    # Generate formal report
    validator.generate_validation_report(best_model, X_test, y_test, version_id)
    
    # 7. Test Prediction Service (loading production version)
    logger.info("Testing Predictor Service with production version...")
    predictor = PredictorService(version_id="production")
    predictor.load_artifacts()
    
    # Simulate a new patient using the first row of test set
    sample_patient = test_df.drop(columns=['target']).iloc[[0]]
    prediction = predictor.predict(sample_patient)
    
    print("\n--- SAMPLE PREDICTION ---")
    for k, v in prediction.items():
        print(f"{k}: {v}")
    print("-------------------------\n")

    logger.info("Module 3 Pipeline completed successfully.")

if __name__ == "__main__":
    run()
