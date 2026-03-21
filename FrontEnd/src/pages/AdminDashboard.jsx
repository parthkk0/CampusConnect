import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = `http://${window.location.hostname}:5000/api`;

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("students"); // 'students', 'lostfound', 'announcements', 'courses', 'notes'
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    // Lost & Found State
    const [lostFoundItems, setLostFoundItems] = useState([]);
    const [filteredLostFound, setFilteredLostFound] = useState([]);
    const [lfSearchTerm, setLfSearchTerm] = useState("");
    const [lfTypeFilter, setLfTypeFilter] = useState("all");
    const [isLoadingLF, setIsLoadingLF] = useState(false);

    // Announcements State
    const [announcements, setAnnouncements] = useState([]);
    const [isLoadingAnn, setIsLoadingAnn] = useState(false);
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

    // Courses State
    const [courses, setCourses] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [showSubjectForm, setShowSubjectForm] = useState(false);

    // Notes State
    const [notes, setNotes] = useState([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [selectedSubjectForNotes, setSelectedSubjectForNotes] = useState(null);

    const navigate = useNavigate();

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin/login");
        } else {
            fetchStudents();
        }
    }, [navigate]);

    // Fetch data when tab changes
    useEffect(() => {
        if (activeTab === "lostfound") {
            fetchLostFoundItems();
        } else if (activeTab === "announcements") {
            fetchAnnouncements();
        } else if (activeTab === "courses") {
            fetchCourses();
        } else if (activeTab === "notes") {
            fetchCourses(); // Need courses for dropdown
        }
    }, [activeTab]);

    // Filter students when search or status changes
    useEffect(() => {
        let filtered = students;

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(s => s.approvalStatus === statusFilter);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredStudents(filtered);
    }, [students, searchTerm, statusFilter]);

    // Filter Lost & Found items
    useEffect(() => {
        let filtered = lostFoundItems;

        if (lfTypeFilter !== "all") {
            filtered = filtered.filter(item => item.type === lfTypeFilter);
        }

        if (lfSearchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(lfSearchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(lfSearchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(lfSearchTerm.toLowerCase()))
            );
        }

        setFilteredLostFound(filtered);
    }, [lostFoundItems, lfSearchTerm, lfTypeFilter]);

    async function fetchStudents() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(`${BACKEND_URL}/admin/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStudents(response.data.students);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("adminToken");
                navigate("/admin/login");
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchLostFoundItems() {
        setIsLoadingLF(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/lost-found/admin/all`);
            if (response.data.success) {
                setLostFoundItems(response.data.items);
            }
        } catch (error) {
            console.error("Failed to fetch Lost & Found items:", error);
        } finally {
            setIsLoadingLF(false);
        }
    }

    async function fetchAnnouncements() {
        setIsLoadingAnn(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/announcements`);
            if (response.data.success) {
                setAnnouncements(response.data.announcements);
            }
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        } finally {
            setIsLoadingAnn(false);
        }
    }

    async function handleDeleteAnnouncement(id) {
        if (!window.confirm("Are you sure you want to delete this announcement?")) {
            return;
        }
        try {
            await axios.delete(`${BACKEND_URL}/announcements/${id}`);
            fetchAnnouncements();
        } catch (error) {
            alert("Failed to delete announcement: " + (error.response?.data?.error || error.message));
        }
    }

    async function fetchCourses() {
        setIsLoadingCourses(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/courses`);
            if (response.data.success) {
                setCourses(response.data.courses);
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setIsLoadingCourses(false);
        }
    }

    async function fetchSubjects(courseId) {
        try {
            const response = await axios.get(`${BACKEND_URL}/subjects/by-course/${courseId}`);
            if (response.data.success) {
                setSubjects(response.data.subjects);
            }
        } catch (error) {
            console.error("Failed to fetch subjects:", error);
        }
    }

    async function fetchNotes(subjectId) {
        setIsLoadingNotes(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/notes/by-subject/${subjectId}`);
            if (response.data.success) {
                setNotes(response.data.notes);
            }
        } catch (error) {
            console.error("Failed to fetch notes:", error);
        } finally {
            setIsLoadingNotes(false);
        }
    }

    async function handleDeleteCourse(id) {
        if (!window.confirm("Delete this course? This will also delete all subjects and notes.")) return;
        try {
            await axios.delete(`${BACKEND_URL}/courses/${id}`);
            fetchCourses();
            setSelectedCourse(null);
            setSubjects([]);
        } catch (error) {
            alert("Failed to delete course: " + (error.response?.data?.error || error.message));
        }
    }

    async function handleDeleteSubject(id) {
        if (!window.confirm("Delete this subject and all its notes?")) return;
        try {
            await axios.delete(`${BACKEND_URL}/subjects/${id}`);
            if (selectedCourse) fetchSubjects(selectedCourse._id);
        } catch (error) {
            alert("Failed to delete subject: " + (error.response?.data?.error || error.message));
        }
    }

    async function handleDeleteNote(id) {
        if (!window.confirm("Delete this note?")) return;
        try {
            await axios.delete(`${BACKEND_URL}/notes/${id}`);
            if (selectedSubjectForNotes) fetchNotes(selectedSubjectForNotes);
        } catch (error) {
            alert("Failed to delete note: " + (error.response?.data?.error || error.message));
        }
    }
    function handleLogout() {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
    }

    async function handleDeleteStudent(id) {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");
            await axios.delete(`${BACKEND_URL}/admin/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchStudents();
        } catch (error) {
            alert("Failed to delete student: " + (error.response?.data?.error || error.message));
        }
    }

    async function handleDeleteLostFoundItem(id) {
        if (!window.confirm("Are you sure you want to delete this item?")) {
            return;
        }

        try {
            await axios.delete(`${BACKEND_URL}/lost-found/admin/${id}`);
            fetchLostFoundItems();
        } catch (error) {
            alert("Failed to delete item: " + (error.response?.data?.error || error.message));
        }
    }

    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header} className="header-mobile">
                <div style={styles.headerLeft}>
                    <h1 style={styles.title}>🎓 Admin Dashboard</h1>
                    <p style={styles.subtitle}>Manage Campus Connect</p>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.userName}>👤 {adminUser.username}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabNav}>
                <button
                    onClick={() => setActiveTab("students")}
                    style={activeTab === "students" ? styles.activeTab : styles.tab}
                >
                    👥 Students
                </button>
                <button
                    onClick={() => setActiveTab("lostfound")}
                    style={activeTab === "lostfound" ? styles.activeTab : styles.tab}
                >
                    🔍 Lost & Found
                </button>
                <button
                    onClick={() => setActiveTab("announcements")}
                    style={activeTab === "announcements" ? styles.activeTab : styles.tab}
                >
                    📢 Announcements
                </button>
                <button
                    onClick={() => setActiveTab("courses")}
                    style={activeTab === "courses" ? styles.activeTab : styles.tab}
                >
                    📚 Courses
                </button>
                <button
                    onClick={() => setActiveTab("notes")}
                    style={activeTab === "notes" ? styles.activeTab : styles.tab}
                >
                    📝 Notes
                </button>
            </div>

            {/* Students Tab Content */}
            {activeTab === "students" && (
                <>
                    {/* Actions Bar */}
                    <div style={styles.actionsBar} className="header-mobile">
                        <div style={styles.searchBox}>
                            <input
                                type="text"
                                placeholder="🔍 Search by roll, name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>

                        <div style={styles.filterBox}>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={styles.select}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <button onClick={() => setShowAddForm(true)} style={styles.addBtn}>
                            + Add Student
                        </button>
                        <button onClick={() => setShowBulkUpload(true)} style={styles.bulkBtn}>
                            📄 Bulk Upload
                        </button>
                    </div>

                    {/* Student List */}
                    <div style={styles.content} className="page-container">
                        {isLoading ? (
                            <div style={styles.loading}>Loading students...</div>
                        ) : filteredStudents.length === 0 ? (
                            <div style={styles.empty}>
                                No students found. {students.length === 0 ? "Add some students to get started." : "Try adjusting your filters."}
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={styles.th}>Roll No</th>
                                            <th style={styles.th}>Name</th>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>Course</th>
                                            <th style={styles.th}>Year</th>
                                            <th style={styles.th}>Fee</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr key={student._id} style={styles.tableRow}>
                                                <td style={styles.td}>{student.roll}</td>
                                                <td style={styles.td}>{student.name}</td>
                                                <td style={styles.td}>{student.email}</td>
                                                <td style={styles.td}>{student.course || "-"}</td>
                                                <td style={styles.td}>{student.year || "-"}</td>
                                                <td style={styles.td}>₹{student.courseFee || 0}</td>
                                                <td style={styles.td}>
                                                    <span style={getStatusStyle(student.approvalStatus)}>
                                                        {student.approvalStatus}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button
                                                        onClick={() => handleDeleteStudent(student._id)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div style={styles.stats}>
                            Showing {filteredStudents.length} of {students.length} students
                        </div>
                    </div>
                </>
            )}

            {/* Lost & Found Tab Content */}
            {activeTab === "lostfound" && (
                <>
                    {/* Actions Bar for Lost & Found */}
                    <div style={styles.actionsBar} className="header-mobile">
                        <div style={styles.searchBox}>
                            <input
                                type="text"
                                placeholder="🔍 Search by title, location..."
                                value={lfSearchTerm}
                                onChange={(e) => setLfSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>

                        <div style={styles.filterBox}>
                            <select
                                value={lfTypeFilter}
                                onChange={(e) => setLfTypeFilter(e.target.value)}
                                style={styles.select}
                            >
                                <option value="all">All Types</option>
                                <option value="lost">Lost Items</option>
                                <option value="found">Found Items</option>
                            </select>
                        </div>
                    </div>

                    {/* Lost & Found List */}
                    <div style={styles.content} className="page-container">
                        {isLoadingLF ? (
                            <div style={styles.loading}>Loading items...</div>
                        ) : filteredLostFound.length === 0 ? (
                            <div style={styles.empty}>
                                No lost & found items found.
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={styles.th}>Type</th>
                                            <th style={styles.th}>Title</th>
                                            <th style={styles.th}>Location</th>
                                            <th style={styles.th}>Date</th>
                                            <th style={styles.th}>Reported By</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLostFound.map((item) => (
                                            <tr key={item._id} style={styles.tableRow}>
                                                <td style={styles.td}>
                                                    <span style={getTypeStyle(item.type)}>
                                                        {item.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>{item.title}</td>
                                                <td style={styles.td}>{item.location}</td>
                                                <td style={styles.td}>{new Date(item.date).toLocaleDateString()}</td>
                                                <td style={styles.td}>{item.reportedBy || "-"}</td>
                                                <td style={styles.td}>
                                                    <span style={getLFStatusStyle(item.status)}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button
                                                        onClick={() => handleDeleteLostFoundItem(item._id)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div style={styles.stats}>
                            Showing {filteredLostFound.length} of {lostFoundItems.length} items
                        </div>
                    </div>
                </>
            )}

            {/* Announcements Tab Content */}
            {activeTab === "announcements" && (
                <>
                    {/* Actions Bar */}
                    <div style={styles.actionsBar} className="header-mobile">
                        <div style={styles.searchBox}>
                            <h3 style={{ margin: 0, color: "#333" }}>📢 Manage Announcements</h3>
                        </div>
                        <button onClick={() => setShowAnnouncementForm(true)} style={styles.addBtn}>
                            + Post Announcement
                        </button>
                    </div>

                    {/* Announcements List */}
                    <div style={styles.content} className="page-container">
                        {isLoadingAnn ? (
                            <div style={styles.loading}>Loading announcements...</div>
                        ) : announcements.length === 0 ? (
                            <div style={styles.empty}>
                                No announcements yet. Click "Post Announcement" to create one.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {announcements.map((ann) => (
                                    <div key={ann._id} style={announcementCardStyles.card}>
                                        <div style={announcementCardStyles.header}>
                                            <div>
                                                <h4 style={announcementCardStyles.title}>{ann.title}</h4>
                                                <span style={announcementCardStyles.date}>
                                                    {new Date(ann.createdAt).toLocaleString()} • By {ann.postedBy}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAnnouncement(ann._id)}
                                                style={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        {ann.content && <p style={announcementCardStyles.content}>{ann.content}</p>}
                                        {ann.attachmentType === "image" && ann.attachmentUrl && (
                                            <img src={ann.attachmentUrl} alt="Attachment" style={announcementCardStyles.image} />
                                        )}
                                        {ann.attachmentType === "pdf" && ann.attachmentUrl && (
                                            <div style={announcementCardStyles.pdf}>
                                                📄 {ann.attachmentName || "PDF Document"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={styles.stats}>
                            Total announcements: {announcements.length}
                        </div>
                    </div>
                </>
            )}

            {/* Courses Tab Content */}
            {activeTab === "courses" && (
                <>
                    <div style={styles.actionsBar} className="header-mobile">
                        <div style={styles.searchBox}>
                            <h3 style={{ margin: 0, color: "#333" }}>📚 Manage Courses & Subjects</h3>
                        </div>
                        <button onClick={() => setShowCourseForm(true)} style={styles.addBtn}>
                            + Add Course
                        </button>
                    </div>

                    <div style={styles.content} className="page-container">
                        {isLoadingCourses ? (
                            <div style={styles.loading}>Loading courses...</div>
                        ) : courses.length === 0 ? (
                            <div style={styles.empty}>No courses yet. Click "Add Course" to create one.</div>
                        ) : (
                            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                                {/* Course List */}
                                <div style={{ flex: "1 1 300px" }}>
                                    <h4 style={{ margin: "0 0 12px", color: "#fff" }}>Courses</h4>
                                    {courses.map(course => (
                                        <div
                                            key={course._id}
                                            style={{
                                                padding: 15,
                                                background: selectedCourse?._id === course._id ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                                borderRadius: 10,
                                                marginBottom: 10,
                                                cursor: "pointer",
                                                border: selectedCourse?._id === course._id ? "2px solid #3B82F6" : "1px solid rgba(255,255,255,0.1)"
                                            }}
                                            onClick={() => { setSelectedCourse(course); fetchSubjects(course._id); }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <span style={{ fontWeight: 600, color: "#fff" }}>{course.name}</span>
                                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginLeft: 8 }}>({course.code})</span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course._id); }} style={styles.deleteBtn}>Delete</button>
                                            </div>
                                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                                                {course.totalYears} years • {course.semestersPerYear} semesters/year
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Subject List */}
                                {selectedCourse && (
                                    <div style={{ flex: "1 1 400px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                            <h4 style={{ margin: 0, color: "#fff" }}>Subjects for {selectedCourse.name}</h4>
                                            <button onClick={() => setShowSubjectForm(true)} style={{ ...styles.addBtn, padding: "6px 12px", fontSize: 13 }}>+ Add Subject</button>
                                        </div>
                                        {subjects.length === 0 ? (
                                            <div style={{ padding: 20, background: "rgba(255,255,255,0.05)", borderRadius: 10, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
                                                No subjects yet. Add your first subject.
                                            </div>
                                        ) : (
                                            <div>
                                                {subjects.map(subject => (
                                                    <div key={subject._id} style={{ padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 8, border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <span style={{ fontWeight: 500, color: "#fff" }}>{subject.name}</span>
                                                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginLeft: 6 }}>({subject.code})</span>
                                                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Year {subject.year} • Sem {subject.semester}</div>
                                                        </div>
                                                        <button onClick={() => handleDeleteSubject(subject._id)} style={{ ...styles.deleteBtn, padding: "4px 10px", fontSize: 11 }}>Delete</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Notes Tab Content */}
            {activeTab === "notes" && (
                <>
                    <div style={styles.actionsBar} className="header-mobile">
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <select
                                onChange={(e) => {
                                    const c = courses.find(x => x._id === e.target.value);
                                    setSelectedCourse(c);
                                    if (c) fetchSubjects(c._id);
                                    setSelectedSubjectForNotes(null);
                                    setNotes([]);
                                }}
                                style={styles.select}
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                            {selectedCourse && (
                                <select
                                    onChange={(e) => {
                                        setSelectedSubjectForNotes(e.target.value);
                                        if (e.target.value) fetchNotes(e.target.value);
                                    }}
                                    style={styles.select}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name} (Y{s.year} S{s.semester})</option>)}
                                </select>
                            )}
                        </div>
                        {selectedSubjectForNotes && (
                            <button onClick={() => setShowNoteForm(true)} style={styles.addBtn}>+ Upload Note</button>
                        )}
                    </div>

                    <div style={styles.content}>
                        {!selectedSubjectForNotes ? (
                            <div style={styles.empty}>Select a course and subject to manage notes</div>
                        ) : isLoadingNotes ? (
                            <div style={styles.loading}>Loading notes...</div>
                        ) : notes.length === 0 ? (
                            <div style={styles.empty}>No notes yet. Click "Upload Note" to add one.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {notes.map(note => (
                                    <div key={note._id} style={{ padding: 15, background: "rgba(255,255,255,0.05)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <span style={{ fontWeight: 500, color: "#fff" }}>{note.title}</span>
                                            {note.description && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{note.description}</div>}
                                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{note.fileName} • {new Date(note.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <button onClick={() => handleDeleteNote(note._id)} style={styles.deleteBtn}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={styles.stats}>Total notes: {notes.length}</div>
                    </div>
                </>
            )}

            {/* Course Form Modal */}
            {showCourseForm && (
                <CourseModal
                    onClose={() => setShowCourseForm(false)}
                    onSuccess={() => { setShowCourseForm(false); fetchCourses(); }}
                />
            )}

            {/* Subject Form Modal */}
            {showSubjectForm && selectedCourse && (
                <SubjectModal
                    courseId={selectedCourse._id}
                    courseName={selectedCourse.name}
                    totalYears={selectedCourse.totalYears}
                    semestersPerYear={selectedCourse.semestersPerYear}
                    onClose={() => setShowSubjectForm(false)}
                    onSuccess={() => { setShowSubjectForm(false); fetchSubjects(selectedCourse._id); }}
                />
            )}

            {/* Note Form Modal */}
            {showNoteForm && selectedSubjectForNotes && (
                <NoteModal
                    subjectId={selectedSubjectForNotes}
                    adminUser={adminUser}
                    onClose={() => setShowNoteForm(false)}
                    onSuccess={() => { setShowNoteForm(false); fetchNotes(selectedSubjectForNotes); }}
                />
            )}

            {/* Add Announcement Modal */}
            {showAnnouncementForm && (
                <AnnouncementModal
                    onClose={() => setShowAnnouncementForm(false)}
                    onSuccess={() => {
                        setShowAnnouncementForm(false);
                        fetchAnnouncements();
                    }}
                    adminUser={adminUser}
                />
            )}

            {/* Add Student Form Modal */}
            {showAddForm && (
                <AddStudentModal
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        fetchStudents();
                    }}
                />
            )}

            {/* Bulk Upload Modal */}
            {showBulkUpload && (
                <BulkUploadModal
                    onClose={() => setShowBulkUpload(false)}
                    onSuccess={() => {
                        setShowBulkUpload(false);
                        fetchStudents();
                    }}
                />
            )}
        </div>
    );
}

// Add Student Modal Component
function AddStudentModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        roll: "",
        name: "",
        email: "",
        course: "",
        year: "",
        semester: "",
        courseFee: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourseObj, setSelectedCourseObj] = useState(null);

    // Fetch available courses on mount
    useEffect(() => {
        async function loadCourses() {
            try {
                const res = await axios.get(`${BACKEND_URL}/courses`);
                if (res.data.success) {
                    setAvailableCourses(res.data.courses);
                }
            } catch (err) {
                console.error("Failed to load courses:", err);
            }
        }
        loadCourses();
    }, []);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleCourseChange(e) {
        const courseId = e.target.value;
        const courseObj = availableCourses.find(c => c._id === courseId);
        setSelectedCourseObj(courseObj || null);
        setFormData({
            ...formData,
            course: courseObj ? courseObj.name : "",
            year: "",
            semester: ""
        });
    }

    // Generate year options based on selected course
    const yearOptions = selectedCourseObj
        ? Array.from({ length: selectedCourseObj.totalYears }, (_, i) => i + 1)
        : [];

    // Generate semester options based on selected course and year
    const semesterOptions = selectedCourseObj && formData.year
        ? Array.from(
            { length: selectedCourseObj.semestersPerYear || 2 },
            (_, i) => (parseInt(formData.year) - 1) * (selectedCourseObj.semestersPerYear || 2) + i + 1
        )
        : [];

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!formData.roll || !formData.name || !formData.email) {
            setError("Roll, name, and email are required");
            return;
        }

        if (!formData.course) {
            setError("Please select a course");
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem("adminToken");
            await axios.post(`${BACKEND_URL}/admin/students/add`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add student");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()} className="modal-mobile">
                <h2 style={modalStyles.title}>Add New Student</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        name="roll"
                        placeholder="Roll Number *"
                        value={formData.roll}
                        onChange={handleChange}
                        style={modalStyles.input}
                    />
                    <input
                        name="name"
                        placeholder="Full Name *"
                        value={formData.name}
                        onChange={handleChange}
                        style={modalStyles.input}
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email *"
                        value={formData.email}
                        onChange={handleChange}
                        style={modalStyles.input}
                    />
                    <select
                        name="course"
                        value={selectedCourseObj ? selectedCourseObj._id : ""}
                        onChange={handleCourseChange}
                        style={modalStyles.input}
                    >
                        <option value="">Select Course *</option>
                        {availableCourses.map(c => (
                            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                        ))}
                    </select>
                    {selectedCourseObj && (
                        <select
                            name="year"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value, semester: "" })}
                            style={modalStyles.input}
                        >
                            <option value="">Select Year</option>
                            {yearOptions.map(y => (
                                <option key={y} value={y}>Year {y}</option>
                            ))}
                        </select>
                    )}
                    {formData.year && (
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            style={modalStyles.input}
                        >
                            <option value="">Select Semester</option>
                            {semesterOptions.map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    )}
                    <input
                        name="courseFee"
                        type="number"
                        placeholder="Course Fee"
                        value={formData.courseFee}
                        onChange={handleChange}
                        style={modalStyles.input}
                    />

                    {error && <div style={modalStyles.error}>{error}</div>}

                    <div style={modalStyles.buttons}>
                        <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} style={modalStyles.submitBtn}>
                            {isLoading ? "Adding..." : "Add Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Bulk Upload Modal Component
function BulkUploadModal({ onClose, onSuccess }) {
    const [csvText, setCsvText] = useState("");
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleUpload() {
        if (!csvText.trim()) {
            alert("Please paste CSV data");
            return;
        }

        setIsLoading(true);
        setResults(null);

        try {
            // Parse CSV
            const lines = csvText.trim().split("\n");
            const headers = lines[0].split(",").map(h => h.trim());

            const students = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(",").map(v => v.trim());
                const student = {};
                headers.forEach((header, index) => {
                    student[header] = values[index];
                });
                students.push(student);
            }

            // Upload to backend
            const token = localStorage.getItem("adminToken");
            const response = await axios.post(
                `${BACKEND_URL}/admin/students/bulk-add`,
                { students },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setResults(response.data.results);
        } catch (error) {
            alert("Upload failed: " + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={{ ...modalStyles.modal, width: "90%", maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
                <h2 style={modalStyles.title}>Bulk Upload Students (CSV)</h2>

                <div style={modalStyles.help}>
                    Format: <code>roll,name,email,course,year,courseFee</code>
                    <br />
                    Example: <code>22IT001,John Doe,john@college.edu,CS,2nd,50000</code>
                </div>

                <textarea
                    placeholder="Paste CSV data here..."
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    style={modalStyles.textarea}
                    rows={10}
                />

                {results && (
                    <div style={modalStyles.results}>
                        <p>✅ Successfully added: {results.success.length}</p>
                        <p>❌ Failed: {results.failed.length}</p>
                        {results.failed.length > 0 && (
                            <div>
                                <strong>Errors:</strong>
                                {results.failed.map((f, i) => (
                                    <div key={i}>{f.roll}: {f.error}</div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div style={modalStyles.buttons}>
                    <button onClick={onClose} style={modalStyles.cancelBtn}>
                        {results ? "Close" : "Cancel"}
                    </button>
                    {!results && (
                        <button onClick={handleUpload} disabled={isLoading} style={modalStyles.submitBtn}>
                            {isLoading ? "Uploading..." : "Upload"}
                        </button>
                    )}
                    {results && (
                        <button onClick={onSuccess} style={modalStyles.submitBtn}>
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function getStatusStyle(status) {
    const baseStyle = {
        padding: "4px 12px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    };

    const colors = {
        pending: { background: "#fff3cd", color: "#856404" },
        approved: { background: "#d4edda", color: "#155724" },
        rejected: { background: "#f8d7da", color: "#721c24" },
    };

    return { ...baseStyle, ...colors[status] };
}

function getTypeStyle(type) {
    const baseStyle = {
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: "700",
    };

    if (type === "lost") {
        return { ...baseStyle, background: "#fee2e2", color: "#991b1b" };
    } else {
        return { ...baseStyle, background: "#dcfce7", color: "#166534" };
    }
}

function getLFStatusStyle(status) {
    const baseStyle = {
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: "600",
        textTransform: "capitalize",
    };

    if (status === "resolved") {
        return { ...baseStyle, background: "#e0e7ff", color: "#3730a3" };
    } else {
        return { ...baseStyle, background: "#fef3c7", color: "#92400e" };
    }
}

// Announcement Modal Component
function AnnouncementModal({ onClose, onSuccess, adminUser }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachmentType, setAttachmentType] = useState("none");
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [attachmentName, setAttachmentName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachmentUrl(reader.result);
            setAttachmentName(file.name);
            if (file.type.startsWith("image/")) {
                setAttachmentType("image");
            } else if (file.type === "application/pdf") {
                setAttachmentType("pdf");
            }
        };
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${BACKEND_URL}/announcements`, {
                title,
                content,
                attachmentType,
                attachmentUrl,
                attachmentName,
                postedBy: adminUser.username || "Admin"
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to post announcement");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={{ ...modalStyles.modal, width: "90%", maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
                <h2 style={modalStyles.title}>📢 Post Announcement</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        placeholder="Title *"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={modalStyles.input}
                    />
                    <textarea
                        placeholder="Message content (optional)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ ...modalStyles.input, minHeight: 100, resize: "vertical" }}
                        rows={4}
                    />

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "500", color: "#333" }}>
                            Attach Image or PDF (optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            style={{ fontSize: 14 }}
                        />
                        {attachmentType !== "none" && (
                            <div style={{ marginTop: 10, padding: 10, background: "#f0f0f0", borderRadius: 8 }}>
                                {attachmentType === "image" && (
                                    <img src={attachmentUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 6 }} />
                                )}
                                {attachmentType === "pdf" && (
                                    <span>📄 {attachmentName}</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { setAttachmentType("none"); setAttachmentUrl(""); setAttachmentName(""); }}
                                    style={{ marginLeft: 10, padding: "4px 10px", background: "#ff5252", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    {error && <div style={modalStyles.error}>{error}</div>}

                    <div style={modalStyles.buttons}>
                        <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} style={modalStyles.submitBtn}>
                            {isLoading ? "Posting..." : "Post Announcement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Course Modal Component
function CourseModal({ onClose, onSuccess }) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [totalYears, setTotalYears] = useState(3);
    const [semestersPerYear, setSemestersPerYear] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name || !code) {
            setError("Name and code are required");
            return;
        }
        setIsLoading(true);
        try {
            await axios.post(`http://${window.location.hostname}:5000/api/courses`, {
                name, code, description, totalYears, semestersPerYear
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create course");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={modalStyles.title}>Add Course</h2>
                <form onSubmit={handleSubmit}>
                    <input placeholder="Course Name *" value={name} onChange={(e) => setName(e.target.value)} style={modalStyles.input} />
                    <input placeholder="Course Code *" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={modalStyles.input} />
                    <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={modalStyles.input} />
                    <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, color: "#666" }}>Total Years</label>
                            <input type="number" min="1" max="6" value={totalYears} onChange={(e) => setTotalYears(parseInt(e.target.value))} style={modalStyles.input} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, color: "#666" }}>Semesters/Year</label>
                            <input type="number" min="1" max="4" value={semestersPerYear} onChange={(e) => setSemestersPerYear(parseInt(e.target.value))} style={modalStyles.input} />
                        </div>
                    </div>
                    {error && <div style={modalStyles.error}>{error}</div>}
                    <div style={modalStyles.buttons}>
                        <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={isLoading} style={modalStyles.submitBtn}>{isLoading ? "Creating..." : "Create Course"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Subject Modal Component
function SubjectModal({ courseId, courseName, totalYears, semestersPerYear, onClose, onSuccess }) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const totalSemesters = totalYears * semestersPerYear;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name || !code) {
            setError("Name and code are required");
            return;
        }
        setIsLoading(true);
        try {
            await axios.post(`http://${window.location.hostname}:5000/api/subjects`, {
                name, code, courseId, year, semester
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create subject");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={modalStyles.title}>Add Subject to {courseName}</h2>
                <form onSubmit={handleSubmit}>
                    <input placeholder="Subject Name *" value={name} onChange={(e) => setName(e.target.value)} style={modalStyles.input} />
                    <input placeholder="Subject Code *" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={modalStyles.input} />
                    <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, color: "#666" }}>Year</label>
                            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={modalStyles.input}>
                                {[...Array(totalYears)].map((_, i) => <option key={i + 1} value={i + 1}>Year {i + 1}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, color: "#666" }}>Semester</label>
                            <select value={semester} onChange={(e) => setSemester(parseInt(e.target.value))} style={modalStyles.input}>
                                {[...Array(totalSemesters)].map((_, i) => <option key={i + 1} value={i + 1}>Sem {i + 1}</option>)}
                            </select>
                        </div>
                    </div>
                    {error && <div style={modalStyles.error}>{error}</div>}
                    <div style={modalStyles.buttons}>
                        <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={isLoading} style={modalStyles.submitBtn}>{isLoading ? "Creating..." : "Create Subject"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Note Modal Component
function NoteModal({ subjectId, adminUser, onClose, onSuccess }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [fileType, setFileType] = useState("pdf");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        // MongoDB Document limit is 16MB. Base64 adds ~33% overhead.
        // Restricting uploads to exactly 10MB max ensures we never crash the DB.
        if (file.size > 10 * 1024 * 1024) {
            setError("File is too large! Maximum limit is 10MB.");
            return;
        }

        setError(""); // Clear any previous errors

        const reader = new FileReader();
        reader.onloadend = () => {
            setFileUrl(reader.result);
            setFileName(file.name);
            if (file.type.startsWith("image/")) setFileType("image");
            else if (file.type === "application/pdf") setFileType("pdf");
            else setFileType("doc");
        };
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title || !fileUrl) {
            setError("Title and file are required");
            return;
        }
        setIsLoading(true);
        try {
            await axios.post(`http://${window.location.hostname}:5000/api/notes`, {
                title, description, subjectId, fileType, fileUrl, fileName,
                uploadedBy: adminUser?.username || "Admin"
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to upload note");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={modalStyles.title}>Upload Note</h2>
                <form onSubmit={handleSubmit}>
                    <input placeholder="Note Title *" value={title} onChange={(e) => setTitle(e.target.value)} style={modalStyles.input} />
                    <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={modalStyles.input} />
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>Select File *</label>
                        <input type="file" accept=".pdf,image/*,.doc,.docx" onChange={handleFileChange} />
                        {fileName && <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>📄 {fileName}</div>}
                    </div>
                    {error && <div style={modalStyles.error}>{error}</div>}
                    <div style={modalStyles.buttons}>
                        <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={isLoading} style={modalStyles.submitBtn}>{isLoading ? "Uploading..." : "Upload Note"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const announcementCardStyles = {
    card: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    title: {
        margin: 0,
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    date: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.6)",
    },
    content: {
        margin: "12px 0",
        fontSize: 15,
        color: "rgba(255, 255, 255, 0.9)",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
    },
    image: {
        maxWidth: "100%",
        maxHeight: 300,
        borderRadius: 8,
        marginTop: 10,
    },
    pdf: {
        marginTop: 10,
        padding: 12,
        background: "rgba(2ef, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: 8,
        color: "#fca5a5",
        fontWeight: "500",
    },
};

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        color: "#ffffff",
        fontFamily: "'Inter', 'Poppins', sans-serif"
    },
    tabNav: {
        display: "flex",
        gap: 10,
        padding: "15px 20px",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    tab: {
        padding: "10px 20px",
        background: "transparent",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.7)",
        transition: "all 0.2s"
    },
    activeTab: {
        padding: "10px 20px",
        background: "rgba(255, 255, 255, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
    },
    header: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        color: "#fff",
        padding: "25px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    headerLeft: {},
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: 15,
    },
    title: {
        margin: 0,
        fontSize: 28,
        fontWeight: "700",
        background: "linear-gradient(to right, #ffffff, #93c5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    subtitle: {
        margin: "5px 0 0 0",
        opacity: 0.8,
        fontSize: 14,
        color: "#cbd5e1"
    },
    userName: {
        fontSize: 14,
        color: "#f8fafc"
    },
    logoutBtn: {
        padding: "8px 20px",
        background: "rgba(239, 68, 68, 0.2)",
        color: "#fca5a5",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "500",
        transition: "all 0.2s"
    },
    actionsBar: {
        padding: 20,
        background: "transparent",
        display: "flex",
        gap: 15,
        alignItems: "center",
        flexWrap: "wrap",
    },
    searchBox: {
        flex: 1,
    },
    searchInput: {
        width: "100%",
        padding: 12,
        fontSize: 14,
        background: "rgba(255, 255, 255, 0.1)",
        color: "#fff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
        boxSizing: "border-box",
        outline: "none"
    },
    filterBox: {},
    select: {
        padding: 12,
        fontSize: 14,
        background: "rgba(255, 255, 255, 0.1)",
        color: "#fff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
        outline: "none"
    },
    addBtn: {
        padding: "12px 20px",
        background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "600",
        transition: "transform 0.2s, box-shadow 0.2s"
    },
    bulkBtn: {
        padding: "12px 20px",
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "600",
        transition: "transform 0.2s, box-shadow 0.2s"
    },
    content: {
        padding: 20,
    },
    loading: {
        textAlign: "center",
        padding: 50,
        fontSize: 16,
        color: "rgba(255,255,255,0.7)",
    },
    empty: {
        textAlign: "center",
        padding: 50,
        fontSize: 16,
        color: "rgba(255,255,255,0.7)",
    },
    table: {
        width: "100%",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        borderCollapse: "collapse",
    },
    tableHeader: {
        background: "rgba(255, 255, 255, 0.1)",
    },
    th: {
        padding: 15,
        textAlign: "left",
        fontWeight: "600",
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.9)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    },
    tableRow: {
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "background 0.2s"
    },
    td: {
        padding: 15,
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
    },
    deleteBtn: {
        padding: "6px 12px",
        background: "rgba(239, 68, 68, 0.8)",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        transition: "background 0.2s"
    },
    stats: {
        marginTop: 15,
        textAlign: "center",
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.6)",
    },
};

const modalStyles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modal: {
        background: "#1e293b",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 30,
        width: "90%",
        maxWidth: 500,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    },
    title: {
        margin: "0 0 20px 0",
        fontSize: 22,
        fontWeight: "600",
    },
    input: {
        width: "100%",
        padding: 12,
        marginBottom: 15,
        fontSize: 14,
        background: "rgba(255, 255, 255, 0.05)",
        color: "#ffffff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
        boxSizing: "border-box",
        outline: "none",
    },
    textarea: {
        width: "100%",
        padding: 12,
        marginBottom: 15,
        fontSize: 13,
        fontFamily: "monospace",
        background: "rgba(255, 255, 255, 0.05)",
        color: "#ffffff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
        boxSizing: "border-box",
        outline: "none",
    },
    help: {
        padding: 12,
        background: "rgba(59, 130, 246, 0.1)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 13,
        color: "#93c5fd",
    },
    error: {
        padding: 12,
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.4)",
        borderRadius: 8,
        color: "#fca5a5",
        marginBottom: 15,
        fontSize: 14,
    },
    results: {
        padding: 15,
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
    },
    buttons: {
        display: "flex",
        gap: 10,
        justifyContent: "flex-end",
    },
    cancelBtn: {
        padding: "10px 20px",
        background: "rgba(255, 255, 255, 0.1)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.2s"
    },
    submitBtn: {
        padding: "10px 20px",
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: "600",
    },
};
