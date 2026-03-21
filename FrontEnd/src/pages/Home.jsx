import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ScanFace, IdCard, Search, Wallet, UserPlus, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  const stars = useMemo(
    () =>
      [...Array(20)].map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      })),
    []
  );

  return (
    <div style={styles.container}>
      {/* Animated Background Elements */}
      <div style={styles.backgroundCircle1} className="animate-float"></div>
      <div style={styles.backgroundCircle2} className="animate-float"></div>

      {/* Particle Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            ...styles.star,
            top: star.top,
            left: star.left,
            animationDelay: star.animationDelay,
            animationDuration: star.animationDuration,
          }}
        />
      ))}

      <div style={styles.content} className="page-container">
        <div style={styles.header}>
          <Sparkles style={styles.sparkleIcon} className="animate-sparkle" size={40} />
          <h1 style={styles.title} className="title-mobile">Campus Connect</h1>
          <p style={styles.subtitle}>Your Smart, AI-Powered Campus Portal</p>
        </div>

        <div style={styles.grid} className="grid-mobile">
          {/* Student Registration */}
          <InteractiveCard
            to="/signup"
            color="#ff4081"
            title="Student Registration"
            text="New student? Register your face and details."
            Icon={UserPlus}
          />

          {/* Admin Portal */}
          <InteractiveCard
            to="/admin/login"
            color="#263238"
            title="Admin Portal"
            text="Manage students and approvals."
            Icon={ShieldCheck}
          />

          {/* Face Verification */}
          <InteractiveCard
            to="/face"
            color="#1e88e5"
            title="Face Verification"
            text="Verify identity using AI-based face recognition."
            Icon={ScanFace}
          />

          {/* Digital eID */}
          <InteractiveCard
            to="/eid"
            color="#43a047"
            title="Digital eID"
            text="View and manage your secure campus identity."
            Icon={IdCard}
          />

          {/* Lost & Found */}
          <InteractiveCard
            to="/lost"
            color="#6a1b9a"
            title="Lost & Found"
            text="Report or find lost items on campus."
            Icon={Search}
          />

          {/* Payments */}
          <InteractiveCard
            to="/pay"
            color="#fb8c00"
            title="Payments"
            text="Pay fines and event fees securely."
            Icon={Wallet}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------- CARD COMPONENT ------------------- */

function InteractiveCard({ to, title, text, Icon, color }) {
  return (
    <Link
      to={to}
      style={{ ...styles.card, borderLeft: `4px solid ${color}` }}
      className="interactive-card card-mobile"
    >
      <div style={styles.iconWrapper(color)} className="icon-wrapper">
        <Icon size={36} color="white" />
      </div>
      <h2 style={styles.cardTitle}>{title}</h2>
      <p style={styles.cardText}>{text}</p>
    </Link>
  );
}

/* ------------------- STYLES ------------------- */

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, sans-serif",
  },
  backgroundCircle1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    top: "-100px",
    right: "-100px",
    animation: "float 6s ease-in-out infinite",
    pointerEvents: "none",
  },
  backgroundCircle2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.08)",
    bottom: "-50px",
    left: "-50px",
    animation: "float 8s ease-in-out infinite",
    animationDelay: "2s",
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "50px",
    paddingTop: "20px",
  },
  sparkleIcon: {
    color: "#ffd700",
    marginBottom: "10px",
    animation: "pulse 2s ease-in-out infinite",
    filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))",
  },
  star: {
    position: "absolute",
    width: "3px",
    height: "3px",
    background: "white",
    borderRadius: "50%",
    boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
    animation: "twinkle 3s ease-in-out infinite",
    pointerEvents: "none",
  },
  title: {
    fontSize: "3.5rem",
    marginBottom: "12px",
    fontWeight: 900,
    color: "#ffffff",
    textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    letterSpacing: "-1px",
  },
  subtitle: {
    fontSize: "1.3rem",
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: 500,
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    marginBottom: "60px",
  },
  card: {
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    textDecoration: "none",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },
  iconWrapper: (color) => ({
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: `0 4px 20px ${color}40`,
    transition: "transform 0.3s ease",
  }),
  cardTitle: {
    margin: "12px 0 8px",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#ffffff",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  cardText: {
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: "1.6",
  },
};

