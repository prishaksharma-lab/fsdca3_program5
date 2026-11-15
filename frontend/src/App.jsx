import React from "react";
import { useState, useEffect } from "react";
import "./app.css";

const API = import.meta.env.VITE_API_URL || "https://fsdca3-program5.onrender.com/";

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  async function fetchProducts() {
    try {
      const response = await fetch(`${API}/products`);
      if (!response.ok) throw new Error("Unable to fetch products");

      const data = await response.json();
      setProducts(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function addProduct(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          quantity: Number(quantity),
          price: Number(price)
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to add product");

      setName("");
      setQuantity("");
      setPrice("");
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProduct(id) {
    try {
      const response = await fetch(`${API}/products/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateProduct(id) {
    const newQuantity = prompt("Enter new quantity:");

    if (newQuantity === null || newQuantity.trim() === "") return;

    try {
      const response = await fetch(`${API}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Number(newQuantity) })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Update failed");
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <h1>Inventory Management System</h1>

      <form onSubmit={addProduct}>
        <input
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />

        <button type="submit">Add Product</button>
      </form>

      {error && <p className="error">{error}</p>}

      <h2>Product List</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>₹{product.price}</td>
              <td>
                <button onClick={() => updateProduct(product._id)}>
                  Update
                </button>
                <button onClick={() => deleteProduct(product._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
