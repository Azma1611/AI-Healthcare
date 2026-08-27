import os
import json
import logging
import joblib
import uuid
from datetime import datetime
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

class ModelRegistry:
    """
    Lightweight, filesystem-based model registry to version datasets, preprocessors, 
    and models without introducing heavy infrastructure dependencies like MLflow.
    """
    def __init__(self, registry_dir: str = "models/registry"):
        self.registry_dir = registry_dir
        os.makedirs(self.registry_dir, exist_ok=True)
        
    def save_version(self, model: Any, preprocessor: Any, metrics: Dict[str, Any], dataset_id: str, hyperparameters: Dict[str, Any] = None, tags: Dict[str, str] = None) -> str:
        """
        Saves a new version of the model, preprocessor, and metadata.
        """
        version_id = f"v_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:4]}"
        version_path = os.path.join(self.registry_dir, version_id)
        os.makedirs(version_path, exist_ok=True)
        
        # Save artifacts
        model_path = os.path.join(version_path, "model.joblib")
        prep_path = os.path.join(version_path, "preprocessor.joblib")
        joblib.dump(model, model_path)
        joblib.dump(preprocessor, prep_path)
        
        # Save metadata
        metadata = {
            "version_id": version_id,
            "created_at": datetime.utcnow().isoformat(),
            "dataset_id": dataset_id,
            "model_type": type(model).__name__,
            "hyperparameters": hyperparameters or {},
            "metrics": metrics,
            "tags": tags or {"status": "staging"},
            "artifact_paths": {
                "model": model_path,
                "preprocessor": prep_path
            }
        }
        
        meta_path = os.path.join(version_path, "model_metadata.json")
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=4)
            
        # Update 'latest' pointer
        latest_path = os.path.join(self.registry_dir, "latest.json")
        with open(latest_path, 'w') as f:
            json.dump({"version": version_id}, f, indent=4)
            
        logger.info(f"ModelRegistry: Saved new version {version_id} mapped to dataset {dataset_id}")
        return version_id

    def promote_model(self, version_id: str, env: str = "production"):
        """
        Promotes a specific model version to an environment alias (e.g., 'production').
        """
        version_path = os.path.join(self.registry_dir, version_id)
        if not os.path.exists(version_path):
            raise FileNotFoundError(f"Version {version_id} not found in registry.")
            
        env_path = os.path.join(self.registry_dir, f"{env}.json")
        with open(env_path, 'w') as f:
            json.dump({"version": version_id, "promoted_at": datetime.utcnow().isoformat()}, f, indent=4)
            
        logger.info(f"ModelRegistry: Promoted version {version_id} to environment '{env}'")

    def load_version(self, version_id: str = "latest") -> Tuple[Any, Any, Dict[str, Any]]:
        """
        Loads a model, preprocessor, and metadata by version ID or environment alias (e.g., 'latest', 'production').
        """
        alias_path = os.path.join(self.registry_dir, f"{version_id}.json")
        if os.path.exists(alias_path):
            with open(alias_path, 'r') as f:
                data = json.load(f)
                # handle both legacy 'latest_version' format and new 'version' format
                actual_version_id = data.get("version") or data.get("latest_version")
                logger.info(f"ModelRegistry: Resolved alias '{version_id}' to version '{actual_version_id}'")
                version_id = actual_version_id
        elif version_id in ["latest", "production", "staging"]:
            raise FileNotFoundError(f"Environment alias '{version_id}' not found in registry.")
                
        version_path = os.path.join(self.registry_dir, version_id)
        if not os.path.exists(version_path):
            raise FileNotFoundError(f"Version {version_id} not found in registry.")
            
        meta_path = os.path.join(version_path, "model_metadata.json")
        with open(meta_path, 'r') as f:
            metadata = json.load(f)
            
        model = joblib.load(metadata["artifact_paths"]["model"])
        preprocessor = joblib.load(metadata["artifact_paths"]["preprocessor"])
        
        logger.info(f"ModelRegistry: Loaded version {version_id}")
        return model, preprocessor, metadata
