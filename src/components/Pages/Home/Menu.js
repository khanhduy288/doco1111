import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import Header from '../Layout/Header';  // phải import Header mới dùng được
import { SiBinance } from 'react-icons/si';

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
  const [userInfo, setUserInfo] = useState(null);
  const [activeOption, setActiveOption] = React.useState(null); // lưu option đang đặt cược (team hoặc id)
  const [updateTick, setUpdateTick] = React.useState(0);
  const [tab, setTab] = useState("live");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showTabMenu, setShowTabMenu] = useState(false);  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [focusedInput, setFocusedInput] = useState(null);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const [form, setForm] = useState({
  name: "",
  team1: "",
  team2: "",
  iframe: "",
  iframe2: "",
  matchType: "top_win_bot_lose", // Mặc định chọn "Top Win / Bot Lose"
  option1: "",
  option2: "",
  rate1: "1.85",
  rate2: "1.85",
  status1: "pending",
  status2: "pending",
  countdown: "",
  claim: "",
  time: "",
});



  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);

    

  }, []);

  const forceUpdate = () => {
  setUpdateTick(prev => prev + 1);
};
  


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

  const requiredFields = ["name", "team1", "team2", "iframe", "countdown"];

  for (const field of requiredFields) {
    if (!form[field] || form[field].toString().trim() === "") {
      toast.error(`Please fill out the required field: ${field}`);
      return;
    }
  }

  // Kiểm tra URL hợp lệ
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!isValidUrl(form.iframe)) {
    toast.error("Iframe Link 1 is not a valid URL.");
    return;
  }

  if (form.matchType === "top_win_bot_lose" && form.iframe2 && !isValidUrl(form.iframe2)) {
    toast.error("Iframe Link 2 is not a valid URL.");
    return;
  }

  const now = Date.now();

  const isDuplicate = matches.some((match) =>
    new Date(match.countdown).getTime() > now &&
    match.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
    match.team1.trim().toLowerCase() === form.team1.trim().toLowerCase() &&
    match.team2.trim().toLowerCase() === form.team2.trim().toLowerCase()
  );

  if (isDuplicate) {
    toast.error("A match with the same name and teams already exists and hasn't expired.");
    return;
  }

  const member = JSON.parse(localStorage.getItem("SEPuser"));
  const creatorId = member?.id;

  if (!creatorId) {
    toast.error("Creator information not found. Please log in again.");
    return;
  }

const payload = {
  ...form,
  iframe:
    form.matchType === "top_win_bot_lose" && form.iframe2
      ? `${form.iframe},${form.iframe2}`
      : form.iframe, 
  option1: `${form.team1} Win`,
  option2: `${form.team2} Win`,
  rate1: "1.85",
  rate2: "1.85",
  status1: "pending",
  status2: "pending",
  time: new Date().toISOString(),
  sum1: 0,
  sum2: 0,
  status: "pending",
  creatorId,
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
      iframe: "",
      iframe2: "",
      countdown: "",
      matchType: "top_win_bot_lose",
    });

    setShowCreateBetForm(false);
  } catch (error) {
    toast.error("Failed to create match. Please try again.");
  }
};



  useEffect(() => {
    // Khi component mount, kiểm tra kích thước màn hình
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // màn hình desktop (tùy chỉnh ngưỡng 768px)
        setSidebarOpen(true);
      } else {
        // màn hình điện thoại
        setSidebarOpen(false);
      }
    };

    handleResize(); // chạy 1 lần khi mount

    // (Không bắt buộc) nếu muốn menu tự động đóng mở khi resize window
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

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
       .catch(() => {
        // Bỏ qua lỗi, không hiện toast, không làm gì
      });
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

        if (!res.ok) {
          // Nếu fetch lỗi (có thể 404), coi như trận hết countdown mà k có cược => xóa trận
          setMatches((prev) => prev.filter((m) => m.id !== match.id));
          settledMatchIds.current.push(match.id);
          continue;
        }

        const allBets = await res.json();

        // Nếu hết countdown mà không có cược
        if (allBets.length === 0) {
          // Xóa trận khỏi danh sách
          setMatches((prev) => prev.filter((m) => m.id !== match.id));
          settledMatchIds.current.push(match.id);
          continue;
        }

        // Tiếp tục xử lý refund nếu có cược như cũ
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
}, [matches, setMatches]); // nhớ thêm setMatches vào deps nếu bạn khai báo từ state



const fetchCreatorInfo = async (creatorId) => {
  try {
    const res = await fetch(`https://berendersepuser.onrender.com/users/${creatorId}`, {
      headers: {
        'x-secret-key': 'adminsepuser'
      }
    });

    if (!res.ok) throw new Error("Không lấy được dữ liệu");

    const data = await res.json();
    return { name: data.fullName, level: data.level };
  } catch (err) {
    console.error("Lỗi lấy thông tin người tạo:", err);
    return { name: "", level: 0 };
  }
};


  const handleFocus = (field) => {
    setFocusedInput(field);
  };

  const handleBlur = () => {
    setFocusedInput(null);
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
      toast.success("Success Connect!");
    } catch (err) {
      toast.error("Error Connect!");
    }
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return "Locked ";
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
    forceUpdate(); // ép render lại

};


const filteredMatches = matches.filter(match => {
  const countdownTime = new Date(match.countdown).getTime();

  if (tab === "live") {
    return countdownTime > now;
  } else if (tab === "history") {
    return countdownTime <= now && countdownTime >= startOfDay.getTime() && countdownTime <= endOfDay.getTime();
  }
  return false;
});


// Danh sách thời gian và round tương ứng (từ 17p đến 5p)
const rounds = [
  { time: 17, round: "1.1" },
  { time: 16, round: "2.1" },
  { time: 15, round: "2.2" },
  { time: 14, round: "2.3" },
  { time: 13, round: "2.4" },
  { time: 12, round: "2.5" },
  { time: 11, round: "2.6" },
  { time: 10, round: "3.1" },
  { time: 9,  round: "3.2" },
  { time: 8,  round: "3.3" },
  { time: 7,  round: "3.4" },
  { time: 6,  round: "3.5" },
  { time: 5,  round: "3.6" },
];



  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Nút toggle menu */}



      {/* Sidebar menu */}

<div
  style={{
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: '20px',
  }}
>
  {!currentAccount ? (
    <button className="wallet-btn" onClick={connectWallet}>
      Connect Wallet
    </button>
  ) : (
    <div
      className="wallet-display"
      title={currentAccount} // hiển thị toàn bộ địa chỉ khi hover
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#1b1b21',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        cursor: 'default',
        color:"#00bcd4",
        marginTop:"10px"
      }}
    >
      <SiBinance size={20} color="#F3BA2F" />
      <span>
        {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
      </span>
    </div>
  )}
</div>



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
  <form className="form" onSubmit={handleCreate} noValidate style={{ position: "relative" }}>
    {/* Close Button */}
    <button
      type="button"
      className="close-btn"
      onClick={() => setShowCreateBetForm(false)}
      aria-label="Close form"
      style={{
        position: "absolute",
        top: "-16px",
        right: "-7px",
        background: "transparent",
        border: "none",
        fontSize: "24px",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      &times;
    </button>

    {/* Match Type */}
    <div className="form-row">
      <select
        name="matchType"
        value={form.matchType || "top_win_bot_lose"}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            matchType: e.target.value,
            team1: "",
            team2: "",
            iframe2: "",
            option1: "",
          }))
        }
      >
        <option value="top_win_bot_lose">Top Win / Bot Lose</option>
        <option value="temporary_ranking" >Temporary Top Ranking</option>
      </select>
    </div>

    {/* Match Name */}
    <div className="form-row">
      <input
        name="name"
        placeholder="Match Name"
        value={form.name}
        onChange={handleChange}
      />
    </div>

    {/* Iframe(s) */}
    <div className="form-row">
      <input
        name="iframe"
        placeholder="Link video team 1"
        value={form.iframe}
        onChange={handleChange}
      />
      {form.matchType === "top_win_bot_lose" && (
        <input
          name="iframe2"
          placeholder="Link video team 2"
          value={form.iframe2 || ""}
          onChange={handleChange}
        />
      )}
    </div>

    {/* Team Select */}
<div className="form-row" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

        <input
          name="team1"
          placeholder="Team 1"
          value={form.team1}
          onChange={handleChange}
          required
          onFocus={() => handleFocus("team1")}
          onBlur={handleBlur}
          style={{ position: "relative" }}
        />
        {focusedInput === "team1" && (
          <div
            style={{
              color: "#d32f2f",
              fontSize: "0.8em",
              marginTop: "4px",
              backgroundColor: "#ffe6e6",
              padding: "6px 10px",
              borderRadius: "4px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              maxWidth: "500px",
            }}
          >
    Please enter a valid name. Incorrect input may result in your account being locked.
          </div>
        )}


        <input
          name="team2"
          placeholder="Team 2"
          value={form.team2}
          onChange={handleChange}
          required
          onFocus={() => handleFocus("team2")}
          onBlur={handleBlur}
          style={{ position: "relative" }}
        />
        {focusedInput === "team2" && (
          <div
            style={{
              color: "#d32f2f",
              fontSize: "0.8em",
              marginTop: "4px",
              backgroundColor: "#ffe6e6",
              padding: "6px 10px",
              borderRadius: "4px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              maxWidth: "500px",
            }}
          >
    Please enter a valid name. Incorrect input may result in your account being locked.
          </div>
        )}
      </div>

    {/* Countdown */}
<div className="form-row">
  <select name="countdown" value={form.countdown} onChange={handleChange}>
    <option value="">Select countdown duration</option>
    {rounds.map(({ time, round }) => {
      const futureTime = new Date(Date.now() + time * 60000).toISOString();
      return (
        <option key={time} value={futureTime}>
          {time} minutes (Round {round})
        </option>
      );
    })}
  </select>
</div>

    {/* Submit */}
    <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
<button type="submit" className="btn-create">
  Create Bet
</button>

    </div>
  </form>
)}





      <div className="container">
<div className="ads-section">
  <a href="/guide" className="ad-box">
    <strong>Newbie Guide</strong><span className="after-title">On mobile, you need to use the MetaMask in-app browser
</span>
  </a>
  <a href="/guide" className="ad-box">
    <strong>Announcement</strong><span className="after-title">{systemMessage}</span> 
  </a>
  <a href="/guide" className="ad-box">
    <strong>Rule</strong> <span className="after-title">Get up to 5% bonus as a member!</span>
  </a>
</div>


  
<div className="header-container">
  <div className="header-title">
    <h1>List Board</h1>
  </div>
  <div className="header-row">
<div className="left-buttons">
  {/* + Board */}
  <div className="tooltip-wrapper">
    <button
      onClick={() => setShowCreateBetForm(v => !v)}
      className="header-btn"
    >
      <span className="plus-icon">✛</span>
      <span style={{ fontWeight: "bold" }}>Board</span>
    </button>
    <div className="tooltip-text">Create a new betting board</div>
  </div>

  {/* ⓘ Result */}
  <div className="tooltip-wrapper">
    <button
      onClick={() => (window.location.href = "/result")}
      className="header-btn"
    >
      ⓘ Result
    </button>
    <div className="tooltip-text">Only available for 5-star accounts</div>
  </div>

  {/* 🔍 Search Input */}
<input
  type="text"
  className="search-input"
  placeholder="🔍 Search..."
  // onChange={(e) => handleSearch(e.target.value)}
/>


</div>

    <div className="tab-menu-wrapper" style={{ position: "relative" }}>
      <button
        className="tab-toggle-btn"
        onClick={() => setShowTabMenu(prev => !prev)}
      >
        ⋮
      </button>
{showTabMenu && (
  <div className="tab-menu">
    <button
      onClick={() => {
        setTab("live");
        setShowTabMenu(false);
      }}
      className={`tab-item ${tab === "live" ? "active" : ""}`}
    >
      Live
    </button>

    <button
      onClick={() => {
        setTab("processing");
        setShowTabMenu(false);
      }}
      className={`tab-item ${tab === "processing" ? "active" : ""}`}
    >
      Processing
    </button>

    <button
      onClick={() => {
        setTab("history");
        setShowTabMenu(false);
      }}
      className={`tab-item ${tab === "history" ? "active" : ""}`}
    >
      History
    </button>
  </div>
)}

    </div>
  </div>
</div>



 


 {matches
.filter((match) => {
  const matchTime = new Date(match.countdown).getTime();

  if (tab === "live") return matchTime > now;
  if (tab === "history") return matchTime <= now - 3600000; // Lịch sử: trước 1h
  if (tab === "processing") {
    return (
      !match.winningTeam &&
      matchTime > now - 3600000 &&
      matchTime <= now
    );
  }

  return true; // fallback
})

      .map((match) => {
        const countdownMs = new Date(match.countdown).getTime() - now;
        const isExpandable = tab === "live"; // chỉ live mới cho mở rộng

        return (
       <div
            key={match.id}
            className="match-card"
            onClick={() => {
              if (isExpandable) {
                setExpandedMatchId(
                  expandedMatchId === match.id ? null : match.id
                );
              }
            }}
          >


<div
  id={"tft" + match.id}
  style={{
    position: "relative",
    backgroundColor: "#1b1b21",
    color: "white",
    padding: "36px 20px 16px",
    borderRadius: "10px",
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    textAlign: "center",
    borderLeft: `5px solid ${
      tab === "live" ? "#00bcd4" : tab === "processing" ? "#ffeb3b" : "red"
    }`,
  }}
>
  {/* Creator info (top-left badge) */}
  <div
    style={{
      position: "absolute",
      top: 6,
      left: 10,
      fontSize: 11,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      padding: "3px 6px",
      borderRadius: 5,
      opacity: 0.85,
    }}
  >
    👤 {match.creator?.name || "Hidden"}{" "}
    {Array(match.creator?.level || 0).fill("⭐").join(" ")}
  </div>

  {/* Match status (top-right badge) */}
  <div
    style={{
      position: "absolute",
      top: 6,
      right: 10,
      fontSize: 11,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      padding: "3px 6px",
      borderRadius: 5,
      opacity: 0.85,
    }}
  >
    <div style={{ fontWeight: "bold", color: "#ffcc00" }}>
      {match.winningTeam ? <>🏆 {match.winningTeam}</> : <>📡 LIVE</>}
    </div>
  </div>

  {/* Countdown (center-top above match) */}
  <div
    style={{
      position: "absolute",
      top: 8,
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: 12,
      color: "#f1c40f",
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: "2px 10px",
      borderRadius: 5,
    }}
  >
    ⏳ {formatCountdown(countdownMs)}
  </div>

  {/* Team names + video buttons + VS */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 22,
      fontWeight: 700,
      padding: "8px 0",
      marginTop: 8,
      gap: 40,
    }}
  >
    <div
      style={{
        flex: 1,
        textAlign: "right",
        fontSize: 24,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 6,
      }}
    >
      <button
        onClick={() =>
          window.open(match.iframe.split(",")[0]?.trim() || "#", "_blank")
        }
        style={{
          padding: "2px 6px",
          fontSize: 12,
          borderRadius: 4,
          border: "1px solid #007bff",
          backgroundColor: "transparent",
          color: "#7cbfe9",
          cursor: "pointer",
        }}
        title="Xem livestream đội 1"
      >
        🔴 LIVE
      </button>
      {match.team1}
    </div>

    <span
      style={{
        flex: 0,
        padding: "0 12px",
        fontSize: 20,
        fontWeight: 700,
        color: "#f39c12",
        textTransform: "uppercase",
        letterSpacing: "1px",
      }}
    >
      𝗩𝗦
    </span>

    <div
      style={{
        flex: 1,
        textAlign: "left",
        fontSize: 24,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 6,
      }}
    >
      {match.team2}
      <button
        onClick={() =>
          window.open(match.iframe.split(",")[1]?.trim() || "#", "_blank")
        }
        style={{
          padding: "2px 6px",
          fontSize: 12,
          borderRadius: 4,
          border: "1px solid #007bff",
          backgroundColor: "transparent",
          color: "#7cbfe9",
          cursor: "pointer",
        }}
        title="Xem livestream đội 2"
      >
        🔴 LIVE
      </button>
    </div>
  </div>

  {/* ID badge bottom-right */}
  <div
    style={{
      position: "absolute",
      bottom: 6,
      right: 10,
      fontSize: 10,
      color: "#bbb",
      opacity: 0.6,
      fontFamily: "'Courier New', monospace",
    }}
  >
    ID: tft{match.id}
  </div>
</div>



{expandedMatchId === match.id && (
  <div className="bet-options" onClick={(e) => e.stopPropagation()}>
    <div className="bet-row">
      {[
        { team: match.option1, rate: match.rate1, sum: match.sum1, name: match.team1 },
        { team: match.option2, rate: match.rate2, sum: match.sum2, name: match.team2 }
      ].map((option, idx) => (
        <div key={idx} className="bet-column">

          <button
            disabled={bettingLoading}
            className="bet-btn"
            onClick={() => {
              // Khi bấm Board này, bật input cho option đó
              setActiveOption(option.team);
              setBetAmount(""); // reset số tiền mỗi lần bấm board khác
            }}
          >
            Board {option.name}
            <div className="bet-rate"> Rate {option.rate}, min 5 USDT</div>
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

          {/* Hiện input + nút OK chỉ khi option đang active */}
{activeOption === option.team && (
  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
    <input
      type="number"
      step="0.001"
      min="5"
      className="bet-input"
      placeholder="Enter bet amount (min 5 USDT)"
      value={betAmount}
      onChange={(e) => setBetAmount(e.target.value)}
      disabled={bettingLoading}
      style={{ flexGrow: 1 }}
    />
<button
  disabled={bettingLoading || !betAmount || Number(betAmount) < 5}
  onClick={() => {
    placeBet(match.id, option.team, option.rate, match.name, betAmount);
    setActiveOption(null);
    setBetAmount("");
  }}
  className={`button-ok ${
    Number(betAmount) >= 0.01 ? "active" : "disabled"
  }`}
>
  OK
</button>

    <button
      onClick={() => {
        setActiveOption(null);
        setBetAmount("");
      }}
      style={{ padding: "6px 12px", backgroundColor: "#1a2b3a" }}
    >
      X
    </button>
  </div>
)}

        </div>
      ))}
    </div>
  </div>
)}
        </div>
      );
    })}
  {matches.filter((m) => new Date(m.countdown).getTime() > now).length === 0 && (
    <p>No match.</p>
  )}
</div>

    </>
  );
};

export default Menu;