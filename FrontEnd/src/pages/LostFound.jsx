import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, MapPin, Calendar, Phone, CheckCircle, Trash2, ArrowLeft, Camera, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const BACKEND_URL = `http://${window.location.hostname}:5000/api`;

export default function LostFound() {
    const [activeTab, setActiveTab] = useState("lost"); // 'lost' or 'found'
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('lost'); // 'lost' or 'found'

    // User Session
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("studentUser");
        if (stored) setUser(JSON.parse(stored));
        fetchItems();
    }, [activeTab]);

    async function fetchItems() {
        setIsLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/lost-found?type=${activeTab}`);
            if (res.data.success) {
                setItems(res.data.items);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        try {
            await axios.delete(`${BACKEND_URL}/lost-found/${id}`, {
                params: { userRoll: user.roll }
            });
            fetchItems();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete");
        }
    }

    async function handleResolve(id) {
        if (!window.confirm("Mark this as resolved?")) return;
        try {
            await axios.put(`${BACKEND_URL}/lost-found/${id}/resolve`, {
                userRoll: user.roll
            });
            fetchItems();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
        }
    }

    async function handleClaim(id) {
        if (!window.confirm("Is this item yours? The finder will see your name.")) return;
        try {
            await axios.post(`${BACKEND_URL}/lost-found/${id}/claim`, {
                studentId: user.roll,
                name: user.name
            });
            fetchItems(); // Refresh to show claimed status
        } catch (err) {
            alert(err.response?.data?.error || "Failed to claim item");
        }
    }

    const openReportModal = () => {
        setModalType(activeTab);
        setShowModal(true);
    };

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header} className="header-mobile">
                <Link to="/student/home" style={styles.backBtn}><ArrowLeft size={20} /></Link>
                <h1 style={styles.headerTitle}>Lost & Found</h1>
                <div style={styles.placeholder}></div>
            </header>

            <div style={styles.container} className="page-container">

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={activeTab === 'lost' ? styles.activeTabLost : styles.tab}
                        onClick={() => setActiveTab('lost')}
                    >
                        Lost Items
                    </button>
                    <button
                        style={activeTab === 'found' ? styles.activeTabFound : styles.tab}
                        onClick={() => setActiveTab('found')}
                    >
                        Found Items
                    </button>
                </div>

                {/* Action Section based on Tab */}
                <div style={styles.actionSection}>
                    {activeTab === 'lost' ? (
                        <div style={styles.actionBannerLost}>
                            <div style={styles.bannerText}>
                                <h3 style={styles.bannerTitleLost}>Lost something?</h3>
                                <p style={styles.bannerDescLost}>File a report to help others find it for you.</p>
                            </div>
                            <button onClick={openReportModal} style={styles.reportBtnLost}>
                                <FileText size={18} />
                                File Lost Report
                            </button>
                        </div>
                    ) : (
                        <div style={styles.actionBannerFound}>
                            <div style={styles.bannerText}>
                                <h3 style={styles.bannerTitleFound}>Found something?</h3>
                                <p style={styles.bannerDescFound}>Take a photo and help return it to the owner.</p>
                            </div>
                            <button onClick={openReportModal} style={styles.reportBtnFound}>
                                <Camera size={18} />
                                Post Found Item
                            </button>
                        </div>
                    )}
                </div>

                {/* List */}
                {isLoading ? (
                    <div style={styles.loading}>Loading items...</div>
                ) : (
                    <div style={styles.grid} className="grid-mobile">
                        {items.length === 0 && (
                            <div style={styles.empty}>
                                <p>No {activeTab} items reported yet.</p>
                            </div>
                        )}
                        {items.map(item => (
                            <ItemCard
                                key={item._id}
                                item={item}
                                currentUser={user}
                                onDelete={handleDelete}
                                onResolve={handleResolve}
                                onClaim={handleClaim}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showModal && (
                <ReportModal
                    type={modalType}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchItems(); }}
                    user={user}
                />
            )}
        </div>
    );
}

// Sub-components
function ItemCard({ item, currentUser, onDelete, onResolve, onClaim }) {
    const isOwner = currentUser && item.reportedBy === currentUser.roll;
    const isFoundType = item.type === 'found';
    const hasClaimed = item.claims?.some(c => c.studentId === currentUser?.roll);

    return (
        <div style={styles.card} className="card-mobile">
            {item.image && (
                <img src={item.image} alt={item.title} style={styles.cardImage} />
            )}
            {!item.image && isFoundType && (
                <div style={{ ...styles.cardImage, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                    No Image
                </div>
            )}

            <div style={styles.cardContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h3 style={styles.cardTitle}>{item.title}</h3>
                    <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: item.type === 'lost' ? '#fee2e2' : '#dcfce7',
                        color: item.type === 'lost' ? '#991b1b' : '#166534',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {item.type}
                    </span>
                </div>

                <p style={styles.cardDesc}>{item.description}</p>

                <div style={styles.metaRow}>
                    <MapPin size={14} color="#666" />
                    <span>{item.location}</span>
                </div>
                <div style={styles.metaRow}>
                    <Calendar size={13} color="rgba(255,255,255,0.5)" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
                {item.contactPhone && (
                    <div style={styles.metaRow}>
                        <Phone size={13} color="rgba(255,255,255,0.5)" />
                        <span>{item.contactPhone}</span>
                    </div>
                )}

                {/* Claims Info (Only for Found items) */}
                {isFoundType && item.claims?.length > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#854d0e', background: '#fef9c3', padding: '5px', borderRadius: '4px' }}>
                        ✋ {item.claims.length} {item.claims.length === 1 ? 'person' : 'people'} claimed this.
                        {isOwner && (
                            <div style={{ marginTop: '4px', fontWeight: 'bold' }}>
                                {item.claims.map(c => c.name).join(", ")}
                            </div>
                        )}
                    </div>
                )}

                <div style={styles.actions}>
                    {isOwner ? (
                        <>
                            {/* Owner Actions */}
                            <button onClick={() => onResolve(item._id)} style={styles.actionBtn}>
                                <CheckCircle size={16} color="#059669" />
                                Resolve
                            </button>
                            <button onClick={() => onDelete(item._id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Public Actions */}
                            {isFoundType && (
                                <button
                                    onClick={() => onClaim(item._id)}
                                    disabled={hasClaimed}
                                    style={{
                                        ...styles.actionBtn,
                                        color: hasClaimed ? '#9ca3af' : '#0b74de',
                                        background: hasClaimed ? '#f3f4f6' : '#eff6ff',
                                        padding: '5px 10px',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <span style={{ fontSize: '16px' }}>👋</span>
                                    {hasClaimed ? "Claimed" : "It's Mine!"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReportModal({ type, onClose, onSuccess, user }) {
    const isLost = type === 'lost';

    const [formData, setFormData] = useState({
        type: type,
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        contactPhone: '',
        image: ''
    });
    const [loading, setLoading] = useState(false);

    function handleImage(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${BACKEND_URL}/lost-found`, {
                ...formData,
                reportedBy: user?.roll
            });
            onSuccess();
        } catch (err) {
            alert("Failed to report item");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modal} className="modal-mobile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ ...styles.modalTitle, marginBottom: 0 }}>
                        {isLost ? "📄 File Lost Report" : "📸 Post Found Item"}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Hidden Type Field - Fixed based on context */}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>{isLost ? "What did you lose?" : "What did you find?"}</label>
                        <input
                            required
                            type="text"
                            placeholder={isLost ? "e.g. Black Titan Watch" : "e.g. Blue Water Bottle"}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>{isLost ? "Description & Identifiers" : "Description"}</label>
                        <textarea
                            rows={3}
                            placeholder={isLost ? "Color, brand, unique scratches..." : "Brief description of the item..."}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ ...styles.input, resize: 'vertical' }}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>{isLost ? "Last Seen Location" : "Found Location"}</label>
                        <input
                            required
                            type="text"
                            placeholder={isLost ? "e.g. Library 2nd Floor around 2 PM" : "e.g. Canteen Table 4"}
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formRow} className="form-row-mobile">
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Date</label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Contact No. (Optional)</label>
                            <input
                                type="tel"
                                placeholder="+91..."
                                value={formData.contactPhone}
                                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            {isLost ? "Upload Photo (If you have one)" : "Upload Photo (Required)"}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            style={styles.fileInput}
                            required={!isLost} // Required for Found items
                        />
                        {formData.image && <img src={formData.image} alt="Preview" style={styles.preview} />}
                    </div>

                    <div style={styles.buttonRow}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={isLost ? styles.submitBtnLost : styles.submitBtnFound}
                        >
                            {loading ? "Submitting..." : (isLost ? "File Report" : "Post Found Item")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        fontFamily: "Inter, sans-serif",
        paddingBottom: "80px",
        color: "#fff"
    },
    header: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        padding: "15px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 10
    },
    headerTitle: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: 0,
        background: "linear-gradient(to right, #ffffff, #93c5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    },
    backBtn: { color: "#fff", display: "flex", alignItems: "center" },
    placeholder: { width: "20px" },
    tabs: {
        display: "flex",
        padding: "20px",
        gap: "10px",
        justifyContent: "center"
    },
    tab: {
        padding: "10px 20px",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "rgba(255, 255, 255, 0.7)",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    activeTabLost: {
        padding: "10px 20px",
        borderRadius: "20px",
        border: "none",
        background: "#ef4444", // Red for Lost
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)"
    },
    activeTabFound: {
        padding: "10px 20px",
        borderRadius: "20px",
        border: "none",
        background: "#10b981", // Green for Found
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
    },

    // Action Sections
    actionSection: {
        marginBottom: '20px'
    },
    actionBannerLost: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '15px'
    },
    actionBannerFound: {
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '15px'
    },
    bannerText: {
        flex: 1,
        minWidth: '200px'
    },
    bannerTitleLost: { margin: '0 0 5px 0', color: '#fca5a5' },
    bannerDescLost: { margin: 0, fontSize: '14px', color: '#fecaca' },
    bannerTitleFound: { margin: '0 0 5px 0', color: '#6ee7b7' },
    bannerDescFound: { margin: 0, fontSize: '14px', color: '#a7f3d0' },
    reportBtnLost: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    reportBtnFound: {
        background: '#10b981',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },

    container: { maxWidth: "800px", margin: "0 auto", padding: "0 20px" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px"
    },
    empty: { textAlign: "center", color: "rgba(255,255,255,0.6)", marginTop: "50px", width: '100%', gridColumn: '1/-1' },
    card: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        transition: "transform 0.2s"
    },
    cardImage: {
        width: "100%",
        height: "160px",
        objectFit: "cover",
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
    },
    cardContent: { padding: "12px 16px" },
    cardTitle: { margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#fff" },
    cardDesc: { color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "12px", lineHeight: "1.4" },
    metaRow: { display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "4px" },

    // Modal
    modalOverlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
    },
    modal: {
        background: "#1E293B",
        padding: "24px",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflowY: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
    },
    modalTitle: { fontSize: "20px", fontWeight: "bold", color: "#fff" },
    form: { display: "flex", flexDirection: "column", gap: "12px" },
    formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    label: { fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.8)" },
    input: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.05)",
        color: "#fff",
        fontSize: "14px",
        outline: "none"
    },
    fileInput: { fontSize: "14px", color: "rgba(255,255,255,0.7)" },
    preview: { width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" },
    buttonRow: { display: "flex", gap: "10px", marginTop: "10px", justifyContent: "flex-end" },
    cancelBtn: {
        padding: "10px 20px",
        background: "rgba(255,255,255,0.1)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500"
    },
    submitBtnLost: {
        padding: "10px 20px",
        background: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer"
    },
    submitBtnFound: {
        padding: "10px 20px",
        background: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer"
    },
    actions: {
        marginTop: "15px",
        paddingTop: "15px",
        borderTop: "1px solid #eee",
        display: "flex",
        justifyContent: "space-between"
    },
    actionBtn: {
        background: "none",
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        color: "rgba(255,255,255,0.7)"
    }
};
