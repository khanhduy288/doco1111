import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { BrowserProvider, parseEther } from "ethers";
import {
  faBox,
  faChartLine,
  faFileInvoice,
  faSignOutAlt,
  faCog,
  faBars,
  faGavel,
  faUserCheck 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Dashbroad.css';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const PRODUCT_API = "https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop";
const WALLET_API = "https://681de07ac1c291fa66320473.mockapi.io/addressqr/wallet";
const ETHERSCAN_API_KEY = "K2IPH3NSF9MB2FZ4CCP4FBK14ESWRTCVMM";

const Dashboard = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", image: "", description: "" });  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletAPIAddress, setWalletAPIAddress] = useState("");
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const toggleNav = () => setIsNavOpen(!isNavOpen);

useEffect(() => {
  if (activeTab === "products") fetchProducts();
  if (["transactions", "settings"].includes(activeTab)) {
    fetchWallet();
    checkWalletConnection(); // Thêm dòng này
  }
  if (activeTab === "approval") fetchPendingUsers();
  if (activeTab === "member") fetchApprovedUsers();
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

  const checkWalletConnection = async () => {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    setIsConnected(accounts.length > 0);
  } else {
    setIsConnected(false);
  }
};
  
const handlePaymentToUser = async (user) => {
  try {
    console.log("Ví của user:", user.walletAddress);
    console.log("Balance của user:", user.balance);

    if (!window.ethereum) {
      toast.error("MetaMask chưa được cài đặt!");
      return;
    }

    const recipientAddress = user.walletAddress;
    const amount = Number(user.balance);

    if (!recipientAddress || isNaN(amount) || amount <= 0) {
      toast.warning("Thông tin không hợp lệ!");
      return;
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: parseEther(amount.toString()),
    });

    await tx.wait();

    toast.success(`Đã thanh toán ${amount}$ cho ${user.fullName || user.username}`);

    setApprovedUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, balance: 0 } : u))
    );
  } catch (err) {
    console.error(err);
    toast.error("Thanh toán thất bại!");
  }
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
  
  const fetchPendingUsers = async () => {
  try {
    const res = await fetch("https://65682fed9927836bd9743814.mockapi.io/api/singup/signup");
    const data = await res.json();
    const pending = data.filter((user) => user.status === "pending");
    setPendingUsers(pending);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đăng ký:", error);
  }
};

const fetchApprovedUsers = async () => {
  try {
    const res = await fetch("https://65682fed9927836bd9743814.mockapi.io/api/singup/signup");
    const data = await res.json();
    const approved = data.filter((user) => user.status === "approved");
    setApprovedUsers(approved);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thành viên đã duyệt:", error);
  }
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

  const handleApprove = async (userId) => {
  try {
    await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    // Sau khi duyệt, cập nhật lại danh sách người dùng chờ duyệt
    fetchPendingUsers();
    toast.success("Người dùng đã được duyệt.");
  } catch (error) {
    console.error("Lỗi khi duyệt người dùng:", error);
    toast.error("Không thể duyệt người dùng.");
  }
};

const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts.length > 0) {
      setIsConnected(true);
      setWalletAPIAddress(accounts[0]); // Tự động điền vào input nếu muốn
    }
  } catch (error) {
    console.error("Lỗi kết nối ví:", error);
  }
};

const handleReject = async (userId) => {
  try {
    await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    // Sau khi từ chối, cập nhật lại danh sách người dùng chờ duyệt
    fetchPendingUsers();
    toast.success("Người dùng đã bị từ chối.");
  } catch (error) {
    console.error("Lỗi khi từ chối người dùng:", error);
    toast.error("Không thể từ chối người dùng.");
  }
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
          <div className="menu-link" onClick={() => setActiveTab("approval")}> <FontAwesomeIcon icon={faUserCheck} /><span>Approval</span></div>
          <div className="menu-link" onClick={() => setActiveTab("member")}> <FontAwesomeIcon icon={faUserCheck} /><span>Member</span></div>
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

{activeTab === "revenue" && (
  <div style={{ 
    padding: "20px", 
    textAlign: "center", 
    background: "#f5f7fa", 
    borderRadius: "8px", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
  }}>
    <h2 style={{ color: "#1890ff", marginBottom: "12px" }}>Revenue Reports</h2>
    <button
      onClick={() => navigate("/Revenuepage")}
      style={{
        backgroundColor: "#1890ff",
        color: "#fff",
        border: "none",
        padding: "10px 24px",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        transition: "background-color 0.3s ease"
      }}
      onMouseOver={e => (e.currentTarget.style.backgroundColor = "#40a9ff")}
      onMouseOut={e => (e.currentTarget.style.backgroundColor = "#1890ff")}
    >
      Go to Revenue Page
    </button>
  </div>
)}

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

        {activeTab === "approval" && (
  <>
    <h2>Danh sách đăng ký chờ xét duyệt</h2>
    {pendingUsers.length === 0 ? (
      <p>Không có yêu cầu nào đang chờ xét duyệt.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Date</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName || user.username}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.dob}</td>
              <td>
                <button onClick={() => handleApprove(user.id)}>Approval</button>
                <button onClick={() => handleReject(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </>
)}

{activeTab === "member" && (
  <>
    <h2>Danh sách Member</h2>
    {approvedUsers.length === 0 ? (
      <p>Chưa có Member.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>WalletAddress</th>
            <th>Level</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {approvedUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName || user.username}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.walletAddress}</td>
              <td>{user.level} ⭐</td>
              <td>
              {user.balance}$
              <br />
              <button
              onClick={() => handlePaymentToUser(user)}
              disabled={isPaying}
              >
              Thanh toán
              </button>
              </td>              
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </>
)}


{activeTab === "settings" && (
  <>
    <h2>Settings</h2>

<p>
  <strong>MetaMask status:</strong> {isConnected ? "✅ Đã kết nối" : "❌ Chưa kết nối"}
</p>
{!isConnected && (
  <button onClick={connectWallet} style={{ marginBottom: "10px" }}>
    Kết nối ví
  </button>
)}
    <label>Wallet Address:</label>
    <input
      type="text"
      value={walletAPIAddress}
      onChange={(e) => setWalletAPIAddress(e.target.value)}
    />
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
