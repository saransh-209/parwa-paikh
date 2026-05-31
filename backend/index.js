const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const Post = require("./models/Post");
const upload = require("./multer");
const verifyToken = require("./middleware/auth");
const cloudinary = require("./cloudinary");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const validator = require("validator");
const rateLimit = require("express-rate-limit");
const admin = require("firebase-admin");

const app = express();

/* ── SECURITY ── */
app.disable("x-powered-by");
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests ❌" });
app.use(limiter);
app.use(helmet());

/* ── CORS ── */
app.use(cors({ origin: "https://parwa-paikh.vercel.app", credentials: true }));

/* ── BODY ── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ── DB ── */
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected ✅"))
  .catch(err => console.log(err));

/* ── FIREBASE ADMIN ── */
try {
  const serviceAccount = require("./serviceAccount.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin initialized ✅");
} catch (e) {
  console.log("serviceAccount.json not found, trying env vars...");
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;
  if (privateKey && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  privateKey
      })
    });
    console.log("Firebase Admin initialized via env ✅");
  } else {
    console.log("Firebase Admin not initialized ❌");
  }
}

/* ══════════════════════════════════
   HOME
══════════════════════════════════ */
app.get("/", (req, res) => res.send("Server chal raha hai 🚀"));

/* ══════════════════════════════════
   GOOGLE AUTH
══════════════════════════════════ */
app.post("/auth/google", async (req, res) => {
  try {
    const { idToken, role } = req.body;

    /* Verify Firebase token */
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    /* Find or create user */
    let user = await User.findOne({ email });

    if (!user) {
      /* New user — create with Google data */
      const validRoles = ["author", "user"];
      const finalRole  = validRoles.includes(role) ? role : "user";

      user = new User({
        name:     name || email.split("@")[0],
        email,
        password: await bcrypt.hash(uid, 10), // Firebase UID as password placeholder
        role:     finalRole,
        googleId: uid
      });
      await user.save();
    }

    /* Issue JWT */
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.log("Google auth error:", err);
    res.status(401).send("Google authentication failed ❌");
  }
});

/* ══════════════════════════════════
   SIGNUP
══════════════════════════════════ */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).send("All fields required ❌");
    if (!validator.isEmail(email))    return res.status(400).send("Invalid email ❌");
    if (password.length < 6)          return res.status(400).send("Password too weak ❌");
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send("User already exists ❌");
    const hashed  = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, role });
    await newUser.save();
    res.send("Signup success 🔥");
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

/* ══════════════════════════════════
   LOGIN
══════════════════════════════════ */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("All fields required ❌");
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found ❌");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Wrong password ❌");
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

/* ══════════════════════════════════
   DASHBOARD
══════════════════════════════════ */
app.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

/* ══════════════════════════════════
   POSTS
══════════════════════════════════ */
app.post("/create", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "author") return res.status(403).send("Only author allowed ❌");
    const { title, content, category } = req.body;
    if (!title?.trim())   return res.status(400).send("Title required ❌");
    if (!content?.trim()) return res.status(400).send("Content required ❌");
    const validCats  = ["Poetry", "Lyrics", "Story", "Thoughts"];
    const finalCat   = validCats.includes(category) ? category : "Poetry";
    const newPost    = new Post({ title, content, image: req.file ? req.file.path : "", author: req.user.name, userId: req.user.id, category: finalCat });
    await newPost.save();
    res.send("Post created 🔥");
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

app.get("/posts", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "All" ? { category } : {};
    const posts  = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

app.get("/post/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found ❌");
    res.json(post);
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

app.get("/my-posts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

app.post("/post/update/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Not found ❌");
    if (post.userId.toString() !== req.user.id) return res.status(403).send("Unauthorized ❌");
    if (req.body?.title?.trim())   post.title   = req.body.title;
    if (req.body?.content?.trim()) post.content = req.body.content;
    const validCats = ["Poetry", "Lyrics", "Story", "Thoughts"];
    if (req.body?.category && validCats.includes(req.body.category)) post.category = req.body.category;
    if (req.file) {
      const oldImage = post.image;
      post.image = req.file.path;
      await post.save();
      if (oldImage) {
        const oldPublicId = oldImage.split("/upload/")[1].split(".")[0].replace(/v\d+\//, "");
        await cloudinary.uploader.destroy(oldPublicId);
      }
      return res.send("Updated Successfully 🔥");
    }
    await post.save();
    res.send("Updated Successfully 🔥");
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

app.delete("/post/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found ❌");
    if (post.userId.toString() !== req.user.id) return res.status(403).send("Unauthorized ❌");
    if (post.image) {
      try {
        const publicId = post.image.split("/upload/")[1].split(".")[0].replace(/v\d+\//, "");
        await cloudinary.uploader.destroy(publicId);
      } catch (e) { console.log("Cloudinary delete error:", e); }
    }
    await post.deleteOne();
    res.send("Post deleted 🗑️");
  } catch (err) { console.log(err); res.status(500).send("Server Error ❌"); }
});

/* ── SERVER ── */
app.listen(5000, () => console.log("Server running on 5000 🚀"));