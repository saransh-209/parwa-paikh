import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { NavBar } from "./NavBar";



function MyPosts() {
  const navigate = useNavigate();
  const theme  = localStorage.getItem("theme") || "dark";
  const isDark = theme === "dark";
  const token  = localStorage.getItem("token");

  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchMyPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/my-posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchMyPosts();
  }, [token, navigate, fetchMyPosts]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/post/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(p => p.filter(post => post._id !== id));
      toast.success("Post deleted 🗑️");
    } catch { toast.error("Error deleting ❌"); }
    finally { setDeleteId(null); }
  };

  const fmtDate    = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const badgeColor = { Poetry: "#7c3aed", Lyrics: "#0891b2", Story: "#065f46", Thoughts: "#92400e" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0d0d1a" : "#f8f9fc", paddingBottom: isMobile ? "70px" : "0" }}>

      <NavBar activePath="/my-posts" />

      <div style={{ maxWidth: "1300px", width: "100%", margin: "0 auto", padding: isMobile ? "16px 14px" : "30px 24px", flex: 1 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: 800, color: isDark ? "#fff" : "#111", margin: 0 }}>My Posts 📝</h1>
            <p style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#666", marginTop: "4px" }}>{posts.length} post{posts.length !== 1 ? "s" : ""} published</p>
          </div>
          {localStorage.getItem("role") === "author" && (
            <button style={{ padding: "10px 18px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.35)", whiteSpace: "nowrap" }} onClick={() => navigate("/create")}>+ New Post</button>
          )}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: "16px" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#e5e7eb" }}>
                <div style={{ position: "relative", overflow: "hidden", height: "160px", background: isDark ? "#1f2937" : "#d1d5db" }}><div style={shimmer} /></div>
                <div style={{ padding: "14px" }}>
                  <div style={{ position: "relative", overflow: "hidden", height: "16px", width: "65%", borderRadius: "6px", background: isDark ? "#374151" : "#c4c9d4", marginBottom: "10px" }}><div style={shimmer} /></div>
                  <div style={{ position: "relative", overflow: "hidden", height: "12px", width: "40%", borderRadius: "6px", background: isDark ? "#4b5563" : "#d1d5db" }}><div style={shimmer} /></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: isDark ? "#fff" : "#111" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
            <h3>No posts yet</h3>
            <p style={{ marginTop: "6px", color: isDark ? "#94a3b8" : "#888", marginBottom: "20px" }}>Start writing your first post!</p>
            <button style={{ padding: "12px 28px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("/create")}>+ Create Post</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(260px,1fr))", gap: "16px" }}>
            {posts.map(post => (
              <div key={post._id} style={{ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                <div style={{ height: isMobile ? "160px" : "180px", overflow: "hidden", background: "#111827", position: "relative" }}>
                  {post.image ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>}
                  {post.category && <div style={{ position: "absolute", top: "10px", left: "10px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#fff", background: badgeColor[post.category] || "#7c3aed" }}>{post.category}</div>}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: "4px" }}>{post.title}</h3>
                  {post.createdAt && <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888", marginBottom: "12px" }}>📅 {fmtDate(post.createdAt)}</p>}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ flex: 1, padding: "8px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", color: isDark ? "#cbd5e1" : "#555", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }} onClick={() => navigate(`/post/${post._id}`)}>👁 View</button>
                    <button style={{ flex: 1, padding: "8px", background: "rgba(99,102,241,0.15)", color: "#6366f1", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }} onClick={() => navigate(`/edit/${post._id}`)}>✏ Edit</button>
                    <button style={{ width: "36px", padding: "8px", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer" }} onClick={() => setDeleteId(post._id)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: isDark ? "#0f172a" : "#fff", padding: "32px", borderRadius: "20px", width: "280px", textAlign: "center", color: isDark ? "#fff" : "#111", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🗑️</div>
            <h3 style={{ marginBottom: "8px" }}>Delete Post?</h3>
            <p style={{ color: isDark ? "#94a3b8" : "#666", fontSize: "14px", marginBottom: "20px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={{ padding: "10px 18px", background: isDark ? "#1f2937" : "#f1f5f9", color: isDark ? "#fff" : "#111", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button style={{ padding: "10px 18px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ padding: "20px", textAlign: "center", fontSize: "13px", background: isDark ? "#08090f" : "#1e1b4b", color: isDark ? "#94a3b8" : "#a78bfa", marginTop: "auto" }}>
        <p>© 2026 Saransh | All Rights Reserved</p>
      </footer>
    </div>
  );
}

const shimmer = { position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", animation: "shimmer 1.4s infinite" };

export default MyPosts;
