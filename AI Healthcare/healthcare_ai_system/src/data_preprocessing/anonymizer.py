import pandas as pd
import logging
from typing import List

logger = logging.getLogger(__name__)

class Anonymizer:
    """
    Strips Personally Identifiable Information (PII) and Protected Health Information (PHI)
    from clinical datasets before they enter the ML pipeline.
    """
    def __init__(self, pii_columns: List[str] = None):
        if pii_columns is None:
            # Common PII/PHI columns in raw clinical data
            self.pii_columns = [
                'patient_name', 'name', 'ssn', 'social_security', 
                'dob', 'date_of_birth', 'address', 'phone', 'email',
                'patient_id', 'mrn'
            ]
        else:
            self.pii_columns = pii_columns

    def anonymize(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Removes PII columns from the dataframe.
        Returns a new anonymized dataframe.
        """
        df_anonymized = df.copy()
        
        # Case insensitive match for dropping columns
        cols_to_drop = [
            col for col in df_anonymized.columns 
            if str(col).lower().strip() in self.pii_columns
        ]
        
        if cols_to_drop:
            logger.info(f"Anonymizer: Stripping PII columns: {cols_to_drop}")
            df_anonymized = df_anonymized.drop(columns=cols_to_drop)
        else:
            logger.info("Anonymizer: No configured PII columns found in dataset.")
            
        return df_anonymized
