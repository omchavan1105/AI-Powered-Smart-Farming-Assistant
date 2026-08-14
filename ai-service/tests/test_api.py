import io
import sys
from pathlib import Path
import pytest
from PIL import Image

# Ensure ai-service root is on sys.path
SERVICE_ROOT = Path(__file__).resolve().parent.parent
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def create_synthetic_leaf_image(color=(34, 139, 34), size=(224, 224), format="JPEG") -> bytes:
    """Helper to create an in-memory valid RGB test image."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()


# 1. Health Check
def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert "confidence_threshold" in data


# 2. Valid Crop Leaf Prediction (English)
def test_valid_leaf_prediction_english():
    image_bytes = create_synthetic_leaf_image(color=(34, 139, 34))  # Green leaf
    response = client.post(
        "/predict/disease?language=en",
        files={"file": ("leaf.jpg", image_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "crop" in data
    assert "disease" in data
    assert "confidence" in data
    assert isinstance(data["confidence"], (int, float))
    assert "severity" in data
    assert "symptoms" in data
    assert len(data["symptoms"]) > 0
    assert "recommended_action" in data
    assert "prevention" in data


# 3. Multilingual Support (Hindi & Marathi)
def test_multilingual_prediction_hindi():
    image_bytes = create_synthetic_leaf_image(color=(139, 69, 19))  # Brown leaf
    response = client.post(
        "/predict/disease?language=hi",
        files={"file": ("leaf_hi.jpg", image_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["recommended_action"]) > 0


def test_multilingual_prediction_marathi():
    image_bytes = create_synthetic_leaf_image(color=(139, 69, 19))  # Brown leaf
    response = client.post(
        "/predict/disease?language=mr",
        files={"file": ("leaf_mr.jpg", image_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["recommended_action"]) > 0


# 4. Empty File Upload
def test_empty_file_upload():
    response = client.post(
        "/predict/disease",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert response.status_code == 400


# 5. Unsupported Non-Image File Format
def test_unsupported_file_format():
    response = client.post(
        "/predict/disease",
        files={"file": ("document.txt", b"This is a text file, not a leaf image", "text/plain")}
    )
    assert response.status_code in [400, 415]


# 6. Corrupt Image Bytes
def test_corrupt_image():
    corrupt_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00corrupted_data_here"
    response = client.post(
        "/predict/disease",
        files={"file": ("corrupt.jpg", corrupt_bytes, "image/jpeg")}
    )
    assert response.status_code in [400, 415]


# 7. Risk Calculation Endpoint (High Risk)
def test_risk_calculation_high():
    payload = {
        "crop": "Tomato",
        "disease_detected": "Late Blight",
        "disease_confidence": 92.5,
        "soil_moisture_pct": 75.0,
        "rain_probability_pct": 80.0,
        "temperature_c": 24.0
    }
    response = client.post("/predict/risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "High"
    assert data["risk_score"] >= 65
    assert len(data["reasons"]) >= 2


# 8. Risk Calculation Endpoint (Low Risk)
def test_risk_calculation_low():
    payload = {
        "crop": "Tomato",
        "disease_detected": "Healthy Plant",
        "disease_confidence": 95.0,
        "soil_moisture_pct": 55.0,
        "rain_probability_pct": 10.0,
        "temperature_c": 26.0
    }
    response = client.post("/predict/risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "Low"
    assert data["risk_score"] < 35
