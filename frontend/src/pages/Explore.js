import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NavBar } from "./NavBar";

const PANKH = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";
const CATEGORIES = ["All", "Poetry", "Lyrics", "Story", "Thoughts"];

function Explore() {
  const navigate = useNavigate();
  const theme  = localStorage.getItem("theme") || "dark";
  const isDark = theme === "dark";

  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("All");
  const [searchTerm, setSearchTerm]   = useState("");
  const [visiblePosts, setVisiblePosts] = useState(12);
  const [isMobile, setIsMobile]       = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/posts`)
      .then(r => setPosts(r.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat    = activeTab === "All" || p.category === activeTab;
    return matchSearch && matchCat;
  });

  const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const readTime = (c) => Math.max(1, Math.ceil((c?.split(" ").length || 100) / 200)) + " min read";
  const badgeColors = { Poetry: "#7c3aed", Lyrics: "#0891b2", Story: "#065f46", Thoughts: "#92400e" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0d0d1a" : "#f8f9fc", paddingBottom: isMobile ? "70px" : "0" }}>

      <NavBar activePath="/explore" />

      <div style={{ maxWidth: "1300px", width: "100%", margin: "0 auto", padding: isMobile ? "16px 14px" : "30px 24px", flex: 1 }}>

        {/* HERO */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: isMobile ? "26px" : "32px", fontWeight: 800, color: isDark ? "#fff" : "#111", margin: 0 }}>Explore 🔍</h1>
          <p style={{ fontSize: "14px", color: isDark ? "#94a3b8" : "#666", marginTop: "6px" }}>Discover all posts — poetry, lyrics, stories and thoughts</p>
        </div>

        {/* SEARCH */}
        <div style={{ display: "flex", alignItems: "center", background: isDark ? "#1a1a2e" : "#fff", borderRadius: "14px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", padding: "0 14px", gap: "10px", marginBottom: "14px", maxWidth: "500px" }}>
          <span style={{ color: isDark ? "#94a3b8" : "#bbb", fontSize: "18px" }}>🔍</span>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search posts..."
            style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", outline: "none", color: isDark ? "#fff" : "#111", fontSize: "14px" }} />
        </div>

        {/* CATEGORY TABS */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} style={{ padding: "8px 14px", borderRadius: "12px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: activeTab === cat ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent", color: activeTab === cat ? "#fff" : isDark ? "#cbd5e1" : "#555" }}>
              {cat}
            </button>
          ))}
        </div>

        <p style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#666", marginBottom: "16px" }}>{filtered.length} posts found{activeTab !== "All" ? ` in ${activeTab}` : ""}</p>

        {/* POSTS */}
        {loading ? (
          <div style={isMobile ? { display: "flex", flexDirection: "column", gap: "10px" } : { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" }}>
            {[...Array(6)].map((_, i) => (
              isMobile ? (
                <div key={i} style={{ display: "flex", borderRadius: "14px", overflow: "hidden", background: isDark ? "#111827" : "#e5e7eb", height: "95px" }}>
                  <div style={{ width: "130px", flexShrink: 0, position: "relative", overflow: "hidden", background: isDark ? "#1f2937" : "#d1d5db" }}><div style={shimmer} /></div>
                  <div style={{ padding: "12px", flex: 1 }}>
                    <div style={{ position: "relative", overflow: "hidden", height: "15px", width: "60%", borderRadius: "6px", background: isDark ? "#374151" : "#c4c9d4", marginBottom: "8px" }}><div style={shimmer} /></div>
                    <div style={{ position: "relative", overflow: "hidden", height: "11px", width: "40%", borderRadius: "6px", background: isDark ? "#4b5563" : "#d1d5db" }}><div style={shimmer} /></div>
                  </div>
                </div>
              ) : (
                <div key={i} style={{ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#e5e7eb" }}>
                  <div style={{ position: "relative", overflow: "hidden", height: "190px", background: isDark ? "#1f2937" : "#d1d5db" }}><div style={shimmer} /></div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ position: "relative", overflow: "hidden", height: "16px", width: "65%", borderRadius: "6px", background: isDark ? "#374151" : "#c4c9d4", marginBottom: "10px" }}><div style={shimmer} /></div>
                    <div style={{ position: "relative", overflow: "hidden", height: "12px", width: "40%", borderRadius: "6px", background: isDark ? "#4b5563" : "#d1d5db" }}><div style={shimmer} /></div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: isDark ? "#94a3b8" : "#666" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
            <h3 style={{ color: isDark ? "#fff" : "#111" }}>No posts found</h3>
            <p style={{ marginTop: "6px" }}>Try a different keyword or category</p>
          </div>
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.slice(0, visiblePosts).map(post => (
              <div key={post._id} style={{ display: "flex", alignItems: "center", borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer" }}
                onClick={() => navigate(`/post/${post._id}`)}>
                <div style={{ width: "120px", height: "95px", flexShrink: 0, overflow: "hidden", background: "#1f2937", borderRadius: "12px", margin: "8px", position: "relative" }}>
                  {post.image ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "12px" }}>No Cover</div>}
                  {post.category && <div style={{ position: "absolute", top: "4px", left: "4px", padding: "2px 7px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, color: "#fff", background: badgeColors[post.category] || "#7c3aed" }}>{post.category}</div>}
                </div>
                <div style={{ padding: "8px 10px 8px 4px", flex: 1 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: isDark ? "#fff" : "#0f172a", marginBottom: "4px", lineHeight: 1.3 }}>{post.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                    <img src={PANKH} alt="" style={{ width: "11px", height: "11px", objectFit: "contain" }} />
                    <p style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600 }}>{post.author}</p>
                  </div>
                  <p style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#888" }}>📅 {post.createdAt ? fmtDate(post.createdAt) : ""} &nbsp; 🕐 {readTime(post.content)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" }}>
            {filtered.slice(0, visiblePosts).map(post => (
              <div key={post._id}
                style={{ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                onClick={() => navigate(`/post/${post._id}`)}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(124,58,237,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}>
                <div style={{ height: "190px", overflow: "hidden", background: "#111827", position: "relative" }}>
                  {post.image ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                    onMouseEnter={e => e.target.style.transform = "scale(1.06)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>}
                  {post.category && <div style={{ position: "absolute", top: "10px", left: "10px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#fff", background: badgeColors[post.category] || "#7c3aed" }}>{post.category}</div>}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: "6px", lineHeight: 1.3 }}>{post.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                    <img src={PANKH} alt="" style={{ width: "13px", height: "13px", objectFit: "contain" }} />
                    <p style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 600 }}>{post.author}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {post.createdAt && <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>📅 {fmtDate(post.createdAt)}</span>}
                    <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>🕐 {readTime(post.content)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {visiblePosts < filtered.length && !loading && (
          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <button style={{ padding: "12px 32px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }} onClick={() => setVisiblePosts(v => v + 12)}>Load More ↓</button>
          </div>
        )}
      </div>

      <footer style={{ padding: "20px", textAlign: "center", fontSize: "13px", background: isDark ? "#08090f" : "#1e1b4b", color: isDark ? "#94a3b8" : "#a78bfa", marginTop: "auto" }}>
        <p>© 2026 Saransh | All Rights Reserved</p>
      </footer>
    </div>
  );
}

const shimmer = { position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", animation: "shimmer 1.4s infinite" };

export default Explore;
