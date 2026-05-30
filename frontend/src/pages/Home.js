import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../index.css";
import mobileBg from "../assets/mobile-bg.png";

function Home() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("searchHistory")) || []; }
    catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setShowRetry] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState(12);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPosts = () => {
    if (!navigator.onLine) { setShowRetry(true); setLoading(false); return; }
    setLoading(true);
    setShowRetry(false);
    setTimeout(() => setShowRetry(true), 5000);
    axios.get(`${process.env.REACT_APP_API_URL}/posts`)
      .then(res => setPosts(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handleOnline = () => { setShowRetry(false); fetchPosts(); };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => { if (token) fetchPosts(); }, [token]);
  useEffect(() => { if (!token) setShowLogoutModal(false); }, [token]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveSearch = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...searchHistory.filter(x => x !== term)].slice(0, 6);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const isDark = theme === "dark";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0a0d1a" : "#f1f5f9" }}>

      {/* ── NAVBAR ── */}
      <nav style={S.navbar(isDark)}>
        <h2 style={S.logo(isDark)}>परवा पाइख</h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={toggleTheme} style={S.iconBtn(isDark)}>
            {isDark ? "🌙" : "☀️"}
          </button>

          {token && (
            <div style={{ position: "relative" }} ref={menuRef}>
              <button onClick={() => setMenuOpen(o => !o)} style={S.iconBtn(isDark)}>
                ☰
              </button>

              {menuOpen && (
                <div style={S.dropdown(isDark)}>
                  <div style={S.dropdownUser(isDark)}>
                    <div style={S.avatar}>
                      {name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: "600" }}>
                      {name}
                    </span>
                  </div>

                  {role === "author" && (
                    <button
                      style={S.dropItem(isDark)}
                      onClick={() => { setMenuOpen(false); navigate("/create"); }}
                    >
                      ✏️ Create Post
                    </button>
                  )}

                  <button
                    style={{ ...S.dropItem(isDark), color: "#ef4444" }}
                    onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {!token && (
            <>
              <button style={S.loginBtn(isDark)} onClick={() => navigate('/login')}>Login</button>
              <button style={S.signupBtn(isDark)} onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* ── LOGGED IN ── */}
      {token && (
        <>
          {/* HERO BANNER */}
          <div style={S.heroBanner}>
            <div style={S.heroOverlay}>
              <h1 style={S.heroTitle}>Discover</h1>
              <h1 style={S.heroTitleHindi}>मैथिली साहित्य</h1>
              <p style={S.heroSub}>Explore poetry, lyrics and stories from creators.</p>
            </div>
          </div>

          {/* POSTS SECTION */}
          <div style={S.postsSection(isDark)}>

            <h2 style={S.sectionTitle(isDark)}>Latest Posts</h2>

            {/* SEARCH */}
            <div style={S.searchWrap}>
              <input
                value={searchTerm}
                onFocus={() => setShowHistory(true)}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { saveSearch(searchTerm); setShowHistory(false); }
                }}
                placeholder="Search post by title..."
                style={S.searchInput(isDark)}
              />
              <button style={S.searchBtn} onClick={() => { saveSearch(searchTerm); setShowHistory(false); }}>
                🔍
              </button>

              {showHistory && searchHistory.length > 0 && (
                <div style={S.historyBox(isDark)}>
                  <div style={S.historyTop}>
                    <span style={{ color: isDark ? "#cbd5e1" : "#555" }}>Recent Searches</span>
                    <span onClick={clearHistory} style={{ cursor: "pointer", color: "#f54f4f" }}>✕</span>
                  </div>
                  {searchHistory.map((item, i) => (
                    <div key={i} style={S.historyItem(isDark)} onClick={() => { setSearchTerm(item); setShowHistory(false); }}>
                      🔍 {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* POST LIST */}
            <div style={S.list}>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={S.skeletonCard(isDark)}>
                    <div style={S.skeletonImg} />
                    <div style={{ flex: 1, padding: "12px" }}>
                      <div style={S.skeletonLine} />
                      <div style={S.skeletonSmall} />
                    </div>
                  </div>
                ))
              ) : filteredPosts.length === 0 ? (
                <div style={S.noPost}>
                  <h2>No Posts Found 🔍</h2>
                  <p>Try another keyword.</p>
                </div>
              ) : (
                filteredPosts.slice(0, visiblePosts).map(post => (
                  <div key={post._id} style={S.card(isDark)} onClick={() => navigate(`/post/${post._id}`)}>
                    <div style={S.cardImg}>
                      {post.image
                        ? <img src={post.image} alt="cover" style={S.img} />
                        : <div style={S.noImg}>No Cover</div>
                      }
                    </div>
                    <div style={S.cardBody}>
                      <h3 style={S.cardTitle(isDark)}>{post.title}</h3>
                      <p style={S.cardAuthor}>✏ {post.author}</p>
                      {post.createdAt && (
                        <p style={S.cardDate(isDark)}>📅 {formatDate(post.createdAt)}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {visiblePosts < filteredPosts.length && !loading && (
              <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
                <button style={S.moreBtn} onClick={() => setVisiblePosts(v => v + 12)}>
                  See More Posts ↓
                </button>
              </div>
            )}

          </div>
        </>
      )}

      {/* ── NOT LOGGED IN ── */}
      {!token && (
        <>
          <div style={S.centerBox}>
            <div className="glass-box" style={S.glass}>
              <h1 style={S.heading(isDark)}>
                Discover
                <span style={S.highlight(isDark)}>मैथिली साहित्य</span>
              </h1>
              <p style={S.subtext(isDark)}>Explore poetry, lyrics and stories from creators.</p>
              <button style={S.primaryBtn} onClick={() => navigate('/login')}>Get Started →</button>
            </div>
          </div>

          <section style={S.whySection}>
            <h2 style={S.whyTitle}>Why Use This Platform?</h2>
            <div style={S.whyGrid}>
              {[
                { icon: "✍️", title: "Create Content", text: "Empower creators to write, edit, and publish original posts seamlessly." },
                { icon: "📖", title: "Read & Explore", text: "Explore a diverse collection of poetry, stories, and articles by talented authors." },
                { icon: "⚡", title: "Fast & Simple", text: "Experience a fast, responsive, and modern interface designed for user comfort." },
              ].map((c, i) => (
                <div key={i} style={S.whyCard}>
                  <div style={{ fontSize: "28px" }}>{c.icon}</div>
                  <h3 style={{ margin: "12px 0 8px" }}>{c.title}</h3>
                  <p style={S.whytext}>{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <h2 style={{ marginBottom: "10px" }}>Logout Confirmation ⚠️</h2>
            <p style={{ color: "#dbeafe", marginBottom: "20px" }}>Do you really want to logout?</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button style={S.cancelBtn} onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button style={S.yesBtn} onClick={() => {
                setShowLogoutModal(false);
                setTimeout(() => { localStorage.clear(); navigate('/'); }, 200);
              }}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={S.footer(isDark)}>
        <p>© copyright 2026 Saransh | All Rights Reserved</p>
      </footer>

    </div>
  );
}

/* ─────────── STYLES ─────────── */
const isMobile = window.innerWidth <= 768;

const S = {

  navbar: (isDark) => ({
    position: "sticky", top: 0, zIndex: 999,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", height: "64px",
    background: isDark ? "rgba(10,13,26,0.92)" : "rgba(241,245,249,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
  }),

  logo: (isDark) => ({
    fontSize: "20px", fontWeight: "700",
    color: isDark ? "#fff" : "#111",
    letterSpacing: "0.3px"
  }),

  iconBtn: (isDark) => ({
    width: "42px", height: "42px",
    borderRadius: "12px",
    border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.12)",
    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
    color: isDark ? "#fff" : "#111",
    fontSize: "18px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center"
  }),

  dropdown: (isDark) => ({
    position: "absolute", right: 0, top: "50px",
    width: "200px",
    background: isDark ? "#111827" : "#fff",
    borderRadius: "14px",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    overflow: "hidden", zIndex: 1000
  }),

  dropdownUser: (isDark) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "14px 16px",
    borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
    color: isDark ? "#fff" : "#111"
  }),

  avatar: {
    width: "34px", height: "34px", borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: "700", fontSize: "15px", flexShrink: 0
  },

  dropItem: (isDark) => ({
    display: "block", width: "100%", textAlign: "left",
    padding: "12px 16px", border: "none",
    background: "transparent",
    color: isDark ? "#e2e8f0" : "#333",
    fontSize: "14px", cursor: "pointer",
    borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)"
  }),

  loginBtn: (isDark) => ({
    padding: "8px 14px", borderRadius: "8px",
    background: isDark ? "#fff" : "#111",
    color: isDark ? "#111" : "#fff",
    border: "none", cursor: "pointer", fontWeight: "600"
  }),

  signupBtn: (isDark) => ({
    padding: "8px 14px", borderRadius: "8px",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    color: "#fff", border: "none", cursor: "pointer", fontWeight: "600"
  }),

  /* HERO */
  heroBanner: {
    width: "100%",
    minHeight: isMobile ? "220px" : "300px",
    backgroundImage: "url('https://res.cloudinary.com/djhio7kqd/image/upload/v1777999093/ChatGPT_Image_May_5_2026_10_07_28_PM_cwmjde.png')",
    backgroundSize: "cover", backgroundPosition: "center",
    display: "flex", alignItems: "center",
    position: "relative"
  },

  heroOverlay: {
    padding: isMobile ? "20px 24px" : "40px 60px",
    background: "rgba(0,0,0,0.35)"  ,
    width: "100%", height: "100%",
    display: "flex", flexDirection: "column", justifyContent: "center"
  },

  heroTitle: {
    fontSize: isMobile ? "32px" : "52px",
    fontWeight: "800", color: "#111", margin: 0, lineHeight: 1.1
  },

  heroTitleHindi: {
    fontSize: isMobile ? "28px" : "46px",
    fontWeight: "800", color: "#c129b4", margin: "4px 0 10px", lineHeight: 1.1
  },

  heroSub: {
    fontSize: isMobile ? "14px" : "18px",
    color: "#1a1a1a", maxWidth: "320px", lineHeight: 1.5
  },

  /* POSTS */
  postsSection: (isDark) => ({
    padding: isMobile ? "20px 14px" : "40px 50px",
    flex: 1,
    background: isDark ? "#0a0d1a" : "#f1f5f9"
  }),

  sectionTitle: (isDark) => ({
    fontSize: isMobile ? "26px" : "36px",
    fontWeight: "800", marginBottom: "6px",
    color: isDark ? "#fff" : "#111",
    borderBottom: "3px solid #7c3aed",
    paddingBottom: "8px", display: "inline-block"
  }),

  searchWrap: {
    position: "relative", display: "flex",
    gap: "10px", margin: "20px 0 24px",
    maxWidth: "500px"
  },

  searchInput: (isDark) => ({
    flex: 1, padding: "14px 18px",
    borderRadius: "14px",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
    background: isDark ? "#141728" : "#fff",
    color: isDark ? "#fff" : "#111",
    fontSize: "15px", outline: "none"
  }),

  searchBtn: {
    width: "52px", height: "52px", flexShrink: 0,
    borderRadius: "14px", border: "none",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    color: "#fff", fontSize: "20px", cursor: "pointer"
  },

  historyBox: (isDark) => ({
    position: "absolute", top: "60px", left: 0, width: "100%",
    background: isDark ? "#111827" : "#fff",
    borderRadius: "14px", padding: "12px", zIndex: 2000,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
  }),

  historyTop: {
    display: "flex", justifyContent: "space-between",
    marginBottom: "10px"
  },

  historyItem: (isDark) => ({
    padding: "10px 12px", borderRadius: "10px", marginBottom: "5px",
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    color: isDark ? "#fff" : "#111", cursor: "pointer", fontSize: "14px"
  }),

  /* HORIZONTAL CARD */
  list: {
    display: "flex", flexDirection: "column", gap: "12px"
  },

  card: (isDark) => ({
    display: "flex", alignItems: "center",
    borderRadius: "16px", overflow: "hidden",
    background: isDark ? "#111827" : "#fff",
    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    cursor: "pointer", transition: "transform 0.2s"
  }),

  cardImg: {
    width: isMobile ? "130px" : "180px",
    height: isMobile ? "100px" : "130px",
    flexShrink: 0, overflow: "hidden",
    background: "#1f2937"
  },

  img: { width: "100%", height: "100%", objectFit: "cover" },

  noImg: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#1f2937", color: "#6b7280", fontSize: "13px"
  },

  cardBody: {
    padding: isMobile ? "10px 14px" : "14px 20px", flex: 1
  },

  cardTitle: (isDark) => ({
    fontSize: isMobile ? "17px" : "20px",
    fontWeight: "700",
    color: isDark ? "#fff" : "#111",
    marginBottom: "6px", lineHeight: 1.3
  }),

  cardAuthor: {
    fontSize: "13px", color: "#f59e0b",
    fontWeight: "600", marginBottom: "4px"
  },

  cardDate: (isDark) => ({
    fontSize: "12px",
    color: isDark ? "#94a3b8" : "#666"
  }),

  moreBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    color: "white", border: "none", borderRadius: "14px",
    fontSize: "16px", cursor: "pointer"
  },

  /* SKELETON */
  skeletonCard: (isDark) => ({
    display: "flex", borderRadius: "16px", overflow: "hidden",
    background: isDark ? "#111827" : "#e2e8f0", height: "100px"
  }),

  skeletonImg: {
    width: "130px", height: "100px",
    background: "#374151", flexShrink: 0
  },

  skeletonLine: {
    height: "18px", width: "60%", borderRadius: "8px",
    background: "#4b5563", marginBottom: "12px"
  },

  skeletonSmall: {
    height: "12px", width: "40%", borderRadius: "8px",
    background: "#6b7280"
  },

  noPost: {
    textAlign: "center", padding: "60px 20px", borderRadius: "20px",
    background: "rgba(255,255,255,0.05)", color: "white"
  },

  /* NOT LOGGED IN */
  centerBox: {
    minHeight: "calc(100vh - 90px)",
    display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
  },

  glass: {
    padding: isMobile ? "25px" : "40px",
    display: "flex", flexDirection: "column",
    alignItems: "center", textAlign: "center",
    width: isMobile ? "280px" : "600px",
  },

  heading: (isDark) => ({
    fontSize: isMobile ? "40px" : "64px",
    fontWeight: "800", lineHeight: 1.1,
    color: isDark ? "#171f68" : "#0986e5",
    marginBottom: "10px"
  }),

  highlight: (isDark) => ({
    display: "block", marginTop: "8px",
    color: isDark ? "#c129b4" : "#7c3aed"
  }),

  subtext: (isDark) => ({
    marginTop: "10px", marginBottom: "26px",
    fontSize: isMobile ? "16px" : "22px",
    color: isDark ? "#334155" : "#6a401e", lineHeight: 1.5
  }),

  primaryBtn: {
    padding: "14px 32px",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    color: "white", border: "none", borderRadius: "14px",
    fontSize: "18px", fontWeight: "600", cursor: "pointer"
  },

  whySection: { width: "100%", padding: "80px 30px", background: "#020617" },
  whyTitle: { textAlign: "center", fontSize: "28px", marginBottom: "50px", color: "white" },
  whyGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "24px", maxWidth: "1100px", margin: "0 auto"
  },
  whyCard: {
    background: "linear-gradient(135deg,#1e1b4b,#312e81)",
    padding: "32px", borderRadius: "20px", color: "#a0e1ea"
  },
  whytext: { marginTop: "10px", fontSize: "16px", color: "#e793e4", lineHeight: 1.5 },

  /* MODAL */
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
  },
  modal: {
    background: "rgba(15,23,42,0.95)", backdropFilter: "blur(18px)",
    padding: "35px", borderRadius: "20px", width: "320px",
    textAlign: "center", color: "white",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  cancelBtn: {
    padding: "10px 20px", background: "#1f2937", color: "white",
    border: "none", borderRadius: "10px", cursor: "pointer"
  },
  yesBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "white", border: "none", borderRadius: "10px", cursor: "pointer"
  },

  footer: (isDark) => ({
    padding: "12px", textAlign: "center", fontSize: "13px",
    background: isDark ? "#08090b" : "#e2e8f0",
    color: isDark ? "#94a3b8" : "#555", marginTop: "auto"
  }),
};

export default Home;