export default function SimpleFooter() {
  return (
    <footer style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, borderTop: "1px solid #f3f4f6", width: "100%", flexWrap: "wrap" }}>
      <p style={{ fontSize: 12, color: "#d1d5db", margin: 0 }}>
        &copy; 2026 TutorCard &middot; A <a href="https://studyspaces.com/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "#d1d5db", textDecoration: "none" }}>StudySpaces</a> product
      </p>
      <p style={{ fontSize: 12, color: "#d1d5db", margin: 0 }}>
        Powered by <a href="https://studyspaces.com/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "#9ca3af", textDecoration: "none" }}>StudySpaces</a>
      </p>
    </footer>
  );
}
