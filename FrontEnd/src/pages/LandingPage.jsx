import { Link } from "react-router-dom";
import { UserCircle, ShieldCheck, ChevronRight } from "lucide-react";
import "../index.css"; // Ensure CSS is loaded

export default function LandingPage() {
    return (
        <div style={styles.pageContainer} className="animate-fade-in">
            {/* Blurred background radial gradients */}
            <div style={styles.gradientOrb1}></div>
            <div style={styles.gradientOrb2}></div>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.logoArea}>
                    <ShieldCheck size={28} color="#60A5FA" />
                    <span style={styles.logoText}>Campus Connect</span>
                </div>
                <div style={styles.navLinks}>
                    <Link to="/about" style={styles.navLink}>About</Link>
                    <Link to="/help" style={styles.navLink}>Help</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={styles.heroSection}>
                <h1 style={styles.heroTitle} className="text-gradient">
                    Welcome to Campus Connect
                </h1>
                <p style={styles.heroSubtitle}>
                    Smart. Secure. Seamless Campus Management.
                </p>
                <div style={styles.roleLabel}>
                    Select your role to continue
                </div>

                {/* Role Cards */}
                <div style={styles.cardContainer} className="grid-mobile">
                    {/* Student Card */}
                    <Link
                        to="/student/login"
                        style={styles.glassCard}
                        className="glass-panel glass-card-hover animate-slide-up delay-100"
                    >
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.iconWrapper, ...styles.bgBlue }}>
                                <UserCircle size={32} color="#fff" strokeWidth={1.5} />
                            </div>
                            <div style={styles.cardTitleArea}>
                                <h2 style={styles.cardTitle}>Student</h2>
                                <p style={styles.cardDesc}>Login to access profile, E-ID, and services.</p>
                            </div>
                        </div>



                        <div style={{ ...styles.actionButton, ...styles.bgBlue }} className="hover-lift">
                            Continue <ChevronRight size={18} />
                        </div>
                    </Link>

                    {/* Admin Card */}
                    <Link
                        to="/admin/login"
                        style={styles.glassCard}
                        className="glass-panel glass-card-hover animate-slide-up delay-200"
                    >
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.iconWrapper, ...styles.bgGreen }}>
                                <ShieldCheck size={32} color="#fff" strokeWidth={1.5} />
                            </div>
                            <div style={styles.cardTitleArea}>
                                <h2 style={styles.cardTitle}>Admin</h2>
                                <p style={styles.cardDesc}>Manage students, approvals, and system settings.</p>
                            </div>
                        </div>



                        <div style={{ ...styles.actionButton, ...styles.bgGreen }} className="hover-lift">
                            Continue <ChevronRight size={18} />
                        </div>
                    </Link>
                </div>

                {/* Demo Credentials for Recruiters */}
                <div style={styles.demoSection} className="animate-slide-up delay-300">
                    <div style={styles.demoLabel}>
                        <span style={styles.pulseDot}></span> Demo Access
                    </div>
                    <div style={styles.demoContent}>
                        <div style={styles.demoField}>
                            <span style={styles.demoKey}>Roll No:</span>
                            <span style={styles.demoValue}>1</span>
                        </div>
                        <div style={styles.demoField}>
                            <span style={styles.demoKey}>Password:</span>
                            <span style={styles.demoValue}>User@123</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'Poppins', sans-serif"
    },
    gradientOrb1: {
        position: "absolute",
        top: "-15%",
        left: "-10%",
        width: "50%",
        height: "50%",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0,
        pointerEvents: "none"
    },
    gradientOrb2: {
        position: "absolute",
        bottom: "-20%",
        right: "-10%",
        width: "60%",
        height: "60%",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0,
        pointerEvents: "none"
    },
    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px",
        position: "sticky",
        top: 0,
        background: "transparent",
        zIndex: 10,
    },
    logoArea: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    logoText: {
        fontSize: "20px",
        fontWeight: "700",
        letterSpacing: "-0.5px",
    },
    navLinks: {
        display: "flex",
        gap: "24px",
    },
    navLink: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: "15px",
        fontWeight: "500",
        textDecoration: "none",
        transition: "color 0.2s",
    },
    heroSection: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        zIndex: 1,
        position: "relative",
    },
    heroTitle: {
        fontSize: "clamp(32px, 5vw, 56px)",
        fontWeight: "800",
        marginBottom: "16px",
        textAlign: "center",
        letterSpacing: "-1px",
    },
    heroSubtitle: {
        fontSize: "clamp(16px, 2vw, 20px)",
        fontWeight: "400",
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: "48px",
        textAlign: "center",
    },
    roleLabel: {
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "2px",
        color: "rgba(255, 255, 255, 0.5)",
        marginBottom: "32px",
    },
    cardContainer: {
        display: "flex",
        gap: "24px",
        alignItems: "stretch",
        justifyContent: "center",
        width: "100%",
        maxWidth: "800px",
    },
    glassCard: {
        width: "380px",
        maxWidth: "100%",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "#ffffff",
        outline: "none", // Will use focus-within for border glow
    },
    cardHeader: {
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "28px",
    },
    iconWrapper: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    },
    bgBlue: {
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    },
    bgGreen: {
        background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
    },
    cardTitleArea: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    cardTitle: {
        margin: 0,
        fontSize: "24px",
        fontWeight: "700",
        letterSpacing: "-0.5px",
    },
    cardDesc: {
        margin: 0,
        fontSize: "14px",
        lineHeight: "1.5",
        color: "rgba(255, 255, 255, 0.7)",
    },
    miniInfoSection: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        background: "rgba(0, 0, 0, 0.2)",
        borderRadius: "12px",
        marginBottom: "32px",
        flex: 1, // pushes button to bottom
    },
    miniInfoRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "14px",
    },
    infoLabel: {
        color: "rgba(255, 255, 255, 0.6)",
        fontWeight: "500",
    },
    infoValue: {
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.9)",
    },
    actionButton: {
        width: "100%",
        padding: "16px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "16px",
        fontWeight: "600",
        color: "white",
        marginTop: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
    },
    footerWrapper: {
        zIndex: 1,
        position: "relative",
        background: "transparent",
        width: "100%",
        borderTop: "1px solid rgba(255,255,255,0.1)",
    },
    demoSection: {
        marginTop: "48px",
        padding: "16px 24px",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    },
    demoLabel: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#60A5FA",
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    pulseDot: {
        width: "8px",
        height: "8px",
        background: "#60A5FA",
        borderRadius: "50%",
        boxShadow: "0 0 0 0 rgba(96, 165, 250, 0.7)",
        animation: "pulse 2s infinite",
    },
    demoContent: {
        display: "flex",
        gap: "24px",
        justifyContent: "center",
    },
    demoField: {
        display: "flex",
        gap: "8px",
        fontSize: "14px",
    },
    demoKey: {
        color: "rgba(255, 255, 255, 0.5)",
        fontWeight: "500",
    },
    demoValue: {
        color: "rgba(255, 255, 255, 1)",
        fontWeight: "700",
        letterSpacing: "0.5px",
    }
};
