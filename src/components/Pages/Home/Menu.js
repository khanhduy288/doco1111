import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Row, Col } from "antd";
import { Link } from "react-router-dom";
import"./Menu.css";



const Menu = () => {
  const [matches, setMatches] = useState([]);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [bettingLoading, setBettingLoading] = useState(false);
  const [betAmount, setBetAmount] = useState("0.01");
  const [now, setNow] = useState(Date.now());
  const [betsByMatchId, setBetsByMatchId] = useState({});
  const [allBets, setAllBets] = useState([]);
  const BET_API = "https://68271b3b397e48c913189c7d.mockapi.io/football";
  const [user, setUser] = useState(null);
  const [showCreateBetForm, setShowCreateBetForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const settledMatchIds = useRef([]); 
  const [systemMessage, setSystemMessage] = useState('Loading...');
    const [creatorInfo, setCreatorInfo] = useState({ name: "", level: "" });

  const [form, setForm] = useState({
    name: "",
    team1: "",
    team2: "",
    option1: "",
    option2: "",
    rate1: "1.85",
    rate2: "1.85",
    status1: "pending",
    status2: "pending",
    claim: "",
    time: "",
    iframe: "",
    countdown: "",
  });


  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);

    

  }, []);

  
  


  useEffect(() => {

    const storedUser = localStorage.getItem("SEPuser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

  }, []);

    const handleChange = (e) => {
      const { name, value } = e.target;
      if ((name === "rate1" || name === "rate2") && parseFloat(value) > 1.9) {
        return;
      }
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
const handleCreate = async (e) => { 
  e.preventDefault();

  const requiredFields = [
    "name", "team1", "team2",
    "option1", "option2",
    "rate1", "rate2",
    "status1", "status2"
  ];

  for (const field of requiredFields) {
    if (!form[field] || form[field].toString().trim() === "") {
      toast.error(`Vui lòng nhập đầy đủ trường: ${field}`);
      return;
    }
  }

  const now = Date.now();

  const isDuplicate = matches.some(match => 
    new Date(match.countdown).getTime() > now &&
    match.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
    match.team1.trim().toLowerCase() === form.team1.trim().toLowerCase() &&
    match.team2.trim().toLowerCase() === form.team2.trim().toLowerCase()
  );

  if (isDuplicate) {
    toast.error("Kèo đã tồn tại với name, team1, team2 trùng nhau và chưa hết thời gian countdown.");
    return;
  }

  // 🔽 Lấy id người tạo từ localStorage
const member = JSON.parse(localStorage.getItem("SEPuser"));
  const creatorId = member?.id;

  if (!creatorId) {
    toast.error("Không tìm thấy thông tin người tạo. Vui lòng đăng nhập lại.");
    return;
  }

  const payload = {
    ...form,
    time: new Date().toISOString(),
    sum1: 0,
    sum2: 0,
    status: "pending",
    creatorId, // 👈 thêm id người tạo vào payload
  };

  try {
    const res = await fetch(BET_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Create failed");

    toast.success("Tạo kèo thành công!");

    setForm({
      name: "",
      team1: "",
      team2: "",
      option1: "",
      option2: "",
      rate1: "1.85",
      rate2: "1.85",
      status1: "pending",
      status2: "pending",
      claim: "",
      time: "",
      iframe: "",
      countdown: "",
    });

    setShowCreateBetForm(false);
  } catch (error) {
    toast.error("Tạo kèo thất bại, vui lòng thử lại.");
  }
};



  

useEffect(() => {
  const fetchMatchesWithCreators = async () => {
    try {
      const res = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/football");
      const matchesData = await res.json();

      const enrichedMatches = await Promise.all(
        matchesData.map(async (match) => {
          const creator = await fetchCreatorInfo(match.creatorId);
          return { ...match, creator };
        })
      );

      setMatches(enrichedMatches);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu trận đấu");
    }
  };

  fetchMatchesWithCreators();
}, []);


useEffect(() => {
  if (window.ethereum) {
    const handleChainChanged = () => {
      window.location.reload(); // reload lại trang để đồng bộ chainId
    };
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }
}, []);


  useEffect(() => {
    fetch('/api/system-message')
      .then(res => res.json())
      .then(data => {
        setSystemMessage(data.message || 'No new announcements.');
      })
      .catch(() => {
        setSystemMessage('Failed to load system message.');
      });
  }, []);


useEffect(() => {
  if (expandedMatchId && !betsByMatchId[expandedMatchId]) {
    fetchBetsByMatch(expandedMatchId)
      .then((bets) => {
        setBetsByMatchId(prev => ({ ...prev, [expandedMatchId]: bets }));
      })
      .catch(() => toast.error("Lỗi tải dữ liệu cược"));
  }
}, [expandedMatchId]);

useEffect(() => {
  const fetchBets = async () => {
    try {
      const res = await fetch('https://68271b3b397e48c913189c7d.mockapi.io/bet');
      const data = await res.json();
      setAllBets(data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách cược:', err);
    }
  };

  fetchBets();
}, []);





useEffect(() => {
  const checkForExpiredMatches = async () => {
    const nowTime = Date.now();

    // Lọc những trận hết giờ, chưa settled và chưa xử lý trong ref
    const expiredMatches = matches.filter(
      (m) =>
        new Date(m.countdown).getTime() <= nowTime &&
        m.status !== "settled" &&
        !settledMatchIds.current.includes(m.id)
    );

    for (const match of expiredMatches) {
      try {
        const res = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet?matchId=${match.id}`);
        const allBets = await res.json();

        const team1Bets = allBets.filter((b) => b.team === match.option1 && b.status === "pending");
        const team2Bets = allBets.filter((b) => b.team === match.option2 && b.status === "pending");

        const sum1 = team1Bets.reduce((acc, b) => acc + Number(b.amount), 0);
        const sum2 = team2Bets.reduce((acc, b) => acc + Number(b.amount), 0);

        const diff = Math.abs(sum1 - sum2);
        const overSide = sum1 > sum2 ? team1Bets : team2Bets;

        let totalRefunded = 0;
        const refundBets = [];

        for (let i = overSide.length - 1; i >= 0 && totalRefunded < diff; i--) {
          const bet = overSide[i];
          const betAmount = Number(bet.amount);
          const remaining = diff - totalRefunded;
          const refundAmount = Math.min(betAmount, remaining);

          totalRefunded += refundAmount;

          if (refundAmount === betAmount) {
            await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${bet.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "refund",
                refund: refundAmount,
              }),
            });
            refundBets.push({ ...bet, status: "refund", refund: refundAmount });
          } else {
            await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${bet.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: betAmount - refundAmount,
              }),
            });

            const newRefundBet = {
              matchId: bet.matchId,
              team: bet.team,
              amount: refundAmount,
              userWallet: bet.userWallet,
              token: bet.token,
              timestamp: new Date().toISOString(),
              status: "refund",
              refund: refundAmount,
            };

            const createRes = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newRefundBet),
            });

            const createdBet = await createRes.json();
            refundBets.push(createdBet);
          }
        }

        await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/football/${match.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "settled" }),
        });

        // Đánh dấu trận đã xử lý
        settledMatchIds.current.push(match.id);

        if (refundBets.length > 0) {
          toast.info(`Đã hoàn tiền ${refundBets.length} đơn cược lệch kèo ở trận ${match.team1} vs ${match.team2}`);
        }
      } catch (err) {
        console.error("Lỗi khi xử lý refund:", err);
      }
    }
  };

  const interval = setInterval(() => {
    const hasUnsettled = matches.some(
      (m) =>
        new Date(m.countdown).getTime() <= Date.now() &&
        m.status !== "settled" &&
        !settledMatchIds.current.includes(m.id)
    );

    if (hasUnsettled) {
      checkForExpiredMatches();
    }
  }, 1000);

  return () => clearInterval(interval);
}, [matches]);


const fetchCreatorInfo = async (creatorId) => {
  try {
    const res = await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${creatorId}`);
    const data = await res.json();
    return { name: data.fullName, level: data.level };
  } catch (err) {
    console.error("Lỗi lấy thông tin người tạo:", err);
    return { name: "Không rõ", level: 0 };
  }
};



const fetchBetsByMatch = async (matchId) => {
  const res = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet?matchId=${matchId}`);
  if (!res.ok) throw new Error("Lỗi khi lấy danh sách cược");
  return await res.json();
};


const ALLOWED_CHAIN_ID = 56n;
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // USDT trên BSC

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)"
];



  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Vui lòng cài đặt MetaMask để đặt cược!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      toast.success("Kết nối ví thành công!");
    } catch (err) {
      toast.error("Kết nối ví thất bại");
    }
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return "Đã kết thúc";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

const switchToBSC = async () => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }], // 0x38 = 56 decimal
    });
    toast.success("Đã chuyển sang mạng BSC");
    return true;
  } catch (switchError) {
    // Nếu mạng chưa có trong MetaMask, yêu cầu add mạng mới
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x38",
              chainName: "Binance Smart Chain Mainnet",
              nativeCurrency: {
                name: "Binance Coin",
                symbol: "BNB",
                decimals: 18,
              },
              rpcUrls: ["https://bsc-dataseed.binance.org/"],
              blockExplorerUrls: ["https://bscscan.com"],
            },
          ],
        });
        toast.success("Đã thêm mạng BSC và chuyển đổi thành công");
        return true;
      } catch (addError) {
        toast.error("Không thể thêm mạng BSC");
        return false;
      }
    } else {
      toast.error("Không thể chuyển sang mạng BSC");
      return false;
    }
  }
};



const placeBet = async (matchId, team, rate, matchName) => {
  console.log("placeBet is called with", matchId, team, "Rate:", rate, matchName);

  if (!currentAccount) {
    toast.warning("Vui lòng kết nối ví MetaMask trước.");
    return;
  }

  if (!betAmount || isNaN(betAmount) || Number(betAmount) <= 0) {
    toast.error("Vui lòng nhập số tiền cược hợp lệ.");
    return;
  }

  setBettingLoading(true);

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    if (network.chainId !== ALLOWED_CHAIN_ID) {
      const switched = await switchToBSC();
      if (!switched) {
        toast.error("Không thể chuyển sang mạng BSC.");
        setBettingLoading(false);
        return;
      }

      window.ethereum.once("chainChanged", async () => {
        setTimeout(() => {
          placeBet(matchId, team, rate, matchName);
        }, 1000);
      });

      setBettingLoading(false);
      return;
    }

    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);

    const decimals = await usdt.decimals();
    const betAmountInUnits = ethers.parseUnits(betAmount, decimals);

    const balance = await usdt.balanceOf(userAddress);
    if (balance < betAmountInUnits) {
      toast.error("Số dư USDT không đủ.");
      setBettingLoading(false);
      return;
    }

    const recipient = "0x65d7d2381b18ab6fbaa980f1eb550672af50710b";

    const allowance = await usdt.allowance(userAddress, recipient);
    if (allowance < betAmountInUnits) {
      const approveTx = await usdt.approve(recipient, betAmountInUnits);
      toast.info("Đang gửi giao dịch approve...");
      await approveTx.wait();
    }

    const transferTx = await usdt.transfer(recipient, betAmountInUnits);
    toast.info("Đang gửi giao dịch USDT...");
    await transferTx.wait();

    const claim = Number((Number(betAmount) * Number(rate)).toFixed(4));

    // 1. Lưu cược vào /bet
    const betData = {
      matchId,
      team,
      amount: Number(betAmount),
      matchName,
      userWallet: userAddress,
      token: "USDT",
      timestamp: new Date().toISOString(),
      status: "pending",
      txHash: transferTx.hash,
      claim,
    };

    const res = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/bet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(betData),
    });

    if (!res.ok) {
      toast.error("Lưu đơn cược thất bại.");
      setBettingLoading(false);
      return;
    }

    // 2. Cập nhật sum1 hoặc sum2 vào /matches
    const matchRes = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/football/${matchId}`);
    const matchData = await matchRes.json();
    let updatedMatch = { ...matchData };
    const betValue = Number(betAmount);

    if (team === matchData.option1) {
      updatedMatch.sum1 = (Number(matchData.sum1) || 0) + betValue;
    } else if (team === matchData.option2) {
      updatedMatch.sum2 = (Number(matchData.sum2) || 0) + betValue;
    }

    const updateRes = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/football/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMatch),
    });

    if (updateRes.ok) {
      toast.success("Cược thành công và đã cập nhật tổng cược!");

      // --- FETCH LẠI trận đấu để cập nhật sum1, sum2 mới nhất ---
      const refreshedRes = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/football/${matchId}`);
      const refreshedMatch = await refreshedRes.json();

      // --- Cập nhật matches state (giả sử bạn có setMatches và matches ở component) ---
      setMatches((prevMatches) =>
        prevMatches.map((m) => (m.id === matchId ? refreshedMatch : m))
      );
    } else {
      toast.warning("Cược thành công nhưng cập nhật tổng cược thất bại.");
    }
  } catch (error) {
    console.error(error);
    toast.error("Lỗi khi đặt cược: " + (error.reason || error.message));
  }

  setBettingLoading(false);
  console.log("Đặt cược vào trận:", matchName);

};

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Nút toggle menu */}
      {user && (
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Đóng menu" : "Mở menu"}
          title={sidebarOpen ? "Đóng menu" : "Mở menu"}
        >
          {sidebarOpen ? "×" : "☰"}
        </button>
      )}

      {/* Sidebar menu */}
      {user && sidebarOpen && (
        <nav className="sidebar-menu">
          <h3>Menu</h3>
          <ul>
            <li>
              <Button
                type="primary"
                block
                onClick={() => setShowCreateBetForm((v) => !v)}
              >
                {showCreateBetForm ? "Open Create Form" : "Create Bet"}
              </Button>
            </li>
            <li>
              <Link to="/result">
                <Button block>Result</Button>
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <div
        className="home container"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          paddingLeft: user && sidebarOpen ? "220px" : "20px",
          transition: "padding-left 0.3s ease",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 0,
        }}
      ></div>
{showCreateBetForm && (
          <form className="form" onSubmit={handleCreate} noValidate>
            <input name="name" placeholder="Match Name" value={form.name} onChange={handleChange} />
            <input name="team1" placeholder="Team 1" value={form.team1} onChange={handleChange} />
            <input name="team2" placeholder="Team 2" value={form.team2} onChange={handleChange} />
            <input name="option1" placeholder="Option 1" value={form.option1} onChange={handleChange} />
            <input name="option2" placeholder="Option 2" value={form.option2} onChange={handleChange} />
            <input
              name="rate1"
              placeholder="Rate 1"
              type="number"
              step="0.01"
              max="1.90"
              value={form.rate1}
              onChange={handleChange}
            />
            <input
              name="rate2"
              placeholder="Rate 2"
              type="number"
              step="0.01"
              max="1.90"
              value={form.rate2}
              onChange={handleChange}
            />
            <select name="countdown" value={form.countdown} onChange={handleChange}>
  <option value="">Chọn thời gian đếm ngược</option>
  {Array.from({ length: 17 }, (_, i) => i + 1).map((minute) => {
    const futureTime = new Date(Date.now() + minute * 60000).toISOString();
    return (
      <option key={minute} value={futureTime}>
        {minute} phút
      </option>
    );
  })}
</select>

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
            <input name="iframe" placeholder="Iframe" value={form.iframe} onChange={handleChange} />
            <button type="submit" className="btn btn-primary">
              Create Bet
            </button>
          </form>
        )}  

      <div className="container">
    <div className="ads-section">
      <a href="/guide" className="ad-box">
        <strong>Newbie Guide:</strong> Learn how to place bets and join easily.
      </a>
      <a href="/guide" className="ad-box">
        <strong>System Announcement:</strong> {systemMessage}
      </a>
      <a href="/guide" className="ad-box">
        <strong>Exclusive Offer:</strong> Get up to 5% bonus as a member!
      </a>
    </div>
  {!currentAccount ? (
    <button className="wallet-btn" onClick={connectWallet}>
      Kết nối ví MetaMask
    </button>
  ) : (
    <p>Đã kết nối ví: {currentAccount}</p>
  )}

  <h1 style={{ textAlign: "center", color: "#007bff", fontSize: "2rem", marginBottom: "20px" }}>
    List Bet
  </h1>

  {matches
    .filter((match) => new Date(match.countdown).getTime() > now)
    .map((match) => {
      const countdownMs = new Date(match.countdown).getTime() - now;

      return (
        <div
          key={match.id}
          className="match-card"
          onClick={() =>
            setExpandedMatchId(expandedMatchId === match.id ? null : match.id)
          }
        >
<div className="match-header">
  <span>
    {match.team1} vs {match.team2}
  </span>
  <span>{formatCountdown(countdownMs)}</span>
  <div>
    👤 {match.creator?.name || "Hidden"} - ⭐ {match.creator?.level || 0}
  </div>
  <div>
    🏁 {match.winningTeam ? match.winningTeam : "In progress"}
  </div>
</div>



{expandedMatchId === match.id && (
  <div className="bet-options" onClick={(e) => e.stopPropagation()}>
    {/* Phần nút chuyển hướng thay cho video */}
    {match.iframe && (
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}
      >
        {match.iframe.split(",").map((link, i) => (
          <button
            className="view-video-btn"
            key={i}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              borderRadius: "6px",
              border: "1px solid #007bff",
              backgroundColor: "#007bff",
              color: "white",
              flex: "1",
              minWidth: "150px"
            }}
            onClick={() => window.open(link.trim(), "_blank")}
          >
            Link {i + 1}
          </button>
        ))}
      </div>
    )}

    {/* Phần cược như cũ */}
<div className="bet-row">
  {[
    { team: match.option1, rate: match.rate1, sum: match.sum1 },
    { team: match.option2, rate: match.rate2, sum: match.sum2 }
  ].map((option, idx) => (
    <div key={idx} className="bet-column">
      <button
        disabled={bettingLoading}
        className="bet-btn"
        onClick={() =>
          placeBet(match.id, option.team, option.rate, match.name) // 👈 thêm match.name vào đây
        }
      >
        Bet on {option.team} ({option.rate})
      </button>
      <div className="bet-sum">
        Total bet: <strong>{Number(option.sum || 0).toFixed(3)} USDT</strong>
      </div>

      <div className="bet-list">
        {allBets
          .filter(
            (bet) =>
              bet.matchId === match.id.toString() &&
              bet.team === option.team
          )
          .map((bet, index) => (
            <div key={index} className="bet-item">
              <span>{bet.amount} {bet.token}</span>
              <span className="wallet">{bet.userWallet.slice(0, 6)}...</span>
            </div>
          ))}
      </div>
    </div>
  ))}
</div>


    <input
      type="number"
      step="0.001"
      min="0.001"
      className="bet-input"
      placeholder="Enter bet amount (USDT)"
      value={betAmount}
      onChange={(e) => setBetAmount(e.target.value)}
      disabled={bettingLoading}
    />
  </div>
)}
        </div>
      );
    })}
  {matches.filter((m) => new Date(m.countdown).getTime() > now).length === 0 && (
    <p>Không có kèo cược nào đang mở.</p>
  )}
</div>

    </>
  );
};

export default Menu;