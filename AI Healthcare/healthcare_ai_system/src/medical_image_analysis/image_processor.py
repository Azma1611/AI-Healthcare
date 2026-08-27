import logging
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io

logger = logging.getLogger(__name__)

class ImageAnalyzer:
    """
    CNN-based Medical Image Analyzer using PyTorch.
    For this prototype, it uses a pre-trained ResNet18 modified for binary classification
    (e.g., Normal vs. Abnormal).
    """
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._build_model()
        self.model.to(self.device)
        self.model.eval()
        
        # Standard ImageNet normalization since we're using a pre-trained backbone
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])

    def _build_model(self):
        """Loads ResNet18 and modifies the final layer for binary classification."""
        try:
            # Using weights='DEFAULT' per PyTorch 0.13+ standards
            model = models.resnet18(weights="DEFAULT")
            num_ftrs = model.fc.in_features
            model.fc = nn.Linear(num_ftrs, 2)
            # In a real scenario, we would load our own fine-tuned weights here:
            # model.load_state_dict(torch.load("path/to/fine_tuned_weights.pth"))
            return model
        except Exception as e:
            logger.error(f"Error building CNN model: {e}")
            raise

    def fine_tune(self, train_loader, val_loader, epochs: int = 5):
        """
        Stub for fine-tuning the ResNet18 on a clinical, IRB-approved image dataset.
        This must be implemented before moving to production to prevent using ImageNet defaults for medical tasks.
        """
        logger.warning("CNN Fine-tuning is a stub. Models are still using ImageNet weights.")
        # Setup criterion, optimizer, scheduler, and standard PyTorch training loop here
        pass

    def analyze(self, image_bytes: bytes) -> dict:
        """
        Analyzes a medical image (e.g., X-ray) and returns the predicted class and confidence.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                
                # Class 0: Normal, Class 1: Abnormal
                prob_abnormal = probabilities[0][1].item()
                prob_normal = probabilities[0][0].item()
                
                predicted_class = 1 if prob_abnormal > prob_normal else 0
                confidence = max(prob_abnormal, prob_normal)
                
                prediction_label = "Abnormal Lesion Detected" if predicted_class == 1 else "Normal Scan"
                
                return {
                    "image_prediction": prediction_label,
                    "image_confidence": confidence,
                    "image_abnormal_probability": prob_abnormal
                }
        except Exception as e:
            logger.error(f"Failed to analyze image: {e}")
            return {
                "image_prediction": "Error processing image",
                "image_confidence": 0.0,
                "image_abnormal_probability": 0.0
            }
