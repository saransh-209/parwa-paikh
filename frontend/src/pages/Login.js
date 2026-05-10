import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ ENTER PRESS FIX

    try {
      if (!data.email || !data.password) {
        return alert("Please fill all fields ❗");
      }

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/login",
        data
      );

      // 🔐 SAVE DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("role", res.data.user.role);

      // 🔔 WELCOME TOAST
      toast.success(`Welcome back, ${res.data.user.name}! 👋`, {
        icon: "🎉"
      });

      // 🚀 REDIRECT
      navigate("/", { replace: true });

    } catch (err) {
      console.log(err);
      alert(err.response?.data || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      <form style={styles.card} onSubmit={handleSubmit}>
        
        <h2 style={styles.title}>Welcome Back 🔥</h2>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) =>
            setData({ ...data, email: e.target.value })
          }
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
        />

        <button
          type="submit"
          style={styles.button}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={styles.link}
          >
            Sign Up
          </span>
        </p>

      </form>
    </div>
  );
}


// 🎨 STYLES
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #0f172a, #1e1b4b, #0f172a)"
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",
    padding: "40px",
    borderRadius: "20px",
    width: "350px",
    height:'420px',
    textAlign: "center",
    color: "white",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  },

  title: {
    marginTop:'15px',
    marginBottom: "40px",
    fontSize: "28px"
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "none",
    outline: "none"
  },

  button: {
    width: "100%",
    padding: "10px",
    marginTop: "20px",
    background:
      "linear-gradient(135deg, #4641aa, #2c0768, #4641aa)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.3s"
  },

  switchText: {
    marginTop: "40px",
    fontSize: "14px",
    color: "#d8dce7"
  },

  link: {
    color: "#00f2ff",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default Login;