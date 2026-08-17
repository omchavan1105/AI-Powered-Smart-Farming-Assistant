# KrishiSetu AI/ML Microservice

FastAPI microservice for crop disease classification, confidence calibration, and agricultural risk analytics.

---

## 1. Quick Start & Setup

### Prerequisites
- Python 3.10+ (Recommended: Python 3.11)
- Pip

### Setup Virtual Environment
```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

---

## 2. Running the AI Service

Start the FastAPI development server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger API docs will be available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 3. API Endpoints

### `GET /health`
Returns service status, model load state, and confidence threshold.
```json
{
  "status": "ok",
  "service": "KrishiSetu AI/ML Engine",
  "version": "1.0.0",
  "model_loaded": true,
  "confidence_threshold": 0.60
}
```

### `POST /predict/disease?language=en`
Accepts multipart image upload (`JPG`, `PNG`, `WEBP` up to 10MB) and returns diagnosis, calibrated confidence score, severity level, symptoms, and safe localized agronomic advisory.

**Parameters**:
- `file` (form-data): Crop leaf image file.
- `language` (query parameter): `"en"` (English), `"hi"` (Hindi), or `"mr"` (Marathi).

**Example Response**:
```json
{
  "success": true,
  "crop": "Tomato",
  "disease": "Early Blight",
  "raw_class": "Tomato___Early_Blight",
  "scientific_name": "Alternaria solani",
  "confidence": 94.5,
  "is_uncertain": false,
  "severity": "Moderate",
  "symptoms": [
    "Dark brown to black spots with concentric rings on older leaves",
    "Yellowing of tissue surrounding leaf spots"
  ],
  "recommended_action": "Apply copper-based fungicides (e.g. Copper Oxychloride 50 WP @ 2.5g/L) or Mancozeb 75 WP @ 2g/L.",
  "prevention": "Maintain 60cm plant spacing for air circulation. Use drip irrigation instead of overhead sprinklers."
}
```

### `POST /predict/risk`
Calculates an explainable multidimensional risk score (0-100) combining disease severity, rainfall forecast, and soil moisture conditions.

---

## 4. Running Automated Tests & Training

### Execute Pytest Suite
```bash
pytest tests/test_api.py -v
```

### Run Model Training & Evaluation Benchmark
```bash
python train.py
```
Outputs validation accuracy, cross-entropy validation loss, weighted precision/recall/F1 score, and latency benchmarks.
