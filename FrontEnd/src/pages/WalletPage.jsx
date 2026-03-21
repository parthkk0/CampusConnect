import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import BackButton from "../components/BackButton";

const BACKEND_URL = `http://${window.location.hostname}:5000/api`;

export default function WalletPage() {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("studentUser");
        if (!stored) {
            navigate("/student/login");
            return;
        }
        const parsedStudent = JSON.parse(stored);
        setStudent(parsedStudent);
        fetchWalletData(parsedStudent.roll);
    }, [navigate]);

    async function fetchWalletData(studentId) {
        setIsLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/pay/wallet/${studentId}`);
            if (res.data.success) {
                setBalance(res.data.balance);
                setHistory(res.data.history);
            }
        } catch (err) {
            console.error("Failed to load wallet", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddMoney(amount) {
        if (!student) return;
        setIsAdding(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/pay/wallet/add`, {
                studentId: student.roll,
                amount: amount,
                description: "Simulated Wallet Top-up"
            });
            if (res.data.success) {
                setBalance(res.data.newBalance);
                // Prepend new transaction to history local state
                setHistory([res.data.transaction, ...history]);
            }
        } catch (err) {
            alert("Failed to add money. Please try again.");
        } finally {
            setIsAdding(false);
        }
    }

    return (
        <div style={styles.page}>
            <BackButton to="/student/home" />

            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>My Campus Wallet</h1>
                    <p style={styles.subtitle}>Manage your digital funds simply and securely</p>
                </div>

                {/* Balance Card */}
                <div style={styles.balanceCard}>
                    <div style={styles.balanceLabel}>
                        <Wallet size={20} color="#ffffff" opacity={0.8} />
                        <span>Available Balance</span>
                    </div>
                    <div style={styles.balanceAmount}>
                        ₹{isLoading ? "---" : balance}
                    </div>
                    <p style={styles.balanceDesc}>Campus Connect Wallet</p>
                </div>

                {/* Add Money Section */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Add Money (Simulation)</h2>
                    <div style={styles.addMoneyGrid}>
                        <button
                            onClick={() => handleAddMoney(50)}
                            disabled={isAdding}
                            style={styles.addBtn}
                        >
                            <Plus size={16} /> ₹50
                        </button>
                        <button
                            onClick={() => handleAddMoney(100)}
                            disabled={isAdding}
                            style={styles.addBtn}
                        >
                            <Plus size={16} /> ₹100
                        </button>
                        <button
                            onClick={() => handleAddMoney(200)}
                            disabled={isAdding}
                            style={styles.addBtn}
                        >
                            <Plus size={16} /> ₹200
                        </button>
                    </div>
                    {isAdding && <p style={styles.addingText}>Processing top-up...</p>}
                </div>

                {/* Transaction History */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Transaction History</h2>

                    {isLoading ? (
                        <p style={styles.emptyText}>Loading records...</p>
                    ) : history.length === 0 ? (
                        <div style={styles.emptyState}>
                            <Clock size={40} color="#ccc" />
                            <p>No transactions yet</p>
                        </div>
                    ) : (
                        <div style={styles.historyList}>
                            {history.map((txn) => (
                                <div key={txn.transactionId} style={styles.txnItem}>
                                    <div style={styles.txnLeft}>
                                        <div style={txn.type === "credit" ? styles.iconCredit : styles.iconDebit}>
                                            {txn.type === "credit" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <h4 style={styles.txnDesc}>{txn.description}</h4>
                                            <span style={styles.txnDate}>
                                                {new Date(txn.timestamp).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={txn.type === "credit" ? styles.amtCredit : styles.amtDebit}>
                                        {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(rgba(240, 244, 248, 0.95), rgba(226, 232, 240, 0.95)), url('/college-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: "Inter, sans-serif",
        padding: "20px"
    },
    container: {
        maxWidth: "500px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        overflow: "hidden"
    },
    header: {
        padding: "30px 20px 20px",
        textAlign: "center"
    },
    title: {
        fontSize: "24px",
        color: "#1e293b",
        marginBottom: "5px"
    },
    subtitle: {
        color: "#64748b",
        fontSize: "14px"
    },
    balanceCard: {
        margin: "0 20px",
        background: "linear-gradient(135deg, #0b74de 0%, #0056b3 100%)",
        borderRadius: "16px",
        padding: "25px",
        color: "#fff",
        boxShadow: "0 8px 20px rgba(11, 116, 222, 0.3)"
    },
    balanceLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        opacity: 0.9,
        marginBottom: "10px"
    },
    balanceAmount: {
        fontSize: "36px",
        fontWeight: "bold",
        marginBottom: "5px"
    },
    balanceDesc: {
        fontSize: "12px",
        opacity: 0.8
    },
    section: {
        padding: "25px 20px"
    },
    sectionTitle: {
        fontSize: "16px",
        color: "#334155",
        marginBottom: "15px",
        fontWeight: "600"
    },
    addMoneyGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px"
    },
    addBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        background: "#f1f5f9",
        border: "1px solid #cbd5e1",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "600",
        color: "#0f172a",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    addingText: {
        textAlign: "center",
        color: "#2563eb",
        fontSize: "13px",
        marginTop: "10px",
        fontWeight: "500"
    },
    emptyState: {
        textAlign: "center",
        padding: "40px 0",
        color: "#94a3b8",
        background: "#f8fafc",
        borderRadius: "12px"
    },
    emptyText: {
        textAlign: "center",
        color: "#64748b"
    },
    historyList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    txnItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        background: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #f1f5f9"
    },
    txnLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    iconCredit: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "#dcfce7",
        color: "#16a34a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    iconDebit: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "#fee2e2",
        color: "#ef4444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    txnDesc: {
        fontSize: "14px",
        color: "#1e293b",
        margin: 0,
        marginBottom: "2px"
    },
    txnDate: {
        fontSize: "12px",
        color: "#64748b"
    },
    amtCredit: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#16a34a"
    },
    amtDebit: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#ef4444"
    }
};
