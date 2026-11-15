
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/product");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Inventory Management API is running");
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch products" });
  }
});

// Add product
app.post("/products", async (req, res) => {
  try {
    const { name, quantity, price } = req.body;

    if (
      !name ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0 ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({ error: "Invalid product details" });
    }

    const product = new Product({
      name,
      quantity: Number(quantity),
      price: Number(price)
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: "Unable to add product" });
  }
});

// Update product quantity
app.put("/products/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    if (
      quantity === undefined ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity: Number(quantity) },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Unable to update product" });
  }
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Unable to delete product" });
  }
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });