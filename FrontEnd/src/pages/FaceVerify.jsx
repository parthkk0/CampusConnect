import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export default function FaceVerify({ studentId, onVerified, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isInitializingRef = useRef(false);

  const [status, setStatus] = useState("Initializing camera...");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  function stopCamera() {
    isInitializingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => {
    async function startCamera() {
      if (streamRef.current || isInitializingRef.current) return;
      isInitializingRef.current = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false,
        });
        if (isVerified || !isInitializingRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); }
          catch (e) { if (e.name !== "AbortError") throw e; }
        }
        setStatus("📸 Position your face clearly in the frame, then click Verify.");
      } catch (err) {
        const msg = err.name === "NotAllowedError"
          ? "❌ Camera permission denied."
          : `❌ Camera error: ${err.message}`;
        setStatus(msg);
        if (onError) onError(msg);
      } finally {
        isInitializingRef.current = false;
      }
    }
    if (!isVerified) startCamera();
    return () => stopCamera();
  }, [onError, isVerified]);

  function captureImage() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) throw new Error("Camera not ready. Please wait.");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.95);
  }

  async function verifyFace() {
    if (!studentId) { setStatus("❌ Student ID is required."); return; }
    setIsLoading(true);
    setStatus("Verifying face...");
    try {
      const liveImage = captureImage();
      const response = await axios.post(`${BACKEND_URL}/face/verify`, { studentId, liveImage });
      if (response.data.success && response.data.matched) {
        const score = response.data.match_score != null ? ` (score: ${response.data.match_score})` : "";
        setStatus(`✅ Face verified!${score}`);
        setIsVerified(true);
        stopCamera();
        if (onVerified) onVerified(response.data.student);
      } else {
        const score = response.data.match_score != null ? ` (distance: ${response.data.match_score})` : "";
        setStatus(`❌ Face does not match${score}. Please try again.`);
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
              <div style={styles.faceBorder} />
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div style={styles.instructions}>{status}</div>

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
    </div>
  );
}

const styles = {
  container: { width: "100%", maxWidth: 420, margin: "0 auto" },
  cameraContainer: { position: "relative", width: "100%", marginBottom: 12 },
  video: { width: "100%", borderRadius: 8, background: "#000", display: "block" },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center",
  },
  faceBorder: {
    width: "60%", height: "75%",
    border: "3px solid rgba(11, 116, 222, 0.6)", borderRadius: 8,
  },
  instructions: {
    fontSize: 13, color: "#fff", marginBottom: 12,
    padding: "8px 12px", background: "rgba(255,255,255,0.08)",
    borderRadius: 6, textAlign: "center",
  },
  button: {
    width: "100%", padding: 14,
    background: "linear-gradient(135deg, #0b74de, #2563EB)",
    color: "#fff", border: "none", borderRadius: 6,
    cursor: "pointer", fontSize: 16, fontWeight: "600",
  },
  buttonDisabled: {
    width: "100%", padding: 14,
    background: "#ccc", color: "#666",
    border: "none", borderRadius: 6, cursor: "not-allowed",
    fontSize: 16, fontWeight: "600",
  },
  successContainer: {
    textAlign: "center", padding: 30,
    background: "rgba(16, 185, 129, 0.1)", borderRadius: 12, marginBottom: 15,
    border: "1px solid rgba(16, 185, 129, 0.3)",
  },
  successIcon: { fontSize: 48, marginBottom: 10 },
  successText: { fontSize: 20, fontWeight: "bold", color: "#6ee7b7" },
};
