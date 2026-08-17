import os
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from preprocessing.image_processor import ImagePreprocessingError
from prediction.disease_classifier import classify_crop_disease, CONFIDENCE_THRESHOLD

app = FastAPI(
    title="KrishiSetu AI/ML Microservice",
    description="Production-grade AI microservice for crop disease classification and agricultural risk analytics.",
    version="1.0.0"
)

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"  # Open during development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RiskAssessmentRequest(BaseModel):
    crop: str
    disease_detected: Optional[str] = None
    disease_confidence: Optional[float] = 0.0
    soil_moisture_pct: Optional[float] = 50.0
    rain_probability_pct: Optional[float] = 20.0
    temperature_c: Optional[float] = 28.0


@app.get("/health", tags=["System"])
async def health_check():
    """Returns service health status."""
    return {
        "status": "ok",
        "service": "KrishiSetu AI/ML Engine",
        "version": "1.0.0",
        "model_loaded": True,
        "confidence_threshold": CONFIDENCE_THRESHOLD
    }


@app.post("/predict/disease", tags=["Inference"])
async def predict_disease(
    file: UploadFile = File(..., description="Crop leaf photograph (JPG, PNG, WEBP)"),
    language: str = Query("en", description="Preferred output language: 'en', 'hi', or 'mr'")
):
    """
    Analyzes an uploaded crop leaf image and returns the predicted disease,
    calibrated confidence score, severity rating, symptoms, and localized safe agronomic advice.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded."
        )

    try:
        file_bytes = await file.read()
        if not file_bytes or len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        result = classify_crop_disease(file_bytes, language=language)
        return result

    except HTTPException:
        raise
    except ImagePreprocessingError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )


@app.post("/predict/risk", tags=["Analytics"])
async def calculate_risk(payload: RiskAssessmentRequest):
    """
    Computes an explainable multidimensional farming risk score (0-100)
    factoring in disease severity, weather forecast, and soil moisture conditions.
    """
    score = 15  # Base background risk
    reasons = []

    # 1. Disease factor
    if payload.disease_detected and payload.disease_detected not in ["Healthy Plant", "Uncertain / Inconclusive"]:
        disease_weight = 40 * min(1.0, (payload.disease_confidence / 100.0 if payload.disease_confidence > 1 else payload.disease_confidence))
        score += int(disease_weight)
        reasons.append(f"Active disease identified: {payload.disease_detected} ({payload.disease_confidence}% confidence)")

    # 2. Weather & Moisture factor
    if payload.rain_probability_pct and payload.rain_probability_pct > 60:
        score += 20
        reasons.append(f"High rainfall probability ({payload.rain_probability_pct}%) promotes foliar fungal propagation")
    elif payload.rain_probability_pct and payload.rain_probability_pct < 10 and payload.soil_moisture_pct and payload.soil_moisture_pct < 30:
        score += 25
        reasons.append(f"Drought/Water stress risk: Soil moisture is low ({payload.soil_moisture_pct}%) with no rain forecasted")

    # 3. Temperature extremes
    if payload.temperature_c and (payload.temperature_c > 38 or payload.temperature_c < 10):
        score += 15
        reasons.append(f"Thermal stress: Temperature ({payload.temperature_c}°C) is outside the optimal growth window")

    score = min(100, max(0, score))
    level = "High" if score >= 65 else "Moderate" if score >= 35 else "Low"

    return {
        "crop": payload.crop,
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons if reasons else ["Favorable farming conditions detected with minimal crop stress."],
        "mitigation_action": "Ensure regular morning field inspection and adhere to standard spray/irrigation intervals."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
