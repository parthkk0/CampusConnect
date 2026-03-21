import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IdCard, Search, LogOut, Bell, MessageSquare, BookOpen, Wallet, ChevronRight } from "lucide-react";
import axios from "axios";

const BACKEND_URL = `http://${window.location.hostname}:5000/api`;

export default function StudentHome() {
    const navigate = useNavigate();
    const location = useLocation();
    const [student, setStudent] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [balance, setBalance] = useState(0);
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);

    useEffect(() => {
        // Load student data from local storage
        const stored = localStorage.getItem("studentUser");
        if (stored) {
            const parsedStudent = JSON.parse(stored);
            setStudent(parsedStudent);
            fetchWalletBalance(parsedStudent.roll);
        } else {
            // Include Clerk session checks if needed, but keeping legacy check as requested
            navigate("/student/login");
        }
    }, [navigate]);

    async function fetchWalletBalance(studentId) {
        try {
            const res = await axios.get(`${BACKEND_URL}/pay/wallet/${studentId}`);
            if (res.data.success) {
                setBalance(res.data.balance);
            }
        } catch (err) {
            console.error("Failed to load wallet balance", err);
        } finally {
            setIsLoadingBalance(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("studentUser");
        // For Clerk, you'd use signOut() here. Assuming hybrid for now.
        navigate("/student/login");
    }

    if (!student) return null;

    const firstName = student.name ? student.name.split(' ')[0] : "Student";

    return (
        <div style={styles.page}>
            {/* TOP NAVIGATION */}
            <header style={styles.topNav}>
                <div style={styles.logoContainer}>
                    <span style={styles.logoText}>Campus Connect</span>
                </div>
                <div style={styles.navRight}>
                    <button style={styles.iconButton} aria-label="Notifications" className="btn-ripple">
                        <Bell size={20} color="#64748B" className="bell-pulse" />
                        <span style={styles.notificationDot}></span>
                    </button>

                    <button
                        style={styles.profileChip}
                        onClick={() => setShowProfile(!showProfile)}
                        aria-label="Profile"
                    >
                        <img
                            src={student.photoUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(student.name) + "&background=E2E8F0&color=1E293B"}
                            alt="Profile"
                            style={styles.avatar}
                        />
                        <span style={styles.profileName}>{firstName}</span>
                    </button>

                    {/* PROFILE DROPDOWN */}
                    {showProfile && (
                        <div style={styles.profileDropdown}>
                            <div style={styles.profileDropdownHeader}>
                                <img
                                    src={student.photoUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(student.name) + "&background=1E293B&color=93C5FD&size=80"}
                                    alt="Profile"
                                    style={styles.profileDropdownAvatar}
                                />
                                <div>
                                    <div style={styles.profileDropdownName}>{student.name}</div>
                                    <div style={styles.profileDropdownRoll}>Roll: {student.roll}</div>
                                    {student.course && (
                                        <div style={styles.profileDropdownDetail}>{student.course}</div>
                                    )}
                                    {student.semester && (
                                        <div style={styles.profileDropdownDetail}>Semester {student.semester}</div>
                                    )}
                                </div>
                            </div>
                            <div style={styles.profileDropdownDivider} />
                            <Link to="/eid" style={styles.profileDropdownLink}>
                                <IdCard size={16} /> View E-ID Card
                            </Link>
                            <Link to="/student/wallet" style={styles.profileDropdownLink}>
                                <Wallet size={16} /> My Wallet
                            </Link>
                            <Link to="/student/register-face" style={styles.profileDropdownLink}>
                                <ChevronRight size={16} /> Register Face
                            </Link>
                            <div style={styles.profileDropdownDivider} />
                            <button onClick={handleLogout} style={styles.profileDropdownLogout}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Overlay to close profile dropdown when clicking outside */}
            {showProfile && (
                <div
                    style={styles.profileOverlay}
                    onClick={() => setShowProfile(false)}
                />
            )}

            {/* MAIN DASHBOARD CONTENT */}
            <main style={styles.mainContainer} className="main-fade-in">

                {/* HERO SECTION */}
                <section style={styles.heroSection} className="fade-slide-up">
                    <div style={styles.heroText}>
                        <h1 style={styles.heroTitle} className="mobile-heading">Welcome back, {firstName}</h1>
                        <p style={styles.heroSubtitle}>Here's your campus dashboard for today.</p>
                    </div>
                    <Link to="/eid" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary-gradient btn-ripple focus-glow" style={styles.primaryActionButton}>
                            Generate E-ID
                        </button>
                    </Link>
                </section>

                {/* PRIMARY FEATURE ROW */}
                <section className="dashboard-grid primary-grid-layout" style={{ marginBottom: spacing.sectionGap }}>

                    {/* Digital E-ID Card */}
                    <div className="dashboard-card glow-emerald fade-slide-up delay-80" style={{ ...styles.primaryCard, borderTop: "4px solid #16A34A" }}>
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.iconWrapper, background: "rgba(22, 163, 74, 0.2)", color: "#4ADE80" }}>
                                <IdCard size={24} />
                            </div>
                            <div>
                                <h3 style={styles.cardTitle}>Digital E-ID</h3>
                            </div>
                        </div>
                        <p style={styles.cardDesc}>Manage your campus identity card.</p>
                        <Link to="/eid" style={{ textDecoration: 'none' }}>
                            <button className="btn-ripple focus-glow" style={{ ...styles.solidButtonBlue, background: "rgba(22, 163, 74, 0.2)", color: "#4ADE80", border: "1px solid rgba(22, 163, 74, 0.3)" }}>View E-ID</button>
                        </Link>
                    </div>

                    {/* Wallet Card */}
                    <div className="dashboard-card glow-blue wallet-premium-border delay-160" style={{ ...styles.primaryCard, borderTop: "4px solid #3B82F6" }}>
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.iconWrapper, background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA" }}>
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 style={styles.cardTitle}>My Wallet</h3>
                                <div style={styles.balanceText} className="shimmer-text">₹{isLoadingBalance ? "---" : balance}</div>
                            </div>
                        </div>
                        <div style={styles.buttonRow}>
                            <Link to="/student/wallet" style={{ textDecoration: 'none', flex: 1 }}>
                                <button className="btn-ripple focus-glow" style={styles.solidButtonBlue}>Add Money</button>
                            </Link>
                            <Link to="/student/wallet" style={{ textDecoration: 'none', flex: 1 }}>
                                <button className="btn-ripple focus-glow" style={styles.outlineButton}>Transactions</button>
                            </Link>
                        </div>
                    </div>

                </section>

                {/* SECONDARY FEATURES GRID */}
                <section className="dashboard-grid secondary-grid-layout" style={{ marginBottom: spacing.sectionGap }}>

                    {/* Lost & Found */}
                    <Link to="/lost" className="dashboard-card glow-amber fade-slide-up delay-240" style={{ ...styles.secondaryCard, borderTop: "3px solid #F59E0B" }}>
                        <div style={{ ...styles.iconWrapperSmall, background: "rgba(245, 158, 11, 0.2)", color: "#FBBF24" }}>
                            <Search size={22} />
                        </div>
                        <div style={styles.secondaryTextContent}>
                            <h4 style={styles.secondaryTitle}>Lost & Found</h4>
                            <p style={styles.secondaryDesc}>Report or find items.</p>
                        </div>
                    </Link>

                    {/* Announcements */}
                    <Link to="/announcements" className="dashboard-card glow-purple fade-slide-up delay-320" style={{ ...styles.secondaryCard, borderTop: "3px solid #9333EA" }}>
                        <div style={{ ...styles.iconWrapperSmall, background: "rgba(147, 51, 234, 0.2)", color: "#C084FC" }}>
                            <MessageSquare size={22} />
                        </div>
                        <div style={styles.secondaryTextContent}>
                            <h4 style={styles.secondaryTitle}>Announcements</h4>
                            <p style={styles.secondaryDesc}>Messages from teachers.</p>
                        </div>
                    </Link>

                    {/* Study Notes */}
                    <Link to="/notes" className="dashboard-card glow-sky fade-slide-up delay-400" style={{ ...styles.secondaryCard, borderTop: "3px solid #3B82F6" }}>
                        <div style={{ ...styles.iconWrapperSmall, background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA" }}>
                            <BookOpen size={22} />
                        </div>
                        <div style={styles.secondaryTextContent}>
                            <h4 style={styles.secondaryTitle}>Study Notes</h4>
                            <p style={styles.secondaryDesc}>Access subject notes.</p>
                        </div>
                    </Link>

                </section>

                {/* Logout area (minimal) */}
                <div style={styles.logoutContainer} className="fade-slide-up delay-400">
                    <button onClick={handleLogout} className="btn-ripple focus-glow" style={styles.logoutBtnMinimal}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </main>

        </div>
    );
}

// STRICT DESIGN SYSTEM SPACING & COLORS
const colors = {
    primary: "#3B82F6",
    success: "#10B981",
    bg: "#0F172A", // Dark navy bg replaced by gradient in styles
    textDark: "#ffffff",
    textLight: "rgba(255,255,255,0.7)",
    white: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)"
};

const spacing = {
    micro: "6px",
    inner: "12px",
    cardGap: "16px",
    sectionGap: "20px"
};

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: "40px", // Adjusted since bottom nav is removed
        color: colors.textDark,
        display: "flex",
        flexDirection: "column",
    },

    // TOP NAV
    topNav: {
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `12px ${spacing.cardGap}`,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${colors.border}`,
    },
    logoContainer: {
        display: "flex",
        alignItems: "center",
    },
    logoText: {
        fontSize: "18px",
        fontWeight: "700",
        background: "linear-gradient(to right, #ffffff, #93c5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-0.5px"
    },
    navRight: {
        display: "flex",
        alignItems: "center",
        gap: spacing.inner,
        position: "relative",
    },
    iconButton: {
        background: "rgba(255,255,255,0.1)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        padding: spacing.micro,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        color: "#ffffff",
        transition: "background 0.2s"
    },
    notificationDot: {
        position: "absolute",
        top: "6px",
        right: "6px",
        width: "8px",
        height: "8px",
        backgroundColor: "#EF4444",
        borderRadius: "50%",
        border: "2px solid #0F172A"
    },
    profileChip: {
        background: "rgba(255, 255, 255, 0.1)",
        border: `1px solid ${colors.border}`,
        borderRadius: "30px",
        padding: "4px 12px 4px 4px",
        display: "flex",
        alignItems: "center",
        gap: spacing.micro,
        cursor: "pointer",
        transition: "background 0.2s"
    },
    avatar: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        objectFit: "cover",
    },
    profileName: {
        fontSize: "13px",
        fontWeight: "600",
        color: colors.textDark,
    },

    // MAIN CONTAINER
    mainContainer: {
        maxWidth: "1000px",
        margin: "0 auto",
        padding: `${spacing.sectionGap} ${spacing.cardGap}`,
        width: "100%",
        boxSizing: 'border-box'
    },

    // HERO SECTION
    heroSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sectionGap,
        flexWrap: "wrap",
        gap: spacing.inner,
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        padding: "20px 24px",
        borderRadius: "20px",
        border: `1px solid ${colors.border}`
    },
    heroText: {
        flex: 1,
        minWidth: "250px"
    },
    heroTitle: {
        fontSize: "24px",
        fontWeight: "800",
        color: colors.textDark,
        margin: "0 0 4px 0",
        letterSpacing: "-0.5px"
    },
    heroSubtitle: {
        fontSize: "15px",
        color: colors.textLight,
        margin: 0,
    },
    primaryActionButton: {
        padding: "12px 24px",
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
    },

    // PRIMARY ROW
    primaryCard: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "24px",
        minHeight: "200px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: `1px solid ${colors.border}`,
        borderTop: "3px solid transparent", // will be overridden inline
    },
    cardHeader: {
        display: "flex",
        alignItems: "flex-start",
        gap: spacing.inner,
        marginBottom: spacing.inner,
    },
    iconWrapper: {
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        fontSize: "16px",
        fontWeight: "700",
        color: colors.textDark,
        margin: "0 0 4px 0",
    },
    balanceText: {
        fontSize: "24px",
        fontWeight: "800",
        color: colors.textDark,
        letterSpacing: "-1px"
    },
    cardDesc: {
        fontSize: "14px",
        color: colors.textLight,
        marginBottom: spacing.inner,
    },
    buttonRow: {
        display: "flex",
        gap: spacing.micro,
        width: "100%",
    },
    solidButtonBlue: {
        width: "100%",
        padding: "8px 0",
        background: "rgba(59, 130, 246, 0.2)",
        color: "#93c5fd",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    outlineButton: {
        width: "100%",
        padding: "8px 0",
        background: "rgba(255, 255, 255, 0.05)",
        color: colors.textDark,
        border: `1px solid ${colors.border}`,
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s",
    },

    // SECONDARY GRID
    secondaryCard: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "20px",
        minHeight: "140px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textDecoration: "none",
        color: colors.textDark,
        border: `1px solid ${colors.border}`,
    },
    iconWrapperSmall: {
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
    },
    secondaryTextContent: {
        display: "flex",
        flexDirection: "column",
    },
    secondaryTitle: {
        fontSize: "14px",
        fontWeight: "700",
        margin: "0 0 2px 0",
    },
    secondaryDesc: {
        fontSize: "13px",
        color: colors.textLight,
        margin: 0,
    },

    logoutContainer: {
        display: "flex",
        justifyContent: "center",
        marginTop: "16px",
    },
    logoutBtnMinimal: {
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "#fca5a5",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        borderRadius: "20px",
        transition: "all 0.2s"
    },

    // PROFILE DROPDOWN
    profileDropdown: {
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: "8px",
        width: "280px",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        padding: "16px",
        zIndex: 100,
        animation: "fadeSlideDown 0.2s ease"
    },
    profileDropdownHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "4px"
    },
    profileDropdownAvatar: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid rgba(59, 130, 246, 0.4)"
    },
    profileDropdownName: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#ffffff"
    },
    profileDropdownRoll: {
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.6)",
        marginTop: "2px"
    },
    profileDropdownDetail: {
        fontSize: "11px",
        color: "rgba(147, 197, 253, 0.8)",
        marginTop: "1px"
    },
    profileDropdownDivider: {
        height: "1px",
        background: "rgba(255, 255, 255, 0.1)",
        margin: "12px 0"
    },
    profileDropdownLink: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        color: "rgba(255, 255, 255, 0.85)",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: "500",
        transition: "background 0.15s",
        cursor: "pointer",
        background: "transparent"
    },
    profileDropdownLogout: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        color: "#fca5a5",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        width: "100%",
        transition: "background 0.15s"
    },
    profileOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        background: "transparent"
    }
};
