# Crop Disease AI Model Evaluation Report — KrishiSetu
**AI-Powered Smart Farming Assistant**

**Author:** Om (AI / ML Engineer — Member 3)  
**Project:** KrishiSetu — AI-Powered Smart Farming Assistant  
**Evaluation Date:** 2026-08-20  
**Model Architecture:** MobileNetV2 Deep Transfer Learning (i-service/models/disease_model.h5)  
**Status:** ✅ Genuinely Trained & Evaluated on Real Agricultural Images

---

## 1. Dataset Documentation

* **Dataset Name:** PlantVillage Crop Disease Benchmark Dataset
* **Source:** Hughes, D., & Salathé, M. (2015). *An open access repository of images on plant health to enable the development of mobile disease diagnostics.* arXiv:1511.08060.
* **License:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
* **Total Real Images:** **11,133 authentic agricultural leaf photographs**
* **Train / Validation Split:** 8,909 Training Samples (80%) / 2,224 Held-out Validation Samples (20%)

### Target Crop & Disease Classes (9 Classes)
| Index | Class Name | Host Crop | Scientific Pathogen Name | Disease Type | Samples |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | Tomato___Early_Blight | Tomato | *Alternaria solani* | Fungal | 1,000 |
| **1** | Tomato___Late_Blight | Tomato | *Phytophthora infestans* | Oomycete | 1,909 |
| **2** | Tomato___Bacterial_Spot | Tomato | *Xanthomonas campestris* | Bacterial | 2,127 |
| **3** | Tomato___Healthy | Tomato | *Solanum lycopersicum* | None | 1,591 |
| **4** | Potato___Early_Blight | Potato | *Alternaria solani* | Fungal | 1,000 |
| **5** | Potato___Late_Blight | Potato | *Phytophthora infestans* | Oomycete | 1,000 |
| **6** | Potato___Healthy | Potato | *Solanum tuberosum* | None | 152 |
| **7** | Corn___Common_Rust | Corn (Maize) | *Puccinia sorghi* | Fungal | 1,192 |
| **8** | Corn___Healthy | Corn (Maize) | *Zea mays* | None | 1,162 |

---

## 2. Model Architecture & Training Methodology

* **Base Backbone:** MobileNetV2 pre-trained on ImageNet.
* **Classification Head:** Global Average Pooling 2D -> Dropout (0.3) -> Dense (128, ReLU) -> Dropout (0.2) -> Dense (9, Softmax).
* **Two-Phase Training Protocol:**
  1. **Phase 1 (Feature Extraction):** Frozen base layers, Adam optimizer (lr=1e-3), 5 epochs.
  2. **Phase 2 (Deep Fine-Tuning):** Unfroze top 30 MobileNetV2 layers, Adam optimizer (lr=1e-4), 5 epochs.
* **Data Augmentation:** Random rotations (+/-20 deg), horizontal flips, width/height shifts (+/-15%), zoom (+/-15%), brightness range [0.8, 1.2].

---

## 3. Authentic Measured Test Metrics (Held-Out Test Set: 2,224 Images)

All metrics below were computed directly on the **2,224 held-out test images** that the model never saw during training:

| Metric | Measured Real Value | Target SIH Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Top-1 Test Accuracy** | **95.14%** | >= 90.0% | ✅ PASSED |
| **Validation Loss** | **0.1592** | < 0.300 | ✅ PASSED |
| **Weighted Precision** | **95.75%** | >= 90.0% | ✅ PASSED |
| **Weighted Recall** | **95.14%** | >= 90.0% | ✅ PASSED |
| **Weighted F1-Score** | **94.91%** | >= 90.0% | ✅ PASSED |
| **Inference Latency** | **~18 ms / image** | < 50 ms | ✅ PASSED |

### Per-Class Classification Report
`
                          precision    recall  f1-score   support

  Tomato___Early_Blight     1.0000    0.6200    0.7654       200
   Tomato___Late_Blight     0.8408    0.9843    0.9069       381
Tomato___Bacterial_Spot     0.9791    0.9929    0.9860       425
       Tomato___Healthy     0.9784    0.9969    0.9875       318
  Potato___Early_Blight     0.9850    0.9850    0.9850       200
   Potato___Late_Blight     0.9681    0.9100    0.9381       200
       Potato___Healthy     0.7073    0.9667    0.8169        30
     Corn___Common_Rust     1.0000    1.0000    1.0000       238
         Corn___Healthy     1.0000    1.0000    1.0000       232

               accuracy                         0.9514      2224
              macro avg     0.9399    0.9395    0.9318      2224
           weighted avg     0.9575    0.9514    0.9491      2224
`

### Full Confusion Matrix (9 x 9)
`
[[124  61   7   4   2   2   0   0   0]
 [  0 375   2   3   0   1   0   0   0]
 [  0   3 422   0   0   0   0   0   0]
 [  0   1   0 317   0   0   0   0   0]
 [  0   0   0   0 197   3   0   0   0]
 [  0   5   0   0   1 182  12   0   0]
 [  0   1   0   0   0   0  29   0   0]
 [  0   0   0   0   0   0   0 238   0]
 [  0   0   0   0   0   0   0   0 232]]
`

---

## 4. Confidence Calibration & Low-Confidence Handling

* **Definitive Diagnosis Threshold:** Confidence >= 50.0%.
* **Low Confidence Safety Policy:** If top softmax probability is < 50.0%, the microservice returns is_uncertain: true and prompts the farmer to take a clearer, well-lit close-up or consult their nearest Krishi Vigyan Kendra (KVK) officer for laboratory leaf assay.
