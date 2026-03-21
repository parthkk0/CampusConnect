import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, FileText, Image, Download, Clock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export default function Announcements() {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("studentUser");
        if (stored) {
            setStudent(JSON.parse(stored));
        } else {
            navigate("/student/login");
            return;
        }
        fetchAnnouncements();
    }, [navigate]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BACKEND_URL}/announcements`);
            if (res.data.success) {
                setAnnouncements(res.data.announcements);
            }
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!student) return null;

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <Link to="/student/home" style={styles.backBtn}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Link>
                <h1 style={styles.title}>Announcements</h1>
                <div style={{ width: 80 }}></div>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                {loading ? (
                    <div style={styles.loading}>Loading announcements...</div>
                ) : announcements.length === 0 ? (
                    <div style={styles.empty}>
                        <FileText size={48} color="#ccc" />
                        <p>No announcements yet</p>
                    </div>
                ) : (
                    <div style={styles.feed}>
                        {announcements.map((item) => (
                            <AnnouncementCard
                                key={item._id}
                                announcement={item}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function AnnouncementCard({ announcement, formatDate }) {
    const { title, content, attachmentType, attachmentUrl, attachmentName, postedBy, createdAt } = announcement;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = attachmentUrl;
        link.download = attachmentName || 'download.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={styles.card}>
            {/* Card Header */}
            <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                    <User size={20} color="#fff" />
                </div>
                <div style={styles.meta}>
                    <span style={styles.postedBy}>{postedBy}</span>
                    <span style={styles.date}>
                        <Clock size={12} />
                        {formatDate(createdAt)}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3 style={styles.cardTitle}>{title}</h3>

            {/* Content */}
            {content && <p style={styles.cardContent}>{content}</p>}

            {/* Attachment */}
            {attachmentType === 'image' && attachmentUrl && (
                <div style={styles.imageContainer}>
                    <img
                        src={attachmentUrl}
                        alt="Attachment"
                        style={styles.attachmentImage}
                    />
                </div>
            )}

            {attachmentType === 'pdf' && attachmentUrl && (
                <div style={styles.pdfContainer}>
                    <FileText size={24} color="#e53935" />
                    <span style={styles.pdfName}>{attachmentName || 'Document.pdf'}</span>
                    <button style={styles.downloadBtn} onClick={handleDownload}>
                        <Download size={16} />
                        Download
                    </button>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#fff",
    },
    header: {
        height: "60px",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 10,
    },
    backBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#fff",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
    },
    title: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: 0,
        background: "linear-gradient(to right, #ffffff, #93c5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    },
    main: {
        padding: "20px",
        maxWidth: "700px",
        margin: "0 auto",
    },
    loading: {
        textAlign: "center",
        padding: "60px 20px",
        color: "rgba(255,255,255,0.8)",
        fontSize: "16px",
    },
    empty: {
        textAlign: "center",
        padding: "80px 20px",
        color: "rgba(255,255,255,0.6)",
    },
    feed: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    card: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    },
    cardHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px",
    },
    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "rgba(59, 130, 246, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    meta: {
        display: "flex",
        flexDirection: "column",
    },
    postedBy: {
        fontWeight: "600",
        color: "#fff",
        fontSize: "14px",
    },
    date: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: "12px",
    },
    cardTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#fff",
        margin: "0 0 8px 0",
    },
    cardContent: {
        fontSize: "15px",
        color: "rgba(255, 255, 255, 0.8)",
        lineHeight: "1.6",
        margin: "0 0 12px 0",
        whiteSpace: "pre-wrap",
    },
    imageContainer: {
        marginTop: "12px",
        borderRadius: "12px",
        overflow: "hidden",
    },
    attachmentImage: {
        width: "100%",
        maxHeight: "400px",
        objectFit: "cover",
        display: "block",
    },
    pdfContainer: {
        marginTop: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px",
        background: "rgba(239, 68, 68, 0.1)",
        borderRadius: "10px",
        border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    pdfName: {
        flex: 1,
        fontSize: "14px",
        color: "#fca5a5",
        fontWeight: "500",
    },
    downloadBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        background: "rgba(239, 68, 68, 0.8)",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.2s",
    },
};
