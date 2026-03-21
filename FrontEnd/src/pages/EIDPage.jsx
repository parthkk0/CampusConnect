import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FaceVerify from "./FaceVerify";
import BackButton from "../components/BackButton";
import { Wallet, AlertCircle } from "lucide-react";

const BACKEND_URL = `http://${window.location.hostname}:5000/api`;
const EID_FEE = 50;

export default function EIDPage() {
  const [step, setStep] = useState("loading"); // loading, input, checking, verify, wallet_check, processing, success, expired
  const [studentId, setStudentId] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [eidData, setEidData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    checkExistingEID();
  }, []);

  async function checkExistingEID() {
    const stored = localStorage.getItem("studentUser");
    if (stored) {
      const student = JSON.parse(stored);
      setStudentId(student.roll);
      setIsLocked(true);

      try {
        const response = await axios.get(
          `${BACKEND_URL}/students/${student.roll}/eid`
        );

        if (response.data.success && response.data.isActive) {
          setStudentData(response.data.student);
          setEidData(response.data.eid);
          setStep("success");
        } else if (response.data.expired) {
          setStep("expired");
        } else {
          setStep("input");
        }
      } catch (err) {
        setStep("input");
      }
    } else {
      setStep("input");
    }
  }

  async function checkFaceStatus() {
    if (!studentId.trim()) {
      setError("Please enter your Student ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setStep("checking");

    try {
      const response = await axios.get(
        `${BACKEND_URL}/students/${studentId}/face-status`
      );

      if (response.data.success) {
        if (response.data.hasFaceRegistered) {
          setStep("verify");
        } else {
          setError(
            "❌ Face not registered. Please complete signup with face registration first."
          );
          setStep("input");
        }
      }
    } catch (err) {
      setError(`❌ ${err.response?.data?.error || err.message}`);
      setStep("input");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerificationSuccess(student) {
    setVerifiedStudent(student);
    setError("");
    await checkCampusWallet(student.roll);
  }

  async function checkCampusWallet(roll) {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/pay/wallet/${roll}`);
      if (res.data.success) {
        setWalletBalance(res.data.balance);
        setStep("wallet_check");
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
      setError("❌ Failed to retrieve Campus Wallet data.");
      setStep("verify");
    } finally {
      setIsLoading(false);
    }
  }

  async function payWithWallet() {
    setIsLoading(true);
    setError("");
    setStep("processing");

    try {
      // 1. Deduct from wallet internally
      const deductRes = await axios.post(`${BACKEND_URL}/pay/wallet/deduct`, {
        studentId: verifiedStudent.roll,
        amount: EID_FEE,
        description: "E-ID Generation Fine"
      });

      if (deductRes.data.success) {
        // 2. Generate E-ID
        await generateEID();
      }
    } catch (err) {
      console.error("Wallet deduction error:", err);
      setError(err.response?.data?.error || "❌ Payment failed. Please try again.");
      setStep("wallet_check");
      setIsLoading(false);
    }
  }

  async function generateEID() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/students/${verifiedStudent.roll}/generate-eid`
      );

      if (response.data.success) {
        setStudentData(response.data.student);
        setEidData(response.data.eid);
        setStep("success");
      }
    } catch (err) {
      setError(`❌ ${err.response?.data?.error || "Failed to generate E-ID"}`);
      setStep("wallet_check");
    } finally {
      setIsLoading(false);
    }
  }

  function handleVerificationError(errorMsg) {
    setError(`❌ ${errorMsg}`);
  }

  function resetFlow() {
    setStep("input");
    setStudentId("");
    setStudentData(null);
    setEidData(null);
    setError("");
  }

  return (
    <div style={styles.page} className="page-container">
      <BackButton to="/student/home" />
      <div style={styles.container}>
        <h1 style={styles.title} className="title-mobile">🎓 Digital E-ID Generation</h1>

        {step === "loading" && (
          <div style={styles.card}>
            <div style={styles.loading}>Loading...</div>
          </div>
        )}

        {step === "input" && (
          <div style={styles.card} className="card-mobile glass-panel animate-slide-up">
            <h2 style={{ color: "#fff" }}>Enter Student ID</h2>
            <p style={styles.subtitle}>
              Enter your student ID to verify your face and generate E-ID
            </p>

            <input
              type="text"
              placeholder="e.g., 22IT045"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={isLocked ? { ...styles.input, background: "#e9ecef", cursor: "not-allowed" } : styles.input}
              disabled={isLoading || isLocked}
              onKeyPress={(e) => e.key === "Enter" && checkFaceStatus()}
            />

            {error && <div style={styles.error}>{error}</div>}

            <button
              onClick={checkFaceStatus}
              disabled={isLoading || !studentId.trim()}
              style={styles.primaryBtn}
              className="btn-mobile"
            >
              {isLoading ? "Checking..." : "Continue to Verification"}
            </button>
          </div>
        )}

        {step === "checking" && (
          <div style={styles.card}>
            <div style={styles.loading}>Checking face registration status...</div>
          </div>
        )}

        {step === "expired" && (
          <div style={styles.card} className="card-mobile glass-panel animate-slide-up">
            <div style={styles.expiredBanner}>
              ⏰ Your E-ID has expired
            </div>
            <p style={styles.subtitle}>
              E-IDs expire at midnight (12:00 AM) daily. Please verify your face again to generate a new E-ID.
            </p>
            <button onClick={() => setStep("verify")} style={styles.primaryBtn} className="btn-mobile">
              Verify Face to Generate New E-ID
            </button>
            <button onClick={resetFlow} style={styles.secondaryBtn} className="btn-mobile">
              ← Back
            </button>
          </div>
        )}

        {step === "verify" && (
          <div style={styles.card} className="card-mobile glass-panel animate-slide-up">
            <h2 style={{ color: "#fff" }}>Face Verification</h2>
            <p style={styles.subtitle}>
              Verify your identity to generate E-ID for <b>{studentId}</b>
            </p>

            <FaceVerify
              studentId={studentId}
              onVerified={handleVerificationSuccess}
              onError={handleVerificationError}
            />

            {error && <div style={styles.error}>{error}</div>}

            <button onClick={resetFlow} style={styles.secondaryBtn}>
              ← Cancel
            </button>
          </div>
        )}

        {step === "wallet_check" && (
          <div style={styles.card} className="card-mobile glass-panel animate-slide-up">
            <div style={styles.paymentBanner}>
              ✅ Face Verified!
            </div>
            <h2 style={{ color: "#fff", marginBottom: 5 }}>E-ID Generation Fee: <span style={{ color: "#fca5a5" }}>₹{EID_FEE}</span></h2>

            <div style={styles.walletBox}>
              <div style={styles.walletHeader}>
                <Wallet size={24} color="#0b74de" />
                <h3 style={styles.walletTitle}>Campus Wallet</h3>
              </div>

              <div style={styles.balanceDisplay}>
                <span style={styles.balanceLabel}>Current Balance</span>
                <span style={styles.balanceAmt}>₹{walletBalance}</span>
              </div>

              {walletBalance < EID_FEE ? (
                <div style={styles.insufficientContainer}>
                  <AlertCircle size={20} color="#ef4444" style={{ marginBottom: 5 }} />
                  <p style={styles.insufficientText}>
                    Insufficient balance. You need ₹{EID_FEE - walletBalance} more to proceed.
                  </p>
                  <button
                    onClick={() => navigate("/student/wallet")}
                    style={styles.addMoneyBtn}
                  >
                    Add Money to Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={payWithWallet}
                  disabled={isLoading}
                  style={styles.payBtn}
                >
                  Pay ₹{EID_FEE} from Wallet
                </button>
              )}
            </div>

            {error && <div style={{ ...styles.error, marginTop: 15 }}>{error}</div>}

            <button onClick={resetFlow} style={styles.secondaryBtn} className="btn-mobile">
              ← Cancel
            </button>
          </div>
        )}

        {step === "processing" && (
          <div style={styles.card} className="card-mobile">
            <div style={styles.processingContainer}>
              <div style={styles.spinner}></div>
              <h2 style={styles.processingTitle}>Generating E-ID...</h2>
              <p style={styles.processingText}>Deducting funds and issuing your pass.</p>
            </div>
          </div>
        )}

        {step === "success" && studentData && eidData && (
          <div style={styles.card} className="card-mobile glass-panel animate-slide-up">
            <div style={styles.successBanner}>
              ✅ E-ID Active! (₹{EID_FEE} Deducted)
            </div>

            <EIDCard student={studentData} eid={eidData} />

            <button onClick={() => navigate("/student/home")} style={styles.secondaryBtn} className="btn-mobile">
              ← Back to Home
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function EIDCard({ student, eid }) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(eid.expiresAt);
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeRemaining("Expired");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eid.expiresAt]);

  const generatedDate = new Date(eid.generatedAt).toLocaleString();
  const expiresDate = new Date(eid.expiresAt).toLocaleString();

  return (
    <div style={cardStyles.container}>
      <div style={cardStyles.header}>
        <h3 style={cardStyles.title}>Campus Connect – E-ID</h3>
        <div style={cardStyles.badge}>VERIFIED</div>
      </div>

      <div style={cardStyles.content}>
        <div style={cardStyles.row}>
          <span style={cardStyles.label}>Name:</span>
          <span style={cardStyles.value}>{student.name}</span>
        </div>
        <div style={cardStyles.row}>
          <span style={cardStyles.label}>Student ID:</span>
          <span style={cardStyles.value}>{student.roll}</span>
        </div>
        {student.course && (
          <div style={cardStyles.row}>
            <span style={cardStyles.label}>Course:</span>
            <span style={cardStyles.value}>{student.course}</span>
          </div>
        )}
        <div style={cardStyles.row}>
          <span style={cardStyles.label}>Generated:</span>
          <span style={cardStyles.value}>{generatedDate}</span>
        </div>
        <div style={cardStyles.row}>
          <span style={cardStyles.label}>Expires At:</span>
          <span style={cardStyles.value}>{expiresDate}</span>
        </div>
        <div style={cardStyles.row}>
          <span style={cardStyles.label}>Time Remaining:</span>
          <span style={{ ...cardStyles.value, color: "#e74c3c", fontWeight: "bold" }}>
            {timeRemaining}
          </span>
        </div>
      </div>

      <div style={cardStyles.footer}>
        <span style={cardStyles.verified}>✔ Face & Wallet Verified</span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Inter, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: 500,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 28,
    fontWeight: "800",
    background: "linear-gradient(to right, #ffffff, #93c5fd)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  card: {
    padding: 30,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 1,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#ffffff",
    borderRadius: 8,
    marginBottom: 15,
    boxSizing: "border-box",
    outline: "none",
  },
  primaryBtn: {
    width: "100%",
    padding: 14,
    marginTop: 10,
    background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  secondaryBtn: {
    width: "100%",
    padding: 12,
    marginTop: 15,
    background: "rgba(255, 255, 255, 0.1)",
    color: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  error: {
    padding: 12,
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 6,
    color: "#fca5a5",
    marginBottom: 15,
    fontSize: 14,
    textAlign: "center"
  },
  successBanner: {
    padding: 15,
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: 8,
    marginBottom: 20,
    color: "#6ee7b7",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  paymentBanner: {
    padding: 10,
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: 8,
    marginBottom: 15,
    color: "#93c5fd",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  walletBox: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: "20px",
    marginTop: "20px",
  },
  walletHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  walletTitle: {
    margin: 0,
    color: "#fff",
    fontSize: "16px",
  },
  balanceDisplay: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "14px",
    fontWeight: "500",
  },
  balanceAmt: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#fff",
  },
  payBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  insufficientContainer: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    padding: "15px",
    textAlign: "center",
  },
  insufficientText: {
    color: "#fca5a5",
    fontSize: "14px",
    marginBottom: "15px",
    fontWeight: "500",
  },
  addMoneyBtn: {
    width: "100%",
    padding: "12px",
    background: "rgba(239, 68, 68, 0.8)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  loading: {
    textAlign: "center",
    color: "rgba(255,255,255,0.7)"
  },
  processingContainer: {
    textAlign: "center",
    padding: 30,
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid rgba(255,255,255,0.1)",
    borderTop: "4px solid #3B82F6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  processingTitle: {
    color: "#fff",
    marginBottom: 10,
  },
  processingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 20,
  },
};

const cardStyles = {
  container: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  header: {
    background: "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
    color: "#fff",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: "bold"
  },
  badge: {
    background: "rgba(16, 185, 129, 0.2)",
    color: "#6ee7b7",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    padding: "16px 20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  label: {
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  value: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  footer: {
    background: "rgba(255, 255, 255, 0.02)",
    padding: "12px 15px",
    textAlign: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  verified: {
    color: "#6ee7b7",
    fontWeight: "bold",
    fontSize: 14,
  },
};
