import pandas as pd
import logging

logger = logging.getLogger(__name__)

class FeatureBuilder:
    """Handles feature engineering logic."""
    
    def __init__(self, target_column: str = 'target'):
        self.target_column = target_column

    def generate_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Creates new features based on domain knowledge or statistical properties.
        For this prototype, we'll demonstrate feature engineering by creating interaction terms.
        """
        df_new = df.copy()
        
        # Example interaction: mean radius * mean texture (if columns exist)
        if 'mean radius' in df_new.columns and 'mean texture' in df_new.columns:
            logger.info("Generating interaction feature: 'radius_texture_interaction'")
            df_new['radius_texture_interaction'] = df_new['mean radius'] * df_new['mean texture']
            
        if 'mean perimeter' in df_new.columns and 'mean area' in df_new.columns:
            logger.info("Generating interaction feature: 'perimeter_area_interaction'")
            df_new['perimeter_area_interaction'] = df_new['mean perimeter'] * df_new['mean area']
            
        return df_new
