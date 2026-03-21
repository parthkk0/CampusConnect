import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = `http://${window.location.hostname}:5000/api`;

export default function FaceVerify({ studentId, onVerified, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("Initializing camera...");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Stop camera function
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  // Auto start camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("Camera ready - Position your face in the frame");
      } catch (err) {
        setStatus("❌ Camera permission denied");
        if (onError) onError("Camera permission denied");
      }
    }

    if (!isVerified) {
      startCamera();
    }

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [onError, isVerified]);

  // Capture image from video
  function captureImage() {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("Camera not ready. Please wait.");
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.95);
  }

  // Verify face against stored embedding
  async function verifyFace() {
    if (!studentId) {
      setStatus("❌ Student ID is required");
      return;
    }

    setIsLoading(true);
    setStatus("Verifying face...");

    try {
      const liveImage = captureImage();

      const response = await axios.post(`${BACKEND_URL}/face/verify`, {
        studentId,
        liveImage,
      });

      if (response.data.success && response.data.matched) {
        setStatus(`✅ Face verified successfully!`);
        setIsVerified(true);

        // Stop camera immediately after successful verification
        stopCamera();

        if (onVerified) {
          onVerified(response.data.student);
        }
      } else {
        setStatus("❌ Face verification failed - Face does not match");
        if (onError) onError("Face verification failed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setStatus(`❌ ${errorMsg}`);
      if (onError) onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {!isVerified && (
        <>
          <div style={styles.cameraContainer}>
            <video ref={videoRef} style={styles.video} muted autoPlay playsInline />
            <div style={styles.overlay}>
              <div style={styles.faceBorder}></div>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div style={styles.instructions}>
            📸 Position your face in the frame with good lighting
          </div>

          <button
            onClick={verifyFace}
            disabled={isLoading}
            style={isLoading ? styles.buttonDisabled : styles.button}
            className="btn-mobile"
          >
            {isLoading ? "Verifying..." : "Verify Face"}
          </button>
        </>
      )}

      {isVerified && (
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✅</div>
          <div style={styles.successText}>Face Verified!</div>
        </div>
      )}

      <div style={styles.status}>{status}</div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
  },
  cameraContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 12,
  },
  video: {
    width: "100%",
    borderRadius: 8,
    background: "#000",
    display: "block",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  faceBorder: {
    width: "60%",
    height: "75%",
    border: "3px solid rgba(11, 116, 222, 0.6)",
    borderRadius: 8,
  },
  instructions: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    padding: "8px 12px",
    background: "#f0f7ff",
    borderRadius: 6,
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 14,
    background: "#0b74de",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    width: "100%",
    padding: 14,
    background: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: 6,
    cursor: "not-allowed",
    fontSize: 16,
    fontWeight: "600",
  },
  status: {
    marginTop: 15,
    padding: 10,
    background: "#f8f9fa",
    borderRadius: 6,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },
  successContainer: {
    textAlign: "center",
    padding: 30,
    background: "#d4edda",
    borderRadius: 12,
    marginBottom: 15,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  successText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#155724",
  },
};
