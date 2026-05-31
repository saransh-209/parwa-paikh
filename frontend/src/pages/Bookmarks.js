import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "./NavBar";

const PANKH = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";

function Bookmarks() {
  const navigate = useNavigate();
  const theme  = localStorage.getItem("theme") || "dark";
  const isDark = theme === "dark";
  const token  = localStorage.getItem("token");

  const [bookmarks, setBookmarks] = useState([]);
  const [isMobile, setIsMobile]   = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarks")) || [];
      setBookmarks(saved);
    } catch { setBookmarks([]); }
  }, [token, navigate]);

  const removeBookmark = (id) => {
    const updated = bookmarks.filter(p => p._id !== id);
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const fmtDate    = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const badgeColor = { Poetry: "#7c3aed", Lyrics: "#0891b2", Story: "#065f46", Thoughts: "#92400e" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0d0d1a" : "#f8f9fc", paddingBottom: isMobile ? "70px" : "0" }}>

      <NavBar activePath="/bookmarks" />

      <div style={{ maxWidth: "1300px", width: "100%", margin: "0 auto", padding: isMobile ? "16px 14px" : "30px 24px", flex: 1 }}>

        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: 800, color: isDark ? "#fff" : "#111", margin: 0 }}>Bookmarks 🔖</h1>
          <p style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#666", marginTop: "4px" }}>{bookmarks.length} saved post{bookmarks.length !== 1 ? "s" : ""}</p>
        </div>

        {bookmarks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: isDark ? "#fff" : "#111" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>🔖</div>
            <h3>No bookmarks yet</h3>
            <p style={{ marginTop: "6px", color: isDark ? "#94a3b8" : "#888", marginBottom: "20px" }}>Save posts to read them later</p>
            <button style={{ padding: "12px 28px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("/explore")}>Explore Posts →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: "16px" }}>
            {bookmarks.map(post => (
              <div key={post._id} style={{ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                <div style={{ height: isMobile ? "160px" : "180px", overflow: "hidden", background: "#111827", position: "relative" }}>
                  {post.image ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>}
                  {post.category && <div style={{ position: "absolute", top: "10px", left: "10px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#fff", background: badgeColor[post.category] || "#7c3aed" }}>{post.category}</div>}
                  <button style={{ position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", borderRadius: "8px", background: "rgba(239,68,68,0.85)", border: "none", color: "#fff", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => removeBookmark(post._id)}>✕</button>
                </div>
                <div style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => navigate(`/post/${post._id}`)}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: "5px", lineHeight: 1.3 }}>{post.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
                    <img src={PANKH} alt="" style={{ width: "12px", height: "12px", objectFit: "contain" }} />
                    <p style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 600 }}>{post.author}</p>
                  </div>
                  {post.createdAt && <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>📅 {fmtDate(post.createdAt)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ padding: "20px", textAlign: "center", fontSize: "13px", background: isDark ? "#08090f" : "#1e1b4b", color: isDark ? "#94a3b8" : "#a78bfa", marginTop: "auto" }}>
        <p>© 2026 Saransh | All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default Bookmarks;