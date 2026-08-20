"""
Download real PlantVillage images from Hugging Face for our 9 target disease classes.
"""

import os
import sys
import json

TARGET_CLASSES = [
    "Tomato___Early_Blight",
    "Tomato___Late_Blight",
    "Tomato___Bacterial_Spot",
    "Tomato___Healthy",
    "Potato___Early_Blight",
    "Potato___Late_Blight",
    "Potato___Healthy",
    "Corn___Common_Rust",
    "Corn___Healthy"
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "datasets", "plantvillage")


def download_and_save_dataset():
    print("[1/3] Loading Hugging Face PlantVillage dataset...")
    try:
        from datasets import load_dataset
        # Load dataset from Hugging Face
        ds = load_dataset("mohanty/PlantVillage", "color", split="train", streaming=True)
        print("  [OK] Connected to Hugging Face stream")
    except Exception as e:
        print(f"  [ERROR] Could not load from datasets library: {e}")
        return False

    os.makedirs(DATASET_DIR, exist_ok=True)
    for cls in TARGET_CLASSES:
        os.makedirs(os.path.join(DATASET_DIR, cls), exist_ok=True)

    print("[2/3] Streaming real agricultural leaf images...")
    # Map Hugging Face class names / indices
    # We will sample up to 150 real images per class for fast, high-quality training
    counts = {cls: 0 for cls in TARGET_CLASSES}
    max_per_class = 150
    total_saved = 0

    try:
        for idx, item in enumerate(ds):
            # item has 'image' (PIL Image) and other fields
            label_name = item.get("label_name") or str(item.get("label"))
            
            # Normalize label name to match our target classes
            matched_class = None
            for target in TARGET_CLASSES:
                target_clean = target.lower().replace("_", "").replace(" ", "")
                label_clean = str(label_name).lower().replace("_", "").replace(" ", "")
                if target_clean in label_clean or label_clean in target_clean:
                    matched_class = target
                    break
            
            if matched_class and counts[matched_class] < max_per_class:
                img = item.get("image")
                if img:
                    img_path = os.path.join(DATASET_DIR, matched_class, f"{matched_class}_{counts[matched_class]:04d}.jpg")
                    img.convert("RGB").save(img_path, "JPEG")
                    counts[matched_class] += 1
                    total_saved += 1
                    if total_saved % 50 == 0:
                        print(f"  Saved {total_saved} real images...")
            
            # If all classes have enough images, break
            if all(c >= max_per_class for c in counts.values()):
                break
            
            if idx > 30000:
                break
    except Exception as e:
        print(f"  Stream exception (processed {total_saved} images): {e}")

    print(f"\n[3/3] Dataset Summary:")
    found_count = 0
    for cls, count in counts.items():
        print(f"  * {cls}: {count} real images")
        if count >= 10:
            found_count += 1

    if found_count >= 7:
        metadata = {
            "dataset": "PlantVillage (Real Images via Hugging Face)",
            "source": "https://huggingface.co/datasets/mohanty/PlantVillage",
            "license": "CC0 1.0 Universal (Public Domain)",
            "classes": TARGET_CLASSES,
            "num_classes": len(TARGET_CLASSES),
            "counts": counts
        }
        with open(os.path.join(DATASET_DIR, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
        print(f"\n[SUCCESS] Real PlantVillage images ready at {DATASET_DIR}!")
        return True
    
    return False


if __name__ == "__main__":
    download_and_save_dataset()
