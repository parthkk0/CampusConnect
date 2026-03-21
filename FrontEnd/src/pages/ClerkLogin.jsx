import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight } from "lucide-react";
import { useSignIn } from "@clerk/clerk-react";
import BackButton from "../components/BackButton";

export default function ClerkLogin() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();

        if (!isLoaded) return;

        setError("");
        setIsLoading(true);

        try {
            // Start the sign-in process using the email and password provided
            const result = await signIn.create({
                identifier: formData.email,
                password: formData.password,
            });

            if (result.status === "complete") {
                // If complete, set the active session
                console.log("Login successful");
                await setActive({ session: result.createdSessionId });
                navigate("/student/home");
            } else {
                // This indicates that further steps like MFA might be required
                console.log("Sign in result requiring more steps:", result);
                setError("Additional steps required (like MFA). This UI doesn't support them yet.");
            }
        } catch (err) {
            console.error(err);
            setError(err.errors?.[0]?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={styles.container} className="page-container">
            <BackButton to="/" />
            <div style={styles.card} className="card-mobile">
                <div style={styles.header} className="header-mobile">
                    <h1 style={styles.title} className="title-mobile">Welcome Back</h1>
                    <p style={styles.subtitle}>Login to your account</p>
                </div>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <User size={20} color="#9ca3af" style={styles.icon} />
                            <input
                                type="email"
                                placeholder="e.g. email@college.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={20} color="#9ca3af" style={styles.icon} />
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

                    <button type="submit" disabled={isLoading || !isLoaded} style={styles.button} className="btn-mobile">
                        {isLoading ? "Logging in..." : "Login"}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>

                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        {/* If using clerk forgot password, you would add a distinct flow here */}
                    </div>
                </form>

                <div style={styles.footer}>
                    <p>
                        Don't have an account?{" "}
                        <Link to="/clerk-signup" style={styles.link}>
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
        background: "linear-gradient(rgba(240, 244, 248, 0.95), rgba(217, 226, 236, 0.98)), url('/college-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
    },
    card: {
        background: "white",
        width: "100%",
        maxWidth: "400px",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        padding: "40px",
    },
    header: {
        textAlign: "center",
        marginBottom: "30px",
    },
    title: {
        fontSize: "26px",
        fontWeight: "800",
        color: "#1f2937",
        margin: "0 0 8px 0",
    },
    subtitle: {
        color: "#6b7280",
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
        color: "#374151",
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
    },
    input: {
        width: "100%",
        padding: "12px 12px 12px 40px",
        borderRadius: "8px",
        border: "2px solid #e5e7eb",
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
        background: "#0b74de",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background 0.2s",
        marginTop: "10px",
    },
    error: {
        background: "#fee2e2",
        color: "#ef4444",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "14px",
        textAlign: "center",
    },
    footer: {
        marginTop: "30px",
        textAlign: "center",
        fontSize: "14px",
        color: "#6b7280",
    },
    link: {
        color: "#0b74de",
        fontWeight: "600",
        textDecoration: "none",
    },
    backLink: {
        display: "block",
        marginTop: "15px",
        color: "#9ca3af",
        textDecoration: "none",
        fontSize: "13px",
    },
};
