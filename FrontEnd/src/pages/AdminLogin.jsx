import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { BACKEND_URL } from "../config";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/admin/login`, {
                username,
                password,
            });

            if (response.data.success) {
                // Store token in localStorage
                localStorage.setItem("adminToken", response.data.token);
                localStorage.setItem("adminUser", JSON.stringify(response.data.admin));

                // Redirect to dashboard
                navigate("/admin/dashboard");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Login failed";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div style={styles.page} className="page-container animate-fade-in">
            <BackButton to="/" />
            <div style={styles.card} className="card-mobile glass-panel animate-slide-up">
                <div style={styles.header}>
                    <h2 style={styles.title}>🔐 Admin Login</h2>
                    <p style={styles.subtitle}>Campus Connect Administration</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter admin username"
                            style={styles.input}
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            style={styles.input}
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={isLoading ? styles.buttonDisabled : styles.button}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div style={styles.footer}>
                    <a href="/" style={styles.link}>← Back to Student Portal</a>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'Poppins', sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
    },
    header: {
        marginBottom: 30,
        textAlign: "center",
        color: "#fff",
    },
    title: {
        margin: 0,
        fontSize: 28,
        fontWeight: "700",
        background: "linear-gradient(to right, #ffffff, #86efac)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    subtitle: {
        margin: "8px 0 0 0",
        fontSize: 14,
        opacity: 0.8,
        color: "#e2e8f0",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        display: "block",
        marginBottom: 8,
        fontWeight: "500",
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
    },
    input: {
        width: "100%",
        padding: 14,
        fontSize: 15,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        color: "#fff",
        boxSizing: "border-box",
        transition: "border-color 0.3s, box-shadow 0.3s",
        outline: "none",
    },
    error: {
        marginBottom: 20,
        padding: 12,
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.4)",
        borderRadius: 8,
        color: "#fca5a5",
        fontSize: 14,
        textAlign: "center",
    },
    button: {
        width: "100%",
        padding: 14,
        background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        marginTop: 10,
    },
    buttonDisabled: {
        width: "100%",
        padding: 14,
        background: "rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.4)",
        border: "none",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: "600",
        cursor: "not-allowed",
        marginTop: 10,
    },
    footer: {
        marginTop: 25,
        textAlign: "center",
    },
    link: {
        color: "rgba(255,255,255,0.7)",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: "500",
        transition: "color 0.2s",
    },
};
