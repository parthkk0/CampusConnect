import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, ChevronDown, ChevronUp, Mail, MessageCircle } from "lucide-react";

const faqs = [
    {
        q: "How do I log in as a student?",
        a: "On the home page, click the 'Student' card and enter your registered email and password. If you forgot your password, use the 'Forgot Password' link on the login page.",
    },
    {
        q: "How does face recognition login work?",
        a: "After registering your face in the profile section, you can use the face scan option on the login page. Make sure you're in good lighting and looking directly at the camera.",
    },
    {
        q: "Where can I find my Digital E-ID?",
        a: "Once logged in, navigate to the 'E-ID' section from your student dashboard. Your digital ID card will be displayed there.",
    },
    {
        q: "How do I access study notes?",
        a: "Go to the 'Notes' section from your dashboard. You can filter notes by subject using the dropdown menu.",
    },
    {
        q: "How do I report a lost item?",
        a: "Visit the 'Lost & Found' section from your student home page. You can post about lost items or browse found items reported by others.",
    },
    {
        q: "Who do I contact for technical issues?",
        a: "Reach out to us at campusconnect.official@gmail.com and our support team will get back to you within 24 hours.",
    },
];

export default function Help() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

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
                    <div style={styles.badge}>Help Center</div>
                    <h1 style={styles.title}>How can we help you?</h1>
                    <p style={styles.subtitle}>
                        Find answers to common questions below. If you need further assistance,
                        don't hesitate to reach out to our support team.
                    </p>

                    {/* FAQs */}
                    <div style={styles.faqList}>
                        {faqs.map((faq, i) => (
                            <div key={i} style={styles.faqItem}>
                                <button style={styles.faqQuestion} onClick={() => toggle(i)}>
                                    <span>{faq.q}</span>
                                    {openIndex === i
                                        ? <ChevronUp size={18} color="#60A5FA" />
                                        : <ChevronDown size={18} color="rgba(255,255,255,0.5)" />
                                    }
                                </button>
                                {openIndex === i && (
                                    <p style={styles.faqAnswer}>{faq.a}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Contact */}
                    <div style={styles.contactSection}>
                        <div style={styles.contactCard}>
                            <Mail size={28} color="#60A5FA" />
                            <h3 style={styles.contactTitle}>Email Support</h3>
                            <p style={styles.contactDesc}>Our team replies within 24 hours.</p>
                            <a href="mailto:campusconnect.official@gmail.com" style={styles.emailLink}>
                                campusconnect.official@gmail.com
                            </a>
                        </div>
                        <div style={styles.contactCard}>
                            <MessageCircle size={28} color="#A78BFA" />
                            <h3 style={styles.contactTitle}>Admin Support</h3>
                            <p style={styles.contactDesc}>Contact your campus admin for account-related issues.</p>
                            <span style={styles.emailLink}>Via Admin Dashboard</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

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
    },
    main: {
        display: "flex", justifyContent: "center",
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
        fontSize: "clamp(26px, 4vw, 40px)",
        fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px",
    },
    subtitle: {
        fontSize: "15px", color: "rgba(255,255,255,0.65)",
        lineHeight: "1.7", marginBottom: "32px",
    },
    faqList: { marginBottom: "36px" },
    faqItem: {
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "4px", marginBottom: "4px",
    },
    faqQuestion: {
        width: "100%", display: "flex", justifyContent: "space-between",
        alignItems: "center", background: "none", border: "none",
        color: "#fff", fontSize: "15px", fontWeight: "600",
        padding: "16px 4px", cursor: "pointer", textAlign: "left", gap: "12px",
    },
    faqAnswer: {
        margin: "0 0 16px 4px", fontSize: "14px",
        color: "rgba(255,255,255,0.65)", lineHeight: "1.7",
    },
    contactSection: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
    },
    contactCard: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", padding: "24px",
        display: "flex", flexDirection: "column", gap: "8px",
    },
    contactTitle: { margin: 0, fontSize: "16px", fontWeight: "700" },
    contactDesc: { margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.55)" },
    emailLink: {
        color: "#60A5FA", fontSize: "14px", fontWeight: "600",
        textDecoration: "none", wordBreak: "break-all",
    },
};
