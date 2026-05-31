import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PANKH        = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";
const DESKTOP_BG   = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780219239/login_desktop_ajfo7q.png";
const MOBILE_BG    = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780219238/login_mobile_kmncgu.png";

function Login() {
  const navigate = useNavigate();
  const [data, setData]             = useState({ email: "", password: "" });
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [remember, setRemember]     = useState(false);
  const [isMobile]                  = useState(window.innerWidth <= 768);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.email || !data.password) return toast.error("Please fill all fields ❗");
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name",  res.data.user.name);
      localStorage.setItem("role",  res.data.user.role);
      if (remember) localStorage.setItem("rememberedEmail", data.email);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data || "Login failed ❌");
    } finally { setLoading(false); }
  };

  /* ── MOBILE LAYOUT ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", background: "#07050f", position: "relative", overflow: "hidden" }}>
        {/* BG */}
        <div style={{ position: "fixed", inset: 0, backgroundImage: `url(${MOBILE_BG})`, backgroundSize: "cover", backgroundPosition: "center bottom", opacity: 0.6, zIndex: 0 }} />
        <div style={{ position: "fixed", inset: 0, background: "linear-gradient(to bottom, rgba(7,5,15,0.85) 0%, rgba(7,5,15,0.4) 40%, rgba(7,5,15,0.85) 100%)", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, padding: "50px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Logo */}
          <img src={PANKH} alt="pankh" style={{ width: "80px", height: "80px", objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(139,92,246,0.9))", marginBottom: "16px" }} />
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", fontFamily: "serif", margin: 0 }}>Parwa Paikh</h1>
          <div style={{ width: "60px", height: "2px", background: "linear-gradient(90deg,transparent,#7c3aed,transparent)", margin: "10px 0" }} />
          <p style={{ fontSize: "14px", color: "#c4b5fd", marginBottom: "32px" }}>मैथिली के शब्द, हमर पहचान</p>

          {/* Title */}
          <div style={{ width: "100%", marginBottom: "8px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Welcome Back!</h2>
            <div style={{ width: "50px", height: "2px", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: "2px", marginBottom: "10px" }} />
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>Sign in to continue your journey into the world of <span style={{ color: "#a855f7" }}>Maithili Sahitya.</span></p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: "20px" }}>
            {/* Email */}
            <div style={F.inputWrap}>
              <span style={F.icon}>✉</span>
              <input type="email" placeholder="Enter your email" value={data.email}
                onChange={e => setData({ ...data, email: e.target.value })}
                style={F.input} />
            </div>

            {/* Password */}
            <div style={F.inputWrap}>
              <span style={F.icon}>🔒</span>
              <input type={showPass ? "text" : "password"} placeholder="Enter your password" value={data.password}
                onChange={e => setData({ ...data, password: e.target.value })}
                style={{ ...F.input, paddingRight: "44px" }} />
              <span onClick={() => setShowPass(s => !s)} style={{ ...F.icon, right: "14px", left: "auto", cursor: "pointer" }}>
                {showPass ? "👁" : "🙈"}
              </span>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#7c3aed" }} />
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Remember me</span>
              </label>
              <span style={{ fontSize: "13px", color: "#a855f7", cursor: "pointer" }}>Forgot Password?</span>
            </div>

            {/* Login btn */}
            <button type="submit" disabled={loading} style={F.submitBtn}>
              {loading ? "Signing in..." : <><span>Login</span><span>→</span></>}
            </button>
          </form>

          {/* Divider */}
          <div style={F.divider}><span style={F.dividerText}>OR CONTINUE WITH</span></div>

          {/* Social */}
          <div style={{ display: "flex", gap: "12px", width: "100%", marginBottom: "24px" }}>
            <button style={F.googleBtn} onClick={() => toast.info("Google login coming soon!")}>
              <span style={{ fontSize: "20px" }}>G</span> Google
            </button>
            <button style={F.facebookBtn} onClick={() => toast.info("Facebook login coming soon!")}>
              <span style={{ fontSize: "18px" }}>f</span> Facebook
            </button>
          </div>

          <p style={{ fontSize: "14px", color: "#94a3b8" }}>
            Don't have an account? <span style={{ color: "#a855f7", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/signup")}>Sign Up →</span>
          </p>
        </div>
      </div>
    );
  }

  /* ── DESKTOP LAYOUT ── */
  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>
      {/* BG */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `url(${DESKTOP_BG})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, background: "rgba(7,5,15,0.35)", zIndex: 1 }} />

      {/* LEFT PANEL */}
      <div style={{ flex: 1, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
          <img src={PANKH} alt="" style={{ width: "36px", height: "36px", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(139,92,246,0.8))" }} />
          <span style={{ fontSize: "22px", fontWeight: 800, color: "#fff", fontFamily: "serif" }}>Parwa Paikh</span>
        </div>
        <h1 style={{ fontSize: "52px", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "20px", fontFamily: "serif" }}>
          Welcome<br />Back!
        </h1>
        <div style={{ width: "60px", height: "3px", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: "2px", marginBottom: "20px" }} />
        <p style={{ fontSize: "16px", color: "#94a3b8", lineHeight: 1.7, maxWidth: "380px" }}>
          Sign in to continue your journey into the world of <span style={{ color: "#a855f7", fontWeight: 600 }}>Maithili Sahitya.</span>
        </p>
      </div>

      {/* RIGHT PANEL - Form card */}
      <div style={{ width: "520px", flexShrink: 0, position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 30px" }}>
        <div style={{ width: "100%", background: "rgba(15,12,28,0.88)", backdropFilter: "blur(20px)", borderRadius: "24px", border: "1px solid rgba(139,92,246,0.25)", padding: "44px 40px", boxShadow: "0 0 60px rgba(124,58,237,0.2)" }}>

          {/* Pankh top right */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
            <div>
              <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", margin: 0, fontFamily: "serif" }}>Welcome Back!</h2>
              <div style={{ width: "50px", height: "2px", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: "2px", margin: "10px 0" }} />
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
                Sign in to continue your journey into the world of <span style={{ color: "#a855f7" }}>Maithili Sahitya.</span>
              </p>
            </div>
            <img src={PANKH} alt="" style={{ width: "60px", height: "60px", objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(139,92,246,0.8))" }} />
          </div>

          <form onSubmit={handleSubmit}>
            <label style={F.label}>Email Address</label>
            <div style={F.inputWrap}>
              <span style={F.icon}>✉</span>
              <input type="email" placeholder="Enter your email" value={data.email}
                onChange={e => setData({ ...data, email: e.target.value })} style={F.input} />
            </div>

            <label style={F.label}>Password</label>
            <div style={F.inputWrap}>
              <span style={F.icon}>🔒</span>
              <input type={showPass ? "text" : "password"} placeholder="Enter your password" value={data.password}
                onChange={e => setData({ ...data, password: e.target.value })}
                style={{ ...F.input, paddingRight: "44px" }} />
              <span onClick={() => setShowPass(s => !s)} style={{ ...F.icon, right: "14px", left: "auto", cursor: "pointer" }}>
                {showPass ? "👁" : "🙈"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#7c3aed" }} />
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Remember me</span>
              </label>
              <span style={{ fontSize: "13px", color: "#a855f7", cursor: "pointer" }}>Forgot Password?</span>
            </div>

            <button type="submit" disabled={loading} style={F.submitBtn}>
              <img src={PANKH} alt="" style={{ width: "18px", height: "18px", objectFit: "contain", filter: "brightness(10)" }} />
              {loading ? "Signing in..." : "Login"}
              <span>→</span>
            </button>
          </form>

          <div style={F.divider}><span style={F.dividerText}>or continue with</span></div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <button style={F.googleBtn} onClick={() => toast.info("Google login coming soon!")}>
              <span style={{ fontSize: "18px" }}>G</span> Continue with Google
            </button>
            <button style={F.facebookBtn} onClick={() => toast.info("Facebook login coming soon!")}>
              <span style={{ fontSize: "16px" }}>f</span> Continue with Facebook
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>
            Don't have an account? <span style={{ color: "#a855f7", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/signup")}>Sign Up →</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* Shared form styles */
const F = {
  label:      { fontSize: "13px", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "8px", letterSpacing: "0.5px" },
  inputWrap:  { position: "relative", marginBottom: "16px" },
  icon:       { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#6b7280", pointerEvents: "none" },
  input:      { width: "100%", padding: "14px 14px 14px 44px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "12px", color: "#fff", fontSize: "15px", outline: "none", boxSizing: "border-box", transition: "border 0.2s" },
  submitBtn:  { width: "100%", padding: "15px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 24px rgba(124,58,237,0.4)", marginBottom: "20px" },
  divider:    { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" },
  dividerText:{ fontSize: "11px", color: "#6b7280", letterSpacing: "1.5px", textTransform: "uppercase", whiteSpace: "nowrap" },
  googleBtn:  { flex: 1, padding: "12px", background: "rgba(255,255,255,0.95)", color: "#111", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  facebookBtn:{ flex: 1, padding: "12px", background: "#1877f2", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
};

export default Login;
