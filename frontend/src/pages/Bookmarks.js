import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PANKH_ICON = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";

function Bookmarks() {
  const navigate = useNavigate();
  const isDark   = (localStorage.getItem("theme") || "dark") === "dark";
  const token    = localStorage.getItem("token");

  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarks")) || [];
      setBookmarks(saved);
    } catch {
      setBookmarks([]);
    }
  }, [token, navigate]); // ✅ navigate added

  const removeBookmark = (id) => {
    const updated = bookmarks.filter(p => p._id !== id);
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const fmtDate    = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const badgeColor = { Poetry: "#7c3aed", Lyrics: "#0891b2", Story: "#065f46", Thoughts: "#92400e" };

  return (
    <div style={S.page(isDark)}>

      {/* NAVBAR */}
      <nav style={S.navbar(isDark)}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src={PANKH_ICON} alt="" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: isDark ? "#fff" : "#111" }}>परवा पाइख</div>
            <div style={{ fontSize: "11px", color: "#7c3aed" }}>मैथिली साहित्य के संग</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={S.navBtn(isDark, false)} onClick={() => navigate("/")}>Home</button>
          <button style={S.navBtn(isDark, false)} onClick={() => navigate("/explore")}>Explore</button>
          <button style={S.navBtn(isDark, false)} onClick={() => navigate("/my-posts")}>My Posts</button>
          <button style={S.navBtn(isDark, true)}>Bookmarks</button>
        </div>
      </nav>

      <div style={S.content}>

        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#fff" : "#111", margin: 0 }}>Bookmarks 🔖</h1>
          <p style={{ fontSize: "14px", color: isDark ? "#94a3b8" : "#666", marginTop: "6px" }}>
            {bookmarks.length} saved post{bookmarks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div style={S.empty(isDark)}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>🔖</div>
            <h3>No bookmarks yet</h3>
            <p style={{ marginTop: "6px", color: isDark ? "#94a3b8" : "#888", marginBottom: "20px" }}>
              Save posts to read them later
            </p>
            <button style={S.exploreBtn} onClick={() => navigate("/explore")}>Explore Posts →</button>
          </div>
        ) : (
          <div style={S.grid}>
            {bookmarks.map(post => (
              <div key={post._id} style={S.card(isDark)}>
                <div style={{ height: "180px", overflow: "hidden", background: "#111827", position: "relative" }}>
                  {post.image
                    ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>
                  }
                  {post.category && (
                    <div style={{ position: "absolute", top: "10px", left: "10px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#fff", background: badgeColor[post.category] || "#7c3aed" }}>
                      {post.category}
                    </div>
                  )}
                  <button
                    style={{ position: "absolute", top: "10px", right: "10px", width: "30px", height: "30px", borderRadius: "8px", background: "rgba(239,68,68,0.8)", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => removeBookmark(post._id)}
                  >✕</button>
                </div>
                <div style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => navigate(`/post/${post._id}`)}>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: "6px", lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ fontSize: "13px", color: "#a855f7", fontWeight: 600, marginBottom: "6px" }}>✏ {post.author}</p>
                  {post.createdAt && <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>📅 {fmtDate(post.createdAt)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={S.footer(isDark)}>
        <p>© 2026 Saransh | All Rights Reserved</p>
      </footer>
    </div>
  );
}

const S = {
  page:       (isDark) => ({ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0d0d1a" : "#f8f9fc" }),
  navbar:     (isDark) => ({ position: "sticky", top: 0, zIndex: 999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "64px", background: isDark ? "rgba(10,10,20,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)", flexWrap: "wrap", gap: "8px" }),
  navBtn:     (isDark, active) => ({ padding: "8px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: active ? 700 : 500, background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent", color: active ? "#fff" : isDark ? "#cbd5e1" : "#555" }),
  content:    { maxWidth: "1300px", width: "100%", margin: "0 auto", padding: "30px 24px", flex: 1 },
  grid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" },
  card:       (isDark) => ({ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }),
  empty:      (isDark) => ({ textAlign: "center", padding: "80px 20px", color: isDark ? "#fff" : "#111" }),
  exploreBtn: { padding: "12px 28px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" },
  footer:     (isDark) => ({ padding: "20px", textAlign: "center", fontSize: "13px", background: isDark ? "#08090f" : "#1e1b4b", color: isDark ? "#94a3b8" : "#a78bfa", marginTop: "auto" }),
};

export default Bookmarks;
