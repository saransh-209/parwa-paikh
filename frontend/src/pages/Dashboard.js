import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState("all"); // 🔥 toggle

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchUser();
    fetchPosts();
  }, []);

  // 🔐 USER
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 POSTS
  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/posts");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!user) return <p style={{ color: "white" }}>Loading...</p>;

  // 🔥 FILTER
  const filteredPosts =
    view === "my"
      ? posts.filter((p) => p.userId === user._id)
      : posts;

  return (
    <div style={styles.container}>

      {/* 🔝 TOP BAR */}
      <div style={styles.topBar}>
        <h2>Welcome, {user.name} 👋</h2>

        <div style={styles.actionsTop}>
          {user.role === "author" && (
            <button
              style={styles.createBtn}
              onClick={() => window.location.href = "/create"}
            >
              + Create
            </button>
          )}

          <button style={styles.logoutBtn} onClick={() => setShowModal(true)}>
            Logout
          </button>
        </div>
      </div>

      {/* 🔥 TOGGLE */}
      {user.role === "author" && (
        <div style={styles.toggleBox}>
          <button
            style={{
              ...styles.toggleBtn,
              background: view === "all" ? "#7c3aed" : "#1f2937"
            }}
            onClick={() => setView("all")}
          >
            All Posts
          </button>

          <button
            style={{
              ...styles.toggleBtn,
              background: view === "my" ? "#7c3aed" : "#1f2937"
            }}
            onClick={() => setView("my")}
          >
            My Posts
          </button>
        </div>
      )}

      {/* 🔥 POSTS GRID */}
      <div style={styles.grid}>
        {filteredPosts.map((post) => (
          <div key={post._id} style={styles.card}>
            
            {/* IMAGE */}
            <div style={styles.image}></div>

            <div style={styles.cardBody}>
              <h3>{post.title}</h3>
              <p style={styles.author}>✍ {post.author}</p>
            </div>

          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Are you sure? 🤔</h3>
            <p>Do you really want to logout?</p>

            <div style={styles.modalBtns}>
              <button
                style={styles.yesBtn}
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
              >
                Yes
              </button>

              <button
                style={styles.noBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// 🎨 STYLES
const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px",
    background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
    color: "white"
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  actionsTop: {
    display: "flex",
    gap: "10px"
  },

  createBtn: {
    padding: "8px 15px",
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  logoutBtn: {
    padding: "8px 15px",
    background: "#111827",
    color: "white",
    border: "1px solid #444",
    borderRadius: "8px",
    cursor: "pointer"
  },

  toggleBox: {
    marginBottom: "20px",
    display: "flex",
    gap: "10px"
  },

  toggleBtn: {
    padding: "8px 15px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "15px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "0.3s"
  },

  image: {
    height: "150px",
    background: "#1f2937"
  },

  cardBody: {
    padding: "15px"
  },

  author: {
    fontSize: "12px",
    color: "#a78bfa"
  },

  // MODAL
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },

  modal: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    width: "300px"
  },

  modalBtns: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between"
  },

  yesBtn: {
    padding: "10px",
    background: "#ef4444",
    border: "none",
    borderRadius: "5px",
    color: "white",
    width: "48%"
  },

  noBtn: {
    padding: "10px",
    background: "#111827",
    border: "1px solid #444",
    borderRadius: "5px",
    color: "white",
    width: "48%"
  }
};

export default Dashboard;