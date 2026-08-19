# AI/ML Implementation Status — KrishiSetu

**Author**: Om (AI/ML Developer — Member 3)  
**Project**: KrishiSetu — AI-Powered Smart Farming Assistant  
**Date**: 2026-08-15  

---

## 1. Existing AI / ML Functionality Overview

| Feature | Current State | Implementation Mechanism | Reality Level |
| :--- | :--- | :--- | :--- |
| **Crop Disease Detection** | Simulated Demo | `src/services/diseaseService.js` (Simulated timeout with hardcoded Early Blight 94.5%) | ⚠️ **Mock / Needs Real Model** |
| **FarmAI Chatbot** | Edge Function + Fallback | `supabase/functions/farm_ai_chat/` + OpenAI API wrapper + context loader | 🟡 **Edge Function Structure Ready** |
| **Crop Recommendations** | Rule-Based Heuristic | `src/services/cropService.js` (Catalog mapping based on season/soil) | ⚠️ **Rule-Based Mock** |
| **Yield Prediction** | Parametric Formula | `src/services/yieldService.js` (`farmSize * baseYieldPerAcre * price`) | ⚠️ **Heuristic / Needs ML** |
| **Smart Risk Scoring** | Placeholder | Statically represented in Dashboard / Yield modules | ⚠️ **Not Yet Built** |

---

## 2. Existing Mock / Demo AI Functionality (Detailed)
1. **`src/services/diseaseService.js`**:
   - Currently returns fixed object `{ disease: "Early Blight", confidence: 94.5, severity: "Moderate", symptoms: [...], recommendedAction: "..." }`.
   - UI correctly displays "Demo ML Mode" badge.
   - **Goal for Om (Member 3)**: Replace mock with a real trained Convolutional Neural Network (CNN / MobileNetV2 / ResNet) served via FastAPI.

2. **`src/services/yieldService.js`**:
   - Computes deterministic expected harvest based on farm acreage and crop name.
   - **Status**: Heuristic baseline. Real regression model will follow in Phase 6.

3. **`src/services/cropService.js`**:
   - Returns fixed matching scores (92% Tomato, 87% Onion, 84% Soybean).

---

## 3. Existing Supabase AI Infrastructure & Tables
- **`disease_detections` Table**: Stores `id`, `farmer_id`, `image_url`, `detected_disease`, `confidence_score`, `severity`, `recommended_action`, `detected_at`. (RLS enabled and verified).
- **`yield_predictions` Table**: Stores `id`, `farmer_id`, `crop_id`, `predicted_yield_kg`, `confidence_score`, `predicted_at`.
- **`ai_conversations` & `ai_messages` Tables**: Stores chat thread history per farmer.
- **`recommendations` Table**: Stores contextual advisory records.
- **`farm_ai_chat` Edge Function**: Ingests farmer ID, conversation ID, and question; queries Supabase DB for farmer profile, crops, and soil test logs; prompts LLM.

---

## 4. Existing Frontend Disease Detection Flow
```
Farmer selects plant leaf image (JPG/PNG/WEBP < 10MB)
                 ↓
`DiseaseDetection.jsx` (Client-side validation & preview)
                 ↓
`diseaseService.detectDisease(imageFile, farmerId)`
                 ↓
[CURRENT]: 1.5s simulated timeout returning mock Early Blight
[TARGET]: POST http://localhost:8000/predict/disease (FastAPI + PyTorch/TensorFlow)
                 ↓
Model Preprocessing (Resize 224x224, Normalize, Tensor Conversion)
                 ↓
Inference Engine (Trained Crop Disease Model)
                 ↓
Confidence Check (If < 60% -> "Uncertain / Low Confidence" warning)
                 ↓
Agronomic Advisory Engine (Safe treatments, symptoms, prevention in EN/HI/MR)
                 ↓
Return Structured JSON -> Saved to `disease_detections` -> Rendered in UI
```

---

## 5. What Om (Member 3) Needs to Implement

### Priority #1: Crop Disease Detection Microservice
- **Directory**: `ai-service/`
- **Stack**: Python 3.10+, FastAPI, Uvicorn, Pillow, NumPy, PyTorch / Torchvision (or TensorFlow/TFLite), Scikit-learn.
- **Dataset**: Public PlantVillage Crop Disease Dataset subset (Tomato, Potato, Pepper, Corn / Maize covering Healthy, Early Blight, Late Blight, Leaf Spot, Rust, Bacterial Spot).
- **Model**: MobileNetV2 / Custom Lightweight CNN trained with transfer learning.
- **Preprocessing Pipeline**: Input image validation, corruption check, RGB conversion, 224x224 bicubic resizing, ImageNet standardization.
- **Inference & Calibration**: Softmax probabilities, confidence thresholding (threshold = 0.60).
- **Advisory Engine**: Multilingual safe treatment recommendations (biological, cultural, chemical safety).
- **REST Endpoints**:
  - `GET /health` -> `{"status": "ok"}`
  - `POST /predict/disease` -> Multipart image form-data returning diagnosis, confidence, severity, and recommendations.
  - `POST /predict/risk` -> Multivariable risk assessment based on disease + weather + soil.
- **Frontend Hook**: Connect `src/services/diseaseService.js` to `http://localhost:8000/predict/disease` with fallback.
- **Test Suite**: Automated tests for all edge cases (health, valid leaves, invalid non-leaf images, corrupted bytes, missing files).

---

## 6. Recommended Implementation Order
1. **Step 1**: Inspection & Documentation (`AI_IMPLEMENTATION_STATUS.md`) — **[COMPLETED]**
2. **Step 2**: Create `ai-service/` project structure, virtual environment, and `requirements.txt`.
3. **Step 3**: Build image preprocessing & corrupt image validation module (`preprocessing/`).
4. **Step 4**: Build & train the crop disease classification model on standard crop disease classes, generating reproducible training & validation metrics (`train.py` & `models/`).
5. **Step 5**: Implement safe agronomic recommendation lookup and low-confidence handling (`recommendations/` & `prediction/`).
6. **Step 6**: Build FastAPI application (`main.py`) with CORS and `/health`, `/predict/disease` endpoints.
7. **Step 7**: Implement automated test suite in `ai-service/tests/` and execute all test cases.
8. **Step 8**: Connect `src/services/diseaseService.js` in the React frontend to the live AI service.
9. **Step 9**: End-to-end verification (Image Upload -> AI Prediction -> UI Display -> Supabase DB Log).
