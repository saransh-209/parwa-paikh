import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../index.css";

const DESKTOP_BG_BEFORE  = "https://res.cloudinary.com/djhio7kqd/image/upload/v1777919102/ChatGPT_Image_May_4_2026_11_47_57_PM_rsfpn5.png";
const DESKTOP_BG_AFTER   = "https://res.cloudinary.com/djhio7kqd/image/upload/v1777999093/ChatGPT_Image_May_5_2026_10_07_28_PM_cwmjde.png";
const MOBILE_BG_BEFORE   = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780124555/mobilebg_h9u3xq.png";
const MOBILE_BG_AFTER    = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780124769/mobilebest_fnztns.png";

function Home() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const name      = localStorage.getItem("name");
  const role      = localStorage.getItem("role");
  const menuRef   = useRef(null);

  const [theme, setTheme]               = useState(() => localStorage.getItem("theme") || "dark");
  const [posts, setPosts]               = useState([]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("searchHistory")) || []; } catch { return []; }
  });
  const [showHistory, setShowHistory]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [visiblePosts, setVisiblePosts] = useState(12);
  const [showLogout, setShowLogout]     = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);

  /* ── responsive ── */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── theme ── */
  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── fetch ── */
  const fetchPosts = () => {
    if (!navigator.onLine) { setLoading(false); return; }
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/posts`)
      .then(r => setPosts(r.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => { const h = () => fetchPosts(); window.addEventListener("online", h); return () => window.removeEventListener("online", h); }, []);
  useEffect(() => { if (token) fetchPosts(); }, [token]);
  useEffect(() => { if (!token) setShowLogout(false); }, [token]);

  const isDark = theme === "dark";

  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const saveSearch = (term) => {
    if (!term.trim()) return;
    const u = [term, ...searchHistory.filter(x => x !== term)].slice(0, 6);
    setSearchHistory(u);
    localStorage.setItem("searchHistory", JSON.stringify(u));
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0a0d1a" : "#f1f5f9" }}>

      {/* ── NAVBAR ── */}
      <nav style={css.navbar(isDark)}>
        <h2 style={css.logo(isDark)}>परवा पाइख</h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* theme toggle */}
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={css.iconBtn(isDark)}>
            {isDark ? "🌙" : "☀️"}
          </button>

          {/* logged-in buttons */}
          {token && !isMobile && (
            <>
              {role === "author" && (
                <button style={css.createBtn} onClick={() => navigate("/create")}>+ Create</button>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={css.avatar}>{name?.[0]?.toUpperCase() || "U"}</div>
                <span style={{ color: isDark ? "#e2e8f0" : "#111", fontSize: "15px" }}>
                  Welcome, <b>{name}</b>
                </span>
              </div>
              <button style={css.logoutBtn} onClick={() => setShowLogout(true)}>⇥ Logout</button>
            </>
          )}

          {/* mobile hamburger */}
          {token && isMobile && (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} style={css.iconBtn(isDark)}>☰</button>
              {menuOpen && (
                <div style={css.dropdown(isDark)}>
                  <div style={css.dropUser(isDark)}>
                    <div style={css.avatar}>{name?.[0]?.toUpperCase() || "U"}</div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#fff" : "#111" }}>{name}</span>
                  </div>
                  {role === "author" && (
                    <button style={css.dropItem(isDark)} onClick={() => { setMenuOpen(false); navigate("/create"); }}>✏️ Create Post</button>
                  )}
                  <button style={{ ...css.dropItem(isDark), color: "#ef4444" }} onClick={() => { setMenuOpen(false); setShowLogout(true); }}>🚪 Logout</button>
                </div>
              )}
            </div>
          )}

          {/* not logged in */}
          {!token && (
            <>
              <button style={css.loginBtn(isDark)} onClick={() => navigate("/login")}>Login</button>
              <button style={css.signupBtn} onClick={() => navigate("/signup")}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* ══ NOT LOGGED IN ══ */}
      {!token && (
        <>
          {/* FULL BG HERO */}
          <div style={css.fullBg(isMobile)}>
            <div style={css.fullBgOverlay}>
              <div className="glass-box" style={css.glass(isMobile)}>
                <h1 style={css.heading(isDark, isMobile)}>
                  Discover
                  <span style={css.highlight(isDark)}>मैथिली साहित्य</span>
                </h1>
                <p style={css.subtext(isDark, isMobile)}>Explore poetry, lyrics and stories from creators.</p>
                <button style={css.primaryBtn} onClick={() => navigate("/login")}>Get Started →</button>
              </div>
            </div>
          </div>

          {/* WHY SECTION */}
          <section style={{ width: "100%", padding: "80px 30px", background: "#020617" }}>
            <h2 style={{ textAlign: "center", fontSize: "28px", marginBottom: "50px", color: "white" }}>Why Use This Platform?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>
              {[
                { icon: "✍️", title: "Create Content",  text: "Empower creators to write, edit, and publish original posts seamlessly." },
                { icon: "📖", title: "Read & Explore",  text: "Explore a diverse collection of poetry, stories, and articles by talented authors." },
                { icon: "⚡", title: "Fast & Simple",   text: "Experience a fast, responsive, and modern interface designed for user comfort." },
              ].map((c, i) => (
                <div key={i} style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", padding: "32px", borderRadius: "20px", color: "#a0e1ea" }}>
                  <div style={{ fontSize: "28px" }}>{c.icon}</div>
                  <h3 style={{ margin: "12px 0 8px" }}>{c.title}</h3>
                  <p style={{ marginTop: "8px", fontSize: "16px", color: "#e793e4", lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ══ LOGGED IN ══ */}
      {token && (
        <>
          {/* HERO BANNER */}
          <div style={css.heroBanner(isMobile)}>
            <div style={css.heroContent(isMobile)}>
              <h1 style={css.heroTitle(isMobile)}>Discover</h1>
              <h1 style={css.heroHindi(isMobile)}>मैथिली साहित्य</h1>
              <p style={css.heroSub(isMobile)}>Explore poetry, lyrics and stories from creators.</p>
            </div>
          </div>

          {/* POSTS SECTION */}
          <div style={{ padding: isMobile ? "20px 14px" : "40px 50px", flex: 1, background: isDark ? "#0a0d1a" : "#f1f5f9" }}>

            <h2 style={css.sectionTitle(isDark)}>Latest Posts</h2>

            {/* SEARCH */}
            <div style={{ position: "relative", display: "flex", gap: "10px", margin: "20px 0 28px", maxWidth: "500px" }}>
              <input
                value={searchTerm}
                onFocus={() => setShowHistory(true)}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { saveSearch(searchTerm); setShowHistory(false); } }}
                placeholder="Search post by title..."
                style={css.searchInput(isDark)}
              />
              <button style={css.searchBtn} onClick={() => { saveSearch(searchTerm); setShowHistory(false); }}>🔍</button>

              {showHistory && searchHistory.length > 0 && (
                <div style={css.historyBox(isDark)}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: isDark ? "#cbd5e1" : "#555", fontSize: "13px" }}>Recent Searches</span>
                    <span onClick={() => { setSearchHistory([]); localStorage.removeItem("searchHistory"); }} style={{ cursor: "pointer", color: "#f54f4f", fontSize: "13px" }}>✕ Clear</span>
                  </div>
                  {searchHistory.map((item, i) => (
                    <div key={i} style={css.historyItem(isDark)} onClick={() => { setSearchTerm(item); setShowHistory(false); }}>🔍 {item}</div>
                  ))}
                </div>
              )}
            </div>

            {/* ── GRID (desktop) / LIST (mobile) ── */}
            {loading ? (
              /* SHIMMER SKELETON */
              <div style={isMobile ? css.list : css.grid}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={isMobile ? css.skelCardMobile(isDark) : css.skelCardDesktop(isDark)}>
                    <div style={{ position: "relative", overflow: "hidden", background: isDark ? "#1f2937" : "#d1d5db",
                      height: isMobile ? "100px" : "180px", width: isMobile ? "130px" : "100%", flexShrink: 0 }}>
                      <div style={css.shimmer} />
                    </div>
                    <div style={{ padding: "12px", flex: 1 }}>
                      <div style={{ position: "relative", overflow: "hidden", height: "18px", width: "65%", borderRadius: "8px", background: isDark ? "#374151" : "#c4c9d4", marginBottom: "10px" }}><div style={css.shimmer} /></div>
                      <div style={{ position: "relative", overflow: "hidden", height: "12px", width: "40%", borderRadius: "8px", background: isDark ? "#4b5563" : "#d1d5db" }}><div style={css.shimmer} /></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", color: "white" }}>
                <h2>No Posts Found 🔍</h2><p>Try another keyword.</p>
              </div>
            ) : isMobile ? (
              /* ── MOBILE: horizontal list ── */
              <div style={css.list}>
                {filteredPosts.slice(0, visiblePosts).map(post => (
                  <div key={post._id} style={css.cardMobile(isDark)} onClick={() => navigate(`/post/${post._id}`)}>
                    <div style={{ width: "130px", height: "100px", flexShrink: 0, overflow: "hidden", background: "#1f2937" }}>
                      {post.image ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "12px" }}>No Cover</div>}
                    </div>
                    <div style={{ padding: "10px 14px", flex: 1 }}>
                      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "5px", lineHeight: 1.3 }}>{post.title}</h3>
                      <p style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 600, marginBottom: "3px" }}>✏ {post.author}</p>
                      {post.createdAt && <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#666" }}>📅 {fmtDate(post.createdAt)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── DESKTOP: grid ── */
              <div style={css.grid}>
                {filteredPosts.slice(0, visiblePosts).map(post => (
                  <div key={post._id} style={css.cardDesktop(isDark)} onClick={() => navigate(`/post/${post._id}`)}>
                    <div style={{ height: "200px", overflow: "hidden", background: "#111827", borderRadius: "12px 12px 0 0" }}>
                      {post.image ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                        onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                        onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>}
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{post.title}</h3>
                      <p style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 600, marginBottom: "4px" }}>✏ {post.author}</p>
                      {post.createdAt && <p style={{ fontSize: "12px", color: "#94a3b8" }}>📅 {fmtDate(post.createdAt)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SEE MORE */}
            {visiblePosts < filteredPosts.length && !loading && (
              <div style={{ textAlign: "center", margin: "30px 0" }}>
                <button style={{ padding: "12px 28px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "14px", fontSize: "16px", cursor: "pointer" }}
                  onClick={() => setVisiblePosts(v => v + 12)}>
                  See More Posts ↓
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── LOGOUT MODAL ── */}
      {showLogout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "rgba(15,23,42,0.97)", backdropFilter: "blur(18px)", padding: "35px", borderRadius: "20px", width: "320px", textAlign: "center", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ marginBottom: "10px" }}>Logout Confirmation ⚠️</h2>
            <p style={{ color: "#dbeafe", marginBottom: "24px" }}>Do you really want to logout?</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button style={{ padding: "10px 20px", background: "#1f2937", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }} onClick={() => setShowLogout(false)}>Cancel</button>
              <button style={{ padding: "10px 20px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}
                onClick={() => { setShowLogout(false); setTimeout(() => { localStorage.clear(); navigate("/"); }, 200); }}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ padding: "12px", textAlign: "center", fontSize: "13px", background: isDark ? "#08090b" : "#e2e8f0", color: isDark ? "#94a3b8" : "#555", marginTop: "auto" }}>
        <p>© copyright 2026 Saransh | All Rights Reserved</p>
      </footer>

    </div>
  );
}

/* ════════════════════════════════════
   STYLES
════════════════════════════════════ */
const css = {

  navbar: (isDark) => ({
    position: "sticky", top: 0, zIndex: 999,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 18px", height: "64px",
    background: isDark ? "rgba(10,13,26,0.92)" : "rgba(241,245,249,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
  }),

  logo: (isDark) => ({ fontSize: "20px", fontWeight: 700, color: isDark ? "#fff" : "#111", letterSpacing: "0.3px" }),

  iconBtn: (isDark) => ({
    width: "42px", height: "42px", borderRadius: "12px",
    border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.12)",
    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
    color: isDark ? "#fff" : "#111", fontSize: "18px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center"
  }),

  createBtn: {
    padding: "9px 16px", borderRadius: "10px",
    border: "1px solid rgba(124,58,237,0.6)",
    background: "transparent", color: "#a78bfa",
    fontWeight: 600, cursor: "pointer", fontSize: "14px"
  },

  avatar: {
    width: "32px", height: "32px", borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: "14px", flexShrink: 0
  },

  logoutBtn: {
    padding: "9px 16px", borderRadius: "10px",
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "14px"
  },

  dropdown: (isDark) => ({
    position: "absolute", right: 0, top: "50px", width: "200px",
    background: isDark ? "#111827" : "#fff", borderRadius: "14px",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)", overflow: "hidden", zIndex: 1000
  }),

  dropUser: (isDark) => ({
    display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px",
    borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
  }),

  dropItem: (isDark) => ({
    display: "block", width: "100%", textAlign: "left", padding: "12px 16px",
    border: "none", background: "transparent",
    color: isDark ? "#e2e8f0" : "#333", fontSize: "14px", cursor: "pointer",
    borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)"
  }),

  loginBtn: (isDark) => ({
    padding: "8px 14px", borderRadius: "8px",
    background: isDark ? "#fff" : "#111", color: isDark ? "#111" : "#fff",
    border: "none", cursor: "pointer", fontWeight: 600
  }),

  signupBtn: {
    padding: "8px 14px", borderRadius: "8px",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    color: "#fff", border: "none", cursor: "pointer", fontWeight: 600
  },

  /* BEFORE LOGIN BG */
  fullBg: (isMobile) => ({
    flex: 1, minHeight: "calc(100vh - 64px)",
    backgroundImage: `url(${isMobile ? MOBILE_BG_BEFORE : DESKTOP_BG_BEFORE})`,
    backgroundSize: isMobile ? "contain" : "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center top",
    backgroundColor: "#111436",
    display: "flex", alignItems: "center", justifyContent: "center"
  }),

  fullBgOverlay: {
    width: "100%", height: "100%", minHeight: "calc(100vh - 64px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 20px"
  },

  glass: (isMobile) => ({
    padding: isMobile ? "28px 22px" : "40px 50px",
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
    width: isMobile ? "270px" : "600px",
    maxWidth: "700px",
  }),

  heading: (isDark, isMobile) => ({
    fontSize: isMobile ? "38px" : "64px", fontWeight: 800, lineHeight: 1.1,
    color: isDark ? "#171f68" : "#0986e5", marginBottom: "8px"
  }),

  highlight: (isDark) => ({ display: "block", marginTop: "6px", color: isDark ? "#c129b4" : "#7c3aed" }),

  subtext: (isDark, isMobile) => ({
    marginTop: "10px", marginBottom: "24px",
    fontSize: isMobile ? "16px" : "20px", fontFamily: "Times New Roman",
    color: isDark ? "#2d2d2d" : "#6a401e", lineHeight: 1.5
  }),

  primaryBtn: {
    padding: "14px 32px", background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    color: "white", border: "none", borderRadius: "14px",
    fontSize: "18px", fontWeight: 600, cursor: "pointer"
  },

  /* AFTER LOGIN HERO */
  heroBanner: (isMobile) => ({
    width: "100%",
    minHeight: isMobile ? "200px" : "320px",
    backgroundImage: `url(${isMobile ? MOBILE_BG_AFTER : DESKTOP_BG_AFTER})`,
    backgroundSize: "cover", backgroundPosition: "center",
    display: "flex", alignItems: "center"
  }),

  heroContent: (isMobile) => ({
    padding: isMobile ? "20px 22px" : "40px 60px",
    display: "flex", flexDirection: "column", justifyContent: "center"
  }),

  heroTitle: (isMobile) => ({ fontSize: isMobile ? "28px" : "52px", fontWeight: 800, color: "#111", margin: 0, lineHeight: 1.1 }),
  heroHindi: (isMobile) => ({ fontSize: isMobile ? "24px" : "46px", fontWeight: 800, color: "#c129b4", margin: "4px 0 8px", lineHeight: 1.1 }),
  heroSub:   (isMobile) => ({ fontSize: isMobile ? "13px" : "17px", color: "#1a1a1a", maxWidth: "320px", lineHeight: 1.5 }),

  sectionTitle: (isDark) => ({
    fontSize: "26px", fontWeight: 800, marginBottom: "4px",
    color: isDark ? "#fff" : "#111",
    borderBottom: "3px solid #7c3aed", paddingBottom: "8px", display: "inline-block"
  }),

  searchInput: (isDark) => ({
    flex: 1, padding: "13px 18px", borderRadius: "14px",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
    background: isDark ? "#141728" : "#fff",
    color: isDark ? "#fff" : "#111", fontSize: "15px", outline: "none"
  }),

  searchBtn: {
    width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px", border: "none",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: "20px", cursor: "pointer"
  },

  historyBox: (isDark) => ({
    position: "absolute", top: "62px", left: 0, width: "100%",
    background: isDark ? "#111827" : "#fff", borderRadius: "14px",
    padding: "12px", zIndex: 2000, boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
  }),

  historyItem: (isDark) => ({
    padding: "10px 12px", borderRadius: "10px", marginBottom: "5px",
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    color: isDark ? "#fff" : "#111", cursor: "pointer", fontSize: "14px"
  }),

  /* LAYOUT */
  list: { display: "flex", flexDirection: "column", gap: "12px" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
    gap: "20px"
  },

  /* MOBILE CARD */
  cardMobile: (isDark) => ({
    display: "flex", alignItems: "center", borderRadius: "14px", overflow: "hidden",
    background: isDark ? "#111827" : "#fff",
    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.18)", cursor: "pointer"
  }),

  /* DESKTOP CARD */
  cardDesktop: (isDark) => ({
    borderRadius: "14px", overflow: "hidden",
    background: isDark ? "#111827" : "#fff",
    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.09)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)", cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s"
  }),

  /* SKELETON */
  skelCardMobile: (isDark) => ({
    display: "flex", borderRadius: "14px", overflow: "hidden",
    background: isDark ? "#111827" : "#e5e7eb", height: "100px"
  }),

  skelCardDesktop: (isDark) => ({
    borderRadius: "14px", overflow: "hidden",
    background: isDark ? "#111827" : "#e5e7eb"
  }),

  shimmer: {
    position: "absolute", top: 0, left: "-100%",
    width: "60%", height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
    animation: "shimmer 1.4s infinite"
  },
};

export default Home;