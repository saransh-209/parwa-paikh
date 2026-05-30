import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const PANKH_ICON = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";

function MyPosts() {
  const navigate = useNavigate();
  const isDark = (localStorage.getItem("theme") || "dark") === "dark";
  const token  = localStorage.getItem("token");

  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deleteId, setDeleteId]     = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get(`${process.env.REACT_APP_API_URL}/my-posts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => setPosts(r.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(p => p.filter(post => post._id !== id));
      toast.success("Post deleted 🗑️");
    } catch (err) {
      toast.error("Error deleting ❌");
    } finally {
      setDeleteId(null);
    }
  };

  const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

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
          <button style={S.navBtn(isDark, true)}>My Posts</button>
          <button style={S.navBtn(isDark, false)} onClick={() => navigate("/bookmarks")}>Bookmarks</button>
        </div>
      </nav>

      <div style={S.content}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#fff" : "#111", margin: 0 }}>My Posts 📝</h1>
            <p style={{ fontSize: "14px", color: isDark ? "#94a3b8" : "#666", marginTop: "6px" }}>
              {posts.length} post{posts.length !== 1 ? "s" : ""} published
            </p>
          </div>
          {localStorage.getItem("role") === "author" && (
            <button style={S.createBtn} onClick={() => navigate("/create")}>+ New Post</button>
          )}
        </div>

        {/* POSTS */}
        {loading ? (
          <div style={S.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={S.skelCard(isDark)}>
                <div style={{ position: "relative", overflow: "hidden", height: "190px", background: isDark ? "#1f2937" : "#d1d5db" }}>
                  <div style={S.shimmer} />
                </div>
                <div style={{ padding: "14px" }}>
                  <div style={{ position: "relative", overflow: "hidden", height: "16px", width: "65%", borderRadius: "6px", background: isDark ? "#374151" : "#c4c9d4", marginBottom: "10px" }}><div style={S.shimmer} /></div>
                  <div style={{ position: "relative", overflow: "hidden", height: "12px", width: "40%", borderRadius: "6px", background: isDark ? "#4b5563" : "#d1d5db" }}><div style={S.shimmer} /></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={S.empty(isDark)}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
            <h3>No posts yet</h3>
            <p style={{ marginTop: "6px", color: isDark ? "#94a3b8" : "#888", marginBottom: "20px" }}>Start writing your first post!</p>
            <button style={S.createBtn} onClick={() => navigate("/create")}>+ Create Post</button>
          </div>
        ) : (
          <div style={S.grid}>
            {posts.map(post => (
              <div key={post._id} style={S.card(isDark)}>
                {/* Image */}
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
                </div>

                {/* Body */}
                <div style={{ padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: "6px", lineHeight: 1.3 }}>{post.title}</h3>
                  {post.createdAt && <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888", marginBottom: "14px" }}>📅 {fmtDate(post.createdAt)}</p>}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={S.viewBtn(isDark)} onClick={() => navigate(`/post/${post._id}`)}>👁 View</button>
                    <button style={S.editBtn} onClick={() => navigate(`/edit/${post._id}`)}>✏ Edit</button>
                    <button style={S.deleteBtn} onClick={() => setDeleteId(post._id)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: isDark ? "#0f172a" : "#fff", padding: "32px", borderRadius: "20px", width: "300px", textAlign: "center", color: isDark ? "#fff" : "#111", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗑️</div>
            <h3 style={{ marginBottom: "8px" }}>Delete Post?</h3>
            <p style={{ color: isDark ? "#94a3b8" : "#666", fontSize: "14px", marginBottom: "24px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={{ padding: "10px 20px", background: isDark ? "#1f2937" : "#f1f5f9", color: isDark ? "#fff" : "#111", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button style={{ padding: "10px 20px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <footer style={S.footer(isDark)}>
        <p>© 2026 Saransh | All Rights Reserved</p>
      </footer>
    </div>
  );
}

const S = {
  page:    (isDark) => ({ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0d0d1a" : "#f8f9fc" }),
  navbar:  (isDark) => ({ position: "sticky", top: 0, zIndex: 999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "64px", background: isDark ? "rgba(10,10,20,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)", flexWrap: "wrap", gap: "8px" }),
  navBtn:  (isDark, active) => ({ padding: "8px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: active ? 700 : 500, background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent", color: active ? "#fff" : isDark ? "#cbd5e1" : "#555" }),
  content: { maxWidth: "1300px", width: "100%", margin: "0 auto", padding: "30px 24px", flex: 1 },
  grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" },
  card:    (isDark) => ({ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }),
  skelCard:(isDark) => ({ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#e5e7eb" }),
  shimmer: { position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", animation: "shimmer 1.4s infinite" },
  empty:   (isDark) => ({ textAlign: "center", padding: "80px 20px", color: isDark ? "#fff" : "#111" }),
  createBtn: { padding: "10px 20px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" },
  viewBtn: (isDark) => ({ flex: 1, padding: "8px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", color: isDark ? "#cbd5e1" : "#555", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }),
  editBtn: { flex: 1, padding: "8px", background: "rgba(99,102,241,0.15)", color: "#6366f1", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  deleteBtn: { width: "36px", padding: "8px", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  footer:  (isDark) => ({ padding: "20px", textAlign: "center", fontSize: "13px", background: isDark ? "#08090f" : "#1e1b4b", color: isDark ? "#94a3b8" : "#a78bfa", marginTop: "auto" }),
};

export default MyPosts;
