import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { NavBar } from "./NavBar";

const PANKH = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";

function PostDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const userName     = localStorage.getItem("name");
  const theme        = localStorage.getItem("theme") || "dark";
  const isDark       = theme === "dark";

  const [post, setPost]                   = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMobile, setIsMobile]           = useState(window.innerWidth <= 768);
  const [isBookmarked, setIsBookmarked]   = useState(false);
  const [copied, setCopied]               = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/post/${id}`)
      .then(r => setPost(r.data))
      .catch(console.log);
  }, [id]);

  useEffect(() => {
    if (!post) return;
    try {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
      setIsBookmarked(bookmarks.some(b => b._id === post._id));
    } catch { setIsBookmarked(false); }
  }, [post]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/post/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Post deleted 🗑️");
      navigate("/");
    } catch (err) {
      toast.error("Error deleting ❌");
    }
  };

  const toggleBookmark = () => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
      let updated;
      if (isBookmarked) {
        updated = bookmarks.filter(b => b._id !== post._id);
        toast.info("Bookmark removed");
      } else {
        updated = [...bookmarks, post];
        toast.success("Bookmarked! 🔖");
      }
      localStorage.setItem("bookmarks", JSON.stringify(updated));
      setIsBookmarked(!isBookmarked);
    } catch { }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied! 📋");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { }
  };

  const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const readTime = (c) => Math.max(1, Math.ceil((c?.split(" ").length || 100) / 200));

  if (!post) {
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#0d0d1a" : "#f8f9fc" }}>
        <NavBar activePath="" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
          {/* Skeleton */}
          <div style={{ width: isMobile ? "90%" : "760px", background: isDark ? "#111827" : "#e5e7eb", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ height: "300px", background: isDark ? "#1f2937" : "#d1d5db", position: "relative", overflow: "hidden" }}>
              <div style={shimmer} />
            </div>
            <div style={{ padding: "28px" }}>
              <div style={{ height: "32px", width: "70%", borderRadius: "8px", background: isDark ? "#374151" : "#c4c9d4", marginBottom: "16px", position: "relative", overflow: "hidden" }}><div style={shimmer} /></div>
              <div style={{ height: "16px", width: "40%", borderRadius: "8px", background: isDark ? "#4b5563" : "#d1d5db", position: "relative", overflow: "hidden" }}><div style={shimmer} /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0d0d1a" : "#f8f9fc", paddingBottom: isMobile ? "70px" : "0" }}>

      <NavBar activePath="" />

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: isMobile ? "16px 14px" : "32px 24px" }}>

        {/* BACK */}
        <button onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", color: isDark ? "#cbd5e1" : "#555", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, marginBottom: "24px" }}>
          ← Back
        </button>

        {/* MAIN CARD */}
        <div style={{ background: isDark ? "#111827" : "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 10px 40px rgba(0,0,0,0.1)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)" }}>

          {/* COVER IMAGE */}
          {post.image && (
            <div style={{ position: "relative", height: isMobile ? "220px" : "380px", overflow: "hidden" }}>
              <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)" }} />
              {/* Category badge */}
              {post.category && (
                <div style={{ position: "absolute", top: "16px", left: "16px", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: "#fff", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)" }}>
                  {post.category === "Poetry" && "📜 "}
                  {post.category === "Lyrics" && "🎵 "}
                  {post.category === "Story" && "📖 "}
                  {post.category === "Thoughts" && "💭 "}
                  {post.category}
                </div>
              )}
            </div>
          )}

          <div style={{ padding: isMobile ? "20px 18px" : "36px 40px" }}>

            {/* CATEGORY (if no image) */}
            {!post.image && post.category && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: "#a855f7", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", marginBottom: "16px" }}>
                {post.category === "Poetry" && "📜 "}
                {post.category === "Lyrics" && "🎵 "}
                {post.category === "Story" && "📖 "}
                {post.category === "Thoughts" && "💭 "}
                {post.category}
              </div>
            )}

            {/* TITLE */}
            <h1 style={{ fontSize: isMobile ? "24px" : "36px", fontWeight: 800, color: isDark ? "#fff" : "#111", lineHeight: 1.25, marginBottom: "20px", margin: "0 0 20px" }}>
              {post.title}
            </h1>

            {/* AUTHOR + META ROW */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingBottom: "20px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Avatar */}
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "16px", flexShrink: 0 }}>
                  {post.author?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <img src={PANKH} alt="" style={{ width: "14px", height: "14px", objectFit: "contain" }} />
                    <span style={{ fontSize: "15px", fontWeight: 700, color: isDark ? "#e2e8f0" : "#111" }}>{post.author}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
                    <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>📅 {fmtDate(post.createdAt)}</span>
                    <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>🕐 {readTime(post.content)} min read</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={toggleBookmark}
                  style={{ width: "38px", height: "38px", borderRadius: "10px", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)", background: isBookmarked ? "rgba(168,85,247,0.15)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: isBookmarked ? "#a855f7" : isDark ? "#94a3b8" : "#666", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Bookmark">
                  🔖
                </button>
                <button onClick={handleShare}
                  style={{ width: "38px", height: "38px", borderRadius: "10px", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)", background: copied ? "rgba(16,185,129,0.15)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: copied ? "#10b981" : isDark ? "#94a3b8" : "#666", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Share">
                  {copied ? "✅" : "📤"}
                </button>

                {/* Edit/Delete for author */}
                {post.author === userName && (
                  <>
                    <button onClick={() => navigate(`/edit/${id}`)}
                      style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: "rgba(99,102,241,0.15)", color: "#6366f1", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
                      ✏ Edit
                    </button>
                    <button onClick={() => setShowDeleteModal(true)}
                      style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
                      🗑 Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div style={{ fontSize: isMobile ? "16px" : "17px", lineHeight: "1.9", color: isDark ? "#e2e8f0" : "#1e293b", fontFamily: post.category === "Poetry" || post.category === "Lyrics" ? "Georgia, serif" : "inherit" }}>
              {post.content.split("\n").map((line, i) => (
                <p key={i} style={{ marginBottom: line.trim() === "" ? "16px" : "4px", textAlign: post.category === "Poetry" || post.category === "Lyrics" ? "center" : "left" }}>
                  {line.trim() === "" ? <br /> : line}
                </p>
              ))}
            </div>

            {/* BOTTOM DIVIDER */}
            <div style={{ marginTop: "36px", paddingTop: "24px", borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={PANKH} alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
                <span style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#888" }}>Published on <strong style={{ color: isDark ? "#e2e8f0" : "#111" }}>Parwa Paikh</strong></span>
              </div>
              <button onClick={() => navigate("/")}
                style={{ padding: "8px 16px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                Explore More →
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: isDark ? "#0f172a" : "#fff", padding: "36px", borderRadius: "24px", width: "300px", textAlign: "center", color: isDark ? "#fff" : "#111", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: "44px", marginBottom: "14px" }}>🗑️</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>Delete Post?</h3>
            <p style={{ color: isDark ? "#94a3b8" : "#666", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>This action cannot be undone. Your post will be permanently deleted.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ flex: 1, padding: "12px", background: isDark ? "#1f2937" : "#f1f5f9", color: isDark ? "#fff" : "#111", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600 }}
                onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600 }}
                onClick={() => { setShowDeleteModal(false); handleDelete(); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const shimmer = { position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", animation: "shimmer 1.4s infinite" };

export default PostDetails;