import os
import cv2
import base64
import numpy as np
import logging
import threading
import shutil
from datetime import datetime

logger = logging.getLogger('FaceUtils')

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

MODEL_READY = False
DEEPFACE_ERROR = None

try:
    logger.info("Importing DeepFace...")
    from deepface import DeepFace
except Exception as e:
    MODEL_READY = False
    DEEPFACE_ERROR = str(e)
    logger.error(f"CRITICAL: Failed to import deepface: {DEEPFACE_ERROR}")
    DeepFace = None


# ---------------------------------------------------------------------------
# Model warm-up
# ---------------------------------------------------------------------------

def __init_model_background():
    global MODEL_READY, DEEPFACE_ERROR
    try:
        if DeepFace is None:
            raise ImportError("DeepFace not available.")

        # --- FIX: Bundled Weights (Avoid 404 from broken download URL) ---
        home = os.path.expanduser("~")
        weights_dir = os.path.join(home, ".deepface", "weights")
        weights_path = os.path.join(weights_dir, "facenet_weights.h5")
        local_bundled = "facenet_weights.h5"

        if not os.path.exists(weights_path) or os.path.getsize(weights_path) < 1000:
            if os.path.exists(local_bundled):
                logger.info(f"Copying bundled weights to {weights_path}")
                os.makedirs(weights_dir, exist_ok=True)
                shutil.copy(local_bundled, weights_path)
            else:
                logger.warning("No bundled weights found and remote download might fail.")
        
        dummy = np.zeros((100, 100, 3), dtype=np.uint8)
        logger.info("Warming up model... (~15s)")
        _ = DeepFace.represent(
            img_path=dummy,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=False
        )
        MODEL_READY = True
        DEEPFACE_ERROR = None
        logger.info("✅ Facenet model ready for inference!")
    except Exception as e:
        MODEL_READY = False
        DEEPFACE_ERROR = str(e)
        logger.error(f"CRITICAL: Model init failed: {DEEPFACE_ERROR}")


def init_background():
    global DEEPFACE_ERROR
    DEEPFACE_ERROR = "Model is initializing. Please wait ~15 seconds..."
    thread = threading.Thread(target=__init_model_background, daemon=True)
    thread.start()


def is_model_ready():
    return MODEL_READY, DEEPFACE_ERROR


# ---------------------------------------------------------------------------
# Image Decode
# ---------------------------------------------------------------------------

def _decode_to_bgr(img_data):
    """Decode base64 or data-URL to BGR numpy array."""
    try:
        if isinstance(img_data, np.ndarray):
            return img_data, None
        if isinstance(img_data, str):
            if img_data.startswith("data:image"):
                img_data = img_data.split(",")[1]
            img_bytes = base64.b64decode(img_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if bgr is None:
                return None, "Failed to decode image – invalid data."
            return bgr, None
        return None, "Unsupported image type."
    except Exception as e:
        return None, f"Image decode error: {str(e)}"


# ---------------------------------------------------------------------------
# Embedding Extraction  (128-d Facenet, enforces EXACTLY one face)
# ---------------------------------------------------------------------------

def get_embedding(img_data):
    """
    Extract a Facenet 128-d face embedding.
    Enforces exactly ONE face in the frame.
    Returns: (embedding_list, error_string)
    """
    if not MODEL_READY:
        return None, f"Face service initializing: {DEEPFACE_ERROR}"
    if DeepFace is None:
        return None, "Face recognition model is not available."

    try:
        bgr, err = _decode_to_bgr(img_data)
        if err:
            return None, err

        # Resize for speed (max 640px wide)
        h, w = bgr.shape[:2]
        if w > 640:
            scale = 640 / w
            bgr = cv2.resize(bgr, (640, int(h * scale)))

        # Convert BGR -> RGB (DeepFace / TF expects RGB)
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

        # Run DeepFace — single pass for detection + embedding
        try:
            results = DeepFace.represent(
                img_path=rgb,
                model_name="Facenet",
                detector_backend="opencv",
                enforce_detection=True
            )
        except ValueError:
            logger.warning("get_embedding: No face detected (enforce_detection=True)")
            return None, "No face detected. Look directly at the camera in good lighting."

        if not results or len(results) == 0:
            return None, "No face detected. Please try again."

        if len(results) > 1:
            logger.warning(f"get_embedding: {len(results)} faces detected — rejecting")
            return None, f"Multiple faces detected ({len(results)}). Only ONE person must be in frame."

        embedding = results[0]["embedding"]
        logger.info(f"get_embedding: Success — {len(embedding)}-d embedding.")
        return embedding, None

    except Exception as e:
        logger.error(f"get_embedding: Unexpected error: {str(e)}")
        return None, f"Face processing failed: {str(e)}"



# ---------------------------------------------------------------------------
# Verification  (cosine distance, threshold 0.45, audit log)
# ---------------------------------------------------------------------------

def verify_embeddings(stored, live, user_id="unknown", threshold=0.60):
    """
    Compare two Facenet embeddings using cosine distance.

    Cosine distance scale:
      0.0  = identical
      ~0.3 = same person
      ~0.6 = different person

    Threshold 0.45 is strict — only high-confidence matches pass.

    Returns: (matched: bool, distance: float)
    """
    try:
        stored_arr = np.array(stored, dtype=np.float64)
        live_arr   = np.array(live,   dtype=np.float64)

        # --- Dimension check ---
        if stored_arr.shape != live_arr.shape:
            logger.error(
                f"FACE_VERIFY | user_id={user_id} | result=REJECT | "
                f"reason=DIMENSION_MISMATCH | stored={stored_arr.shape} | live={live_arr.shape}"
            )
            return False, 1.0

        # --- Zero-vector guard ---
        n_stored = np.linalg.norm(stored_arr)
        n_live   = np.linalg.norm(live_arr)
        if n_stored < 1e-6 or n_live < 1e-6:
            logger.error(f"FACE_VERIFY | user_id={user_id} | result=REJECT | reason=ZERO_EMBEDDING")
            return False, 1.0

        # --- Cosine distance (same math face_recognition.face_distance uses internally) ---
        cosine_sim = np.dot(stored_arr, live_arr) / (n_stored * n_live)
        distance   = float(1.0 - cosine_sim)

        matched    = bool(distance < threshold)
        confidence = max(0.0, (1.0 - distance / threshold) * 100.0) if matched else 0.0

        # --- Structured audit log (every attempt, every user) ---
        logger.info(
            f"FACE_VERIFY | user_id={user_id} | "
            f"distance={distance:.4f} | threshold={threshold} | "
            f"confidence={confidence:.1f}% | "
            f"result={'MATCH' if matched else 'REJECT'} | "
            f"timestamp={datetime.now().isoformat()}"
        )

        return matched, distance

    except Exception as e:
        logger.error(
            f"FACE_VERIFY | user_id={user_id} | result=ERROR | error={str(e)} | "
            f"timestamp={datetime.now().isoformat()}"
        )
        return False, 1.0
