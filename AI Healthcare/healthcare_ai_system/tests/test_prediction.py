import pytest
import pandas as pd
import numpy as np
import os
from sklearn.linear_model import LogisticRegression
from src.ml_models.model_trainer import ModelTrainer
from src.disease_prediction.predictor import PredictorService

@pytest.fixture
def mock_trainer_data():
    X_train = pd.DataFrame({
        'feature1': [0.1, 0.5, 0.8, 0.2, 0.9, 0.4, 0.7, 0.3],
        'feature2': [1.1, 1.5, 1.8, 1.2, 1.9, 1.4, 1.7, 1.3]
    })
    y_train = pd.Series([0, 1, 1, 0, 1, 0, 1, 0], name='target')
    return X_train, y_train

def test_model_training_and_evaluation(mock_trainer_data):
    X, y = mock_trainer_data
    trainer = ModelTrainer()
    
    # Train
    models = trainer.train_models(X, y)
    assert 'LogisticRegression' in models
    assert 'RandomForest' in models
    assert 'GradientBoosting' in models
    
    # Evaluate
    metrics = trainer.evaluate_models(models, X, y) # Evaluating on train for simple test
    assert 'accuracy' in metrics['LogisticRegression']
    assert metrics['LogisticRegression']['accuracy'] >= 0.0

def test_select_and_save_model(mock_trainer_data, tmp_path):
    X, y = mock_trainer_data
    trainer = ModelTrainer()
    models = trainer.train_models(X, y)
    metrics = trainer.evaluate_models(models, X, y)
    
    best_name, best_model, _ = trainer.select_best_model(metrics)
    
    assert best_name in trainer.models.keys()
    
    save_path = os.path.join(tmp_path, "test_model.joblib")
    trainer.save_model(best_model, output_path=save_path)
    assert os.path.exists(save_path)

def test_risk_category():
    predictor = PredictorService()
    assert predictor.get_risk_category(0.2) == "Low Risk"
    assert predictor.get_risk_category(0.5) == "Medium Risk"
    assert predictor.get_risk_category(0.8) == "High Risk"

# Note: We do not do a full integration test of PredictorService.predict() here 
# to avoid requiring the actual preprocessor.joblib file to exist before the pipeline is run.
