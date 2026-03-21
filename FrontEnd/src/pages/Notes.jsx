import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, BookOpen, FileText, Download, ChevronDown, ChevronRight, Eye, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export default function Notes() {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subjectsData, setSubjectsData] = useState([]);
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [courseName, setCourseName] = useState("");
    const [previewNote, setPreviewNote] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("studentUser");
        if (stored) {
            const studentData = JSON.parse(stored);
            setStudent(studentData);
            // If semester is missing from stored data, refresh from API
            if (!studentData.semester) {
                refreshStudentData(studentData.roll);
            } else {
                fetchNotes(studentData);
            }
        } else {
            navigate("/student/login");
        }
    }, [navigate]);

    const refreshStudentData = async (roll) => {
        try {
            const res = await axios.get(`${BACKEND_URL}/students/${roll}`);
            if (res.data.success) {
                const fresh = res.data.student;
                // Merge fresh data with stored data and save
                const stored = JSON.parse(localStorage.getItem("studentUser") || "{}");
                const updated = { ...stored, ...fresh };
                localStorage.setItem("studentUser", JSON.stringify(updated));
                setStudent(updated);
                if (updated.semester) {
                    fetchNotes(updated);
                } else {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error("Failed to refresh student data:", error);
            setLoading(false);
        }
    };

    const fetchNotes = async (studentData) => {
        try {
            setLoading(true);
            const { course, semester } = studentData;

            if (!course || !semester) {
                console.error("Missing course or semester:", { course, semester });
                setLoading(false);
                return;
            }

            const res = await axios.get(`${BACKEND_URL}/notes/for-student/${encodeURIComponent(course)}/${semester}`);
            if (res.data.success) {
                setSubjectsData(res.data.subjects);
                setCourseName(res.data.courseName);
            }
        } catch (error) {
            console.error("Failed to fetch notes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (noteId) => {
        try {
            setPreviewLoading(true);
            const res = await axios.get(`${BACKEND_URL}/notes/${noteId}`);
            if (res.data.success) {
                setPreviewNote(res.data.note);
            }
        } catch (error) {
            console.error("Preview failed:", error);
            alert("Failed to load preview");
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDownload = () => {
        if (!previewNote) return;
        const link = document.createElement('a');
        link.href = previewNote.fileUrl;
        link.download = previewNote.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const closePreview = () => {
        setPreviewNote(null);
    };

    const toggleSubject = (subjectId) => {
        setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
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
                <h1 style={styles.title}>Study Notes</h1>
                <div style={{ width: 80 }}></div>
            </header>

            {/* Course Info */}
            <div style={styles.courseInfo}>
                <BookOpen size={20} />
                <span>{courseName || student.course} - Semester {student.semester}</span>
            </div>

            {/* Main Content */}
            <main style={styles.main}>
                {loading ? (
                    <div style={styles.loading}>Loading your subjects...</div>
                ) : !student.semester ? (
                    <div style={styles.empty}>
                        <BookOpen size={48} color="#ccc" />
                        <p>Your semester is not assigned yet.</p>
                        <p style={{ fontSize: 14, color: "#888" }}>Please contact admin to update your profile.</p>
                    </div>
                ) : subjectsData.length === 0 ? (
                    <div style={styles.empty}>
                        <BookOpen size={48} color="#ccc" />
                        <p>No subjects found for your semester.</p>
                    </div>
                ) : (
                    <div style={styles.subjectsList}>
                        {subjectsData.map(({ subject, notes }) => (
                            <div key={subject._id} style={styles.subjectCard}>
                                {/* Subject Header */}
                                <div
                                    style={styles.subjectHeader}
                                    onClick={() => toggleSubject(subject._id)}
                                >
                                    <div style={styles.subjectInfo}>
                                        <span style={styles.subjectCode}>{subject.code}</span>
                                        <span style={styles.subjectName}>{subject.name}</span>
                                    </div>
                                    <div style={styles.subjectMeta}>
                                        <span style={styles.noteCount}>{notes.length} notes</span>
                                        {expandedSubject === subject._id ?
                                            <ChevronDown size={20} /> :
                                            <ChevronRight size={20} />
                                        }
                                    </div>
                                </div>

                                {/* Notes List */}
                                {expandedSubject === subject._id && (
                                    <div style={styles.notesContainer}>
                                        {notes.length === 0 ? (
                                            <div style={styles.noNotes}>No notes uploaded yet</div>
                                        ) : (
                                            notes.map(note => (
                                                <div key={note._id} style={styles.noteItem} onClick={() => handlePreview(note._id)}>
                                                    <div style={styles.noteIcon}>
                                                        <FileText size={18} color="#e53935" />
                                                    </div>
                                                    <div style={styles.noteInfo}>
                                                        <span style={styles.noteTitle}>{note.title}</span>
                                                        {note.description && (
                                                            <span style={styles.noteDesc}>{note.description}</span>
                                                        )}
                                                        <span style={styles.noteDate}>
                                                            {note.fileName} • {new Date(note.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <button
                                                        style={styles.previewBtn}
                                                        onClick={(e) => { e.stopPropagation(); handlePreview(note._id); }}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Preview Loading Overlay */}
            {previewLoading && (
                <div style={styles.previewOverlay}>
                    <div style={styles.previewLoadingText}>Loading preview...</div>
                </div>
            )}

            {/* Preview Modal */}
            {previewNote && (
                <div style={styles.previewOverlay} onClick={closePreview}>
                    <div style={styles.previewModal} onClick={e => e.stopPropagation()}>
                        {/* Preview Header */}
                        <div style={styles.previewHeader}>
                            <button onClick={closePreview} style={styles.previewBackBtn}>
                                <ArrowLeft size={18} />
                                <span>Back</span>
                            </button>
                            <div style={styles.previewTitleArea}>
                                <h2 style={styles.previewTitle}>{previewNote.title}</h2>
                                {previewNote.description && (
                                    <p style={styles.previewDesc}>{previewNote.description}</p>
                                )}
                            </div>
                            <div style={styles.previewActions}>
                                <button onClick={handleDownload} style={styles.previewDownloadBtn}>
                                    <Download size={16} />
                                    <span>Download</span>
                                </button>
                                <button onClick={closePreview} style={styles.previewCloseBtn}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div style={styles.previewContent}>
                            {previewNote.fileType === 'image' ? (
                                <img
                                    src={previewNote.fileUrl}
                                    alt={previewNote.title}
                                    style={styles.previewImage}
                                />
                            ) : previewNote.fileType === 'pdf' ? (
                                <iframe
                                    src={previewNote.fileUrl}
                                    style={styles.previewIframe}
                                    title={previewNote.title}
                                />
                            ) : (
                                <div style={styles.previewUnsupported}>
                                    <FileText size={64} color="#ccc" />
                                    <p>Preview not available for this file type.</p>
                                    <p style={{ fontSize: 14, color: '#888' }}>{previewNote.fileName}</p>
                                    <button onClick={handleDownload} style={styles.previewDownloadBtnLarge}>
                                        <Download size={18} />
                                        <span>Download File</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
        paddingBottom: "80px", // space for bottom nav
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
    courseInfo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "15px",
        background: "rgba(59, 130, 246, 0.1)",
        borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
        color: "#93c5fd",
        fontSize: "14px",
        fontWeight: "500",
    },
    main: {
        padding: "20px",
        maxWidth: "800px",
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
    subjectsList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    subjectCard: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    },
    subjectHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "background 0.2s",
        background: "rgba(255,255,255,0.02)",
    },
    subjectInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    subjectCode: {
        background: "rgba(59, 130, 246, 0.2)",
        color: "#93c5fd",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700",
    },
    subjectName: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#fff",
    },
    subjectMeta: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "rgba(255, 255, 255, 0.6)",
    },
    noteCount: {
        fontSize: "13px",
        color: "rgba(255, 255, 255, 0.6)",
    },
    notesContainer: {
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "12px",
        background: "rgba(0,0,0,0.2)",
    },
    noNotes: {
        padding: "20px",
        textAlign: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: "14px",
    },
    noteItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        marginBottom: "8px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    noteIcon: {
        width: "36px",
        height: "36px",
        background: "rgba(239, 68, 68, 0.1)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    noteInfo: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    noteTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#fff",
    },
    noteDesc: {
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.7)",
        marginTop: "2px",
    },
    noteDate: {
        fontSize: "11px",
        color: "rgba(255, 255, 255, 0.5)",
        marginTop: "4px",
    },
    previewBtn: {
        width: "36px",
        height: "36px",
        background: "rgba(59, 130, 246, 0.2)",
        border: "none",
        borderRadius: "8px",
        color: "#93c5fd",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s",
    },
    // Preview Modal Styles
    previewOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
    },
    previewLoadingText: {
        color: "#fff",
        fontSize: "18px",
        fontWeight: "500",
    },
    previewModal: {
        background: "#1E293B",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "900px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
    },
    previewHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.2)",
        gap: "16px",
    },
    previewBackBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
    },
    previewTitleArea: {
        flex: 1,
        minWidth: 0,
    },
    previewTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#fff",
        margin: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    previewDesc: {
        fontSize: "13px",
        color: "rgba(255, 255, 255, 0.7)",
        margin: "4px 0 0",
    },
    previewActions: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
    },
    previewDownloadBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        background: "rgba(59, 130, 246, 0.8)",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },
    previewCloseBtn: {
        width: "36px",
        height: "36px",
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "8px",
        color: "rgba(255, 255, 255, 0.8)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s",
    },
    previewContent: {
        flex: 1,
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.3)", // darker backdrop for previews inside the modal
        minHeight: "400px",
    },
    previewImage: {
        maxWidth: "100%",
        maxHeight: "75vh",
        objectFit: "contain",
    },
    previewIframe: {
        width: "100%",
        height: "75vh",
        border: "none",
        background: "#fff", // PDFs usually need a white background
    },
    previewUnsupported: {
        textAlign: "center",
        padding: "60px 20px",
        color: "rgba(255, 255, 255, 0.6)",
    },
    previewDownloadBtnLarge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 24px",
        background: "rgba(59, 130, 246, 0.8)",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        marginTop: "20px",
    },
};
