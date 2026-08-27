import re
import logging
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)

class NLPProcessor:
    """
    A lightweight, rule-based NLP pipeline designed for an educational prototype.
    It performs text normalization, sentence segmentation, entity extraction, 
    and proximity-based negation detection on medical text.
    """
    
    def __init__(self):
        # Mock dictionary of symptoms and clinical terms relevant to the prototype
        self.clinical_keywords = [
            "pain", "swelling", "lump", "mass", "lesion", "abnormal", 
            "discharge", "asymmetry", "fatigue", "history", "malignant", "benign"
        ]
        
        # Negation triggers
        self.negation_words = ["no", "not", "denies", "without", "none", "negative"]

    def clean_text(self, text: str) -> str:
        """Normalizes text by lowercasing and standardizing spacing."""
        text = text.lower()
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def segment_sentences(self, text: str) -> List[str]:
        """Splits the text into sentences based on punctuation."""
        sentences = re.split(r'[.!?]\s*', text)
        return [s.strip() for s in sentences if s.strip()]

    def detect_negation(self, words: List[str], keyword_index: int, window: int = 4) -> bool:
        """
        Checks a window of words before the keyword for negation triggers.
        """
        start_index = max(0, keyword_index - window)
        context = words[start_index:keyword_index]
        for word in context:
            if word in self.negation_words:
                return True
        return False

    def extract_findings(self, text: str) -> Dict[str, List[str]]:
        """
        Extracts positive and negated findings from the medical text.
        """
        cleaned_text = self.clean_text(text)
        sentences = self.segment_sentences(cleaned_text)
        
        findings = {
            "positive_findings": [],
            "negated_findings": []
        }
        
        for sentence in sentences:
            words = sentence.split()
            for i, word in enumerate(words):
                # Remove trailing punctuation for exact match
                clean_word = re.sub(r'[^\w\s]', '', word)
                if clean_word in self.clinical_keywords:
                    # Check for negation
                    is_negated = self.detect_negation(words, i)
                    
                    if is_negated:
                        if clean_word not in findings["negated_findings"]:
                            findings["negated_findings"].append(clean_word)
                    else:
                        if clean_word not in findings["positive_findings"]:
                            findings["positive_findings"].append(clean_word)
                            
        # Deduplicate sets in case a word is both negated and positive in different sentences
        findings["positive_findings"] = list(set(findings["positive_findings"]) - set(findings["negated_findings"]))
        
        logger.info(f"Extracted NLP Findings: {findings}")
        return findings

    def process(self, medical_note: str) -> Dict[str, any]:
        """
        Main pipeline entry point.
        """
        if not medical_note or not isinstance(medical_note, str):
            logger.warning("Invalid medical note provided.")
            return {"error": "Invalid input text."}
            
        findings = self.extract_findings(medical_note)
        return findings
