import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams } from 'react-router-dom';
import {
  faBox,
  faChartLine,
  faFileInvoice,
  faSignOutAlt,
  faCog,
  faBars,
  faGavel,
  faUserCheck,
  faUser,
  faWallet
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Dashbroad.css';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BETLIST_API = "https://68271b3b397e48c913189c7d.mockapi.io/bet";
const BET_API = "https://68271b3b397e48c913189c7d.mockapi.io/football";
const WALLET_API = "https://681de07ac1c291fa66320473.mockapi.io/addressqr/wallet";
const ETHERSCAN_API_KEY = "K2IPH3NSF9MB2FZ4CCP4FBK14ESWRTCVMM";

const DashboardMember = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bets");
  const [betList, setBetList] = useState([]);
  const [formBet, setFormBet] = useState({});
  const [isEditingBet, setIsEditingBet] = useState(false);
  const [editBetId, setEditBetId] = useState(null);
  const [bets, setBets] = useState([]);
  const [form, setForm] = useState({ name: "", teamA: "", teamB: "", option1: "",option2:"",rate1:"",rate2:"",status1:"",status2:"",claim:"", time: "",iframe:"" });  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletAPIAddress, setWalletAPIAddress] = useState("");
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [email, setEmail] = useState("");
const [phoneNumber, setPhoneNumber] = useState("");
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const toggleNav = () => setIsNavOpen(!isNavOpen);

  useEffect(() => {
  // Gọi API lấy thông tin user khi component mount
  async function fetchUserData() {
    try {
      const res = await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${id}`);
      const data = await res.json();
      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  }

  

  fetchUserData();
}, [id]); // chạy khi id thay đổi

  useEffect(() => {
  // Giả sử bạn đã có userData từ fetch
  if (userData) {
    setEmail(userData.email || "");
    setPhoneNumber(userData.phoneNumber || "");
    setWalletAPIAddress(userData.walletAddress || "");
  }
}, [userData]);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${id}`);
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  if (id) fetchUser();
}, [id]);



  useEffect(() => {
    
    if (activeTab === "bets") fetchBets();
    if (activeTab === "revenue") fetchBetList();
    if (["transactions", "settings"].includes(activeTab)) fetchWallet();
    if (activeTab === "approval") fetchPendingUsers();
  }, [activeTab]);

  const fetchBets = async () => {
    const res = await fetch(BET_API);
    const data = await res.json();
    setBets(data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    await fetch(BET_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", team1: "", team2: "", option1: "",option2:"",rate1:"",rate2:"",status1:"pendding",status2:"pendding",claim:"", time: "", status:"pendding", iframe:"" });
    fetchBets();
  };

  const handleEdit = (bet) => {
    setIsEditing(true);
    setEditId(bet.id);
    setForm({ name: bet.name, teamA: bet.team1, teamB: bet.team2, option1: bet.option1,option2: bet.option2,rate1:bet.rate1,rate2:bet.rate2,status1:bet.status1, status2:bet.status2, time: bet.countdown, iframe: bet.iframe });
  };

  const handleUpdate = async () => {
    await fetch(`${BET_API}/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", team1: "", team2: "", option1: "",option2:"",rate1:"",rate2:"",status1:"",status2:"", time: "",status:"pending", iframe:"" });
    setIsEditing(false);
    fetchBets();
  };

  const handleDelete = async (id) => {
    await fetch(`${BET_API}/${id}`, { method: "DELETE" });
    fetchBets();
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

  const fetchBetList = async () => {
  const res = await fetch(BETLIST_API);
  const data = await res.json();
  setBetList(data);
};

const handleCreateBet = async () => {
  await fetch(BETLIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formBet),
  });
  setFormBet({});
  fetchBetList();
};

const handleEditBet = (bet) => {
  setFormBet(bet);
  setEditBetId(bet.id);
  setIsEditingBet(true);
};

const handleUpdateBet = async () => {
  await fetch(`${BETLIST_API}/${editBetId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formBet),
  });
  setFormBet({});
  setIsEditingBet(false);
  fetchBetList();
};

const handleDeleteBet = async (id) => {
  await fetch(`${BETLIST_API}/${id}`, { method: "DELETE" });
  fetchBetList();
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

const saveAccountInfo = async () => {
  if (!userData || !userData.id) {
    alert("User ID is missing");
    return;
  }

  setIsSavingWallet(true);

  try {
    const response = await fetch(
      `https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${userData.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          phoneNumber: phoneNumber,
          walletAddress: walletAPIAddress
        })
      }
    );

    if (!response.ok) throw new Error("Failed to update");

    alert("Account information updated successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to update account information");
  } finally {
    setIsSavingWallet(false);
  }
};





  const handleApprove = async (userId) => {
    try {
      await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      fetchPendingUsers();
      toast.success("Người dùng đã được duyệt.");
    } catch (error) {
      console.error("Lỗi khi duyệt người dùng:", error);
      toast.error("Không thể duyệt người dùng.");
    }
  };

  const handleReject = async (userId) => {
    try {
      await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      fetchPendingUsers();
      toast.success("Người dùng đã bị từ chối.");
    } catch (error) {
      console.error("Lỗi khi từ chối người dùng:", error);
      toast.error("Không thể từ chối người dùng.");
    }
  };

  return (
    <div className="dashboard-container">
<header className="header">
  {userData && (
    <div className="member-info" style={{ position: 'absolute', right: '20px', top: '10px' }}>
<span>
  <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
  {userData.fullName}
</span>
&nbsp;|&nbsp;
<span>
  <FontAwesomeIcon icon={faWallet} style={{ marginRight: '5px' }} />
  Balance: {userData.balance ?? 0} USDT
</span>
    </div>
  )}
</header>

      <div className={`sidebar ${isNavOpen ? "open" : ""}`}>
        <div className="nav-links">
          <div className="menu-link" onClick={() => setActiveTab("bets")}> <FontAwesomeIcon icon={faBox} /><span>Bets</span> </div>
          <div className="menu-link" onClick={() => setActiveTab("revenue")}> <FontAwesomeIcon icon={faChartLine} /><span>Revenue</span> </div>
          <div className="menu-link" onClick={() => setActiveTab("transactions")}> <FontAwesomeIcon icon={faFileInvoice} /><span>Transactions</span> </div>
          <div className="menu-link" onClick={() => setActiveTab("approval")}> <FontAwesomeIcon icon={faUserCheck} /><span>Approval</span></div>
          <div className="menu-link" onClick={() => setActiveTab("settings")}> <FontAwesomeIcon icon={faCog} /><span>Settings</span> </div>
          <div className="menu-link" onClick={() => navigate("/")}> <FontAwesomeIcon icon={faSignOutAlt} /><span>Logout</span> </div>
        </div>
      </div>

      <div className="main-content">
      {activeTab === "bets" && (
  <>
    <h2>Bet Management</h2>
    <div className="form">
      <input name="name" placeholder="Match Name" value={form.name} onChange={handleChange} />
      <input name="team1" placeholder="Team 1" value={form.team1} onChange={handleChange} />
      <input name="team2" placeholder="Team 2" value={form.team2} onChange={handleChange} />
      <input name="option1" placeholder="Option 1" value={form.option1} onChange={handleChange} />
      <input name="option2" placeholder="Option 2" value={form.option2} onChange={handleChange} />
      <input name="rate1" placeholder="Rate 1" type="number" value={form.rate1} onChange={handleChange} />
      <input name="rate2" placeholder="Rate 2" type="number" value={form.rate2} onChange={handleChange} />
      <input name="countdown" placeholder="Countdown" type="datetime-local" value={form.countdown} onChange={handleChange} />
      <select name="status1" value={form.status1} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>
      <select name="status2" value={form.status2} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>
      <input name="iframe" placeholder="Iframe"  value={form.iframe} onChange={handleChange} />
      {isEditing ? (
        <button onClick={handleUpdate}>Update</button>
      ) : (
        <button onClick={handleCreate}>Create</button>
      )}
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Team 1</th>
          <th>Team 2</th>
          <th>Option 1</th>
          <th>Option 2</th>
          <th>Rate 1</th>
          <th>Rate 2</th>
          <th>Status 1</th>
          <th>Status 2</th>
          <th>Countdown</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {bets.map((bet) => (
          <tr key={bet.id}>
            <td>{bet.name}</td>
            <td>{bet.team1}</td>
            <td>{bet.team2}</td>
            <td>{bet.option1}</td>
            <td>{bet.option2}</td>
            <td>{bet.rate1}</td>
            <td>{bet.rate2}</td>
            <td>{bet.status1}</td>
            <td>{bet.status2}</td>
            <td>{new Date(bet.countdown).toLocaleString()}</td>
            <td>
              <button onClick={() => handleEdit(bet)}>Edit</button>
              <button onClick={() => handleDelete(bet.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}


{activeTab === "revenue" && (
  <>
    <h2>Bet List Management</h2>
<div className="form">
  <input
    name="userWallet"
    placeholder="User Wallet"
    value={formBet.userWallet || ""}
    onChange={(e) => setFormBet({ ...formBet, userWallet: e.target.value })}
  />
  <input
    name="amount"
    placeholder="Amount"
    value={formBet.amount || ""}
    onChange={(e) => setFormBet({ ...formBet, amount: e.target.value })}
  />
  <input
    name="matchId"
    placeholder="Match ID"
    value={formBet.matchId || ""}
    onChange={(e) => setFormBet({ ...formBet, matchId: e.target.value })}
  />
  <input
    name="team"
    placeholder="Team Bet On"
    value={formBet.team || ""}
    onChange={(e) => setFormBet({ ...formBet, team: e.target.value })}
  />
  <input
    name="token"
    placeholder="Token (e.g. USDT)"
    value={formBet.token || ""}
    onChange={(e) => setFormBet({ ...formBet, token: e.target.value })}
  />
  <input
    name="status"
    placeholder="Status"
    value={formBet.status || ""}
    onChange={(e) => setFormBet({ ...formBet, status: e.target.value })}
  />
  <input
    name="txHash"
    placeholder="Transaction Hash"
    value={formBet.txHash || ""}
    onChange={(e) => setFormBet({ ...formBet, txHash: e.target.value })}
  />
  {isEditingBet ? (
    <button onClick={handleUpdateBet}>Update</button>
  ) : (
    <button onClick={handleCreateBet}>Create</button>
  )}
</div>


<table>
  <thead>
    <tr>
      <th>User Wallet</th>
      <th>Amount</th>
      <th>Match ID</th>
      <th>Team</th>
      <th>Token</th>
      <th>Status</th>
      <th>TxHash</th>
      <th>Claim</th>
      <th>Time</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {betList.map((bet) => (
      <tr key={bet.id}>
        <td>{bet.userWallet}</td>
        <td>{bet.amount}$</td>
        <td>{bet.matchId}</td>
        <td>{bet.team}</td>
        <td>{bet.token}</td>
        <td>{bet.status}</td>
        <td style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {bet.txHash}
        </td>
        <td>{bet.claim}$</td>
        <td>{new Date(bet.timestamp).toLocaleString()}</td>
        <td>
          <button onClick={() => handleEditBet(bet)}>Edit</button>
          <button onClick={() => handleDeleteBet(bet.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
  </>
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

{activeTab === "settings" && (
  <div className="settings-tab" style={{ maxWidth: "500px", marginTop: "20px" }}>
    <h3 style={{ marginBottom: "20px" }}>Account Settings</h3>

    <div className="form-group" style={{ marginBottom: "15px" }}>
      <label style={{ fontWeight: "bold" }}>Email:</label>
      <input
        type="email"
        className="form-control"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
    </div>

    <div className="form-group" style={{ marginBottom: "15px" }}>
      <label style={{ fontWeight: "bold" }}>Phone Number:</label>
      <input
        type="text"
        className="form-control"
        value={phoneNumber}
        onChange={e => setPhoneNumber(e.target.value)}
        placeholder="Enter your phone number"
      />
    </div>

    <div className="form-group" style={{ marginBottom: "15px" }}>
      <label style={{ fontWeight: "bold" }}>Wallet Address:</label>
      <input
        type="text"
        className="form-control"
        value={walletAPIAddress}
        onChange={e => setWalletAPIAddress(e.target.value)}
        placeholder="Enter your wallet address"
      />
    </div>

    <button
      className="btn btn-primary"
      onClick={saveAccountInfo}
      disabled={isSavingWallet}
    >
      {isSavingWallet ? "Saving..." : "Save Changes"}
    </button>
  </div>
)}
      </div>
    </div>
  );
};

export default DashboardMember;
