import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ShieldAlert, ArrowRight } from "lucide-react";
import axios from "axios";
import BackButton from "../components/BackButton";
import { BACKEND_URL } from "../config";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        roll: "",
        email: "",
        newPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");

    async function handleSendOtp(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/students/forgot-password/send-otp`, {
                roll: formData.roll,
                email: formData.email
            });

            if (response.data.success) {
                setSuccess("OTP sent to your registered email!");
                setOtpSent(true);
            }
        } catch (err) {
            console.error("Send OTP Error:", err);
            setError(err.response?.data?.error || "Failed to send OTP.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleReset(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/students/reset-password`, {
                ...formData,
                otp: otp
            });

            if (response.data.success) {
                setSuccess("Password reset successful! Redirecting to login...");
                setTimeout(() => navigate("/student/login"), 2000);
            }
        } catch (err) {
            console.error("Reset Error:", err);
            setError(err.response?.data?.error || "Reset failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={styles.container} className="page-container">
            <BackButton to="/student/login" />
            <div style={styles.card} className="card-mobile glass-panel animate-slide-up">
                <div style={styles.header}>
                    <h1 style={styles.title}>Reset Password</h1>
                    <p style={styles.subtitle}>Verify using your registered email</p>
                </div>

                <form onSubmit={otpSent ? handleReset : handleSendOtp} style={styles.form}>

                    {/* Student Verification */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Identity Verification</h3>
                        <div style={styles.inputGroup}>
                            <User size={18} color="rgba(255, 255, 255, 0.5)" style={styles.icon} />
                            <input
                                type="text"
                                placeholder="Student Roll Number"
                                value={formData.roll}
                                onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                                style={styles.input}
                                disabled={otpSent}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <ShieldAlert size={18} color="rgba(255, 255, 255, 0.5)" style={styles.icon} />
                            <input
                                type="email"
                                placeholder="Registered Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={styles.input}
                                disabled={otpSent}
                                required
                            />
                        </div>
                    </div>

                    {/* New Password & OTP */}
                    {otpSent && (
                        <div style={{ ...styles.section, background: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.3)" }}>
                            <h3 style={{ ...styles.sectionTitle, color: "#93c5fd" }}>Verification & New Password</h3>
                            <div style={styles.inputGroup}>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    style={{ ...styles.input, backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "10px", color: "#fff" }}
                                    required
                                    maxLength={6}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <Lock size={18} color="#93c5fd" style={styles.icon} />
                                <input
                                    type="password"
                                    placeholder="Enter New Password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    style={{ ...styles.input, backgroundColor: "rgba(255, 255, 255, 0.05)", paddingLeft: "38px", color: "#fff" }}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {error && <div style={styles.error}>{error}</div>}
                    {success && <div style={styles.success}>{success}</div>}

                    <button type="submit" disabled={isLoading} style={styles.button} className="btn-mobile">
                        {isLoading ? (otpSent ? "Resetting..." : "Sending OTP...") : (otpSent ? "Reset Password" : "Send OTP")}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <Link to="/student/login" style={styles.backLink}>Cancel & Return to Login</Link>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
    },
    card: {
        width: "100%",
        maxWidth: "420px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
    },
    header: {
        textAlign: "center",
        marginBottom: "30px",
    },
    title: {
        fontSize: "24px",
        fontWeight: "800",
        background: "linear-gradient(to right, #ffffff, #93c5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        margin: "0 0 6px 0",
    },
    subtitle: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: "14px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    section: {
        background: "rgba(255, 255, 255, 0.05)",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    sectionTitle: {
        fontSize: "12px",
        fontWeight: "700",
        textTransform: "uppercase",
        color: "rgba(255, 255, 255, 0.6)",
        marginBottom: "5px"
    },
    inputGroup: {
        position: "relative",
    },
    icon: {
        position: "absolute",
        left: "12px",
        top: "12px",
        zIndex: 1,
    },
    input: {
        width: "100%",
        padding: "10px 10px 10px 38px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "#ffffff",
        fontSize: "14px",
        outline: "none",
        boxSizing: 'border-box'
    },
    button: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "12px",
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        marginTop: "10px"
    },
    error: {
        background: "rgba(239, 68, 68, 0.1)",
        color: "#fca5a5",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        padding: "10px",
        borderRadius: "6px",
        fontSize: "13px",
        textAlign: "center",
    },
    success: {
        background: "rgba(16, 185, 129, 0.1)",
        color: "#6ee7b7",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        padding: "10px",
        borderRadius: "6px",
        fontSize: "13px",
        textAlign: "center",
    },
    backLink: {
        display: "block",
        textAlign: "center",
        marginTop: "20px",
        color: "rgba(255, 255, 255, 0.6)",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: "500",
        transition: "color 0.2s"
    },
};
