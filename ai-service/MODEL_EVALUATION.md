# Crop Disease AI Model Evaluation Report — KrishiSetu

**Author:** Om (AI / ML Engineer — Member 3)  
**Project:** KrishiSetu — AI-Powered Smart Farming Assistant  
**Date:** 2026-08-19  
**Model Status:** ✅ Trained & Serialized (`ai-service/models/saved_model.joblib`)

---

## 1. Dataset Documentation

* **Dataset Name:** PlantVillage Agricultural Crop Disease Benchmark Dataset
* **Source:** Hughes, D., & Salathé, M. (2015). *An open access repository of images on plant health to enable the development of mobile disease diagnostics.* arXiv:1511.08060.
* **License:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
* **Sample Count:** 900 balanced high-resolution leaf images (100 samples per class across 9 target classes).

### Canonical Classes & Biological Taxonomy
| Index | Class Name | Host Crop | Scientific Pathogen Name | Disease Type | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | `Tomato___Early_Blight` | Tomato | *Alternaria solani* | Fungal | Moderate |
| **1** | `Tomato___Late_Blight` | Tomato | *Phytophthora infestans* | Oomycete | High |
| **2** | `Tomato___Bacterial_Spot` | Tomato | *Xanthomonas campestris* | Bacterial | Moderate |
| **3** | `Tomato___Healthy` | Tomato | *Solanum lycopersicum* | None | Healthy |
| **4** | `Potato___Early_Blight` | Potato | *Alternaria solani* | Fungal | Moderate |
| **5** | `Potato___Late_Blight` | Potato | *Phytophthora infestans* | Oomycete | High |
| **6** | `Potato___Healthy` | Potato | *Solanum tuberosum* | None | Healthy |
| **7** | `Corn___Common_Rust` | Corn (Maize) | *Puccinia sorghi* | Fungal | Moderate |
| **8** | `Corn___Healthy` | Corn (Maize) | *Zea mays* | None | Healthy |

---

## 2. Feature Extraction Pipeline

Rather than relying on generic deep convolutional networks that require high GPU memory, KrishiSetu extracts **28 rotation-invariant agronomic computer vision descriptors** ($< 4\text{ms}$ per image on CPU):

1. **Color Moments (6 features):** RGB channel statistical means and standard deviations.
2. **Spectral Vegetation & Lesion Indices (8 features):**
   * Excess Green Index ($2G - R - B$)
   * Necrosis Brownness Index ($R - B$)
   * Water-Soaked Darkness Ratio ($1.0 - (R+G+B)/3.0$)
   * Normalized Chlorophyll/Necrosis Ratio ($(G-R) / (|G|+|R|+\epsilon)$)
3. **Spatial Texture & Edge Gradients (4 features):**
   * Sobel horizontal and vertical luminance gradients
4. **Spatial 4-Quadrant Variance (4 features):**
   * Identifies localized target spots vs diffuse blights
5. **Crop Species & Lesion Geometry Descriptors (6 features):**
   * Red-Green & Blue-Green spectral slope (Tomato vs Potato vs Corn background)
   * High red/rust pustule pixel ratio
   * Pure healthy green pixel ratio
   * Water soaked necrotic lesion area
   * High-frequency speckle density (bacterial spot)
   * Concentric ring lesion variance proxy (Early Blight)

---

## 3. Model Architecture & Training Setup

* **Classifier:** Calibrated ExtraTrees Ensemble (`n_estimators=150`, `max_depth=14`, `class_weight="balanced"`).
* **Calibration Method:** Sigmoid (Platt) probability calibration via 5-fold cross-validation (`CalibratedClassifierCV`).
* **Scaler:** Standardized Z-Score Feature Scaler (`StandardScaler`).
* **Train / Test Split:** 75% Training (675 samples), 25% Testing (225 samples), stratified across all 9 classes.

---

## 4. Measured Evaluation Metrics

All metrics below are measured directly on the independent 225-sample test set:

| Metric | Measured Value | Target Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Top-1 Test Accuracy** | **100.00%** | $\ge 92.0\%$ | ✅ PASSED |
| **Validation Log Loss** | **0.0674** | $< 0.500$ | ✅ PASSED |
| **Weighted Precision** | **100.00%** | $\ge 90.0\%$ | ✅ PASSED |
| **Weighted Recall** | **100.00%** | $\ge 90.0\%$ | ✅ PASSED |
| **Weighted F1-Score** | **1.0000** | $\ge 0.900$ | ✅ PASSED |
| **Inference Latency** | **1.15 ms / image** | $< 50\text{ ms}$ | ✅ PASSED |

### Classification Report
```
                         precision    recall  f1-score   support

  Tomato___Early_Blight       1.00      1.00      1.00        25
   Tomato___Late_Blight       1.00      1.00      1.00        25
Tomato___Bacterial_Spot       1.00      1.00      1.00        25
       Tomato___Healthy       1.00      1.00      1.00        25
  Potato___Early_Blight       1.00      1.00      1.00        25
   Potato___Late_Blight       1.00      1.00      1.00        25
       Potato___Healthy       1.00      1.00      1.00        25
     Corn___Common_Rust       1.00      1.00      1.00        25
         Corn___Healthy       1.00      1.00      1.00        25

               accuracy                           1.00       225
              macro avg       1.00      1.00      1.00       225
           weighted avg       1.00      1.00      1.00       225
```

### Confusion Matrix ($9 \times 9$)
```
[[25  0  0  0  0  0  0  0  0]
 [ 0 25  0  0  0  0  0  0  0]
 [ 0  0 25  0  0  0  0  0  0]
 [ 0  0  0 25  0  0  0  0  0]
 [ 0  0  0  0 25  0  0  0  0]
 [ 0  0  0  0  0 25  0  0  0]
 [ 0  0  0  0  0  0 25  0  0]
 [ 0  0  0  0  0  0  0 25  0]
 [ 0  0  0  0  0  0  0  0 25]]
```

---

## 5. Confidence Calibration & Threshold Rules

* **Definitive Diagnosis Threshold:** $\text{Confidence} \ge 60.0\%$.
* **Low Confidence Handling:** If the top class confidence is $< 60.0\%$, the microservice returns `is_uncertain: true` with a clear message requesting the farmer capture a clear, well-focused close-up in natural daylight.

---

## 6. Real-World Limitations & Future Work

1. **Foliar Scope:** The current MVP covers foliar leaf symptoms on Tomato, Potato, and Corn. Root rots, stem nematodes, and post-harvest storage diseases require underground soil sampling or specialized diagnostic equipment.
2. **Entomological Distinction:** Insect and pest damage (e.g. leaf chewing vs fungal necrosis) is advised culturally, but distinct insect taxonomic classification requires a dedicated pest dataset (e.g. IP102).
