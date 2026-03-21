export default function Footer() {
  return (
    <div style={styles.footer}>
      <p style={styles.heading}>Need Help? Contact Us</p>

      <a href="mailto:campusconnect0962@gmail.com" style={styles.link}>
        campusconnect0962@gmail.com
      </a>

      <p style={styles.techSupport}>Technical Support:</p>
      <a href="mailto:parthkadam1941@gmail.com" style={styles.link}>
        parthkadam1941@gmail.com
      </a>

      <p style={styles.copy}>© 2025 Campus Connect</p>
    </div>
  );
}

const styles = {
  footer: {
    marginTop: 50,
    padding: "25px 0",
    textAlign: "center",
    borderTop: "1px solid #ddd",
    background: "#fafafa",
  },
  heading: {
    fontSize: 15,
    fontWeight: 600,
    color: "#444",
    marginBottom: 8,
  },
  link: {
    display: "block",
    color: "#1e88e5",
    fontSize: 14,
    marginTop: 4,
    textDecoration: "none",
    fontWeight: 500,
    transition: "0.2s",
  },
  copy: {
    marginTop: 12,
    fontSize: 12,
    color: "#666",
  },
  techSupport: {
    fontSize: 14,
    fontWeight: 600,
    color: "#444",
    marginTop: 12,
    marginBottom: 4,
  },
};
