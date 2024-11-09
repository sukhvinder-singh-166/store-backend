import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://sukhvinder:sukhvinder%409729@cluster0.ziams1m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username) {
      return res.json({ message: "Username is required" });
    }
    if (!email) {
      return res.json({ message: "Email is required" });
    }
    if (!password) {
      return res.json({ message: "Password is required" });
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal server error" });
  }
});
app.post("/forgetPass", async (req, res) => {
  try {
    const { email, oldPass, newPass } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    if (user.password !== oldPass) {
      return res.json({ message: "Invalid password" });
    }
    if (!user.username) {
      return res.json({ message: "Username is required" });
    }
    if (!user.email) {
      return res.json({ message: "Email is required" });
    }
    if (!newPass) {
      return res.json({ message: "New password is required" });
    }
    user.password = newPass;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal server error" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    if (user.password !== password) {
      return res.json({ message: "Invalid password" });
    }
    res.json({ message: "Login successful", user: user });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal server error" });
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
