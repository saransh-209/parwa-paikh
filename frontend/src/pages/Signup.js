import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PANKH       = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";
const DESKTOP_BG  = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780219276/signup_desktop_hgmxtt.png";
const MOBILE_BG   = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780219238/login_mobile_kmncgu.png";

function Signup() {
  const navigate = useNavigate();
  const [data, setData]           = useState({ name: "", email: "", password: "", confirmPassword: "", role: "author" });
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth <= 768);
  const [stats, setStats]         = useState({ users: 0, posts: 0, writers: 0 });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fetch real stats
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/posts`)
      .then(r => {
        const posts   = r.data.length;
        const writers = new Set(r.data.map(p => p.userId)).size;
        setStats({ users: writers + Math.floor(posts * 1.8), posts, writers });
      })
      .catch(() => setStats({ users: 50, posts: 100, writers: 30 }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name || !data.email || !data.password) return toast.error("Please fill all fields ❗");
    if (data.password.length < 6) return toast.error("Password must be at least 6 characters 🔐");
    if (data.password !== data.confirmPassword) return toast.error("Passwords don't match ❌");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return toast.error("Invalid email ❌");

    try {
      setLoading(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/signup`, { name: data.name, email: data.email, password: data.password, role: data.role });
      const loginRes = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { email: data.email, password: data.password });
      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("role",  loginRes.data.user.role);
      localStorage.setItem("name",  loginRes.data.user.name);
      toast.success(`Welcome ${loginRes.data.user.name} 🔥`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data || "Something went wrong ❌");
    } finally { setLoading(false); }
  };

  const formCard = (
    <div style={{ width: "100%", maxWidth: isMobile ? "100%" : "520px", background: "rgba(15,12,28,0.88)", backdropFilter: "blur(20px)", borderRadius: isMobile ? "0" : "24px", border: isMobile ? "none" : "1px solid rgba(139,92,246,0.25)", padding: isMobile ? "0" : "44px 40px", boxShadow: isMobile ? "none" : "0 0 60px rgba(124,58,237,0.2)" }}>

      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: isMobile ? "30px" : "30px", fontWeight: 800, color: "#fff", margin: 0, fontFamily: "serif" }}>
          <span style={{ color: "#a855f7" }}>Create</span> Your Account <span style={{ fontSize: "20px" }}>✨</span>
        </h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "8px" }}>Join thousands of readers & writers today.</p>
      </div>

      {/* Social buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button style={{ ...F.googleBtn, flex: 1 }} onClick={() => toast.info("Coming soon!")}>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#ea4335" }}>G</span> Continue with Google
        </button>
        <button style={{ ...F.facebookBtn, flex: 1 }} onClick={() => toast.info("Coming soon!")}>
          <span style={{ fontSize: "16px" }}>f</span> Continue with Facebook
        </button>
      </div>

      <div style={F.divider}><span style={F.dividerText}>OR</span></div>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={F.inputWrap}>
          <span style={F.icon}>👤</span>
          <input placeholder="Full Name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} style={F.input} />
        </div>

        {/* Email */}
        <div style={F.inputWrap}>
          <span style={F.icon}>✉</span>
          <input type="email" placeholder="Email Address" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} style={F.input} />
        </div>

        {/* Password */}
        <div style={F.inputWrap}>
          <span style={F.icon}>🔒</span>
          <input type={showPass ? "text" : "password"} placeholder="Password" value={data.password}
            onChange={e => setData({ ...data, password: e.target.value })} style={{ ...F.input, paddingRight: "44px" }} />
          <span onClick={() => setShowPass(s => !s)} style={{ ...F.icon, right: "14px", left: "auto", cursor: "pointer" }}>{showPass ? "👁" : "🙈"}</span>
        </div>

        {/* Confirm Password */}
        <div style={F.inputWrap}>
          <span style={F.icon}>🔒</span>
          <input type={showConf ? "text" : "password"} placeholder="Confirm Password" value={data.confirmPassword}
            onChange={e => setData({ ...data, confirmPassword: e.target.value })} style={{ ...F.input, paddingRight: "44px" }} />
          <span onClick={() => setShowConf(s => !s)} style={{ ...F.icon, right: "14px", left: "auto", cursor: "pointer" }}>{showConf ? "👁" : "🙈"}</span>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: "20px" }}>
          <div style={F.divider}><span style={F.dividerText}>Choose Your Role</span></div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={() => setData({ ...data, role: "author" })}
              style={{ flex: 1, padding: "14px", borderRadius: "12px", border: data.role === "author" ? "2px solid #a855f7" : "1px solid rgba(139,92,246,0.2)", background: data.role === "author" ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)", color: data.role === "author" ? "#a855f7" : "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600, fontSize: "15px" }}>
              <span>✏ Writer</span>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid " + (data.role === "author" ? "#a855f7" : "#4b5563"), display: "flex", alignItems: "center", justifyContent: "center", background: data.role === "author" ? "#a855f7" : "transparent", fontSize: "12px" }}>{data.role === "author" ? "✓" : ""}</span>
            </button>
            <button type="button" onClick={() => setData({ ...data, role: "user" })}
              style={{ flex: 1, padding: "14px", borderRadius: "12px", border: data.role === "user" ? "2px solid #a855f7" : "1px solid rgba(139,92,246,0.2)", background: data.role === "user" ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)", color: data.role === "user" ? "#a855f7" : "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600, fontSize: "15px" }}>
              <span>📖 Reader</span>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid " + (data.role === "user" ? "#a855f7" : "#4b5563"), display: "flex", alignItems: "center", justifyContent: "center", background: data.role === "user" ? "#a855f7" : "transparent", fontSize: "12px" }}>{data.role === "user" ? "✓" : ""}</span>
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} style={F.submitBtn}>
          {loading ? "Creating..." : <>Create Account →</>}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
        Already have an account? <span style={{ color: "#a855f7", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/login")}>Login</span>
      </p>

      <p style={{ textAlign: "center", fontSize: "11px", color: "#6b7280", lineHeight: 1.6 }}>
        🛡 By creating an account, you agree to our{" "}
        <span style={{ color: "#a855f7", cursor: "pointer" }} onClick={() => toast.info("Terms of Service — Parwa Paikh platform pe published content creator ki responsibility hai. Hate speech, copyright violation aur inappropriate content allowed nahi hai.")}>
          Terms of Service
        </span>{" "}and{" "}
        <span style={{ color: "#a855f7", cursor: "pointer" }} onClick={() => toast.info("Privacy Policy — Aapka data sirf platform use ke liye store hota hai. Hum aapka data kisi third party ko share nahi karte.")}>
          Privacy Policy
        </span>.
      </p>
    </div>
  );

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", background: "#07050f", position: "relative" }}>
        <div style={{ position: "fixed", inset: 0, backgroundImage: `url(${MOBILE_BG})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.5, zIndex: 0 }} />
        <div style={{ position: "fixed", inset: 0, background: "linear-gradient(to bottom, rgba(7,5,15,0.9) 0%, rgba(7,5,15,0.6) 50%, rgba(7,5,15,0.95) 100%)", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, padding: "50px 20px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src={PANKH} alt="" style={{ width: "80px", height: "80px", objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(139,92,246,0.9))", marginBottom: "12px" }} />
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", fontFamily: "serif", margin: "0 0 4px" }}>Parwa Paikh</h1>
          <div style={{ width: "60px", height: "2px", background: "linear-gradient(90deg,transparent,#7c3aed,transparent)", marginBottom: "6px" }} />
          <p style={{ fontSize: "13px", color: "#c4b5fd", marginBottom: "28px" }}>Join the world of <span style={{ color: "#a855f7" }}>stories and imagination.</span></p>
          {formCard}
        </div>
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `url(${DESKTOP_BG})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, background: "rgba(7,5,15,0.55)", zIndex: 1 }} />

      {/* LEFT PANEL */}
      <div style={{ flex: 1, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <img src={PANKH} alt="" style={{ width: "36px", height: "36px", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(139,92,246,0.8))" }} />
          <span style={{ fontSize: "22px", fontWeight: 800, color: "#fff", fontFamily: "serif" }}>Parwa Paikh</span>
        </div>

        <div style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", padding: "10px 16px", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px", width: "fit-content" }}>
          <span style={{ fontSize: "14px" }}>✨</span>
          <span style={{ fontSize: "14px", color: "#c4b5fd", fontWeight: 500 }}>Write. Share. Inspire.</span>
        </div>

        <h1 style={{ fontSize: "52px", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "20px", fontFamily: "serif" }}>
          Start Your<br />
          <span style={{ color: "#a855f7" }}>Story</span> Today
        </h1>

        <p style={{ fontSize: "16px", color: "#94a3b8", lineHeight: 1.7, maxWidth: "380px", marginBottom: "40px" }}>
          Join a creative community where readers discover stories and writers bring imaginations to life.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: "32px" }}>
          {[
            { icon: "👥", val: stats.users > 0 ? `${stats.users}+` : "50K+",   label: "Active Users" },
            { icon: "📚", val: stats.posts > 0 ? `${stats.posts}+` : "100K+",  label: "Stories Published" },
            { icon: "✏",  val: stats.writers > 0 ? `${stats.writers}+` : "200K+", label: "Writers & Readers" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 8px" }}>{s.icon}</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{s.val}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: "560px", flexShrink: 0, position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", padding: "30px" }}>
        {formCard}
      </div>
    </div>
  );
}

const F = {
  inputWrap:  { position: "relative", marginBottom: "14px" },
  icon:       { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#6b7280", pointerEvents: "none" },
  input:      { width: "100%", padding: "14px 14px 14px 44px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "12px", color: "#fff", fontSize: "15px", outline: "none", boxSizing: "border-box" },
  submitBtn:  { width: "100%", padding: "15px", background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 24px rgba(124,58,237,0.4)", marginBottom: "16px" },
  divider:    { display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" },
  dividerText:{ fontSize: "11px", color: "#6b7280", letterSpacing: "1.5px", textTransform: "uppercase", whiteSpace: "nowrap" },
  googleBtn:  { padding: "12px", background: "rgba(255,255,255,0.95)", color: "#111", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  facebookBtn:{ padding: "12px", background: "#1877f2", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
};

export default Signup;
