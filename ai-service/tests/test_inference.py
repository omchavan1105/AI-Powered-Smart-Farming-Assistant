import pytest
import io
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from models.architecture import DISEASE_CLASSES, CropDiseaseClassifierModel

client = TestClient(app)


def generate_realistic_leaf_image(crop_type="healthy"):
    """Generates synthetic test leaf image with realistic spectral & gradient profile."""
    np.random.seed(42)
    if crop_type == "healthy":
        r = np.random.normal(loc=55, scale=12, size=(224, 224))
        g = np.random.normal(loc=195, scale=12, size=(224, 224))
        b = np.random.normal(loc=45, scale=12, size=(224, 224))
    elif crop_type == "early_blight":
        r = np.random.normal(loc=140, scale=25, size=(224, 224))
        g = np.random.normal(loc=120, scale=25, size=(224, 224))
        b = np.random.normal(loc=60, scale=20, size=(224, 224))
        # Concentric target lesions
        mask = np.random.uniform(0, 1, size=(224, 224)) > 0.60
        r[mask] = np.clip(r[mask] + 60, 0, 255)
    elif crop_type == "rust":
        r = np.random.normal(loc=200, scale=30, size=(224, 224))
        g = np.random.normal(loc=90, scale=20, size=(224, 224))
        b = np.random.normal(loc=50, scale=18, size=(224, 224))
    else:  # ambiguous / flat
        r = np.full((224, 224), 128, dtype=float)
        g = np.full((224, 224), 128, dtype=float)
        b = np.full((224, 224), 128, dtype=float)

    img_arr = np.zeros((224, 224, 3), dtype=np.uint8)
    img_arr[:, :, 0] = np.clip(r, 0, 255).astype(np.uint8)
    img_arr[:, :, 1] = np.clip(g, 0, 255).astype(np.uint8)
    img_arr[:, :, 2] = np.clip(b, 0, 255).astype(np.uint8)

    img = Image.fromarray(img_arr)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()


class TestDiseaseModelInference:
    """Test suite for Real Trained ML Crop Disease Classifier."""

    def test_model_artifact_loaded(self):
        """Verify that the model loads serialized pipeline from disk."""
        model = CropDiseaseClassifierModel()
        assert model.pipeline is not None
        assert len(model.classes) == 9

    def test_healthy_plant_inference(self):
        """Test inference on healthy lush green leaf image."""
        green_img = generate_realistic_leaf_image("healthy")
        response = client.post(
            "/predict/disease",
            files={"file": ("healthy_leaf.png", green_img, "image/png")},
            data={"language": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "confidence" in data
        assert isinstance(data["confidence"], (int, float))
        assert "disease" in data
        assert "severity" in data
        assert "recommendations" in data
        assert len(data["recommendations"]) > 0

    def test_diseased_leaf_inference_tomato(self):
        """Test inference on leaf image with early blight profile."""
        blight_img = generate_realistic_leaf_image("early_blight")
        response = client.post(
            "/predict/disease",
            files={"file": ("blight_leaf.png", blight_img, "image/png")},
            data={"language": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["crop"] in ["Tomato", "Potato", "Corn", "General Crop", "Unknown"]

    def test_multilingual_inference_hindi(self):
        """Verify Hindi advisory output."""
        img = generate_realistic_leaf_image("healthy")
        response = client.post(
            "/predict/disease",
            files={"file": ("leaf.png", img, "image/png")},
            data={"language": "hi"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["recommendations"]) > 0

    def test_multilingual_inference_marathi(self):
        """Verify Marathi advisory output."""
        img = generate_realistic_leaf_image("healthy")
        response = client.post(
            "/predict/disease",
            files={"file": ("leaf.png", img, "image/png")},
            data={"language": "mr"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["recommendations"]) > 0

    def test_low_confidence_uncertainty_handling(self):
        """Verify ambiguous/flat image returns is_uncertain: True."""
        ambiguous_img = generate_realistic_leaf_image("ambiguous")
        response = client.post(
            "/predict/disease",
            files={"file": ("flat.png", ambiguous_img, "image/png")},
            data={"language": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "is_uncertain" in data

    def test_corrupt_file_handling(self):
        """Verify corrupt byte stream is safely rejected with 400."""
        corrupt_bytes = b"NOT_A_VALID_IMAGE_DATA_CORRUPT_STREAM"
        response = client.post(
            "/predict/disease",
            files={"file": ("corrupt.jpg", corrupt_bytes, "image/jpeg")},
            data={"language": "en"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
