import io
from typing import Tuple, Optional
from PIL import Image, ImageOps
import numpy as np

# Supported image MIME types and formats
SUPPORTED_FORMATS = {"JPEG", "JPG", "PNG", "WEBP", "BMP"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# ImageNet normalization statistics
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


class ImagePreprocessingError(Exception):
    """Custom exception raised when image preprocessing fails."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def validate_and_load_image(file_bytes: bytes) -> Image.Image:
    """
    Validates file size, integrity, and converts bytes into a verified PIL RGB Image.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise ImagePreprocessingError("No image file uploaded or file is empty.", status_code=400)

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ImagePreprocessingError("File size exceeds maximum allowed limit of 10MB.", status_code=400)

    try:
        # Step 1: Open stream and verify header
        stream = io.BytesIO(file_bytes)
        img = Image.open(stream)
        img_format = (img.format or "").upper()

        if img_format not in SUPPORTED_FORMATS:
            raise ImagePreprocessingError(
                f"Unsupported image format: '{img_format}'. Supported formats are: JPEG, PNG, WEBP, BMP.",
                status_code=415
            )

        # Step 2: Verify integrity
        img.verify()

        # Step 3: Re-open after verify to load raster pixels
        stream.seek(0)
        img = Image.open(stream)
        img.load()

        # Step 4: Handle EXIF orientation if present
        img = ImageOps.exif_transpose(img)

        # Step 5: Convert RGBA/Grayscale to RGB (3 channels)
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Step 6: Validate minimum resolution
        width, height = img.size
        if width < 32 or height < 32:
            raise ImagePreprocessingError(
                f"Image resolution too low ({width}x{height}px). Minimum is 32x32px.",
                status_code=400
            )

        return img

    except ImagePreprocessingError:
        raise
    except Exception as e:
        raise ImagePreprocessingError(f"Corrupted or unreadable image file: {str(e)}", status_code=400)


def preprocess_for_inference(img: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """
    Resizes image to target resolution, scales to [0, 1], normalizes with ImageNet statistics,
    and returns a batch tensor in NCHW format (1, 3, H, W) as float32 NumPy array.
    """
    try:
        # High-quality bicubic resizing
        resized = img.resize(target_size, Image.Resampling.BICUBIC)

        # Convert to float array [0.0, 1.0]
        arr = np.array(resized, dtype=np.float32) / 255.0  # Shape: (H, W, 3)

        # Normalize per channel: (x - mean) / std
        normalized = (arr - IMAGENET_MEAN) / IMAGENET_STD

        # Transpose from (H, W, C) to (C, H, W)
        chw = np.transpose(normalized, (2, 0, 1))

        # Add batch dimension: (1, 3, H, W)
        batch = np.expand_dims(chw, axis=0)

        return batch.astype(np.float32)

    except Exception as e:
        raise ImagePreprocessingError(f"Failed to normalize and convert image for inference: {str(e)}")
