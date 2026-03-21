import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    function handleResize() {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 768);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const linkStyle = (path) => ({
    ...styles.link,
    ...(location.pathname === path ? styles.activeLink : {}),
    ...(hoveredLink === path ? styles.hoverLink : {}),
  });

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Campus Connect</div>

      {/* Hamburger Menu for Mobile */}
      <button
        type="button"
        style={styles.hamburger}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
        aria-expanded={isMenuOpen}
        className="touch-target"
      >
        <span style={isMenuOpen ? styles.barOpen : styles.bar}></span>
        <span style={isMenuOpen ? styles.barOpen : styles.bar}></span>
        <span style={isMenuOpen ? styles.barOpen : styles.bar}></span>
      </button>

      <div
        style={{
          ...styles.links,
          ...(isMobile ? (isMenuOpen ? styles.linksOpen : styles.linksClosed) : {}),
        }}
      >
        <Link
          to="/"
          style={linkStyle("/")}
          onMouseEnter={() => setHoveredLink("/")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Home
        </Link>
        <Link
          to="/face"
          style={linkStyle("/face")}
          onMouseEnter={() => setHoveredLink("/face")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Face Verify
        </Link>
        <Link
          to="/eid"
          style={linkStyle("/eid")}
          onMouseEnter={() => setHoveredLink("/eid")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          eID
        </Link>
        <Link
          to="/lost"
          style={linkStyle("/lost")}
          onMouseEnter={() => setHoveredLink("/lost")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Lost & Found
        </Link>
        <Link
          to="/pay"
          style={linkStyle("/pay")}
          onMouseEnter={() => setHoveredLink("/pay")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Pay
        </Link>
        <Link
          to="/signup"
          style={linkStyle("/signup")}
          onMouseEnter={() => setHoveredLink("/signup")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Signup
        </Link>
        <Link
          to="/admin/login"
          style={linkStyle("/admin/login")}
          onMouseEnter={() => setHoveredLink("/admin/login")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#0b74de",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    position: "relative",
  },
  logo: { fontSize: 20, fontWeight: "bold" },
  links: {
    display: "flex",
    gap: "20px",
    transition: "all 0.3s ease",
  },
  linksClosed: {
    display: "none",
  },
  linksOpen: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#0b74de",
    padding: "10px 20px",
    gap: "10px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 500,
    transition: "all 0.3s ease",
    padding: "5px 10px",
    borderRadius: "4px",
  },
  activeLink: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    fontWeight: "bold",
  },
  hoverLink: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: "scale(1.05)",
  },
  hamburger: {
    display: "none",
    flexDirection: "column",
    cursor: "pointer",
    gap: "4px",
  },
  bar: {
    width: "25px",
    height: "3px",
    background: "#fff",
    transition: "all 0.3s ease",
  },
  barOpen: {
    width: "25px",
    height: "3px",
    background: "#fff",
    transform: "rotate(45deg)",
    transition: "all 0.3s ease",
  },
};
