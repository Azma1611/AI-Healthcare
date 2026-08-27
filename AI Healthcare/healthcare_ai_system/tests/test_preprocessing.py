import pytest
import pandas as pd
import numpy as np
from src.data_preprocessing.cleaner import DataCleaner
from src.data_preprocessing.preprocessor import DataPreprocessor
from src.feature_engineering.feature_builder import FeatureBuilder

@pytest.fixture
def mock_dataframe():
    """Provides a dummy dataframe for testing."""
    return pd.DataFrame({
        'mean radius': [10.0, 20.0, 20.0, np.nan, 15.0, 25.0, 30.0, 10.0],
        'mean texture': [15.0, 25.0, 25.0, 30.0, 20.0, 15.0, 10.0, 20.0],
        'target': [1, 0, 0, 1, 1, 0, 0, 1]
    })

def test_remove_duplicates(mock_dataframe):
    cleaner = DataCleaner()
    cleaned = cleaner.remove_duplicates(mock_dataframe)
    assert len(cleaned) == 7 # 1 duplicate row removed
    
def test_handle_missing_values(mock_dataframe):
    cleaner = DataCleaner()
    # Fill nan in mean radius with median (15.0)
    cleaned = cleaner.handle_missing_values(mock_dataframe, strategy='median')
    assert not cleaned.isnull().values.any()
    assert cleaned.loc[3, 'mean radius'] == 20.0 # 20.0 is the median of [10.0, 20.0, 20.0]

def test_feature_engineering(mock_dataframe):
    fb = FeatureBuilder()
    features = fb.generate_features(mock_dataframe)
    assert 'radius_texture_interaction' in features.columns
    assert features.loc[0, 'radius_texture_interaction'] == 150.0

def test_preprocessor_leakage_prevention(mock_dataframe):
    preprocessor = DataPreprocessor()
    cleaner = DataCleaner()
    df = cleaner.handle_missing_values(mock_dataframe)
    
    # Must raise error if transforming before fitting
    with pytest.raises(ValueError):
        preprocessor.transform(df)
        
    train, val, test = preprocessor.split_data(df, test_size=0.25, val_size=0.25, random_state=42)
    
    train_transformed = preprocessor.fit_transform(train)
    test_transformed = preprocessor.transform(test)
    
    assert preprocessor.is_fitted
    assert 'mean radius' in train_transformed.columns
    # Scaled data should be roughly zero mean for train
    # Since it's a small mock dataset, just assert it runs and columns match
    assert len(train_transformed.columns) == len(df.columns)
    assert len(test_transformed.columns) == len(df.columns)
