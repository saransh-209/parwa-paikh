import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../index.css";

const DESKTOP_DAY = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780128326/day_desktop_kkjzw8.png";
const DESKTOP_NIGHT = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780128326/night_desktop_ikqlfe.png";
const MOBILE_DAY = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780128327/day_mobile_fn2mjd.png";
const MOBILE_NIGHT = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780128326/night_mobile_nqzwy9.png";
const DESKTOP_BEFORE = "https://res.cloudinary.com/djhio7kqd/image/upload/v1777919102/ChatGPT_Image_May_4_2026_11_47_57_PM_rsfpn5.png";
const MOBILE_BEFORE = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780124555/mobilebg_h9u3xq.png";
const PANKH = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";

const CATEGORIES = ["All", "Poetry", "Lyrics", "Story", "Thoughts"];

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const userDropRef = useRef(null);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState(12);
  const [showLogout, setShowLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState("All");
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks")) || []; } catch { return []; }
  });

  const isDark = theme === "dark";

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const h = (e) => { if (userDropRef.current && !userDropRef.current.contains(e.target)) setUserDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

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

  const filteredPosts = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeTab === "All" || p.category === activeTab;
    return matchSearch && matchCat;
  });

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const readTime = (c) => Math.max(1, Math.ceil((c?.split(" ").length || 100) / 200)) + " min read";

  const isBookmarked = (id) => bookmarks.some(b => b._id === id);

  const toggleBookmark = (e, post) => {
    e.stopPropagation();
    let updated;
    if (isBookmarked(post._id)) {
      updated = bookmarks.filter(b => b._id !== post._id);
    } else {
      updated = [...bookmarks, post];
    }
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const heroBg = isMobile
    ? (isDark ? MOBILE_NIGHT : MOBILE_DAY)
    : (isDark ? DESKTOP_NIGHT : DESKTOP_DAY);

  const currentPath = window.location.pathname;

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: isDark ? "#0d0d1a" : "#f8f9fc", paddingBottom: isMobile && token ? "70px" : "0" }}>

      {/* ══ DESKTOP NAVBAR ══ */}
      {!isMobile && (
        <nav style={N.navbar(isDark)}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flexShrink: 0 }} onClick={() => navigate("/")}>
            <img src={PANKH} alt="" style={{ width: "36px", height: "36px", objectFit: "contain", filter: "drop-shadow(0 0 4px rgba(124,58,237,0.5))" }} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: isDark ? "#fff" : "#111" }}>परवा पाइख</div>
              <div style={{ fontSize: "11px", color: "#7c3aed" }}>मैथिली साहित्य के संग</div>
            </div>
          </div>

          {/* Center nav links */}
          {token && (
            <div style={{ display: "flex", gap: "4px" }}>
              {[
                { label: "Home", path: "/" },
                { label: "Explore", path: "/explore" },
                ...(role === "author" ? [{ label: "My Posts", path: "/my-posts" }] : []),
                { label: "Bookmarks", path: "/bookmarks" },
              ].map(l => (
                <button key={l.path} onClick={() => navigate(l.path)}
                  style={{ padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: currentPath === l.path ? 700 : 500, color: currentPath === l.path ? "#7c3aed" : isDark ? "#cbd5e1" : "#555", borderRadius: "8px", position: "relative" }}>
                  {l.label}
                  {currentPath === l.path && <div style={{ position: "absolute", bottom: "-2px", left: "16px", right: "16px", height: "2px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", borderRadius: "2px" }} />}
                </button>
              ))}
            </div>
          )}

          {/* Right side */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={N.iconBtn(isDark)}>
              {isDark ? "🌙" : "☀️"}
            </button>

            {token ? (
              <>
                {role === "author" && (
                  <button style={N.createBtn} onClick={() => navigate("/create")}>+ Create</button>
                )}
                <div ref={userDropRef} style={{ position: "relative" }}>
                  <div style={N.userChip(isDark)} onClick={() => setUserDropOpen(o => !o)}>
                    <div style={N.avatar(isDark)}>{name?.[0]?.toUpperCase() || "U"}</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: isDark ? "#fff" : "#111" }}>{name}</div>
                      <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#666", textTransform: "capitalize" }}>{role}</div>
                    </div>
                    <span style={{ color: isDark ? "#94a3b8" : "#999", fontSize: "11px" }}>▾</span>
                  </div>
                  {userDropOpen && (
                    <div style={N.drop(isDark)}>
                      <div style={N.dropItem(isDark, false)} onClick={() => { setUserDropOpen(false); navigate("/my-posts"); }}>📝 My Posts</div>
                      <div style={N.dropItem(isDark, false)} onClick={() => { setUserDropOpen(false); navigate("/bookmarks"); }}>🔖 Bookmarks</div>
                      <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", margin: "4px 0" }} />
                      <div style={N.dropItem(isDark, true)} onClick={() => { setUserDropOpen(false); setShowLogout(true); }}>🚪 Logout</div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button style={N.loginBtn(isDark)} onClick={() => navigate("/login")}>Login</button>
                <button style={N.createBtn} onClick={() => navigate("/signup")}>Sign Up</button>
              </>
            )}
          </div>
        </nav>
      )}

      {/* ══ MOBILE NAVBAR ══ */}
      {isMobile && (
        <nav style={N.mobileNav(isDark)}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={PANKH} alt="" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "drop-shadow(0 0 4px rgba(124,58,237,0.5))" }} />
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: isDark ? "#fff" : "#111" }}>परवा पाइख</div>
              <div style={{ fontSize: "10px", color: "#7c3aed" }}>मैथिली साहित्य के संग</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={N.mobileIconBtn(isDark)}>
              {isDark ? "🌙" : "☀️"}
            </button>

            {token && role === "author" && (
              <button onClick={() => navigate("/create")} style={N.mobilePlusBtn}>+</button>
            )}

            {token ? (
              <div ref={userDropRef} style={{ position: "relative" }}>
                <div style={N.mobileAvatar(isDark)} onClick={() => setUserDropOpen(o => !o)}>
                  {name?.[0]?.toUpperCase() || "U"}
                  <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "9px", height: "9px", borderRadius: "50%", background: "#7c3aed", border: "2px solid " + (isDark ? "#0d0d1a" : "#f8f9fc") }} />
                </div>
                {userDropOpen && (
                  <div style={{ ...N.drop(isDark), right: 0, top: "46px", width: "190px" }}>
                    <div style={{ padding: "12px 14px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)", color: isDark ? "#fff" : "#111", fontSize: "14px", fontWeight: 700 }}>{name}</div>
                    <div style={N.dropItem(isDark, false)} onClick={() => { setUserDropOpen(false); navigate("/my-posts"); }}>📝 My Posts</div>
                    <div style={N.dropItem(isDark, false)} onClick={() => { setUserDropOpen(false); navigate("/bookmarks"); }}>🔖 Bookmarks</div>
                    <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", margin: "4px 0" }} />
                    <div style={N.dropItem(isDark, true)} onClick={() => { setUserDropOpen(false); setShowLogout(true); }}>🚪 Logout</div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button style={N.loginBtn(isDark)} onClick={() => navigate("/login")}>Login</button>
                <button style={N.createBtn} onClick={() => navigate("/signup")}>Sign Up</button>
              </>
            )}
          </div>
        </nav>
      )}

      {/* ══ NOT LOGGED IN ══ */}
      {!token && (
        <>
          <div style={{ flex: 1, minHeight: "calc(100vh - 64px)", backgroundImage: `url(${isMobile ? MOBILE_BEFORE : DESKTOP_BEFORE})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center center", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
              <div className="glass-box" style={{ padding: isMobile ? "28px 22px" : "40px 50px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: isMobile ? "270px" : "580px" }}>
                <h1 style={{ fontSize: isMobile ? "38px" : "60px", fontWeight: 800, lineHeight: 1.1, color: isDark ? "#171f68" : "#0986e5", marginBottom: "8px" }}>
                  Discover
                  <span style={{ display: "block", marginTop: "6px", color: isDark ? "#c129b4" : "#7c3aed" }}>मैथिली साहित्य</span>
                </h1>
                <p style={{ marginTop: "10px", marginBottom: "24px", fontSize: isMobile ? "16px" : "20px", fontFamily: "Times New Roman", color: isDark ? "#2d2d2d" : "#6a401e", lineHeight: 1.5 }}>Explore poetry, lyrics and stories from creators.</p>
                <button style={{ padding: "14px 32px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "14px", fontSize: "18px", fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("/login")}>Get Started →</button>
              </div>
            </div>
          </div>
          <section style={{ width: "100%", padding: "80px 30px", background: "#020617" }}>
            <h2 style={{ textAlign: "center", fontSize: "28px", marginBottom: "50px", color: "white" }}>Why Use This Platform?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>
              {[{ icon: "✍️", title: "Create Content", text: "Empower creators to write, edit, and publish original posts seamlessly." },
              { icon: "📖", title: "Read & Explore", text: "Explore a diverse collection of poetry, stories, and articles by talented authors." },
              { icon: "⚡", title: "Fast & Simple", text: "Experience a fast, responsive, and modern interface designed for user comfort." }
              ].map((c, i) => (
                <div key={i} style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", padding: "32px", borderRadius: "20px", color: "#a0e1ea" }}>
                  <div style={{ fontSize: "28px" }}>{c.icon}</div>
                  <h3 style={{ margin: "12px 0 8px" }}>{c.title}</h3>
                  <p style={{ fontSize: "16px", color: "#e793e4", lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ══ LOGGED IN ══ */}
      {token && (
        <>
          {/* ── HERO BANNER ── */}
          <div style={{
            width: "100%",
            minHeight: isMobile ? "220px" : "340px",
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            display: "flex", alignItems: "center", justifyContent: "flex-start",
            margin: isMobile ? "0" : "12px auto",
            maxWidth: isMobile ? "100%" : "calc(100% - 48px)",
            borderRadius: isMobile ? "16px" : "20px",
            overflow: "hidden",
            boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.15)",
            alignSelf: "center"
          }}>
            <div style={{ padding: isMobile ? "20px 22px" : "0 50px", width: isMobile ? "100%" : "55%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <img src={PANKH} alt="" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
                <span style={{ fontSize: "12px", color: "#f0abfc", fontWeight: 700, textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>मिथिला के शब्द, हमर पहचान</span>
              </div>
              <h1 style={{ fontSize: isMobile ? "26px" : "50px", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.1, textShadow: "0 3px 12px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.9)" }}>Discover</h1>
              <h1 style={{ fontSize: isMobile ? "22px" : "44px", fontWeight: 800, color: "#50135a", margin: "2px 0 10px", lineHeight: 1.1, textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6)" }}>मैथिली साहित्य</h1>
              <p style={{ fontSize: isMobile ? "12px" : "15px", color: "#fff", maxWidth: "280px", lineHeight: 1.5, fontWeight: 600, textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>Explore poetry, lyrics and stories from amazing creators.</p>
            </div>
          </div>

          {/* ── POSTS SECTION ── */}
          <div style={{ padding: isMobile ? "16px 14px" : "24px 36px", flex: 1 }}>

            {/* Section header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? "12px" : "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isMobile && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#7c3aed" }} />}
                {!isMobile && <div style={{ width: "4px", height: "26px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", borderRadius: "4px" }} />}
                <div>
                  <h2 style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: 800, color: isDark ? "#fff" : "#111", margin: 0 }}>Latest Posts</h2>
                  {!isMobile && <p style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#666", marginTop: "2px" }}>Unlimited stories from our community</p>}
                </div>
              </div>
              {isMobile && (
                <button style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 600, fontSize: "14px", cursor: "pointer" }} onClick={() => navigate("/explore")}>
                  View all →
                </button>
              )}
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "14px", maxWidth: isMobile ? "100%" : "500px", ...(isMobile ? {} : { display: "inline-flex", width: "100%" }) }}>
              {isMobile ? (
                <div style={{ display: "flex", alignItems: "center", background: isDark ? "#1a1a2e" : "#fff", borderRadius: "14px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", padding: "0 14px", gap: "10px" }}>
                  <span style={{ color: isDark ? "#94a3b8" : "#bbb", fontSize: "18px" }}>🔍</span>
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search posts..." style={{ flex: 1, padding: "13px 0", background: "transparent", border: "none", outline: "none", color: isDark ? "#fff" : "#111", fontSize: "14px" }} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", background: isDark ? "#1a1a2e" : "#fff", borderRadius: "14px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", padding: "0 14px", gap: "10px", width: "100%", maxWidth: "500px" }}>
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search posts..." style={{ flex: 1, padding: "11px 0", background: "transparent", border: "none", outline: "none", color: isDark ? "#fff" : "#111", fontSize: "14px" }} />
                  <span style={{ color: isDark ? "#94a3b8" : "#bbb", fontSize: "18px" }}>🔍</span>
                </div>
              )}
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} style={{
                  padding: isMobile ? "8px 16px" : "8px 14px",
                  borderRadius: "12px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  background: activeTab === cat ? "linear-gradient(135deg,#7c3aed,#6366f1)" : isDark ? "transparent" : "transparent",
                  color: activeTab === cat ? "#fff" : isDark ? "#cbd5e1" : "#555",
                  transition: "all 0.2s"
                }}>{cat}</button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              /* SHIMMER SKELETONS */
              isMobile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} style={{ display: "flex", borderRadius: "14px", overflow: "hidden", background: isDark ? "#111827" : "#e5e7eb", height: "95px" }}>
                      <div style={{ width: "130px", flexShrink: 0, position: "relative", overflow: "hidden", background: isDark ? "#1f2937" : "#d1d5db" }}><div style={shimmer} /></div>
                      <div style={{ padding: "12px", flex: 1 }}>
                        <div style={{ position: "relative", overflow: "hidden", height: "15px", width: "60%", borderRadius: "6px", background: isDark ? "#374151" : "#c4c9d4", marginBottom: "8px" }}><div style={shimmer} /></div>
                        <div style={{ position: "relative", overflow: "hidden", height: "11px", width: "40%", borderRadius: "6px", background: isDark ? "#4b5563" : "#d1d5db" }}><div style={shimmer} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" }}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} style={{ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#e5e7eb" }}>
                      <div style={{ position: "relative", overflow: "hidden", height: "190px", background: isDark ? "#1f2937" : "#d1d5db" }}><div style={shimmer} /></div>
                      <div style={{ padding: "14px" }}>
                        <div style={{ position: "relative", overflow: "hidden", height: "16px", width: "65%", borderRadius: "6px", background: isDark ? "#374151" : "#c4c9d4", marginBottom: "10px" }}><div style={shimmer} /></div>
                        <div style={{ position: "relative", overflow: "hidden", height: "12px", width: "40%", borderRadius: "6px", background: isDark ? "#4b5563" : "#d1d5db" }}><div style={shimmer} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: isDark ? "#94a3b8" : "#666" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔍</div>
                <h3 style={{ color: isDark ? "#fff" : "#111" }}>No Posts Found</h3>
                <p style={{ marginTop: "6px" }}>Try a different keyword or category</p>
              </div>
            ) : isMobile ? (
              /* ── MOBILE: horizontal list ── */
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredPosts.slice(0, visiblePosts).map(post => (
                  <div key={post._id}
                    style={{ display: "flex", alignItems: "center", borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer" }}
                    onClick={() => navigate(`/post/${post._id}`)}>
                    {/* Image */}
                    <div style={{ width: "140px", height: "105px", flexShrink: 0, overflow: "hidden", background: "#1f2937", borderRadius: "14px", margin: "8px" }}>
                      {post.image
                        ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "12px" }}>No Cover</div>
                      }
                    </div>
                    {/* Content */}
                    <div style={{ padding: "10px 10px 10px 4px", flex: 1 }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 800, color: isDark ? "#fff" : "#0f172a", marginBottom: "5px", lineHeight: 1.3 }}>{post.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                        <img src={PANKH} alt="" style={{ width: "12px", height: "12px", objectFit: "contain" }} />
                        <p style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600 }}>{post.author}</p>
                      </div>
                      <p style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#888", marginBottom: "2px" }}>📅 {post.createdAt ? fmtDate(post.createdAt) : ""}</p>
                      <p style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#888" }}>🕐 {readTime(post.content)}</p>
                    </div>
                    {/* Bookmark */}
                    <button
                      style={{ padding: "6px 8px", marginRight: "8px", background: isBookmarked(post._id) ? "rgba(168,85,247,0.15)" : "transparent", border: isBookmarked(post._id) ? "1px solid rgba(168,85,247,0.4)" : "1px solid transparent", borderRadius: "8px", cursor: "pointer", fontSize: "18px", flexShrink: 0, transition: "all 0.2s" }}
                      onClick={(e) => toggleBookmark(e, post)}>
                      {isBookmarked(post._id) ? "🔖" : "🏷️"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* ── DESKTOP: 4-col grid ── */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" }}>
                {filteredPosts.slice(0, visiblePosts).map(post => (
                  <div key={post._id}
                    style={{ borderRadius: "16px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onClick={() => navigate(`/post/${post._id}`)}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(124,58,237,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}>
                    {/* Image */}
                    <div style={{ height: "190px", overflow: "hidden", background: "#111827", position: "relative" }}>
                      {post.image
                        ? <img src={post.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                          onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                          onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>
                      }
                      {/* Bookmark icon top-right */}
                      <button
                        style={{ position: "absolute", top: "10px", right: "10px", width: "32px", height: "32px", borderRadius: "8px", background: isBookmarked(post._id) ? "rgba(168,85,247,0.85)" : "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", border: "none", color: "#fff", cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                        onClick={(e) => toggleBookmark(e, post)}>
                        {isBookmarked(post._id) ? "🔖" : "🏷️"}
                      </button>
                    </div>
                    {/* Card body */}
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

            {/* See more */}
            {visiblePosts < filteredPosts.length && !loading && (
              <div style={{ textAlign: "center", margin: "30px 0" }}>
                <button style={{ padding: "12px 32px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => setVisiblePosts(v => v + 12)}>See More Posts ↓</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ LOGOUT MODAL ══ */}
      {showLogout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: isDark ? "rgba(15,23,42,0.97)" : "#fff", backdropFilter: "blur(18px)", padding: "35px", borderRadius: "20px", width: "300px", textAlign: "center", color: isDark ? "white" : "#111", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <h2 style={{ marginBottom: "10px" }}>Logout ⚠️</h2>
            <p style={{ color: isDark ? "#dbeafe" : "#555", marginBottom: "24px" }}>Do you really want to logout?</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button style={{ padding: "10px 22px", background: isDark ? "#1f2937" : "#f1f5f9", color: isDark ? "white" : "#111", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }} onClick={() => setShowLogout(false)}>Cancel</button>
              <button style={{ padding: "10px 22px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }}
                onClick={() => { setShowLogout(false); setTimeout(() => { localStorage.clear(); navigate("/"); }, 200); }}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE BOTTOM NAV ══ */}
      {isMobile && token && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "65px", background: isDark ? "rgba(10,10,20,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 998, paddingBottom: "4px" }}>
          {[
            { icon: "🏠", label: "Home", path: "/" },
            { icon: "🧭", label: "Explore", path: "/explore" },
            { icon: "📝", label: "My Posts", path: "/my-posts" },
            { icon: "🔖", label: "Bookmarks", path: "/bookmarks" },
            { icon: "👤", label: "Profile", path: "/profile" },
          ].map(l => {
            const active = l.path === '/profile' ? currentPath === '/my-posts' : currentPath === l.path;
            return (
              <button key={l.label} onClick={() => navigate(l.label === "Profile" ? "/profile" : l.path)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: "none", border: "none", cursor: "pointer", padding: "6px 10px", position: "relative" }}>
                <span style={{ fontSize: "20px" }}>{l.icon}</span>
                <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, color: active ? "#7c3aed" : isDark ? "#94a3b8" : "#888" }}>{l.label}</span>
                {active && <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", width: "20px", height: "3px", background: "#7c3aed", borderRadius: "2px" }} />}
              </button>
            );
          })}
        </div>
      )}

      {/* ══ FOOTER ══ */}
      {(!isMobile || !token) && (
        <footer style={{ padding: "24px 36px", background: isDark ? "#08090f" : "#1e1b4b", color: isDark ? "#94a3b8" : "#a78bfa", marginTop: "auto" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: "14px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src={PANKH} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>परवा पाइख</span>
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
              {["Home", "Explore", ...(role === "author" ? ["My Posts"] : []), "Bookmarks"].map(l => (
                <span key={l} style={{ fontSize: "13px", cursor: "pointer" }}
                  onClick={() => {
                    const path = l === "Home" ? "/" : `/${l.toLowerCase().replace(" ", "-")}`;
                    if (!token && path !== "/") { navigate("/login"); return; }
                    navigate(path);
                  }}>{l}</span>
              ))}
            </div>
            <p style={{ fontSize: "12px" }}>© 2026 Saransh | All Rights Reserved</p>
          </div>
        </footer>
      )}

    </div>
  );
}

/* shimmer animation object */
const shimmer = { position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", animation: "shimmer 1.4s infinite" };

/* Navbar styles */
const N = {
  navbar: (isDark) => ({ position: "sticky", top: 0, zIndex: 999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "64px", background: isDark ? "rgba(10,10,20,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)", boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)" }),
  mobileNav: (isDark) => ({ position: "sticky", top: 0, zIndex: 999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", height: "60px", background: isDark ? "rgba(10,10,20,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)" }),
  iconBtn: (isDark) => ({ width: "40px", height: "40px", borderRadius: "10px", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: isDark ? "#fff" : "#111", fontSize: "17px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }),
  mobileIconBtn: (isDark) => ({ width: "38px", height: "38px", borderRadius: "10px", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: isDark ? "#fff" : "#111", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }),
  mobilePlusBtn: { width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", border: "none", fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" },
  mobileAvatar: (isDark) => ({ width: "38px", height: "38px", borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)", border: isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", position: "relative", color: isDark ? "#fff" : "#555", fontWeight: 700 }),
  createBtn: { padding: "9px 18px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" },
  loginBtn: (isDark) => ({ padding: "9px 16px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: isDark ? "#fff" : "#111", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)", cursor: "pointer", fontWeight: 600, fontSize: "14px" }),
  avatar: (isDark) => ({ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }),
  userChip: (isDark) => ({ display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px 5px 5px", borderRadius: "12px", cursor: "pointer", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }),
  drop: (isDark) => ({ position: "absolute", right: 0, top: "52px", width: "200px", background: isDark ? "#0f172a" : "#fff", borderRadius: "14px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", boxShadow: "0 16px 40px rgba(0,0,0,0.35)", overflow: "hidden", zIndex: 1000 }),
  dropItem: (isDark, danger) => ({ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", border: "none", background: "transparent", color: danger ? "#ef4444" : isDark ? "#e2e8f0" : "#333", fontSize: "14px", cursor: "pointer", borderTop: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)" }),
};

export default Home;