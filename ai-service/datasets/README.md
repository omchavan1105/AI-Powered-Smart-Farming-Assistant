# Crop Disease Dataset Documentation — KrishiSetu

## 1. Dataset Overview
- **Name**: PlantVillage Crop Disease Benchmark Dataset (Curated Agricultural MVP Subset)
- **Source**: Hughes, D., & Salathé, M. (2015). *An open access repository of images on plant health to enable the development of mobile disease diagnostics.* arXiv:1511.08060.
- **License**: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

## 2. Crops & Disease Classes Included
| Crop | Disease Class | Scientific Name | Pathogen Type | Typical Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Tomato** | Early Blight | *Alternaria solani* | Fungus | Moderate |
| **Tomato** | Late Blight | *Phytophthora infestans* | Oomycete | High |
| **Tomato** | Bacterial Spot | *Xanthomonas campestris* | Bacteria | Moderate |
| **Tomato** | Healthy | *Solanum lycopersicum* | None | Healthy |
| **Potato** | Early Blight | *Alternaria solani* | Fungus | Moderate |
| **Potato** | Late Blight | *Phytophthora infestans* | Oomycete | High |
| **Potato** | Healthy | *Solanum tuberosum* | None | Healthy |
| **Corn (Maize)** | Common Rust | *Puccinia sorghi* | Fungus | Moderate |
| **Corn (Maize)** | Healthy | *Zea mays* | None | Healthy |

## 3. Preprocessing & Data Augmentation Specs
- **Input Resolution**: 224 x 224 pixels (RGB)
- **Normalization**: ImageNet mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`
- **Augmentation Pipeline**:
  - Random Horizontal & Vertical Flips ($p = 0.5$)
  - Random Rotation ($\pm 20^\circ$)
  - Color Jitter (Brightness $\pm 0.2$, Contrast $\pm 0.2$)
  - Random Affine Scaling ($0.9 - 1.1\times$)

## 4. Evaluation Targets & Benchmarks
- **Target Top-1 Accuracy**: $> 92.0\%$
- **Confidence Threshold for Definitive Diagnosis**: $\ge 60.0\%$ (Images below threshold flagged as *Inconclusive / Uncertain*)
- **Inference Latency**: $< 50\text{ms}$ on standard CPU
