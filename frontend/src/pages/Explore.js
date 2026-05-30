import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PANKH_ICON = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";
const CATEGORIES = ["All", "Poetry", "Lyrics", "Story", "Thoughts"];

function Explore() {
  const navigate = useNavigate();
  const isDark = (localStorage.getItem("theme") || "dark") === "dark";

  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("All");
  const [searchTerm, setSearchTerm]   = useState("");
  const [visiblePosts, setVisiblePosts] = useState(12);

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

  return (
    <div style={S.page(isDark)}>

      {/* ── NAVBAR ── */}
      <nav style={S.navbar(isDark)}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src={PANKH_ICON} alt="" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: isDark ? "#fff" : "#111" }}>परवा पाइख</div>
            <div style={{ fontSize: "11px", color: "#7c3aed" }}>मैथिली साहित्य के संग</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={S.navBtn(isDark, false)} onClick={() => navigate("/")}>Home</button>
          <button style={S.navBtn(isDark, true)}>Explore</button>
          {localStorage.getItem("token") && (
            <>
              <button style={S.navBtn(isDark, false)} onClick={() => navigate("/my-posts")}>My Posts</button>
              <button style={S.navBtn(isDark, false)} onClick={() => navigate("/bookmarks")}>Bookmarks</button>
            </>
          )}
        </div>
      </nav>

      <div style={S.content}>

        {/* ── HERO ── */}
        <div style={S.hero(isDark)}>
          <h1 style={S.heroTitle(isDark)}>Explore 🔍</h1>
          <p style={S.heroSub(isDark)}>Discover all posts — poetry, lyrics, stories and thoughts</p>
        </div>

        {/* ── SEARCH + FILTER ── */}
        <div style={S.filterRow}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: isDark ? "#94a3b8" : "#999" }}>🔍</span>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search posts..."
              style={S.searchInput(isDark)}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)} style={S.catBtn(isDark, activeTab === cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={S.stats(isDark)}>
          <span style={{ color: isDark ? "#94a3b8" : "#666", fontSize: "14px" }}>
            {filtered.length} posts found
            {activeTab !== "All" && ` in ${activeTab}`}
          </span>
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div style={S.grid}>
            {[...Array(12)].map((_, i) => (
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
        ) : filtered.length === 0 ? (
          <div style={S.empty(isDark)}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
            <h3>No posts found</h3>
            <p style={{ marginTop: "6px", color: isDark ? "#94a3b8" : "#888" }}>Try a different keyword or category</p>
          </div>
        ) : (
          <>
            <div style={S.grid}>
              {filtered.slice(0, visiblePosts).map(post => (
                <div key={post._id} style={S.card(isDark)}
                  onClick={() => navigate(`/post/${post._id}`)}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(124,58,237,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = S.card(isDark).boxShadow; }}
                >
                  <div style={{ height: "190px", overflow: "hidden", background: "#111827", position: "relative" }}>
                    {post.image
                      ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                          onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                          onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>
                    }
                    {/* Category badge */}
                    {post.category && (
                      <div style={S.badge(post.category)}>{post.category}</div>
                    )}
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: "6px", lineHeight: 1.3 }}>{post.title}</h3>
                    <p style={{ fontSize: "13px", color: "#a855f7", fontWeight: 600, marginBottom: "8px" }}>✏ {post.author}</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      {post.createdAt && <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>📅 {fmtDate(post.createdAt)}</span>}
                      <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>🕐 {readTime(post.content)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visiblePosts < filtered.length && (
              <div style={{ textAlign: "center", margin: "30px 0" }}>
                <button style={S.moreBtn} onClick={() => setVisiblePosts(v => v + 12)}>
                  Load More ↓
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={S.footer(isDark)}>
        <p>© 2026 Saransh | All Rights Reserved</p>
      </footer>
    </div>
  );
}

const S = {
  page:    (isDark) => ({ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0d0d1a" : "#f8f9fc" }),
  navbar:  (isDark) => ({ position: "sticky", top: 0, zIndex: 999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "64px", background: isDark ? "rgba(10,10,20,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)" }),
  navBtn:  (isDark, active) => ({ padding: "8px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: active ? 700 : 500, background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent", color: active ? "#fff" : isDark ? "#cbd5e1" : "#555" }),
  content: { maxWidth: "1300px", width: "100%", margin: "0 auto", padding: "30px 24px", flex: 1 },
  hero:    (isDark) => ({ marginBottom: "28px" }),
  heroTitle: (isDark) => ({ fontSize: "32px", fontWeight: 800, color: isDark ? "#fff" : "#111", margin: 0 }),
  heroSub:   (isDark) => ({ fontSize: "15px", color: isDark ? "#94a3b8" : "#666", marginTop: "6px" }),
  filterRow: { display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" },
  searchInput: (isDark) => ({ width: "100%", padding: "11px 16px 11px 40px", borderRadius: "12px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)", background: isDark ? "#1a1a2e" : "#fff", color: isDark ? "#fff" : "#111", fontSize: "14px", outline: "none" }),
  catBtn:  (isDark, active) => ({ padding: "8px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", color: active ? "#fff" : isDark ? "#cbd5e1" : "#555", transition: "all 0.2s" }),
  stats:   (isDark) => ({ marginBottom: "20px" }),
  grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" },
  card:    (isDark) => ({ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }),
  badge:   (cat) => {
    const colors = { Poetry: "#7c3aed", Lyrics: "#0891b2", Story: "#065f46", Thoughts: "#92400e" };
    return { position: "absolute", top: "10px", left: "10px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#fff", background: colors[cat] || "#7c3aed" };
  },
  skelCard: (isDark) => ({ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#e5e7eb" }),
  shimmer:  { position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", animation: "shimmer 1.4s infinite" },
  empty:   (isDark) => ({ textAlign: "center", padding: "80px 20px", color: isDark ? "#fff" : "#111" }),
  moreBtn: { padding: "12px 32px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" },
  footer:  (isDark) => ({ padding: "20px", textAlign: "center", fontSize: "13px", background: isDark ? "#08090f" : "#1e1b4b", color: isDark ? "#94a3b8" : "#a78bfa", marginTop: "auto" }),
};

export default Explore;
