const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ""
  },
  author: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    enum: ["Poetry", "Lyrics", "Story", "Thoughts"],
    default: "Poetry"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Post", postSchema);
