import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import BackButton from "../components/BackButton";

const BACKEND_URL = `http://${window.location.hostname}:5000/api`;

export default function StudentLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ roll: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/students/login`, formData);

            if (response.data.success) {
                // Save session
                localStorage.setItem("studentUser", JSON.stringify(response.data.student));
                navigate("/student/home");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={styles.container} className="page-container">
            <BackButton to="/" />
            <div style={styles.card} className="card-mobile glass-panel animate-slide-up">
                <div style={styles.header} className="header-mobile">
                    <h1 style={styles.title} className="title-mobile">Welcome Back</h1>
                    <p style={styles.subtitle}>Login to your student account</p>
                </div>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Roll Number</label>
                        <div style={styles.inputWrapper}>
                            <User size={20} color="rgba(255, 255, 255, 0.5)" style={styles.icon} />
                            <input
                                type="text"
                                placeholder="e.g. 22IT001"
                                value={formData.roll}
                                onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={20} color="rgba(255, 255, 255, 0.5)" style={styles.icon} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" disabled={isLoading} style={styles.button} className="btn-mobile hover-lift">
                        {isLoading ? "Logging in..." : "Login"}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>

                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <Link to="/student/forgot-password" style={{ fontSize: '13px', color: '#93c5fd', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>
                </form>

                <div style={styles.footer}>
                    <p>
                        Don't have an account?{" "}
                        <Link to="/signup" style={styles.link}>
                            Register here
                        </Link>
                    </p>
                    <Link to="/" style={styles.backLink}>← Back to Home</Link>
                </div>
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
        fontFamily: "'Inter', sans-serif",
        padding: "20px",
    },
    card: {
        width: "100%",
        maxWidth: "400px",
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
        fontSize: "26px",
        fontWeight: "800",
        background: "linear-gradient(to right, #ffffff, #93c5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        margin: "0 0 8px 0",
    },
    subtitle: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: "15px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.9)",
    },
    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    icon: {
        position: "absolute",
        left: "12px",
        zIndex: 1,
        color: "rgba(255, 255, 255, 0.5)",
    },
    input: {
        width: "100%",
        padding: "12px 12px 12px 40px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "#ffffff",
        fontSize: "15px",
        transition: "border-color 0.2s",
        outline: "none",
        boxSizing: "border-box", // Fix input overflow
    },
    button: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "14px",
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        marginTop: "10px",
    },
    error: {
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "#fca5a5",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "14px",
        textAlign: "center",
    },
    footer: {
        marginTop: "30px",
        textAlign: "center",
        fontSize: "14px",
        color: "rgba(255, 255, 255, 0.6)",
    },
    link: {
        color: "#93c5fd",
        fontWeight: "600",
        textDecoration: "none",
        transition: "color 0.2s"
    },
    backLink: {
        display: "block",
        marginTop: "15px",
        color: "rgba(255, 255, 255, 0.5)",
        textDecoration: "none",
        fontSize: "13px",
        transition: "color 0.2s"
    },
};
