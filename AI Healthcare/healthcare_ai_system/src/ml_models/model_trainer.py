import os
import json
import joblib
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.model_selection import cross_val_score

logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self):
        self.models = {
            'LogisticRegression': LogisticRegression(random_state=42, max_iter=2000),
            'RandomForest': RandomForestClassifier(random_state=42, n_estimators=100),
            'GradientBoosting': GradientBoostingClassifier(random_state=42, n_estimators=100)
        }
        
    def train_models(self, X_train: pd.DataFrame, y_train: pd.Series) -> Dict[str, Any]:
        """Trains all initialized models."""
        logger.info("Training models: " + ", ".join(self.models.keys()))
        for name, model in self.models.items():
            model.fit(X_train, y_train)
            logger.info(f"Trained {name}.")
        return self.models

    def evaluate_models(self, models: Dict[str, Any], X_val: pd.DataFrame, y_val: pd.Series) -> Dict[str, Dict[str, Any]]:
        """Evaluates models and returns a dictionary of metrics."""
        results = {}
        for name, model in models.items():
            preds = model.predict(X_val)
            probs = model.predict_proba(X_val)[:, 1] if hasattr(model, 'predict_proba') else preds
            
            # Cross validation on validation set
            min_class_count = y_val.value_counts().min()
            cv_folds = min(5, min_class_count)
            if cv_folds >= 2:
                cv_scores = cross_val_score(model, X_val, y_val, cv=cv_folds, scoring='f1')
            else:
                cv_scores = [0.0] # Fallback for extremely small mock datasets in tests
            
            metrics = {
                'accuracy': float(accuracy_score(y_val, preds)),
                'precision': float(precision_score(y_val, preds, zero_division=0)),
                'recall': float(recall_score(y_val, preds, zero_division=0)),
                'f1': float(f1_score(y_val, preds, zero_division=0)),
                'roc_auc': float(roc_auc_score(y_val, probs)),
                'confusion_matrix': confusion_matrix(y_val, preds).tolist(),
                'cv_f1_mean': float(np.mean(cv_scores)),
                'cv_f1_std': float(np.std(cv_scores))
            }
            results[name] = metrics
            logger.info(f"[{name}] F1: {metrics['f1']:.4f}, AUC: {metrics['roc_auc']:.4f}, CV-F1: {metrics['cv_f1_mean']:.4f} (+/- {metrics['cv_f1_std']:.4f})")
        return results

    def select_best_model(self, metrics: Dict[str, Dict[str, Any]], primary_metric: str = 'f1') -> Tuple[str, Any, Dict[str, Any]]:
        """Selects the best model based on the primary metric and extracts its hyperparameters."""
        best_name = max(metrics.keys(), key=lambda k: metrics[k][primary_metric])
        best_model = self.models[best_name]
        hyperparameters = best_model.get_params()
        
        # Convert any non-serializable types in hyperparameters if necessary
        for k, v in hyperparameters.items():
            if hasattr(v, '__dict__'):
                hyperparameters[k] = str(v)
                
        logger.info(f"Best model selected: {best_name} with {primary_metric} = {metrics[best_name][primary_metric]:.4f}")
        return best_name, best_model, hyperparameters
        
    def save_model(self, model: Any, output_path: str = "models/best_model.joblib"):
        """Saves the trained model to disk."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        joblib.dump(model, output_path)
        logger.info(f"Model saved to {output_path}")

    def save_metrics(self, metrics: Dict[str, Any], best_model_name: str, output_path: str = "models/evaluation_metrics.json"):
        """Saves evaluation metrics to a JSON file for the dashboard."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        # Store all metrics, highlighting the best one
        payload = {
            "best_model": best_model_name,
            "metrics": metrics
        }
        with open(output_path, 'w') as f:
            json.dump(payload, f, indent=4)
        logger.info(f"Evaluation metrics saved to {output_path}")
