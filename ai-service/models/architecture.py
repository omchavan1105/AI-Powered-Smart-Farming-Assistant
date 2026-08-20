"""
Real Crop Disease Classifier for KrishiSetu.
Uses TensorFlow MobileNetV2 fine-tuned on actual PlantVillage images.
Falls back to sklearn + real image features if TensorFlow is unavailable.
"""

import os
import sys
from typing import List, Dict, Tuple, Optional
import numpy as np
import joblib

# Canonical class list — MUST match training order
DISEASE_CLASSES: List[str] = [
    "Tomato___Early_Blight",
    "Tomato___Late_Blight",
    "Tomato___Bacterial_Spot",
    "Tomato___Healthy",
    "Potato___Early_Blight",
    "Potato___Late_Blight",
    "Potato___Healthy",
    "Corn___Common_Rust",
    "Corn___Healthy"
]

NUM_CLASSES = len(DISEASE_CLASSES)

MODELS_DIR = os.path.dirname(os.path.abspath(__file__))
TF_MODEL_PATH = os.path.join(MODELS_DIR, "disease_model.h5")
SKLEARN_MODEL_PATH = os.path.join(MODELS_DIR, "saved_model.joblib")


def extract_image_features(x: np.ndarray) -> np.ndarray:
    """
    Extracts real visual features from preprocessed image tensor.
    Input: (B, 3, 224, 224) or (3, 224, 224) normalized NCHW tensor.
    Output: (B, 28) feature vector for sklearn classifier.
    
    These features are extracted from REAL images (not synthetic data).
    """
    if x.ndim == 3:
        x = np.expand_dims(x, axis=0)

    batch_size = x.shape[0]
    features = np.zeros((batch_size, 28), dtype=np.float32)

    for i in range(batch_size):
        r = x[i, 0, :, :]
        g = x[i, 1, :, :]
        b = x[i, 2, :, :]

        # 1. RGB Channel Moments (6 features)
        features[i, 0] = float(np.mean(r))
        features[i, 1] = float(np.std(r))
        features[i, 2] = float(np.mean(g))
        features[i, 3] = float(np.std(g))
        features[i, 4] = float(np.mean(b))
        features[i, 5] = float(np.std(b))

        # 2. Agronomic Spectral Indices (8 features)
        ex_g = 2.0 * g - r - b
        features[i, 6] = float(np.mean(ex_g))
        features[i, 7] = float(np.std(ex_g))

        brown = r - b
        features[i, 8] = float(np.mean(brown))
        features[i, 9] = float(np.std(brown))

        darkness = 1.0 - (r + g + b) / 3.0
        features[i, 10] = float(np.mean(darkness))
        features[i, 11] = float(np.std(darkness))

        norm_gr = (g - r) / (np.abs(g) + np.abs(r) + 1e-5)
        features[i, 12] = float(np.mean(norm_gr))
        features[i, 13] = float(np.std(norm_gr))

        # 3. Spatial Texture & Edge Gradients (4 features)
        grad_r_y = np.abs(r[1:, :] - r[:-1, :])
        grad_r_x = np.abs(r[:, 1:] - r[:, :-1])
        grad_g_y = np.abs(g[1:, :] - g[:-1, :])
        grad_g_x = np.abs(g[:, 1:] - g[:, :-1])

        features[i, 14] = float(np.mean(grad_r_y) + np.mean(grad_r_x))
        features[i, 15] = float(np.std(grad_r_y) + np.std(grad_r_x))
        features[i, 16] = float(np.mean(grad_g_y) + np.mean(grad_g_x))
        features[i, 17] = float(np.std(grad_g_y) + np.std(grad_g_x))

        # 4. Spatial 4-Quadrant Variance (2 features)
        h_m, w_m = 112, 112
        q_g = [float(np.mean(g[:h_m, :w_m])), float(np.mean(g[:h_m, w_m:])),
               float(np.mean(g[h_m:, :w_m])), float(np.mean(g[h_m:, w_m:]))]
        features[i, 18] = float(np.std(q_g))

        q_r = [float(np.mean(r[:h_m, :w_m])), float(np.mean(r[:h_m, w_m:])),
               float(np.mean(r[h_m:, :w_m])), float(np.mean(r[h_m:, w_m:]))]
        features[i, 19] = float(np.std(q_r))

        # 5. Crop/Lesion Descriptors (8 features)
        features[i, 20] = float(np.mean(r / (np.abs(g) + 1e-5)))
        features[i, 21] = float(np.mean(b / (np.abs(g) + 1e-5)))
        features[i, 22] = float(np.mean(r > 0.4))
        features[i, 23] = float(np.mean(g > 0.4))
        features[i, 24] = float(np.mean(darkness > 1.2))
        features[i, 25] = float(np.mean(grad_g_x > 0.3))
        features[i, 26] = float(np.var(grad_r_x) + np.var(grad_r_y))
        features[i, 27] = float(np.mean(r + g + b) / 3.0)

    return features


class CropDiseaseClassifierModel:
    """
    Production Crop Disease Classifier for KrishiSetu.
    
    Tries to load models in this order:
    1. TensorFlow MobileNetV2 model (fine-tuned on real PlantVillage images)
    2. sklearn model (trained on real PlantVillage image features)
    
    If no model is available, raises an error instead of training on synthetic data.
    """
    def __init__(self, model_path: Optional[str] = None):
        self.classes = DISEASE_CLASSES
        self.num_classes = NUM_CLASSES
        self.tf_model = None
        self.sklearn_pipeline = None
        self.pipeline = None
        self.model_type = None  # 'tensorflow' or 'sklearn'
        self._load_model(model_path)

    def _load_model(self, model_path: Optional[str] = None):
        """Load the best available trained model."""
        
        # 1. Try TensorFlow model
        tf_path = model_path or TF_MODEL_PATH
        if os.path.exists(tf_path) and tf_path.endswith('.h5'):
            try:
                import tensorflow as tf
                self.tf_model = tf.keras.models.load_model(tf_path)
                self.pipeline = self.tf_model
                self.model_type = 'tensorflow'
                print(f"[OK] Loaded TensorFlow model from {tf_path}")
                return
            except Exception as e:
                print(f"Warning: Could not load TF model: {e}")
        
        # 2. Try sklearn model (trained on real image features)
        sklearn_path = model_path if (model_path and model_path.endswith('.joblib')) else SKLEARN_MODEL_PATH
        if os.path.exists(sklearn_path):
            try:
                saved = joblib.load(sklearn_path)
                self.sklearn_pipeline = saved.get("pipeline")
                self.pipeline = self.sklearn_pipeline
                self.classes = saved.get("classes", DISEASE_CLASSES)
                self.model_type = 'sklearn'
                
                # Check if this is a real-image-trained model
                metadata = saved.get("metadata", {})
                trained_on = metadata.get("trained_on", "unknown")
                print(f"[OK] Loaded sklearn model from {sklearn_path} (trained on: {trained_on})")
                return
            except Exception as e:
                print(f"Warning: Could not load sklearn model: {e}")
        
        # 3. No model available — raise error instead of training on fake data
        raise RuntimeError(
            "No trained disease classification model found. "
            f"Expected TF model at: {TF_MODEL_PATH} or sklearn model at: {SKLEARN_MODEL_PATH}. "
            "Run 'python ai-service/train.py' with real PlantVillage images to train the model."
        )

    def predict(self, x: np.ndarray) -> Tuple[str, float, Dict[str, float]]:
        """
        Runs model inference on input image tensor.
        Input: (B, C, H, W) or (C, H, W) normalized tensor
        Returns: (top_class_name, calibrated_confidence, all_class_probabilities)
        """
        if self.model_type == 'tensorflow':
            return self._predict_tf(x)
        elif self.model_type == 'sklearn':
            return self._predict_sklearn(x)
        else:
            raise RuntimeError("No model loaded for inference.")

    def _predict_tf(self, x: np.ndarray) -> Tuple[str, float, Dict[str, float]]:
        """TensorFlow MobileNetV2 inference."""
        import tensorflow as tf
        
        if x.ndim == 3:
            x = np.expand_dims(x, axis=0)
        
        # Convert from NCHW to NHWC for TF
        x_nhwc = np.transpose(x, (0, 2, 3, 1))
        
        probs = self.tf_model.predict(x_nhwc, verbose=0)[0]
        top_idx = int(np.argmax(probs))
        top_class = self.classes[top_idx]
        top_confidence = float(probs[top_idx])
        all_probs = {self.classes[i]: float(probs[i]) for i in range(len(self.classes))}
        
        return top_class, top_confidence, all_probs

    def _predict_sklearn(self, x: np.ndarray) -> Tuple[str, float, Dict[str, float]]:
        """sklearn pipeline inference using agronomic features."""
        features = extract_image_features(x)
        probs = self.sklearn_pipeline.predict_proba(features)[0]
        
        top_idx = int(np.argmax(probs))
        top_class = self.classes[top_idx]
        top_confidence = float(probs[top_idx])
        all_probs = {self.classes[i]: float(probs[i]) for i in range(len(self.classes))}
        
        return top_class, top_confidence, all_probs
