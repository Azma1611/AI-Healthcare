import os
import pandas as pd
import joblib
import logging
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from typing import Tuple

logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Handles train/test splitting and numerical scaling while preventing data leakage."""
    
    def __init__(self, target_column: str = 'target'):
        self.target_column = target_column
        self.scaler = StandardScaler()
        self.is_fitted = False
        
    def split_data(self, df: pd.DataFrame, test_size: float = 0.2, val_size: float = 0.1, random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Splits data into train, validation, and test sets.
        test_size represents the test portion. val_size represents the validation portion of the REMAINING data.
        """
        logger.info(f"Splitting data with test_size={test_size} and subsequent val_size={val_size}")
        
        # Extract features and target to ensure stratified split if applicable
        X = df.drop(columns=[self.target_column])
        y = df[self.target_column]
        
        # Split out test set
        X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)
        
        # Split remaining into train and validation
        X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=val_size, random_state=random_state, stratify=y_temp)
        
        train_df = pd.concat([X_train, y_train], axis=1)
        val_df = pd.concat([X_val, y_val], axis=1)
        test_df = pd.concat([X_test, y_test], axis=1)
        
        logger.info(f"Data split sizes - Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")
        return train_df, val_df, test_df

    def fit_transform(self, train_df: pd.DataFrame) -> pd.DataFrame:
        """Fits the scaler ONLY on training data to prevent data leakage, then transforms it."""
        logger.info("Fitting and transforming preprocessor on training data...")
        X = train_df.drop(columns=[self.target_column])
        y = train_df[self.target_column]
        
        X_scaled = pd.DataFrame(self.scaler.fit_transform(X), columns=X.columns, index=X.index)
        self.is_fitted = True
        
        return pd.concat([X_scaled, y], axis=1)

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transforms validation/test data using the already fitted scaler."""
        if not self.is_fitted:
            raise ValueError("Preprocessor has not been fitted yet. Call fit_transform on training data first.")
            
        logger.info(f"Transforming dataset of size {len(df)}...")
        X = df.drop(columns=[self.target_column])
        y = df[self.target_column]
        
        X_scaled = pd.DataFrame(self.scaler.transform(X), columns=X.columns, index=X.index)
        return pd.concat([X_scaled, y], axis=1)
        
    def save_artifacts(self, path: str = "models/preprocessor.joblib") -> None:
        """Saves the fitted scaler artifact."""
        if not self.is_fitted:
            logger.warning("Cannot save unfitted preprocessor.")
            return
            
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.scaler, path)
        logger.info(f"Preprocessor artifact saved to {path}")
