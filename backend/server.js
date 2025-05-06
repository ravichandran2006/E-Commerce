const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// User model
const User = require("./models/User");

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  const token = jwt.sign({ email }, "secret123");
  res.json({ success: true, token });
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.json({ success: false, message: "Invalid password" });
  }

  const token = jwt.sign({ email }, "secret123");
  res.json({ success: true, token });
});

// Server
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
