import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Create from "./pages/Create";
import Home from "./pages/Home";
import PostDetails from "./pages/PostDetails";
import EditPost from "./pages/EditPost";

import "./index.css";

// 🔐 Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {

  // 🌙 THEME STATE (GLOBAL)
  const [theme] = useState("dark");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <BrowserRouter>

      <Routes>

        {/* 🏠 MAIN APP */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" />} />

        {/* 📄 POSTS */}
        <Route path="/post/:id" element={<PostDetails />} />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          }
        />

        {/* 🔐 AUTH */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* 🔒 PROTECTED */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          }
        />

        {/* ❌ DASHBOARD REMOVED */}
        <Route path="/dashboard" element={<Navigate to="/" />} />

      </Routes>
       {/* 🔔 TOAST CONTAINER */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme={theme} // Dark/Light theme support
      />
    </BrowserRouter>
  );
}

export default App;