// src/components/BackButton.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ to, style }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1); // Go back to previous page
        }
    };

    return (
        <button onClick={handleBack} style={{ ...styles.backButton, ...style }} className="mobile-back-btn">
            <ArrowLeft size={20} className="back-icon" />
            <span>Back</span>
        </button>
    );
}

const styles = {
    backButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 20px",
        background: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
    },
};
