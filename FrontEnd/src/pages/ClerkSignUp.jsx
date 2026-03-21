import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { useSignUp } from "@clerk/clerk-react";
import BackButton from "../components/BackButton";

export default function ClerkSignUp() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const navigate = useNavigate();

    const [pendingVerification, setPendingVerification] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        code: "" // OTP Code for email verification
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Step 1: Handle initial signup with email and password
    async function handleSignup(e) {
        e.preventDefault();

        if (!isLoaded) return;

        setError("");
        setIsLoading(true);

        try {
            // Create user in Clerk
            await signUp.create({
                emailAddress: formData.email,
                password: formData.password,
            });

            // Start the verification process by sending an email code
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            // Switch to verification UI
            setPendingVerification(true);
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.errors?.[0]?.message || "Signup failed. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Step 2: Verify the email address using the OTP code
    async function onPressVerify(e) {
        e.preventDefault();

        if (!isLoaded) return;

        setError("");
        setIsLoading(true);

        try {
            // Submit the code
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: formData.code,
            });

            if (completeSignUp.status !== 'complete') {
                // Investigate the response to see if there's an error
                // or if extra steps are needed
                console.log(JSON.stringify(completeSignUp, null, 2));
                setError("Verification incomplete. Please check the console.");
                setIsLoading(false);
                return;
            }

            // If complete, set the active session
            await setActive({ session: completeSignUp.createdSessionId });

            // Redirect to home page
            navigate("/student/home");

        } catch (err) {
            console.error("Verification error:", err);
            setError(err.errors?.[0]?.message || "Verification failed. Check your code.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={styles.container} className="page-container">
            <BackButton to="/" />
            <div style={styles.card} className="card-mobile modal-mobile">
                <div style={styles.header} className="header-mobile">
                    <h1 style={styles.title} className="title-mobile">🎓 Create Account</h1>
                    <p style={styles.subtitle}>
                        {pendingVerification
                            ? "We've sent a verification code to your email."
                            : "Register a new student account"}
                    </p>
                </div>

                {error && <div style={styles.errorBanner}>{error}</div>}

                {!pendingVerification ? (
                    // SIGNUP FORM
                    <form onSubmit={handleSignup} style={styles.form}>
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
                            <label style={styles.label}>Create Password</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={20} color="#9ca3af" style={styles.icon} />
                                <input
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading || !isLoaded} style={styles.button} className="btn-mobile">
                            {isLoading ? "Processing..." : "Continue"}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                ) : (
                    // VERIFICATION FORM
                    <form onSubmit={onPressVerify} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Verification Code</label>
                            <div style={styles.inputWrapper}>
                                <ShieldAlert size={20} color="#9ca3af" style={styles.icon} />
                                <input
                                    type="text"
                                    placeholder="Enter the 6-digit code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading || !isLoaded} style={styles.button} className="btn-mobile">
                            {isLoading ? "Verifying..." : "Verify Email"}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>

                        <div style={styles.footer}>
                            <button type="button" onClick={() => setPendingVerification(false)} style={styles.textBtn}>
                                Wrong email? Go back.
                            </button>
                        </div>
                    </form>
                )}

                <div style={styles.footer}>
                    <p>
                        Already have an account?{" "}
                        <Link to="/clerk-login" style={styles.link}>
                            Login here
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
    errorBanner: {
        background: "#fee2e2",
        color: "#ef4444",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "14px",
        textAlign: "center",
        marginBottom: "20px",
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
        boxSizing: "border-box",
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
    textBtn: {
        background: "none",
        border: "none",
        color: "#0b74de",
        textDecoration: "underline",
        cursor: "pointer",
        fontSize: "13px"
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
