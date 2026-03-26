import logging
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from face_utils import get_embedding, verify_embeddings, is_model_ready, init_background

# Configure basic logging for all modules
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', force=True)
logger = logging.getLogger('FlaskApp')
# Ensure FaceUtils log level is also INFO
logging.getLogger('FaceUtils').setLevel(logging.INFO)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Increase max content length to 50MB for base64 images
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

@app.before_request
def log_request_info():
    logger.info(f"Received {request.method} request to {request.path}")

# Global error handler - prevents crashes from unhandled exceptions
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(traceback.format_exc())
    return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.errorhandler(413)
def handle_large_payload(e):
    return jsonify({"error": "Image too large. Please use a smaller image."}), 413

# Legacy endpoints (kept for backward compatibility)
@app.route("/face/embedding", methods=["POST"])
def create_embedding():
    try:
        ready, err = is_model_ready()
        if not ready:
            return jsonify({"error": f"Service temporarily unavailable: {err}"}), 503

        img = request.json.get("image")
        embedding, error = get_embedding(img)
        if error:
            return jsonify({"error": error}), 400

        return jsonify({"embedding": embedding})
    except Exception as e:
        logger.error(f"Error in /face/embedding: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Embedding failed: {str(e)}"}), 500


@app.route("/face/verify", methods=["POST"])
def verify_face():
    try:
        ready, err = is_model_ready()
        if not ready:
            return jsonify({"error": f"Service temporarily unavailable: {err}"}), 503

        stored = request.json.get("storedEmbedding")
        live = request.json.get("liveEmbedding")

        if not stored or not live:
            return jsonify({"error": "Missing embeddings"}), 400

        match = verify_embeddings(stored, live)
        return jsonify({"match": match})
    except Exception as e:
        logger.error(f"Error in /face/verify: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Verification failed: {str(e)}"}), 500


# REGISTRATION endpoint
@app.route("/register-face", methods=["POST"])
def register_face():
    """
    Register a face by generating its embedding.
    Expected: { "userId": "student_id", "image": "base64_image" }
    Returns: { "embedding": [...], "userId": "student_id" }
    """
    try:
        ready, err = is_model_ready()
        if not ready:
            return jsonify({"error": f"Face scanning is offline. Please contact admin. ({err})"}), 503

        user_id = request.json.get("userId")
        image = request.json.get("image")

        if not user_id or not image:
            return jsonify({"error": "Missing userId or image"}), 400

        embedding, error = get_embedding(image)
        if error:
            return jsonify({"error": error}), 400

        logger.info(f"Successfully generated embedding for user: {user_id}")
        return jsonify({
            "success": True,
            "userId": user_id,
            "embedding": embedding,
            "message": f"Face registered successfully for {user_id}"
        })

    except Exception as e:
        logger.error(f"Error in /register-face for user {request.json.get('userId', 'unknown')}: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error during registration", "details": str(e)}), 500


# VERIFICATION endpoint
@app.route("/verify-face", methods=["POST"])
def verify_face_with_stored():
    """
    Verify a live face against a stored embedding.
    Expected: { "storedEmbedding": [...], "liveImage": "base64_image" }
    Returns: { "matched": true/false, "confidence": float }
    """
    try:
        ready, err = is_model_ready()
        if not ready:
            return jsonify({"error": f"Face scanning is offline. Please contact admin. ({err})"}), 503

        stored_embedding = request.json.get("storedEmbedding")
        live_image = request.json.get("liveImage")
        student_id = request.json.get("studentId", "unknown")

        if not stored_embedding or not live_image:
            return jsonify({"error": "Missing storedEmbedding or liveImage"}), 400

        # Generate 128-d embedding from live image
        live_embedding, error = get_embedding(live_image)
        if error:
            logger.warning(f"FACE_VERIFY | user_id={student_id} | result=REJECT | reason=EMBEDDING_FAILED | error={error}")
            return jsonify({"error": error}), 400

        # Compare ONLY with this student's stored encoding — cross-user comparison is impossible by design
        matched, distance = verify_embeddings(stored_embedding, live_embedding, user_id=student_id)
        
        logger.info(f"Face verification attempt: {'SUCCESS' if matched else 'FAILED'} | student_id={student_id}")
        return jsonify({
            "success": True,
            "matched": matched,
            "match_score": round(float(distance), 4),
            "message": "Face verified successfully" if matched else "Face verification failed - face does not match"
        })

    except Exception as e:
        logger.error(f"Error in /verify-face: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error during verification", "details": str(e)}), 500


# HEALTH CHECK endpoints
@app.route("/health", methods=["GET"])
def health_check():
    """Basic health check to ensure the Flask API is responding."""
    return jsonify({"status": "healthy", "service": "Face Recognition API"})

@app.route("/face-status", methods=["GET"])
def face_status():
    """Detailed health check to verify if the ML models actually loaded."""
    ready, error = is_model_ready()
    return jsonify({
        "status": "ready" if ready else "degraded",
        "model_loaded": ready,
        "error": error
    }), 200 if ready else 503


import os

if __name__ == "__main__":
    logger.info("Starting FaceService...")
    
    # Start ML load in background so Waitress doesn't block the frontend from getting a 503 retry signal
    init_background()

    # Start the server using Waitress for production readiness on Windows
    # Avoids threading and WSGI issues associated with running standard Flask server
    from waitress import serve
    port = int(os.environ.get("PORT", 7860))
    logger.info(f"Server listening on http://0.0.0.0:{port}")
    serve(app, host="0.0.0.0", port=port, threads=4)
