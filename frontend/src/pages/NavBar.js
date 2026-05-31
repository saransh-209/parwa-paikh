import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

const PANKH = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";

export function NavBar({ activePath }) {
  const navigate    = useNavigate();
  const userDropRef = useRef(null);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [showLogout, setShowLogout]     = useState(false);

  const theme  = localStorage.getItem("theme") || "dark";
  const isDark = theme === "dark";
  const token  = localStorage.getItem("token");
  const name   = localStorage.getItem("name");
  const role   = localStorage.getItem("role");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const h = (e) => { if (userDropRef.current && !userDropRef.current.contains(e.target)) setUserDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const NAV_LINKS = [
    { label: "Home",      path: "/" },
    { label: "Explore",   path: "/explore" },
    { label: "My Posts",  path: "/my-posts" },
    { label: "Bookmarks", path: "/bookmarks" },
  ];

  const BOTTOM_LINKS = [
    { icon: "🏠", label: "Home",      path: "/" },
    { icon: "🧭", label: "Explore",   path: "/explore" },
    { icon: "📝", label: "My Posts",  path: "/my-posts" },
    { icon: "🔖", label: "Bookmarks", path: "/bookmarks" },
    { icon: "👤", label: "Profile",   path: "/profile" },
  ];

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      {!isMobile && (
        <nav style={S.navbar(isDark)}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={PANKH} alt="" style={{ width: "36px", height: "36px", objectFit: "contain", filter: "drop-shadow(0 0 4px rgba(124,58,237,0.5))" }} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: isDark ? "#fff" : "#111" }}>परवा पाइख</div>
              <div style={{ fontSize: "11px", color: "#7c3aed" }}>मैथिली साहित्य के संग</div>
            </div>
          </div>

          {token && (
            <div style={{ display: "flex", gap: "4px" }}>
              {NAV_LINKS.map(l => (
                <button key={l.path} onClick={() => navigate(l.path)}
                  style={{ padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: activePath === l.path ? 700 : 500, color: activePath === l.path ? "#7c3aed" : isDark ? "#cbd5e1" : "#555", borderRadius: "8px", position: "relative" }}>
                  {l.label}
                  {activePath === l.path && <div style={{ position: "absolute", bottom: "-2px", left: "16px", right: "16px", height: "2px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", borderRadius: "2px" }} />}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {token ? (
              <>
                {role === "author" && (
                  <button style={S.createBtn} onClick={() => navigate("/create")}>+ Create</button>
                )}
                <div ref={userDropRef} style={{ position: "relative" }}>
                  <div style={S.userChip(isDark)} onClick={() => setUserDropOpen(o => !o)}>
                    <div style={S.avatar}>{name?.[0]?.toUpperCase() || "U"}</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: isDark ? "#fff" : "#111" }}>{name}</div>
                      <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#666", textTransform: "capitalize" }}>{role}</div>
                    </div>
                    <span style={{ color: isDark ? "#94a3b8" : "#999", fontSize: "11px" }}>▾</span>
                  </div>
                  {userDropOpen && (
                    <div style={S.drop(isDark)}>
                      <div style={S.dropItem(isDark, false)} onClick={() => { setUserDropOpen(false); navigate("/my-posts"); }}>📝 My Posts</div>
                      <div style={S.dropItem(isDark, false)} onClick={() => { setUserDropOpen(false); navigate("/bookmarks"); }}>🔖 Bookmarks</div>
                      <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", margin: "4px 0" }} />
                      <div style={S.dropItem(isDark, true)} onClick={() => { setUserDropOpen(false); setShowLogout(true); }}>🚪 Logout</div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button style={S.loginBtn(isDark)} onClick={() => navigate("/login")}>Login</button>
                <button style={S.createBtn} onClick={() => navigate("/signup")}>Sign Up</button>
              </>
            )}
          </div>
        </nav>
      )}

      {/* ── MOBILE TOP NAVBAR ── */}
      {isMobile && (
        <nav style={S.mobileNav(isDark)}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={PANKH} alt="" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "drop-shadow(0 0 4px rgba(124,58,237,0.5))" }} />
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: isDark ? "#fff" : "#111" }}>परवा पाइख</div>
              <div style={{ fontSize: "10px", color: "#7c3aed" }}>मैथिली साहित्य के संग</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {token && role === "author" && (
              <button onClick={() => navigate("/create")} style={S.mobilePlusBtn}>+</button>
            )}
            {token ? (
              <div ref={userDropRef} style={{ position: "relative" }}>
                <div style={S.mobileAvatar(isDark)} onClick={() => setUserDropOpen(o => !o)}>
                  {name?.[0]?.toUpperCase() || "U"}
                  <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "9px", height: "9px", borderRadius: "50%", background: "#7c3aed", border: "2px solid " + (isDark ? "#0d0d1a" : "#f8f9fc") }} />
                </div>
                {userDropOpen && (
                  <div style={{ ...S.drop(isDark), right: 0, top: "46px", width: "190px" }}>
                    <div style={{ padding: "12px 14px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)", color: isDark ? "#fff" : "#111", fontSize: "14px", fontWeight: 700 }}>{name}</div>
                    <div style={S.dropItem(isDark, false)} onClick={() => { setUserDropOpen(false); navigate("/my-posts"); }}>📝 My Posts</div>
                    <div style={S.dropItem(isDark, false)} onClick={() => { setUserDropOpen(false); navigate("/bookmarks"); }}>🔖 Bookmarks</div>
                    <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", margin: "4px 0" }} />
                    <div style={S.dropItem(isDark, true)} onClick={() => { setUserDropOpen(false); setShowLogout(true); }}>🚪 Logout</div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button style={S.loginBtn(isDark)} onClick={() => navigate("/login")}>Login</button>
                <button style={S.createBtn} onClick={() => navigate("/signup")}>Sign Up</button>
              </>
            )}
          </div>
        </nav>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && token && (
        <div style={S.bottomNav(isDark)}>
          {BOTTOM_LINKS.map(l => {
            const active = l.path === '/profile' ? activePath === '/my-posts' : activePath === l.path;
            return (
              <button key={l.label} onClick={() => navigate(l.label === "Profile" ? "/my-posts" : l.path)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: "none", border: "none", cursor: "pointer", padding: "6px 10px", position: "relative", flex: 1 }}>
                <span style={{ fontSize: "20px" }}>{l.icon}</span>
                <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, color: active ? "#7c3aed" : isDark ? "#94a3b8" : "#888" }}>{l.label}</span>
                {active && <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "20px", height: "3px", background: "#7c3aed", borderRadius: "2px" }} />}
              </button>
            );
          })}
        </div>
      )}

      {/* ── LOGOUT MODAL ── */}
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
    </>
  );
}

const S = {
  navbar:      (isDark) => ({ position: "sticky", top: 0, zIndex: 999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "64px", background: isDark ? "rgba(10,10,20,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)" }),
  mobileNav:   (isDark) => ({ position: "sticky", top: 0, zIndex: 999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", height: "60px", background: isDark ? "rgba(10,10,20,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)" }),
  bottomNav:   (isDark) => ({ position: "fixed", bottom: 0, left: 0, right: 0, height: "65px", background: isDark ? "rgba(10,10,20,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 998, paddingBottom: "4px" }),
  createBtn:   { padding: "9px 18px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" },
  mobilePlusBtn: { width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", border: "none", fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" },
  loginBtn:    (isDark) => ({ padding: "9px 16px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: isDark ? "#fff" : "#111", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)", cursor: "pointer", fontWeight: 600, fontSize: "14px" }),
  avatar:      { width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", flexShrink: 0 },
  mobileAvatar:(isDark) => ({ width: "38px", height: "38px", borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)", border: isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", position: "relative", color: isDark ? "#fff" : "#555", fontWeight: 700 }),
  userChip:    (isDark) => ({ display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px 5px 5px", borderRadius: "12px", cursor: "pointer", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }),
  drop:        (isDark) => ({ position: "absolute", right: 0, top: "52px", width: "200px", background: isDark ? "#0f172a" : "#fff", borderRadius: "14px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", boxShadow: "0 16px 40px rgba(0,0,0,0.35)", overflow: "hidden", zIndex: 1000 }),
  dropItem:    (isDark, danger) => ({ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", border: "none", background: "transparent", color: danger ? "#ef4444" : isDark ? "#e2e8f0" : "#333", fontSize: "14px", cursor: "pointer", borderTop: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)" }),
};
