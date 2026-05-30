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

const app = express();

/* ── SECURITY ── */
app.disable("x-powered-by");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP ❌"
});

app.use(limiter);
app.use(helmet());

/* ── CORS ── */
app.use(cors({
  origin: "https://parwa-paikh.vercel.app",
  credentials: true
}));

/* ── BODY LIMIT ── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ── DB ── */
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected ✅"))
  .catch((err) => console.log(err));

/* ── HOME ── */
app.get("/", (req, res) => {
  res.send("Server chal raha hai 🚀");
});

/* ══════════════════════════════════
   AUTH
══════════════════════════════════ */

/* SIGNUP */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).send("All fields required ❌");

    if (!validator.isEmail(email))
      return res.status(400).send("Invalid email ❌");

    if (password.length < 6)
      return res.status(400).send("Password too weak ❌");

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).send("User already exists ❌");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.send("Signup success 🔥");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send("All fields required ❌");

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).send("User not found ❌");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).send("Wrong password ❌");

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* DASHBOARD */
app.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* ══════════════════════════════════
   POSTS
══════════════════════════════════ */

/* CREATE POST */
app.post("/create", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "author")
      return res.status(403).send("Only author allowed ❌");

    const { title, content, category } = req.body;

    if (!title || !title.trim())
      return res.status(400).send("Title required ❌");

    if (!content || !content.trim())
      return res.status(400).send("Content required ❌");

    const validCategories = ["Poetry", "Lyrics", "Story", "Thoughts"];
    const finalCategory = validCategories.includes(category) ? category : "Poetry";

    const newPost = new Post({
      title,
      content,
      image: req.file ? req.file.path : "",
      author: req.user.name,
      userId: req.user.id,
      category: finalCategory
    });

    await newPost.save();
    res.send("Post created 🔥");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* ALL POSTS */
app.get("/posts", async (req, res) => {
  try {
    const { category } = req.query;

    const filter = category && category !== "All"
      ? { category }
      : {};

    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* SINGLE POST */
app.get("/post/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).send("Post not found ❌");
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* MY POSTS — posts by logged in user */
app.get("/my-posts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* UPDATE POST */
app.post("/post/update/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).send("Not found ❌");

    if (post.userId.toString() !== req.user.id)
      return res.status(403).send("Unauthorized ❌");

    if (req.body?.title?.trim())   post.title   = req.body.title;
    if (req.body?.content?.trim()) post.content = req.body.content;

    const validCategories = ["Poetry", "Lyrics", "Story", "Thoughts"];
    if (req.body?.category && validCategories.includes(req.body.category))
      post.category = req.body.category;

    if (req.file) {
      const oldImage = post.image;
      post.image = req.file.path;
      await post.save();

      if (oldImage) {
        const oldPublicId = oldImage
          .split("/upload/")[1]
          .split(".")[0]
          .replace(/v\d+\//, "");
        await cloudinary.uploader.destroy(oldPublicId);
      }

      return res.send("Updated Successfully 🔥");
    }

    await post.save();
    res.send("Updated Successfully 🔥");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* DELETE POST */
app.delete("/post/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).send("Post not found ❌");

    if (post.userId.toString() !== req.user.id)
      return res.status(403).send("Unauthorized ❌");

    /* Delete image from Cloudinary if exists */
    if (post.image) {
      try {
        const publicId = post.image
          .split("/upload/")[1]
          .split(".")[0]
          .replace(/v\d+\//, "");
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.log("Cloudinary delete error:", e);
      }
    }

    await post.deleteOne();
    res.send("Post deleted 🗑️");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error ❌");
  }
});

/* ── SERVER ── */
app.listen(5000, () => {
  console.log("Server running on 5000 🚀");
});
