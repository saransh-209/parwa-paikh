import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  const [loading, setLoading] = useState(false);

  // ✅ ENTER PRESS + BUTTON CLICK BOTH
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      if (!data.name || !data.email || !data.password) {
        return alert("Please fill all fields ❗");
      }

      setLoading(true);

      // 🔐 SIGNUP
      await axios.post(
        "http://localhost:5000/signup",
        data
      );

      // 🔥 AUTO LOGIN
      const loginRes = await axios.post(
        "http://localhost:5000/login",
        {
          email: data.email,
          password: data.password
        }
      );

      // 🔐 SAVE DATA
      localStorage.setItem(
        "token",
        loginRes.data.token
      );

      localStorage.setItem(
        "role",
        loginRes.data.user.role
      );

      localStorage.setItem(
        "name",
        loginRes.data.user.name
      );

      alert(`Welcome ${loginRes.data.user.name} 🔥`);

      // 🚀 REDIRECT
      navigate("/dashboard");

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data ||
        "Something went wrong ❌"
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div style={styles.container}>

      {/* ✅ FORM ADD KIYA */}
      <form
        style={styles.card}
        onSubmit={handleSubmit}
      >

        <h2 style={styles.title}>
          Create Your Account
        </h2>

        <input
          style={styles.input}
          placeholder="Full Name"
          value={data.name}
          onChange={(e) =>
            setData({
              ...data,
              name: e.target.value
            })
          }
        />

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) =>
            setData({
              ...data,
              email: e.target.value
            })
          }
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) =>
            setData({
              ...data,
              password: e.target.value
            })
          }
        />

        <select
          style={styles.input}
          value={data.role}
          onChange={(e) =>
            setData({
              ...data,
              role: e.target.value
            })
          }
        >
          <option value="author">
            Author
          </option>

          <option value="user">
            Reader
          </option>
        </select>

        {/* ✅ TYPE SUBMIT */}
        <button
          type="submit"
          style={styles.button}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p style={styles.switchText}>
          Already have an account?{" "}

          <span
            onClick={() => navigate("/login")}
            style={styles.link}
          >
            Login
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
    background:"linear-gradient(160deg, #0f172a, #1e1b4b, #0f172a, #1e1b4b)"
  },

  card: {
    background: "#1b2130",
    padding: "30px",
    borderRadius: "15px",
    width: "420px",
    textAlign: "center",
    color: "white"
  },

  title: {
    marginBottom: "40px"
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "5px",
    border: "none",
    outline: "none"
  },

  button: {
    marginTop: "25px",
    width: "100%",
    padding: "10px",
    background:"linear-gradient(45deg, #4f46e5, #2c0768, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  switchText: {
    marginTop: "25px",
    fontSize: "17px",
    color: "#e0e4f2"
  },

  link: {
    color: "#00d0ff",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s"
  }
};

export default Signup;