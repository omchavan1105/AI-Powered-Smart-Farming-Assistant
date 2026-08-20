"""
Fast multithreaded downloader for our 9 target PlantVillage disease classes
directly from the official spMohanty/PlantVillage-Dataset repository.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

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
DATASET_DIR = os.path.join(BASE_DIR, "datasets", "plantvillage")
IMAGES_PER_CLASS = 120  # Balanced dataset with 120 real images per class


def download_single_image(url, save_path):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) > 1000:
                with open(save_path, "wb") as f:
                    f.write(data)
                return True
    except Exception as e:
        pass
    return False


def fetch_class_images(repo_folder_name, canonical_name):
    encoded_folder = urllib.parse.quote(repo_folder_name)
    api_url = f"https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents/raw/color/{encoded_folder}"
    
    req = urllib.request.Request(api_url, headers={"User-Agent": "KrishiSetu-Downloader"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            files_data = json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [ERROR] Failed to list {repo_folder_name}: {e}")
        return canonical_name, 0

    class_save_dir = os.path.join(DATASET_DIR, canonical_name)
    os.makedirs(class_save_dir, exist_ok=True)
    
    # Filter image files
    image_items = [f for f in files_data if f["name"].lower().endswith((".jpg", ".jpeg", ".png"))][:IMAGES_PER_CLASS]
    
    # Download images concurrently for this class
    downloaded = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = []
        for item in image_items:
            save_file = os.path.join(class_save_dir, item["name"])
            if os.path.exists(save_file) and os.path.getsize(save_file) > 1000:
                downloaded += 1
                continue
            futures.append(pool.submit(download_single_image, item["download_url"], save_file))
        
        for fut in as_completed(futures):
            if fut.result():
                downloaded += 1
                
    print(f"  [OK] {canonical_name}: {downloaded} real PlantVillage images downloaded")
    return canonical_name, downloaded


def download_all_classes():
    print("=" * 70)
    print("KrishiSetu: Downloading REAL PlantVillage Leaf Dataset (9 Classes)")
    print(f"Target: {DATASET_DIR}")
    print("=" * 70)
    
    os.makedirs(DATASET_DIR, exist_ok=True)
    results = {}
    
    for repo_name, canonical_name in TARGET_CLASSES.items():
        name, count = fetch_class_images(repo_name, canonical_name)
        results[name] = count
        
    total_images = sum(results.values())
    print("\n" + "=" * 70)
    print(f"Total downloaded: {total_images} real images across {len(results)} classes")
    print("=" * 70)
    
    # Save dataset metadata
    metadata = {
        "dataset": "PlantVillage",
        "source": "https://github.com/spMohanty/PlantVillage-Dataset",
        "license": "CC0 1.0 Universal (Public Domain)",
        "crops": ["Tomato", "Potato", "Corn (Maize)"],
        "classes": list(TARGET_CLASSES.values()),
        "num_classes": len(TARGET_CLASSES),
        "total_images": total_images,
        "class_counts": results
    }
    with open(os.path.join(DATASET_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Metadata saved to {os.path.join(DATASET_DIR, 'metadata.json')}")
    return total_images > 500


if __name__ == "__main__":
    success = download_all_classes()
    sys.exit(0 if success else 1)
