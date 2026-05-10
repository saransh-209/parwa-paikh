const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // 🔥 duplicate email block
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "author"],
    default: "user"
  }
}, {
  timestamps: true // 🔥 createdAt, updatedAt auto
});

module.exports = mongoose.model("User", userSchema);