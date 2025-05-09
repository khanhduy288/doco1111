import React, { useState, useEffect } from "react";
import Web3 from "web3";
import {
  faBox,
  faChartLine,
  faFileInvoice,
  faSignOutAlt,
  faCog,
  faBars,
  faGavel 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Dashbroad.css';
import { useNavigate } from "react-router-dom";

const PRODUCT_API = "https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop";
const WALLET_API = "https://681de07ac1c291fa66320473.mockapi.io/addressqr/wallet";
const ETHERSCAN_API_KEY = "K2IPH3NSF9MB2FZ4CCP4FBK14ESWRTCVMM";

const Dashboard = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", image: "", description: "" });  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletAPIAddress, setWalletAPIAddress] = useState("");
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const navigate = useNavigate();

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    if (["transactions", "settings"].includes(activeTab)) fetchWallet();
  }, [activeTab]);

  const fetchProducts = async () => {
    const res = await fetch(PRODUCT_API);
    const data = await res.json();
    setProducts(data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    await fetch(PRODUCT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", price: "", image: "", description: "" });
    fetchProducts();
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product.id);
    setForm({ name: product.name, price: product.price, image: product.image, description: product.description });
  };

  const handleUpdate = async () => {
    await fetch(`${PRODUCT_API}/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", price: "", image: "", description: "" });
    setIsEditing(false);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await fetch(`${PRODUCT_API}/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch(WALLET_API);
      const data = await res.json();
      if (data.length > 0) {
        setWalletAddress(data[0].address);
        setWalletAPIAddress(data[0].address);
        fetchTransactions(data[0].address);
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };
  const startAuction = async (id) => {
  const endTime = prompt("Nhập thời gian kết thúc đấu giá (YYYY-MM-DD HH:mm):");
  if (!endTime) return;

  const endISO = new Date(endTime).toISOString();
  await fetch(`${PRODUCT_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAuction: true, auctionEndTime: endISO })
  });
  alert("Sản phẩm đã được đưa vào phiên đấu giá!");
  fetchProducts();
};
  const saveWalletAddress = async () => {
    setIsSavingWallet(true);
    try {
      await fetch(WALLET_API + "/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAPIAddress }),
      });
      alert("Wallet address updated");
    } catch (err) {
      alert("Failed to update wallet address");
    }
    setIsSavingWallet(false);
  };

  const fetchTransactions = async (address) => {
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "1") setTransactions(data.result);
      else setTransactions([]);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <FontAwesomeIcon icon={faBars} onClick={toggleNav} className="toggle-button" />
        <div className="logo">Dashboard</div>
      </header>

      <div className={`sidebar ${isNavOpen ? "open" : ""}`}>
        <div className="nav-links">
          <div className="menu-link" onClick={() => setActiveTab("products")}> <FontAwesomeIcon icon={faBox} /><span>Products</span> </div>
          <div className="menu-link" onClick={() => setActiveTab("auction")}> <FontAwesomeIcon icon={faGavel} /><span>Auction</span> </div>
          <div className="menu-link" onClick={() => setActiveTab("revenue")}> <FontAwesomeIcon icon={faChartLine} /><span>Revenue</span> </div>
          <div className="menu-link" onClick={() => setActiveTab("transactions")}> <FontAwesomeIcon icon={faFileInvoice} /><span>Transactions</span> </div>
          <div className="menu-link" onClick={() => setActiveTab("settings")}> <FontAwesomeIcon icon={faCog} /><span>Settings</span> </div>
          <div className="menu-link" onClick={() => navigate("/")}> <FontAwesomeIcon icon={faSignOutAlt} /><span>Logout</span> </div>
        </div>
      </div>

      <div className="main-content">
  {activeTab === "products" && (
          <>
            <h2>Product Management</h2>
            <div className="form">
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
              <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
              <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
              <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
              {isEditing ? <button onClick={handleUpdate}>Update</button> : <button onClick={handleCreate}>Create</button>}
            </div>
            <table>
              <thead>
                <tr><th>Name</th><th>Image</th><th>Price</th><th>Description</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><img src={p.image} alt={p.name} width="100" /></td>
                    <td>{p.price}</td>
                    <td>{p.description}</td>
                    <td>
                      <button onClick={() => handleEdit(p)}>Edit</button>
                      <button onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      {activeTab === "auction" && (
  <>
    <h2>Đặt sản phẩm vào phiên đấu giá</h2>
    <table>
      <thead>
        <tr><th>Tên</th><th>Giá</th><th>Đang đấu giá?</th><th>Hết hạn</th><th>Thao tác</th></tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.id}>
            <td>{p.name}</td>
            <td>{p.price}</td>
            <td>{p.isAuction ? "✅" : "❌"}</td>
            <td>{p.auctionEndTime ? new Date(p.auctionEndTime).toLocaleString() : "-"}</td>
            <td>
              <button onClick={() => startAuction(p.id)}>Auction</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}

        {activeTab === "revenue" && <><h2>Revenue Reports</h2><p>Coming soon...</p></>}

        {activeTab === "transactions" && (
          <>
            <h2>Transaction Log</h2>
            <p><strong>Wallet:</strong> {walletAddress}</p>
            <table>
              <thead>
                <tr><th>Hash</th><th>From</th><th>To</th><th>Value</th><th>Time</th></tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.hash}>
                    <td>{tx.hash.slice(0, 10)}...</td>
                    <td>{tx.from}</td>
                    <td>{tx.to}</td>
                    <td>{(parseFloat(tx.value) / 1e18).toFixed(4)}</td>
                    <td>{new Date(tx.timeStamp * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "settings" && (
          <>
            <h2>Settings</h2>
            <label>Wallet Address:</label>
            <input type="text" value={walletAPIAddress} onChange={e => setWalletAPIAddress(e.target.value)} />
            <button onClick={saveWalletAddress} disabled={isSavingWallet}>
              {isSavingWallet ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
