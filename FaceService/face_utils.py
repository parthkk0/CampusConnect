import os
import cv2
import base64
import numpy as np
import logging

# Configure basic logging for the ML module
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('FaceUtils')

# --- ENVIRONMENT HARDENING ---
# 1. Disable GPU execution to prevent CUDA/VRAM allocation errors on startup
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
# 2. Suppress excessive TensorFlow OneDNN/C++ warnings
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# Global state to track if the model loaded successfully
MODEL_READY = False
DEEPFACE_ERROR = None

import threading

try:
    logger.info("Initializing TensorFlow and DeepFace Module...")
    from deepface import DeepFace
except Exception as e:
    MODEL_READY = False
    DEEPFACE_ERROR = str(e)
    logger.error(f"CRITICAL: Failed to import deepface: {DEEPFACE_ERROR}")


def __init_model_background():
    global MODEL_READY, DEEPFACE_ERROR
    try:
        # --- MODEL PRE-CACHING ---
        # Force DeepFace to load the Facenet model into memory immediately upon startup.
        # This prevents the first user request from hanging or failing due to lazy loading.
        # We use a dummy 1x1 image just to trigger the initialization cascade inside DeepFace.
        dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
        logger.info("Triggering initial model weights load into memory. This may take a moment (~15s)...")
        _ = DeepFace.represent(
            img_path=dummy_img,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=False
        )
        
        MODEL_READY = True
        DEEPFACE_ERROR = None
        logger.info("✅ DeepFace Facenet model loaded and ready for inference!")
    except Exception as e:
        MODEL_READY = False
        DEEPFACE_ERROR = str(e)
        logger.error(f"CRITICAL: Failed to initialize face recognition model: {DEEPFACE_ERROR}")
        logger.error("Face scanning features will be disabled until this service is restarted correctly.")

def init_background():
    """Start model caching in a background thread."""
    global DEEPFACE_ERROR
    DEEPFACE_ERROR = "Model is still initializing in the background. Please wait ~15 seconds..."
    thread = threading.Thread(target=__init_model_background, daemon=True)
    thread.start()

def is_model_ready():
    """Returns True if the ML model is successfully loaded in memory."""
    return MODEL_READY, DEEPFACE_ERROR

def get_embedding(img):
    if not MODEL_READY:
        return None, f"Face service is currently down (Init Error: {DEEPFACE_ERROR})"

    try:
        # Handle Base64 string
        if isinstance(img, str):
            if img.startswith("data:image"):
                img = img.split(",")[1]
            
            # Decode base64 string to numpy array
            logger.debug(f"Processing base64 string length: {len(img)}")
            img_bytes = base64.b64decode(img)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.error("cv2.imdecode returned None. Invalid image data provided.")
                return None, "Failed to decode image"

        if img is None:
            return None, "Failed to decode image"

        # Use Facenet model (reliable) with opencv detector (fast)
        result = DeepFace.represent(
            img_path=img,
            model_name="Facenet",
            detector_backend="opencv", 
            enforce_detection=False 
        )
        
        if not result:
             return None, "No face detected in the provided image."
             
        return result[0]["embedding"], None
    except Exception as e:
        logger.error(f"Error during face embedding generation: {str(e)}")
        return None, f"Embedding generation failed: {str(e)}"


def verify_embeddings(stored, live, threshold=0.40):
    stored = np.array(stored)
    live = np.array(live)
    
    # Cosine Distance = 1 - Cosine Similarity
    # Robust for face recognition (ignores lighting magnitude differences)
    dot = np.dot(stored, live)
    norm_stored = np.linalg.norm(stored)
    norm_live = np.linalg.norm(live)
    cosine_similarity = dot / (norm_stored * norm_live)
    distance = 1 - cosine_similarity
    
    confidence = max(0, (1 - distance / threshold) * 100)
    logger.info(f"Face Verification - Distance: {distance:.4f}, Threshold: {threshold}, Confidence: {confidence:.1f}%, Match: {distance < threshold}")
    
    # Threshold for Facenet + Cosine:
    # - 0.40 is the standard recommended threshold for Facenet with cosine distance
    # - Provides good balance between security and usability with webcam-quality images
    # - Lower = more strict (may reject valid users under poor lighting/angles)
    # - Higher = more lenient (may accept different faces)
    return bool(distance < threshold)
