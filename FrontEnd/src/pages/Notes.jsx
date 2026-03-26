import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, BookOpen, FileText, Download, ChevronDown, ChevronRight, Eye, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export default function Notes() {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // New state for dropdown
    const [allSubjects, setAllSubjects] = useState([]);
    const [courseObj, setCourseObj] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [notes, setNotes] = useState([]);
    const [notesLoading, setNotesLoading] = useState(false);

    const [previewNote, setPreviewNote] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("studentUser");
        if (stored) {
            const studentData = JSON.parse(stored);
            setStudent(studentData);
            fetchAllSubjects(studentData.course);
        } else {
            navigate("/student/login");
        }
    }, [navigate]);

    const fetchAllSubjects = async (courseName) => {
        try {
            setLoading(true);
            // 1. Get all courses to find the ID
            const coursesRes = await axios.get(`${BACKEND_URL}/courses`);
            if (coursesRes.data.success) {
                const targetCourse = coursesRes.data.courses.find(c => 
                    c.name.toLowerCase() === courseName.toLowerCase() || 
                    c.code.toLowerCase() === courseName.toLowerCase()
                );
                
                if (targetCourse) {
                    setCourseObj(targetCourse);
                    // 2. Fetch all subjects for this course
                    const subjectsRes = await axios.get(`${BACKEND_URL}/subjects/by-course/${targetCourse._id}`);
                    if (subjectsRes.data.success) {
                        setAllSubjects(subjectsRes.data.subjects);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch subjects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectChange = async (e) => {
        const subId = e.target.value;
        setSelectedSubjectId(subId);
        setNotes([]);
        
        if (!subId) return;

        try {
            setNotesLoading(true);
            const res = await axios.get(`${BACKEND_URL}/notes/by-subject/${subId}`);
            if (res.data.success) {
                setNotes(res.data.notes);
            }
        } catch (error) {
            console.error("Failed to fetch notes:", error);
        } finally {
            setNotesLoading(false);
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

    const closePreview = () => setPreviewNote(null);

    if (!student) return null;

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <Link to="/student/home" style={styles.backBtn}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Link>
                <h1 style={styles.title}>Study Notes</h1>
                <div style={{ width: 80 }}></div>
            </header>

            <div style={styles.courseInfoContainer}>
                <div style={styles.courseInfo}>
                    <BookOpen size={20} />
                    <span>{student.course} - Browse Library</span>
                </div>
                {courseObj?.description && (
                    <div style={styles.courseDescription}>
                        {courseObj.description}
                    </div>
                )}
            </div>

            <main style={styles.main}>
                {loading ? (
                    <div style={styles.loading}>Loading subjects catalog...</div>
                ) : (
                    <div style={styles.selectContainer}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#fff" }}>Select a Subject to view notes:</h4>
                        <select 
                            style={styles.selectBox} 
                            value={selectedSubjectId} 
                            onChange={handleSubjectChange}
                        >
                            <option value="">-- Choose Subject --</option>
                            {allSubjects.map(sub => (
                                <option key={sub._id} value={sub._id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Notes List for Selected Subject */}
                {selectedSubjectId && (
                    <div style={styles.subjectCard}>
                        <div style={styles.subjectHeader}>
                            <div style={styles.subjectInfo}>
                                <span style={styles.subjectCode}>NOTES</span>
                                <span style={styles.subjectName}>
                                    {allSubjects.find(s => s._id === selectedSubjectId)?.name}
                                </span>
                            </div>
                            <div style={styles.subjectMeta}>
                                <span style={styles.noteCount}>{notes.length} notes</span>
                            </div>
                        </div>

                        <div style={styles.notesContainer}>
                            {notesLoading ? (
                                <div style={styles.loading}>Fetching notes...</div>
                            ) : notes.length === 0 ? (
                                <div style={styles.noNotes}>No notes uploaded for this subject yet.</div>
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
                    </div>
                )}
            </main>

            {/* Preview Overlays */}
            {previewLoading && (
                <div style={styles.previewOverlay}>
                    <div style={styles.previewLoadingText}>Loading preview...</div>
                </div>
            )}

            {previewNote && (
                <div style={styles.previewOverlay} onClick={closePreview}>
                    <div style={styles.previewModal} onClick={e => e.stopPropagation()}>
                        <div style={styles.previewHeader}>
                            <button onClick={closePreview} style={styles.previewBackBtn}>
                                <ArrowLeft size={18} />
                                <span>Back</span>
                            </button>
                            <div style={styles.previewTitleArea}>
                                <h2 style={styles.previewTitle}>{previewNote.title}</h2>
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
                        <div style={styles.previewContent}>
                            {previewNote.fileType === 'image' ? (
                                <img src={previewNote.fileUrl} alt={previewNote.title} style={styles.previewImage} />
                            ) : previewNote.fileType === 'pdf' ? (
                                <iframe src={previewNote.fileUrl} style={styles.previewIframe} title={previewNote.title} />
                            ) : (
                                <div style={styles.previewUnsupported}>
                                    <FileText size={64} color="#ccc" />
                                    <p>Preview not available for this file type.</p>
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

// Add our existing styles plus the selectContainer and selectBox
const styles = {
    // ... we merge existing styles from file
    selectContainer: {
        background: "rgba(255, 255, 255, 0.05)",
        padding: "20px",
        borderRadius: "16px",
        marginBottom: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    },
    selectBox: {
        width: "100%",
        padding: "12px",
        fontSize: "15px",
        background: "rgba(15, 23, 42, 0.8)",
        color: "#fff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "8px",
        outline: "none",
        cursor: "pointer",
    },

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
    courseInfoContainer: {
        background: "rgba(59, 130, 246, 0.1)",
        borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
        padding: "15px 20px",
    },
    courseInfo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        color: "#93c5fd",
        fontSize: "14px",
        fontWeight: "500",
    },
    courseDescription: {
        marginTop: "8px",
        fontSize: "13px",
        color: "rgba(255, 255, 255, 0.7)",
        textAlign: "center",
        fontStyle: "italic",
        maxWidth: "600px",
        margin: "8px auto 0",
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
