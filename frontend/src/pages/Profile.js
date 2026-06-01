import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NavBar } from "./NavBar";

const PANKH = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";

function Profile() {
  const navigate = useNavigate();
  const theme    = localStorage.getItem("theme") || "dark";
  const isDark   = theme === "dark";
  const token    = localStorage.getItem("token");
  const role     = localStorage.getItem("role");

  const [user, setUser]             = useState(null);
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768);
  const [showLogout, setShowLogout] = useState(false);
  const [activeTab, setActiveTab]   = useState("posts");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        role === "author"
          ? axios.get(`${process.env.REACT_APP_API_URL}/my-posts`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          : Promise.resolve({ data: [] })
      ]);
      setUser(userRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, [token, navigate, fetchData]);

  const bookmarks = (() => {
    try { return JSON.parse(localStorage.getItem("bookmarks")) || []; }
    catch { return []; }
  })();

  const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const joinDate = user?.createdAt ? fmtDate(user.createdAt) : "N/A";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#0d0d1a" : "#f8f9fc" }}>
        <NavBar activePath="/profile" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: isDark ? "#94a3b8" : "#666" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0d0d1a" : "#f8f9fc", paddingBottom: isMobile ? "70px" : "0" }}>

      <NavBar activePath="/profile" />

      {/* COVER */}
      <div style={{ position: "relative", height: isMobile ? "160px" : "220px", background: "linear-gradient(135deg, #1e1b4b, #4c1d95, #7c3aed)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(168,85,247,0.2)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "10%", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(99,102,241,0.2)" }} />
        <img src={PANKH} alt="" style={{ position: "absolute", right: isMobile ? "20px" : "60px", bottom: "10px", width: isMobile ? "80px" : "120px", height: isMobile ? "80px" : "120px", objectFit: "contain", opacity: 0.3 }} />
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: isMobile ? "0 16px" : "0 32px", position: "relative" }}>

        {/* AVATAR */}
        <div style={{ position: "absolute", top: isMobile ? "-48px" : "-60px", left: isMobile ? "16px" : "32px" }}>
          <div style={{ width: isMobile ? "90px" : "110px", height: isMobile ? "90px" : "110px", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: `4px solid ${isDark ? "#0d0d1a" : "#f8f9fc"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "36px" : "44px", fontWeight: 800, color: "#fff" }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>

        {/* TOP BUTTONS */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "16px", gap: "10px" }}>
          <button style={{ padding: "8px 18px", borderRadius: "10px", border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.15)", background: "transparent", color: isDark ? "#fff" : "#111", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            ✏ Edit Profile
          </button>
          <button onClick={() => setShowLogout(true)}
            style={{ padding: "8px 18px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            🚪 Logout
          </button>
        </div>

        {/* NAME + ROLE */}
        <div style={{ marginTop: isMobile ? "52px" : "60px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: isMobile ? "24px" : "30px", fontWeight: 800, color: isDark ? "#fff" : "#111", margin: 0 }}>
              {user?.name}
            </h1>
            <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: role === "author" ? "rgba(124,58,237,0.2)" : "rgba(6,182,212,0.15)", color: role === "author" ? "#a855f7" : "#06b6d4", border: `1px solid ${role === "author" ? "rgba(168,85,247,0.3)" : "rgba(6,182,212,0.3)"}` }}>
              {role === "author" ? "✏ Author" : "📖 Reader"}
            </span>
          </div>
          <p style={{ fontSize: "14px", color: isDark ? "#94a3b8" : "#666", marginTop: "6px" }}>{user?.email}</p>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(4,1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { icon: "📝", label: "Posts",     val: role === "author" ? posts.length : "—" },
            { icon: "🔖", label: "Bookmarks", val: bookmarks.length },
            { icon: "🎭", label: "Role",      val: role === "author" ? "Author" : "Reader" },
            { icon: "📅", label: "Joined",    val: joinDate },
          ].map((s, i) => (
            <div key={i} style={{ background: isDark ? "#111827" : "#fff", borderRadius: "16px", padding: "16px", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.icon}</div>
              <div style={{ fontSize: isMobile ? "13px" : "18px", fontWeight: 800, color: isDark ? "#fff" : "#111", wordBreak: "break-word" }}>{s.val}</div>
              <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#888", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* PERSONAL INFO */}
        <div style={{ background: isDark ? "#111827" : "#fff", borderRadius: "16px", padding: "24px", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", marginBottom: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 20px" }}>
            👤 Personal Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
            {[
              { label: "Full Name",     val: user?.name,  icon: "🪪" },
              { label: "Email Address", val: user?.email, icon: "✉" },
              { label: "Account Type",  val: role === "author" ? "Author / Writer" : "Reader", icon: "🎭" },
              { label: "Member Since",  val: joinDate,    icon: "📅" },
              { label: "Account ID",    val: user?._id ? `#${user._id.slice(-8).toUpperCase()}` : "N/A", icon: "🔑" },
              { label: "Status",        val: "Active ✅", icon: "💡" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{d.icon}</span>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#888", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{d.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#e2e8f0" : "#111", wordBreak: "break-all" }}>{d.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: "12px", padding: "4px" }}>
          {[
            ...(role === "author" ? [{ id: "posts",     label: `Posts (${posts.length})` }] : []),
            { id: "bookmarks", label: `Bookmarks (${bookmarks.length})` },
            { id: "activity",  label: "Activity" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: activeTab === tab.id ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent", color: activeTab === tab.id ? "#fff" : isDark ? "#94a3b8" : "#666", transition: "all 0.2s" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* POSTS TAB */}
        {activeTab === "posts" && role === "author" && (
          posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: isDark ? "#94a3b8" : "#888" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
              <p>No posts yet. <span style={{ color: "#a855f7", cursor: "pointer" }} onClick={() => navigate("/create")}>Create your first post →</span></p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(240px,1fr))", gap: "16px", marginBottom: "24px" }}>
              {posts.map(post => (
                <div key={post._id} style={{ borderRadius: "14px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                  onClick={() => navigate(`/post/${post._id}`)}>
                  <div style={{ height: "140px", overflow: "hidden", background: "#1f2937", position: "relative" }}>
                    {post.image
                      ? <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>}
                    {post.category && (
                      <div style={{ position: "absolute", top: "8px", left: "8px", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, color: "#fff", background: "#7c3aed" }}>{post.category}</div>
                    )}
                  </div>
                  <div style={{ padding: "12px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: isDark ? "#fff" : "#111", margin: "0 0 4px" }}>{post.title}</h4>
                    <p style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#888" }}>📅 {post.createdAt ? fmtDate(post.createdAt) : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === "bookmarks" && (
          bookmarks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: isDark ? "#94a3b8" : "#888" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔖</div>
              <p>No bookmarks yet. <span style={{ color: "#a855f7", cursor: "pointer" }} onClick={() => navigate("/explore")}>Explore posts →</span></p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(240px,1fr))", gap: "16px", marginBottom: "24px" }}>
              {bookmarks.map(post => (
                <div key={post._id} style={{ borderRadius: "14px", overflow: "hidden", background: isDark ? "#111827" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                  onClick={() => navigate(`/post/${post._id}`)}>
                  <div style={{ height: "140px", overflow: "hidden", background: "#1f2937" }}>
                    {post.image
                      ? <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No Cover</div>}
                  </div>
                  <div style={{ padding: "12px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: isDark ? "#fff" : "#111", margin: "0 0 4px" }}>{post.title}</h4>
                    <p style={{ fontSize: "11px", color: "#a855f7", fontWeight: 600 }}>✏ {post.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div style={{ background: isDark ? "#111827" : "#fff", borderRadius: "16px", padding: "24px", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)", marginBottom: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { icon: "🎉", text: "Joined Parwa Paikh",  time: joinDate, color: "#7c3aed" },
                { icon: "✅", text: "Account created",     time: joinDate, color: "#10b981" },
                ...(role === "author" && posts.length > 0 ? [
                  { icon: "📝", text: `Published ${posts.length} post${posts.length > 1 ? "s" : ""}`, time: posts[0]?.createdAt ? fmtDate(posts[0].createdAt) : "", color: "#6366f1" }
                ] : []),
                ...(bookmarks.length > 0 ? [
                  { icon: "🔖", text: `Saved ${bookmarks.length} bookmark${bookmarks.length > 1 ? "s" : ""}`, time: "Recently", color: "#f59e0b" }
                ] : []),
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `${a.color}22`, border: `2px solid ${a.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{a.icon}</div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#e2e8f0" : "#111", margin: 0 }}>{a.text}</p>
                    <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888", margin: 0 }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* LOGOUT MODAL */}
      {showLogout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: isDark ? "#0f172a" : "#fff", padding: "32px", borderRadius: "20px", width: "280px", textAlign: "center", color: isDark ? "#fff" : "#111", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🚪</div>
            <h3 style={{ marginBottom: "8px" }}>Logout?</h3>
            <p style={{ color: isDark ? "#94a3b8" : "#666", fontSize: "14px", marginBottom: "20px" }}>Are you sure you want to logout?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={{ padding: "10px 18px", background: isDark ? "#1f2937" : "#f1f5f9", color: isDark ? "#fff" : "#111", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }} onClick={() => setShowLogout(false)}>Cancel</button>
              <button style={{ padding: "10px 18px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }}
                onClick={() => { setShowLogout(false); setTimeout(() => { localStorage.clear(); navigate("/"); }, 200); }}>Logout</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ padding: "20px", textAlign: "center", fontSize: "13px", background: isDark ? "#08090f" : "#1e1b4b", color: isDark ? "#94a3b8" : "#a78bfa", marginTop: "24px" }}>
        <p>© 2026 Saransh | All Rights Reserved</p>
      </footer>

    </div>
  );
}

export default Profile;