import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faChartLine, faFileInvoice, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import './Dashbroad.css';

const API_URL = "https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop";
const ETHERSCAN_API_KEY = "K2IPH3NSF9MB2FZ4CCP4FBK14ESWRTCVMM"; // Thay bằng API key của bạn

const Dashboard = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", brand: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    } else if (activeTab === "transactions") {
      connectWallet();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setProducts(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", price: "", brand: "" });
    fetchProducts();
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product.id);
    setForm({ name: product.name, price: product.price, brand: product.brand });
  };

  const handleUpdate = async () => {
    await fetch(`${API_URL}/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", price: "", brand: "" });
    setIsEditing(false);
    setEditId(null);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setWalletAddress(accounts[0]);
        fetchTransactions(accounts[0]);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const fetchTransactions = async (address) => {
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "1") {
        setTransactions(data.result);
      } else {
        setTransactions([]);
        console.error("Error from Etherscan:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={toggleNav}>Dashboard</div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${isNavOpen ? "open" : "closed"}`}>
        <div className="nav-links">
          <div className="menu-link" onClick={() => setActiveTab("products")}>
            <FontAwesomeIcon icon={faBox} size="2xl" />
            <span>Product Management</span>
          </div>
          <div className="menu-link" onClick={() => setActiveTab("revenue")}>
            <FontAwesomeIcon icon={faChartLine} size="2xl" />
            <span>Revenue</span>
          </div>
          <div className="menu-link" onClick={() => setActiveTab("transactions")}>
            <FontAwesomeIcon icon={faFileInvoice} size="2xl" />
            <span>Transaction Log</span>
          </div>
          <div className="menu-link" onClick={() => alert("Logging out...")}>
            <FontAwesomeIcon icon={faSignOutAlt} size="2xl" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {activeTab === "products" ? (
          <>
          <h2>Product Management</h2>
            <div className="form">
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
              <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
              <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
              <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
              {isEditing ? (
                <button onClick={handleUpdate}>Update</button>  
              ) : (
                <button onClick={handleCreate}>Create</button>
              )}
            </div>
            <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><img src={p.image} alt={p.name} style={{ width: "100px", height: "auto" }} /></td>
                    <td>{p.price}</td>
                    <td>{p.description}</td>
                    <td>
                      <button onClick={() => handleEdit(p)}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={{ marginLeft: "10px", color: "red" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : activeTab === "revenue" ? (
          <>
            <h2>Revenue Reports</h2>
            <p>[Placeholder for revenue charts and stats]</p>
          </>
        ) : activeTab === "transactions" ? (
          <>
            <h2>Transaction Log</h2>
            {walletAddress ? (
              <>
                <p><strong>Wallet Address:</strong> {walletAddress}</p>
                <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Hash</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Value (ETH)</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.hash}>
                        <td>{tx.hash}</td>
                        <td>{tx.from}</td>
                        <td>{tx.to}</td>
                        <td>{parseFloat(tx.value) / 1e18}</td>
                        <td>{new Date(tx.timeStamp * 1000).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <button onClick={connectWallet}>Connect MetaMask</button>
            )}
          </>
        ) : (
          <>
            <h1>Welcome to the Dashboard</h1>
            <p>This is your admin dashboard where you can manage products, view revenue, and track transactions.</p>
            <div className="card-container">
              <div className="card"><h3>Products</h3><p>Manage your products here.</p></div>
              <div className="card"><h3>Revenue</h3><p>View your revenue reports.</p></div>
              <div className="card"><h3>Transaction Log</h3><p>Track all your transactions.</p></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
