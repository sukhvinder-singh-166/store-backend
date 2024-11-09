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
  products: { type: Array, default: [] },
});
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);

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
app.post("/addProduct", async (req, res) => {
  try {
    const { email, product } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    if (!product) {
      return res.json({ message: "Product is required" });
    }
    const productExists = user.products.find((p) => p.name === product.name);
    if (productExists) {
      return res.json({ message: "Product already exists" });
    }
    user.products.push(product);
    await user.save();
    res.json({ message: "Product added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal server error" });
  }
});
app.get("/getCart", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ products: user.products });
  } catch (err) {
    console.error("Error finding user or cart:", err);
    return res.status(500).json({ message: "Database error" });
  }
});
app.delete("/deleteProduct", async (req, res) => {
  const { email, productName } = req.body; // email and product name from request body

  if (!email || !productName) {
    return res
      .status(400)
      .json({ message: "Email and product name are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the product index in user's cart
    const productIndex = user.products.findIndex(
      (product) => product.name === productName
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    // Remove the product from user's cart
    user.products.splice(productIndex, 1);
    await user.save();

    res.json({ message: "Product removed from cart", products: user.products });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
