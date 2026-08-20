"""
Organize our 9 target PlantVillage classes from cloned repository.
"""

import os
import sys
import shutil
import json

TARGET_CLASSES = {
    "Tomato___Early_blight": "Tomato___Early_Blight",
    "Tomato___Late_blight": "Tomato___Late_Blight",
    "Tomato___Bacterial_spot": "Tomato___Bacterial_Spot",
    "Tomato___healthy": "Tomato___Healthy",
    "Potato___Early_blight": "Potato___Early_Blight",
    "Potato___Late_blight": "Potato___Late_Blight",
    "Potato___healthy": "Potato___Healthy",
    "Corn_(maize)___Common_rust_": "Corn___Common_Rust",
    "Corn_(maize)___healthy": "Corn___Healthy"
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_COLOR_DIR = os.path.join(BASE_DIR, "datasets", "pv_repo", "raw", "color")
DATASET_DIR = os.path.join(BASE_DIR, "datasets", "plantvillage")


def organize():
    if not os.path.exists(REPO_COLOR_DIR):
        print(f"Waiting for repo checkout: {REPO_COLOR_DIR} not found yet.")
        return False

    os.makedirs(DATASET_DIR, exist_ok=True)
    available_dirs = os.listdir(REPO_COLOR_DIR)
    print(f"Available directories in repo ({len(available_dirs)}):")
    
    found = 0
    for repo_name, canonical_name in TARGET_CLASSES.items():
        src = os.path.join(REPO_COLOR_DIR, repo_name)
        if not os.path.exists(src):
            # Try case-insensitive matching
            for d in available_dirs:
                if d.lower().replace("_", "").replace(" ", "") == repo_name.lower().replace("_", "").replace(" ", ""):
                    src = os.path.join(REPO_COLOR_DIR, d)
                    break
        
        if os.path.exists(src):
            dst = os.path.join(DATASET_DIR, canonical_name)
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            img_count = len([f for f in os.listdir(dst) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            print(f"  [COPIED] {canonical_name}: {img_count} real images")
            found += 1
        else:
            print(f"  [NOT FOUND] {repo_name}")

    if found >= 7:
        # Save metadata
        metadata = {
            "dataset": "PlantVillage",
            "source": "https://github.com/spMohanty/PlantVillage-Dataset",
            "license": "CC0 1.0 Universal (Public Domain)",
            "classes": list(TARGET_CLASSES.values()),
            "num_classes": len(TARGET_CLASSES)
        }
        with open(os.path.join(DATASET_DIR, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
        print(f"\n[SUCCESS] PlantVillage dataset organized into {DATASET_DIR} ({found}/9 classes)")
        return True
    return False


if __name__ == "__main__":
    organize()
