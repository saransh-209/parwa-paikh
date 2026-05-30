import { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { toast } from "react-toastify";

const PANKH_ICON = "https://res.cloudinary.com/djhio7kqd/image/upload/v1780131089/pankh_ut6atj.png";
const CATEGORIES = ["Poetry", "Lyrics", "Story", "Thoughts"];

function Create() {
  const navigate = useNavigate();
  const isDark = (localStorage.getItem("theme") || "dark") === "dark";

  const [data, setData] = useState({ title: "", content: "", category: "Poetry" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (_, cap) => setCroppedAreaPixels(cap);

  const handleSubmit = async () => {
    try {
      if (!data.title || !data.content) return toast.error("Fill all fields ❗");
      setLoading(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title",    data.title);
      formData.append("content",  data.content);
      formData.append("category", data.category);

      if (selectedFile && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(preview, croppedAreaPixels);
        const finalFile = new File([croppedImage], "cropped.jpg", { type: "image/jpeg" });
        formData.append("image", finalFile);
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/create`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      toast.success("Post created 🔥");
      setData({ title: "", content: "", category: "Poetry" });
      setSelectedFile(null);
      setPreview("");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data || "Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page(isDark)}>
      <div style={S.card(isDark)}>

        {/* Header */}
        <div style={S.header}>
          <img src={PANKH_ICON} alt="" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
          <h2 style={S.title(isDark)}>Create Post</h2>
        </div>

        {/* Category selector */}
        <div style={S.label(isDark)}>Category</div>
        <div style={S.catRow}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setData({ ...data, category: cat })}
              style={S.catBtn(isDark, data.category === cat)}
            >
              {cat === "Poetry"   && "📜 "}
              {cat === "Lyrics"   && "🎵 "}
              {cat === "Story"    && "📖 "}
              {cat === "Thoughts" && "💭 "}
              {cat}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={S.label(isDark)}>Title</div>
        <input
          style={S.input(isDark)}
          placeholder="Enter your post title..."
          value={data.title}
          onChange={e => setData({ ...data, title: e.target.value })}
        />

        {/* Content */}
        <div style={S.label(isDark)}>Content</div>
        <textarea
          style={S.textarea(isDark)}
          placeholder="Write your content here..."
          value={data.content}
          onChange={e => setData({ ...data, content: e.target.value })}
        />

        {/* Cover Image */}
        <div style={S.label(isDark)}>Cover Image <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>(optional)</span></div>
        <label style={S.fileLabel(isDark)}>
          📷 Choose Image
          <input
            type="file" accept="image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              try {
                let finalFile = file;
                if (file.size > 1500000) {
                  finalFile = await imageCompression(file, {
                    maxSizeMB: 1, maxWidthOrHeight: 1600,
                    useWebWorker: true, initialQuality: 0.88, fileType: "image/jpeg"
                  });
                }
                const converted = new File([finalFile], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
                setSelectedFile(converted);
                setPreview(URL.createObjectURL(converted));
              } catch (err) {
                toast.error("Image processing failed");
              }
            }}
          />
        </label>

        {/* Cropper */}
        {preview && (
          <>
            <div style={S.cropBox}>
              <Cropper
                image={preview} crop={crop} zoom={zoom} aspect={16 / 9}
                onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
              <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#888" }}>Zoom</span>
              <input
                type="range" min={1} max={3} step={0.1} value={zoom}
                onChange={e => setZoom(e.target.value)}
                style={{ flex: 1, accentColor: "#7c3aed" }}
              />
            </div>
          </>
        )}

        {/* Buttons */}
        <button style={S.publishBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Publishing..." : "🚀 Publish Post"}
        </button>

        <button style={S.backBtn(isDark)} onClick={() => navigate("/")}>
          ← Back
        </button>

      </div>
    </div>
  );
}

const S = {
  page: (isDark) => ({
    minHeight: "100vh",
    background: isDark ? "#0d0d1a" : "#f8f9fc",
    display: "flex", justifyContent: "center", alignItems: "flex-start",
    padding: "40px 20px"
  }),

  card: (isDark) => ({
    background: isDark ? "#111827" : "#fff",
    borderRadius: "20px",
    padding: "32px",
    width: "100%", maxWidth: "520px",
    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
    boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.4)" : "0 10px 40px rgba(0,0,0,0.08)"
  }),

  header: {
    display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px"
  },

  title: (isDark) => ({
    fontSize: "22px", fontWeight: 800,
    color: isDark ? "#fff" : "#111", margin: 0
  }),

  label: (isDark) => ({
    fontSize: "13px", fontWeight: 600,
    color: isDark ? "#94a3b8" : "#666",
    marginBottom: "8px", marginTop: "18px",
    textTransform: "uppercase", letterSpacing: "0.5px"
  }),

  catRow: {
    display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "4px"
  },

  catBtn: (isDark, active) => ({
    padding: "8px 14px", borderRadius: "10px", border: "none",
    cursor: "pointer", fontSize: "13px", fontWeight: 600,
    background: active
      ? "linear-gradient(135deg,#7c3aed,#6366f1)"
      : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    color: active ? "#fff" : isDark ? "#cbd5e1" : "#555",
    transition: "all 0.2s",
    boxShadow: active ? "0 4px 12px rgba(124,58,237,0.3)" : "none"
  }),

  input: (isDark) => ({
    width: "100%", padding: "12px 16px",
    borderRadius: "12px",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
    background: isDark ? "#1a1a2e" : "#f8f9fc",
    color: isDark ? "#fff" : "#111",
    fontSize: "15px", outline: "none",
    boxSizing: "border-box"
  }),

  textarea: (isDark) => ({
    width: "100%", height: "150px", padding: "12px 16px",
    borderRadius: "12px",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
    background: isDark ? "#1a1a2e" : "#f8f9fc",
    color: isDark ? "#fff" : "#111",
    fontSize: "15px", outline: "none", resize: "vertical",
    boxSizing: "border-box", lineHeight: "1.6"
  }),

  fileLabel: (isDark) => ({
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "10px 18px", borderRadius: "10px", cursor: "pointer",
    border: isDark ? "1px dashed rgba(124,58,237,0.5)" : "1px dashed rgba(124,58,237,0.4)",
    background: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)",
    color: isDark ? "#a78bfa" : "#7c3aed",
    fontSize: "14px", fontWeight: 600, marginTop: "4px"
  }),

  cropBox: {
    position: "relative", width: "100%", height: "240px",
    marginTop: "16px", background: "#0f172a",
    borderRadius: "14px", overflow: "hidden"
  },

  publishBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    color: "white", border: "none", borderRadius: "12px",
    fontSize: "16px", fontWeight: 700, cursor: "pointer",
    marginTop: "24px",
    boxShadow: "0 6px 20px rgba(124,58,237,0.35)"
  },

  backBtn: (isDark) => ({
    width: "100%", padding: "12px",
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    color: isDark ? "#94a3b8" : "#555",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.1)",
    borderRadius: "12px", fontSize: "14px", cursor: "pointer", marginTop: "10px"
  }),
};

export default Create;