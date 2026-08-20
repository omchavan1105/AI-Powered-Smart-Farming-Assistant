"""
Real Training & Evaluation Script for KrishiSetu Crop Disease Classifier.

Trains on ACTUAL PlantVillage images — NOT synthetic data.

Supports two training modes:
1. TensorFlow MobileNetV2 transfer learning (if TF is installed)
2. sklearn ensemble on real image features extracted via Pillow (fallback)

Usage:
    python ai-service/train.py
"""

import os
import sys
import time
import json
import joblib
import numpy as np
from typing import Dict, Any, Tuple, List
from pathlib import Path

# Ensure ai-service root is in sys.path
AI_SERVICE_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AI_SERVICE_ROOT)

from models.architecture import (
    DISEASE_CLASSES, NUM_CLASSES,
    TF_MODEL_PATH, SKLEARN_MODEL_PATH,
    extract_image_features
)

DATASET_DIR = os.path.join(AI_SERVICE_ROOT, "datasets", "plantvillage")

# ImageNet normalization constants
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def verify_dataset() -> Dict[str, List[str]]:
    """Verify PlantVillage dataset exists and return class -> image paths mapping."""
    if not os.path.exists(DATASET_DIR):
        print(f"[FAIL] Dataset directory not found: {DATASET_DIR}")
        print(f"  Run: python ai-service/download_dataset.py")
        sys.exit(1)
    
    class_images = {}
    total = 0
    
    for class_name in DISEASE_CLASSES:
        class_dir = os.path.join(DATASET_DIR, class_name)
        if not os.path.exists(class_dir):
            print(f"  [MISSING] {class_name}: directory not found")
            continue
        
        images = [
            os.path.join(class_dir, f)
            for f in os.listdir(class_dir)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))
        ]
        
        if len(images) == 0:
            print(f"  [EMPTY] {class_name}: no images found")
            continue
        
        class_images[class_name] = images
        total += len(images)
        print(f"  [OK] {class_name}: {len(images)} images")
    
    print(f"\n  Total: {total} images across {len(class_images)} classes")
    
    if len(class_images) < 7:
        print(f"\n[FAIL] Only {len(class_images)}/9 classes found. Need at least 7.")
        sys.exit(1)
    
    return class_images


def load_real_images_for_sklearn(class_images: Dict[str, List[str]], max_per_class: int = 200) -> Tuple[np.ndarray, np.ndarray]:
    """
    Load REAL PlantVillage images, resize to 224x224, normalize, extract features.
    Returns: (X_features, y_labels)
    """
    from PIL import Image
    
    all_features = []
    all_labels = []
    
    for class_idx, class_name in enumerate(DISEASE_CLASSES):
        if class_name not in class_images:
            continue
        
        paths = class_images[class_name]
        # Limit per class for training speed
        if len(paths) > max_per_class:
            np.random.seed(42)
            paths = list(np.random.choice(paths, max_per_class, replace=False))
        
        loaded = 0
        for img_path in paths:
            try:
                img = Image.open(img_path).convert("RGB").resize((224, 224), Image.Resampling.BICUBIC)
                arr = np.array(img, dtype=np.float32) / 255.0
                # Normalize with ImageNet stats
                arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
                # Convert HWC -> CHW
                tensor = np.transpose(arr, (2, 0, 1))
                
                features = extract_image_features(tensor)
                all_features.append(features[0])
                all_labels.append(class_idx)
                loaded += 1
            except Exception as e:
                continue  # Skip corrupt images
        
        print(f"    Loaded {loaded}/{len(paths)} images for {class_name}")
    
    return np.array(all_features, dtype=np.float32), np.array(all_labels, dtype=np.int64)


def train_sklearn_on_real_images(class_images: Dict[str, List[str]]) -> Dict[str, Any]:
    """Train sklearn classifier on features extracted from REAL PlantVillage images."""
    from sklearn.ensemble import ExtraTreesClassifier
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import (
        accuracy_score, precision_recall_fscore_support,
        confusion_matrix, classification_report, log_loss
    )
    
    print("\n[2/4] Loading and extracting features from real PlantVillage images...")
    X_feat, y = load_real_images_for_sklearn(class_images, max_per_class=250)
    print(f"  Feature matrix: {X_feat.shape} | Labels: {y.shape}")
    
    # 75/25 stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X_feat, y, test_size=0.25, random_state=42, stratify=y
    )
    
    print(f"\n[3/4] Training Calibrated ExtraTrees Ensemble (Train: {len(X_train)}, Test: {len(X_test)})...")
    base_clf = ExtraTreesClassifier(
        n_estimators=200, max_depth=16, random_state=42, 
        class_weight="balanced", n_jobs=-1
    )
    calibrated = CalibratedClassifierCV(estimator=base_clf, method="sigmoid", cv=5)
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", calibrated)
    ])
    
    start_train = time.time()
    pipeline.fit(X_train, y_train)
    train_time = time.time() - start_train
    
    print(f"  Training completed in {train_time:.1f}s")
    
    # Evaluate
    print("\n[4/4] Evaluating on held-out test set...")
    start_infer = time.time()
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)
    avg_latency = (time.time() - start_infer) * 1000 / len(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    val_loss = log_loss(y_test, y_prob)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average="weighted", zero_division=0
    )
    cm = confusion_matrix(y_test, y_pred)
    
    # Get class names present in test set
    present_classes = [DISEASE_CLASSES[i] for i in sorted(np.unique(np.concatenate([y_test, y_pred])))]
    
    print("\n" + "=" * 30 + " EVALUATION REPORT " + "=" * 30)
    print(f"  * Dataset         : PlantVillage (Real Images)")
    print(f"  * Total Samples   : {len(X_feat)}")
    print(f"  * Train / Test    : {len(X_train)} / {len(X_test)}")
    print(f"  * Test Accuracy   : {acc * 100:.2f}%")
    print(f"  * Validation Loss : {val_loss:.4f}")
    print(f"  * Weighted Prec.  : {precision * 100:.2f}%")
    print(f"  * Weighted Recall : {recall * 100:.2f}%")
    print(f"  * Weighted F1     : {f1 * 100:.2f}%")
    print(f"  * Avg Latency     : {avg_latency:.2f} ms/image")
    print(f"  * Train Time      : {train_time:.1f}s")
    print("=" * 79)
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=present_classes, zero_division=0))
    
    print("Confusion Matrix:")
    print(cm)
    
    # Save model with metadata
    os.makedirs(os.path.dirname(SKLEARN_MODEL_PATH), exist_ok=True)
    save_data = {
        "pipeline": pipeline,
        "classes": DISEASE_CLASSES,
        "metadata": {
            "trained_on": "PlantVillage Real Images",
            "dataset_source": "https://github.com/spMohanty/PlantVillage-Dataset",
            "dataset_license": "CC0 1.0 Universal (Public Domain)",
            "num_classes": len(present_classes),
            "total_samples": len(X_feat),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "model_type": "CalibratedExtraTreesClassifier",
            "num_features": 28,
            "accuracy": round(acc * 100, 2),
            "f1_score": round(float(f1) * 100, 2),
            "training_date": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    }
    joblib.dump(save_data, SKLEARN_MODEL_PATH)
    print(f"\n[OK] Model saved to: {SKLEARN_MODEL_PATH}")
    
    return {
        "model_type": "sklearn_extratrees",
        "dataset": "PlantVillage (Real Images)",
        "total_samples": len(X_feat),
        "accuracy": round(acc * 100, 2),
        "validation_loss": round(val_loss, 4),
        "precision": round(float(precision) * 100, 2),
        "recall": round(float(recall) * 100, 2),
        "f1_score": round(float(f1) * 100, 2),
        "avg_latency_ms": round(avg_latency, 2),
        "train_time_s": round(train_time, 1),
        "confusion_matrix": cm.tolist()
    }


def try_train_tensorflow(class_images: Dict[str, List[str]]) -> bool:
    """Attempt TensorFlow MobileNetV2 transfer learning. Returns True if successful."""
    try:
        import tensorflow as tf
        print(f"  TensorFlow {tf.__version__} detected. Using MobileNetV2 transfer learning.")
    except ImportError:
        print("  TensorFlow not available. Will use sklearn fallback.")
        return False
    
    print("\n[2/4] Loading real PlantVillage images for TensorFlow training...")
    
    # Use tf.keras.preprocessing for efficient image loading
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    
    # Create train/validation split using directory structure
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        horizontal_flip=True,
        zoom_range=0.15,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )
    
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    # Map our class names to indices
    train_gen = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        subset='training',
        classes=DISEASE_CLASSES,
        shuffle=True,
        seed=42
    )
    
    val_gen = val_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        subset='validation',
        classes=DISEASE_CLASSES,
        shuffle=False,
        seed=42
    )
    
    print(f"  Train samples: {train_gen.samples}")
    print(f"  Val samples: {val_gen.samples}")
    print(f"  Classes: {train_gen.class_indices}")
    
    print("\n[3/4] Building MobileNetV2 transfer learning model...")
    
    # Load MobileNetV2 with ImageNet weights (no top)
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze base layers
    
    model = tf.keras.Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    # Phase 1: Train top layers only
    print("\n  Phase 1: Training top layers (5 epochs)...")
    history1 = model.fit(
        train_gen,
        epochs=5,
        validation_data=val_gen,
        verbose=1
    )
    
    # Phase 2: Fine-tune top 30 layers of MobileNetV2
    print("\n  Phase 2: Fine-tuning top 30 layers (5 more epochs)...")
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history2 = model.fit(
        train_gen,
        epochs=5,
        validation_data=val_gen,
        verbose=1
    )
    
    # Evaluate
    print("\n[4/4] Evaluating TensorFlow model...")
    val_loss, val_acc = model.evaluate(val_gen, verbose=0)
    
    print(f"\n  Validation Accuracy: {val_acc * 100:.2f}%")
    print(f"  Validation Loss: {val_loss:.4f}")
    
    # Save
    model.save(TF_MODEL_PATH)
    print(f"\n[OK] TensorFlow model saved to: {TF_MODEL_PATH}")
    
    return True


def train_and_evaluate() -> Dict[str, Any]:
    """Main training entry point."""
    print("=" * 70)
    print("KrishiSetu AI/ML -- REAL Crop Disease Model Training")
    print("Dataset: PlantVillage (Real Images)")
    print("=" * 70, flush=True)
    
    print(f"\n[1/4] Verifying PlantVillage dataset ({len(DISEASE_CLASSES)} classes)...")
    class_images = verify_dataset()
    
    # Try TensorFlow first, fall back to sklearn
    tf_success = try_train_tensorflow(class_images)
    
    if tf_success:
        print("\n[OK] TensorFlow MobileNetV2 model trained successfully.")
        return {"model_type": "tensorflow_mobilenetv2", "status": "success"}
    
    # Fallback to sklearn with real images
    print("\n  Using sklearn + real image features (fallback mode)...")
    return train_sklearn_on_real_images(class_images)


if __name__ == "__main__":
    results = train_and_evaluate()
    
    # Save evaluation results
    results_path = os.path.join(AI_SERVICE_ROOT, "training_results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\n[OK] Training results saved to: {results_path}")
