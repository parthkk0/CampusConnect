import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { BACKEND_URL } from "../config";

export default function SignupPage() {
    const videoRef = useRef(null);
    const [step, setStep] = useState(1); // 1: Verify Roll, 2: Capture Face & Signup
    const [formData, setFormData] = useState({
        roll: "",
        name: "",
        email: "",
        course: "",
        year: "",
    });

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" }); // type: error, success, info
    const [cameraActive, setCameraActive] = useState(false);
    const [faceImage, setFaceImage] = useState(null);

    // Verify Roll Number
    async function verifyRoll(e) {
        e.preventDefault();
        if (!formData.roll) return setStatus({ type: "error", message: "Please enter your Roll Number" });

        setIsLoading(true);
        setStatus({ type: "info", message: "Verifying roll number..." });

        try {
            const res = await axios.post(`${BACKEND_URL}/students/validate-roll`, { roll: formData.roll });
            if (res.data.success) {
                setFormData(prev => ({ ...prev, ...res.data.student }));
                setStep(2);
                setStatus({ type: "success", message: "✅ Roll number verified! Please complete registration." });
            }
        } catch (err) {
            console.error("Verification Error:", err);
            const errMsg = err.response?.data?.error || (err.message === "Network Error" ? "Backend unreachable. Check CORS/Server status." : "Roll number verification failed");
            setStatus({ type: "error", message: errMsg });
        } finally {
            setIsLoading(false);
        }
    }

    // Camera Functions
    useEffect(() => {
        let stream = null;

        async function initCamera() {
            if (cameraActive && !faceImage) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play().catch(e => console.error("Play error:", e));
                        };
                        setStatus({ type: "info", message: "Camera active. Please position your face." });
                    }
                } catch (err) {
                    console.error("Camera Error:", err);
                    setStatus({ type: "error", message: "Camera access denied. Please allow permissions." });
                    setCameraActive(false);
                }
            }
        }

        if (cameraActive) {
            initCamera();
        }

        // Cleanup
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraActive, faceImage]);

    function startCamera() {
        setCameraActive(true);
    }

    function capturePhoto() {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        // Use video dimensions
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const data = canvas.toDataURL("image/jpeg", 0.9);
        setFaceImage(data);

        // Stop Camera
        const stream = videoRef.current.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setCameraActive(false);
        setStatus({ type: "success", message: "Photo captured! You can now register." });
    }

    function retakePhoto() {
        setFaceImage(null);
        startCamera();
    }

    // Final Signup
    async function handleSignup() {
        if (!formData.password) return setStatus({ type: "error", message: "Please create a password" });
        if (!faceImage) return setStatus({ type: "error", message: "Please capture your face first" });

        setIsLoading(true);
        setStatus({ type: "info", message: "⏳ Registering... processing face data..." });

        try {
            const res = await axios.post(`${BACKEND_URL}/students/signup`, {
                ...formData,
                faceImage
            });

            if (res.data.success) {
                // Save session
                localStorage.setItem("studentUser", JSON.stringify(res.data.student));

                setStatus({ type: "success", message: "🎉 Registration Successful! Redirecting to Home..." });
                setTimeout(() => window.location.href = "/student/home", 2000);
            }
        } catch (err) {
            console.error("Signup Error:", err);
            setStatus({ type: "error", message: err.response?.data?.error || "Registration failed. Try again." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={styles.container} className="page-container">
            <BackButton to="/" />
            <div style={styles.card} className="card-mobile modal-mobile glass-panel animate-slide-up">
                <h1 style={styles.title} className="title-mobile">🎓 Student Registration</h1>

                {/* Status Message Banner */}
                {status.message && (
                    <div style={{ ...styles.statusBanner, ...styles[status.type] }}>
                        {status.message}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={verifyRoll} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Roll Number</label>
                            <input
                                type="text"
                                value={formData.roll}
                                onChange={e => setFormData({ ...formData, roll: e.target.value })}
                                placeholder="e.g. 22IT001"
                                style={styles.input}
                                autoFocus
                            />
                            <small style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: '5px', display: 'block' }}>
                                Note: Only students pre-registered by admin can signup.
                            </small>
                        </div>
                        <button type="submit" disabled={isLoading} style={styles.button} className="btn-mobile">
                            {isLoading ? "Verifying..." : "Verify & Continue"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div style={styles.stepContainer}>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={styles.input}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div style={styles.infoGrid} className="grid-mobile">
                            {/* Removed Name from here */}
                            <InfoField label="Email" value={formData.email} />
                            <InfoField label="Course" value={formData.course} />
                            <InfoField label="Year" value={formData.year} />
                            <InfoField label="Fee" value={`₹${formData.courseFee || 0}`} />
                        </div>

                        {/* Password Input */}
                        <div style={{ marginBottom: "25px" }}>
                            <label style={styles.label}>Set Password</label>
                            <input
                                type="password"
                                placeholder="Create a strong password"
                                value={formData.password || ""}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.cameraSection}>
                            <h3 style={styles.subTitle}>📸 Face Registration</h3>

                            {!faceImage ? (
                                <div style={styles.videoWrapper}>
                                    {cameraActive ? (
                                        <video ref={videoRef} autoPlay playsInline style={styles.video} />
                                    ) : (
                                        <div style={styles.placeholder}>
                                            <button onClick={startCamera} style={styles.secondaryBtn}>Start Camera</button>
                                        </div>
                                    )}
                                    {cameraActive && (
                                        <button onClick={capturePhoto} style={styles.captureBtn}>Capture</button>
                                    )}
                                </div>
                            ) : (
                                <div style={styles.previewWrapper}>
                                    <img src={faceImage} alt="Face Preview" style={styles.previewParams} />
                                    <button onClick={retakePhoto} style={styles.textBtn}>Retake Photo</button>
                                </div>
                            )}
                        </div>

                        <div style={styles.actionRow} className="form-row-mobile">
                            <button onClick={() => setStep(1)} style={styles.backBtn} className="btn-mobile">Back</button>
                            <button onClick={handleSignup} disabled={isLoading || !faceImage} style={{ ...styles.button, opacity: (!faceImage || isLoading) ? 0.7 : 1 }} className="btn-mobile">
                                {isLoading ? "Registering..." : "Complete Registration"}
                            </button>
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                            Current Status: {isLoading ? "Processing..." : "Ready"}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

const InfoField = ({ label, value }) => (
    <div style={styles.infoField}>
        <span style={styles.infoLabel}>{label}</span>
        <span style={styles.infoValue}>{value}</span>
    </div>
);

const styles = {
    container: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Inter', sans-serif"
    },
    card: {
        width: "100%",
        maxWidth: "500px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
        textAlign: "left"
    },
    title: {
        margin: "0 0 20px",
        fontSize: "24px",
        fontWeight: "800",
        background: "linear-gradient(to right, #ffffff, #93c5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textAlign: "center"
    },
    subTitle: {
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "15px",
        textAlign: "center",
        color: "rgba(255, 255, 255, 0.9)"
    },
    statusBanner: {
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "20px",
        fontSize: "14px",
        textAlign: "center",
        fontWeight: "500"
    },
    error: { background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5" },
    success: { background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#6ee7b7" },
    info: { background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#93c5fd" },

    inputGroup: { marginBottom: "20px" },
    label: { display: "block", marginBottom: "8px", fontWeight: "600", color: "rgba(255, 255, 255, 0.8)" },
    input: {
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "#ffffff",
        fontSize: "16px",
        transition: "border-color 0.2s",
        outline: "none",
        boxSizing: 'border-box'
    },
    button: {
        width: "100%",
        padding: "14px",
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s"
    },
    infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" },
    infoField: { display: "flex", flexDirection: "column" },
    infoLabel: { fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", fontWeight: "bold", textTransform: "uppercase" },
    infoValue: { fontSize: "15px", color: "#ffffff", fontWeight: "500" },

    cameraSection: { marginBottom: "25px", textAlign: "center" },
    videoWrapper: {
        position: "relative",
        width: "100%",
        height: "300px",
        background: "rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    video: { width: "100%", height: "100%", objectFit: "cover" },
    placeholder: { color: "rgba(255, 255, 255, 0.6)" },
    captureBtn: {
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 24px",
        background: "rgba(255, 255, 255, 0.9)",
        color: "#0F172A",
        border: "none",
        borderRadius: "30px",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
    },
    secondaryBtn: {
        padding: "10px 20px",
        background: "rgba(255,255,255,0.1)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500"
    },
    previewWrapper: { textAlign: "center" },
    previewParams: {
        width: "100%",
        height: "300px",
        objectFit: "cover",
        borderRadius: "12px",
        marginBottom: "10px",
        border: "1px solid rgba(255,255,255,0.1)"
    },
    textBtn: {
        background: "none",
        border: "none",
        color: "#93c5fd",
        textDecoration: "underline",
        cursor: "pointer"
    },
    actionRow: { display: "flex", gap: "10px" },
    backBtn: {
        padding: "14px",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.8)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer"
    }
};
