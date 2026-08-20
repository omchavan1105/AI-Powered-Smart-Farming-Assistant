"""
Download PlantVillage dataset for KrishiSetu disease classification.
Downloads the 9 specific classes used by our model from the Kaggle PlantVillage dataset.

Usage:
    python ai-service/download_dataset.py
"""

import os
import sys
import urllib.request
import zipfile
import shutil
import json

# Our 9 target classes
TARGET_CLASSES = [
    "Tomato___Early_Blight",
    "Tomato___Late_Blight",
    "Tomato___Bacterial_Spot",
    "Tomato___healthy",
    "Potato___Early_Blight",
    "Potato___Late_Blight",
    "Potato___healthy",
    "Corn_(Maize)___Common_Rust",
    "Corn_(Maize)___healthy"
]

# Mapping from PlantVillage folder names to our canonical names
CLASS_NAME_MAP = {
    "Tomato___Early_Blight": "Tomato___Early_Blight",
    "Tomato___Late_Blight": "Tomato___Late_Blight",
    "Tomato___Bacterial_Spot": "Tomato___Bacterial_Spot",
    "Tomato___healthy": "Tomato___Healthy",
    "Potato___Early_Blight": "Potato___Early_Blight",
    "Potato___Late_Blight": "Potato___Late_Blight",
    "Potato___healthy": "Potato___Healthy",
    "Corn_(Maize)___Common_Rust": "Corn___Common_Rust",
    "Corn_(Maize)___healthy": "Corn___Healthy"
}

DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets", "plantvillage")

# PlantVillage GitHub mirror (smaller, faster than Kaggle)
DATASET_URL = "https://github.com/spMohanty/PlantVillage-Dataset/archive/refs/heads/master.zip"
# Alternative: Kaggle URL (requires kaggle CLI)
# kaggle datasets download -d abdallahalidev/plantvillage-dataset


def download_progress(block_num, block_size, total_size):
    downloaded = block_num * block_size
    if total_size > 0:
        pct = min(100, downloaded * 100 // total_size)
        mb_down = downloaded / (1024 * 1024)
        mb_total = total_size / (1024 * 1024)
        sys.stdout.write(f"\r  Downloading: {mb_down:.1f}/{mb_total:.1f} MB ({pct}%)")
        sys.stdout.flush()


def download_and_extract():
    """Download PlantVillage dataset and extract only our 9 classes."""
    
    os.makedirs(DATASET_DIR, exist_ok=True)
    
    # Check if already downloaded
    existing_classes = [d for d in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, d))] if os.path.exists(DATASET_DIR) else []
    if len(existing_classes) >= 9:
        print(f"[OK] Dataset already exists with {len(existing_classes)} classes at {DATASET_DIR}")
        for cls in sorted(existing_classes):
            count = len([f for f in os.listdir(os.path.join(DATASET_DIR, cls)) if f.endswith(('.jpg', '.JPG', '.jpeg', '.png'))])
            print(f"  {cls}: {count} images")
        return True
    
    zip_path = os.path.join(os.path.dirname(DATASET_DIR), "plantvillage_raw.zip")
    extract_dir = os.path.join(os.path.dirname(DATASET_DIR), "raw")
    
    # Download
    if not os.path.exists(zip_path):
        print(f"[1/3] Downloading PlantVillage dataset...")
        print(f"  URL: {DATASET_URL}")
        try:
            urllib.request.urlretrieve(DATASET_URL, zip_path, download_progress)
            print(f"\n  [OK] Downloaded to {zip_path}")
        except Exception as e:
            print(f"\n  [FAIL] Download failed: {e}")
            print(f"\n  MANUAL ALTERNATIVE:")
            print(f"  1. Go to: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset")
            print(f"  2. Download and extract to: {DATASET_DIR}")
            print(f"  3. Each subfolder should be one disease class with .jpg images")
            return False
    else:
        print(f"[1/3] ZIP already downloaded at {zip_path}")
    
    # Extract
    print(f"[2/3] Extracting dataset...")
    os.makedirs(extract_dir, exist_ok=True)
    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(extract_dir)
        print(f"  [OK] Extracted to {extract_dir}")
    except Exception as e:
        print(f"  [FAIL] Extraction failed: {e}")
        return False
    
    # Find the color images directory
    print(f"[3/3] Copying target classes...")
    color_dir = None
    for root, dirs, files in os.walk(extract_dir):
        if "color" in dirs:
            color_dir = os.path.join(root, "color")
            break
        # Also check for direct class folders
        for target_cls in TARGET_CLASSES:
            if target_cls in dirs:
                color_dir = root
                break
        if color_dir:
            break
    
    if not color_dir:
        # Try looking for folders matching our classes anywhere
        for root, dirs, files in os.walk(extract_dir):
            matching = [d for d in dirs if any(t in d for t in ["Tomato", "Potato", "Corn"])]
            if len(matching) >= 5:
                color_dir = root
                break
    
    if not color_dir:
        print(f"  [FAIL] Could not locate image directories in extracted archive.")
        print(f"  Contents of {extract_dir}:")
        for item in os.listdir(extract_dir)[:20]:
            print(f"    {item}")
        return False
    
    print(f"  Source directory: {color_dir}")
    
    # Copy only our 9 target classes
    found_count = 0
    for source_name, canonical_name in CLASS_NAME_MAP.items():
        src = os.path.join(color_dir, source_name)
        if not os.path.exists(src):
            # Try case variations
            for d in os.listdir(color_dir):
                if d.lower().replace(" ", "_") == source_name.lower().replace(" ", "_"):
                    src = os.path.join(color_dir, d)
                    break
        
        if os.path.exists(src):
            dst = os.path.join(DATASET_DIR, canonical_name)
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            img_count = len([f for f in os.listdir(dst) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            print(f"  [OK] {canonical_name}: {img_count} images")
            found_count += 1
        else:
            print(f"  [MISSING] {source_name} not found in dataset")
    
    # Cleanup extracted raw files (keep zip for re-extraction)
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    
    print(f"\n{'='*50}")
    print(f"  Dataset ready: {found_count}/9 classes found")
    print(f"  Location: {DATASET_DIR}")
    print(f"{'='*50}")
    
    # Save dataset metadata
    metadata = {
        "dataset": "PlantVillage",
        "source": "https://github.com/spMohanty/PlantVillage-Dataset",
        "license": "CC0 1.0 Universal (Public Domain)",
        "classes": list(CLASS_NAME_MAP.values()),
        "num_classes": len(CLASS_NAME_MAP)
    }
    with open(os.path.join(DATASET_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
    
    return found_count >= 7  # Allow partial success


if __name__ == "__main__":
    success = download_and_extract()
    sys.exit(0 if success else 1)
