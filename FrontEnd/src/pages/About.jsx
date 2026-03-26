import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Users, BookOpen, BadgeCheck, Fingerprint } from "lucide-react";

export default function About() {
    return (
        <div style={styles.page}>
            <div style={styles.orb1}></div>
            <div style={styles.orb2}></div>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.logoArea}>
                    <ShieldCheck size={26} color="#60A5FA" />
                    <span style={styles.logoText}>Campus Connect</span>
                </div>
                <Link to="/" style={styles.backBtn}>
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>
            </nav>

            <main style={styles.main}>
                <div style={styles.card}>
                    <div style={styles.badge}>About Us</div>
                    <h1 style={styles.title}>Smarter Campus.<br />Better Experience.</h1>
                    <p style={styles.subtitle}>
                        Campus Connect is a modern, all-in-one campus management platform designed to bridge
                        the gap between students, faculty, and administration — making campus life smart,
                        seamless, and secure.
                    </p>

                    <div style={styles.featureGrid}>
                        {features.map((f, i) => (
                            <div key={i} style={styles.featureCard}>
                                <div style={styles.featureIcon}>{f.icon}</div>
                                <div>
                                    <h3 style={styles.featureTitle}>{f.title}</h3>
                                    <p style={styles.featureDesc}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.contactBox}>
                        <p style={styles.contactLabel}>📬 Contact Us</p>
                        <a href="mailto:campusconnect.official@gmail.com" style={styles.emailLink}>
                            campusconnect.official@gmail.com
                        </a>
                        <p style={styles.contactNote}>
                            We're a team of passionate developers building tools to empower campus communities.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

const features = [
    {
        icon: <BadgeCheck size={22} color="#60A5FA" />,
        title: "Digital E-ID",
        desc: "Students get a secure, verifiable digital identity card accessible anytime.",
    },
    {
        icon: <Fingerprint size={22} color="#A78BFA" />,
        title: "Face Recognition",
        desc: "AI-powered face authentication for secure and contactless access.",
    },
    {
        icon: <BookOpen size={22} color="#34D399" />,
        title: "Notes & Resources",
        desc: "Centralized study materials organized by course and year.",
    },
    {
        icon: <Users size={22} color="#F472B6" />,
        title: "Admin Control",
        desc: "Powerful tools for administrators to manage students and campus operations.",
    },
];

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        color: "#fff",
        fontFamily: "'Inter', 'Poppins', sans-serif",
        position: "relative",
        overflow: "hidden",
    },
    orb1: {
        position: "absolute", top: "-15%", left: "-10%",
        width: "50%", height: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    orb2: {
        position: "absolute", bottom: "-20%", right: "-10%",
        width: "60%", height: "60%",
        background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    navbar: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 32px",
        position: "sticky", top: 0, zIndex: 10,
    },
    logoArea: { display: "flex", alignItems: "center", gap: "10px" },
    logoText: { fontSize: "18px", fontWeight: "700" },
    backBtn: {
        display: "flex", alignItems: "center", gap: "6px",
        color: "rgba(255,255,255,0.7)", textDecoration: "none",
        fontSize: "14px", fontWeight: "500",
        padding: "8px 16px",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.05)",
        transition: "background 0.2s",
    },
    main: {
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        padding: "40px 20px 60px",
        position: "relative", zIndex: 1,
    },
    card: {
        maxWidth: "760px", width: "100%",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "24px",
        padding: "48px 40px",
        backdropFilter: "blur(12px)",
    },
    badge: {
        display: "inline-block",
        background: "rgba(96,165,250,0.15)",
        color: "#60A5FA",
        fontSize: "12px", fontWeight: "700",
        letterSpacing: "2px", textTransform: "uppercase",
        padding: "6px 14px", borderRadius: "20px",
        marginBottom: "20px",
    },
    title: {
        fontSize: "clamp(28px, 4vw, 42px)",
        fontWeight: "800", lineHeight: "1.2",
        marginBottom: "16px", letterSpacing: "-1px",
    },
    subtitle: {
        fontSize: "16px", lineHeight: "1.7",
        color: "rgba(255,255,255,0.7)",
        marginBottom: "36px",
    },
    featureGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px", marginBottom: "36px",
    },
    featureCard: {
        display: "flex", gap: "14px", alignItems: "flex-start",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px", padding: "16px 18px",
    },
    featureIcon: { marginTop: "2px", flexShrink: 0 },
    featureTitle: { margin: "0 0 4px", fontSize: "15px", fontWeight: "600" },
    featureDesc: { margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "1.5" },
    contactBox: {
        background: "rgba(96,165,250,0.08)",
        border: "1px solid rgba(96,165,250,0.25)",
        borderRadius: "16px", padding: "24px 28px",
        textAlign: "center",
    },
    contactLabel: { margin: "0 0 8px", fontSize: "15px", fontWeight: "600" },
    emailLink: {
        display: "block",
        color: "#60A5FA", fontSize: "16px", fontWeight: "600",
        textDecoration: "none", marginBottom: "12px",
        wordBreak: "break-all",
    },
    contactNote: { margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.55)" },
};
