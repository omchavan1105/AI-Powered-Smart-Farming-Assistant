from typing import Dict, Any, Optional
from preprocessing.image_processor import validate_and_load_image, preprocess_for_inference, ImagePreprocessingError
from models.architecture import CropDiseaseClassifierModel
from recommendations.advisory_engine import get_disease_recommendations

CONFIDENCE_THRESHOLD = 0.60  # Require at least 60% probability for a definitive diagnosis

# Singleton model instance
_model_instance: Optional[CropDiseaseClassifierModel] = None


def get_model() -> CropDiseaseClassifierModel:
    global _model_instance
    if _model_instance is None:
        _model_instance = CropDiseaseClassifierModel()
    return _model_instance


def classify_crop_disease(image_bytes: bytes, language: str = "en") -> Dict[str, Any]:
    """
    Full pipeline: Preprocessing -> Model Inference -> Confidence Calibration -> Agronomic Advisory.
    """
    # 1. Validation & Preprocessing
    pil_image = validate_and_load_image(image_bytes)
    input_tensor = preprocess_for_inference(pil_image)

    # 2. Run Model Inference
    model = get_model()
    top_class, confidence, all_probs = model.predict(input_tensor)

    # 3. Handle Low-Confidence / Inconclusive Images
    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "success": True,
            "crop": "Unknown",
            "disease": "Uncertain / Inconclusive",
            "confidence": round(confidence * 100, 1),
            "is_uncertain": True,
            "severity": "Unknown",
            "message": "The image could not be classified with high confidence. Please provide a clear, close-up photograph of the affected leaf in good daylight.",
            "symptoms": [
                "Unclear leaf patterns or non-crop image detected",
                "Blurry or poorly lit photograph"
            ],
            "recommended_action": "Retake a clear, well-focused close-up photo showing distinct leaf symptoms in daylight, or consult your local agricultural officer.",
            "prevention": "Ensure regular crop inspection and capture sharp photographs of individual leaves.",
            "top_probabilities": {k: round(v * 100, 1) for k, v in sorted(all_probs.items(), key=lambda x: x[1], reverse=True)[:3]}
        }

    # 4. Fetch Agronomic Recommendations in Target Language
    advisory = get_disease_recommendations(top_class, language=language)

    return {
        "success": True,
        "crop": advisory["crop"],
        "disease": advisory["disease"],
        "raw_class": top_class,
        "scientific_name": advisory.get("scientific_name", ""),
        "confidence": round(confidence * 100, 1),
        "is_uncertain": False,
        "severity": advisory["severity"],
        "symptoms": advisory["symptoms"],
        "recommended_action": advisory["recommended_action"],
        "prevention": advisory["prevention"],
        "top_probabilities": {k: round(v * 100, 1) for k, v in sorted(all_probs.items(), key=lambda x: x[1], reverse=True)[:3]}
    }
