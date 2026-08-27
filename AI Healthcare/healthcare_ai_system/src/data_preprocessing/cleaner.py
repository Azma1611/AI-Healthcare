import pandas as pd
import logging

logger = logging.getLogger(__name__)

class DataCleaner:
    """Handles missing values, duplicates, and invalid value detection."""
    
    @staticmethod
    def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
        """Removes duplicate rows from the DataFrame."""
        initial_count = len(df)
        df_cleaned = df.drop_duplicates()
        removed = initial_count - len(df_cleaned)
        if removed > 0:
            logger.info(f"Removed {removed} duplicate rows.")
        return df_cleaned

    @staticmethod
    def handle_missing_values(df: pd.DataFrame, strategy: str = 'median') -> pd.DataFrame:
        """
        Imputes missing values using a simple median/mode strategy.
        In a strict pipeline, imputation parameters should be fit on training data only.
        For demonstration/simplicity on this clean dataset, we assume no missing values,
        but we'll implement a basic safe-fill if they exist.
        """
        df_cleaned = df.copy()
        missing_counts = df_cleaned.isnull().sum().sum()
        if missing_counts > 0:
            logger.info(f"Found {missing_counts} missing values. Imputing using {strategy}.")
            for col in df_cleaned.columns:
                if df_cleaned[col].isnull().any():
                    if df_cleaned[col].dtype == 'object':
                        df_cleaned[col] = df_cleaned[col].fillna(df_cleaned[col].mode()[0])
                    else:
                        if strategy == 'median':
                            df_cleaned[col] = df_cleaned[col].fillna(df_cleaned[col].median())
                        elif strategy == 'mean':
                            df_cleaned[col] = df_cleaned[col].fillna(df_cleaned[col].mean())
        return df_cleaned

    @staticmethod
    def detect_invalid_values(df: pd.DataFrame) -> None:
        """Logs warnings if unexpected invalid values (e.g., negative physical measurements) exist."""
        # For this dataset, features are generally non-negative physical measurements.
        numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
        # Exclude target from non-negative check if it could theoretically be negative (though it's 0/1 here)
        features = [c for c in numeric_cols if c != 'target']
        
        negatives = (df[features] < 0).sum().sum()
        if negatives > 0:
            logger.warning(f"Found {negatives} unexpected negative values in numeric features.")
        else:
            logger.info("No invalid negative physical measurements detected.")
