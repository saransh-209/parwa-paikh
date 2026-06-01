import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Signup     from "./pages/Signup";
import Login      from "./pages/Login";
import Create     from "./pages/Create";
import Home       from "./pages/Home";
import PostDetails from "./pages/PostDetails";
import EditPost   from "./pages/EditPost";
import Explore    from "./pages/Explore";
import MyPosts    from "./pages/MyPosts";
import Bookmarks  from "./pages/Bookmarks";
import Profile    from "./pages/Profile";

import "./index.css";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return children;
};

function App() {
  const [theme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Home />} />
        <Route path="/home"    element={<Navigate to="/" />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/explore" element={<Explore />} />

        {/* Protected */}
        <Route path="/create"    element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="/edit/:id"  element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
        <Route path="/my-posts"  element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/" />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme={theme}
      />
    </BrowserRouter>
  );
}

export default App;
