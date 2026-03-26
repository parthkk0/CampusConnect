import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { BACKEND_URL } from "../config";

export default function RegisterFace() {
    const videoRef = useRef(null);
    const navigate = useNavigate();

    // User State
    const [user, setUser] = useState(null);

    // Camera State
    const [stream, setStream] = useState(null);
    const [faceImage, setFaceImage] = useState(null);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("studentUser");
        if (stored) {
            setUser(JSON.parse(stored));
        } else {
            navigate("/student/login");
        }

        // Cleanup stream on unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Start Camera
    async function startCamera() {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStatus({ type: "info", message: "Position your face clearly in the frame." });
        } catch (err) {
            setStatus({ type: "error", message: "Camera access denied." });
        }
    }

    // Capture Photo
    function capturePhoto() {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0);
        const data = canvas.toDataURL("image/jpeg", 0.9);
        setFaceImage(data);
        setStatus({ type: "info", message: "Photo captured. Submit to register." });
    }

    // Retake
    function retakePhoto() {
        setFaceImage(null);
        startCamera();
    }

    // Submit Registration
    async function handleRegister() {
        if (!faceImage || !user) return;

        setIsLoading(true);
        setStatus({ type: "info", message: "Registering face..." });

        try {
            const res = await axios.post(`${BACKEND_URL}/face/register`, {
                studentId: user.roll,
                image: faceImage
            });

            if (res.data.success) {
                // Save the captured face image as profile picture in localStorage
                const stored = JSON.parse(localStorage.getItem("studentUser"));
                if (stored) {
                    stored.photoUrl = res.data.photoUrl || faceImage;
                    localStorage.setItem("studentUser", JSON.stringify(stored));
                }
                setStatus({ type: "success", message: "✅ Face Registered Successfully!" });
                setTimeout(() => navigate("/student/home"), 2000);
            }
        } catch (err) {
            console.error("Registration Error:", err);
            const msg = err.response?.data?.error || "Registration failed.";
            setStatus({ type: "error", message: msg });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <BackButton to="/student/home" />
            <div style={styles.card}>
                <h1 style={styles.title}>📸 Register Face</h1>
                <p style={styles.subtitle}>
                    Use this to update or re-register your face data.
                </p>

                {status.message && (
                    <div style={{ ...styles.statusBanner, ...styles[status.type] }}>
                        {status.message}
                    </div>
                )}

                <div style={styles.videoWrapper}>
                    {!faceImage ? (
                        stream ? (
                            <video ref={videoRef} autoPlay playsInline style={styles.video} />
                        ) : (
                            <div style={styles.placeholder}>
                                <button onClick={startCamera} style={styles.btn}>Start Camera</button>
                            </div>
                        )
                    ) : (
                        <img src={faceImage} alt="Face Preview" style={styles.video} />
                    )}
                </div>

                <div style={styles.actionRow}>
                    {!faceImage && stream && (
                        <button onClick={capturePhoto} style={styles.btnPrimary}>Capture Photo</button>
                    )}
                    {faceImage && (
                        <>
                            <button onClick={retakePhoto} style={styles.btnSecondary}>Retake</button>
                            <button onClick={handleRegister} disabled={isLoading} style={styles.btnPrimary}>
                                {isLoading ? "Registering..." : "Submit Registration"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Inter, sans-serif"
    },
    card: {
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "500px",
        textAlign: "center"
    },
    title: { margin: "0 0 10px 0", color: "#333" },
    subtitle: { color: "#666", marginBottom: "20px" },
    statusBanner: { padding: "10px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
    error: { background: "#ffebee", color: "#c62828" },
    success: { background: "#e8f5e9", color: "#2e7d32" },
    info: { background: "#e3f2fd", color: "#1565c0" },
    videoWrapper: {
        width: "100%",
        height: "300px",
        background: "#000",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    video: { width: "100%", height: "100%", objectFit: "cover" },
    placeholder: { display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" },
    actionRow: { display: "flex", gap: "10px", justifyContent: "center" },
    btn: {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        background: "#0b74de",
        color: "white",
        cursor: "pointer",
        fontWeight: "600"
    },
    btnPrimary: {
        padding: "12px 24px",
        borderRadius: "8px",
        border: "none",
        background: "#0b74de",
        color: "white",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px"
    },
    btnSecondary: {
        padding: "12px 24px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        background: "white",
        color: "#333",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px"
    }
};
