import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Menu = () => {
  const [matches, setMatches] = useState([]);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [bettingLoading, setBettingLoading] = useState(false);
  const [betAmount, setBetAmount] = useState("0.01");
  const [now, setNow] = useState(Date.now());
  const [betsByMatchId, setBetsByMatchId] = useState({});
  const [allBets, setAllBets] = useState([]);


  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("https://68271b3b397e48c913189c7d.mockapi.io/football")
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch(() => toast.error("Lỗi tải dữ liệu trận đấu"));
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

    const expiredMatches = matches.filter(
      (m) => new Date(m.countdown).getTime() <= nowTime && m.status !== "settled"
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
            // Hoàn toàn bộ bet
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
            // Tách bet: 1 phần refund, 1 phần giữ lại pending
            // Cập nhật bet hiện tại thành phần giữ lại
            await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${bet.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: betAmount - refundAmount,
              }),
            });

            // Tạo bet mới cho phần refund
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
      (m) => new Date(m.countdown).getTime() <= Date.now() && m.status !== "settled"
    );
    if (hasUnsettled) {
      checkForExpiredMatches();
    }
  }, 1000);

  return () => clearInterval(interval);
}, [matches]);


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




const placeBet = async (matchId, team, rate) => {
  console.log("placeBet is called with", matchId, team, "Rate:", rate);

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
          placeBet(matchId, team, rate);
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
};








  return (
    <>
      <style>{`
       .container {
  max-width: 900px;
  margin: auto;
  padding: 10px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.match-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
}

.match-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.match-header {
  font-weight: bold;
  font-size: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bet-options {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bet-row {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.bet-column {
  flex: 1;
  min-width: 45%;
  background-color: #ffffff;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bet-btn {
  background-color: #2563eb;
  color: #fff;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  max-width: 180px;
}

.bet-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.bet-btn:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.bet-sum {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 10px;
}

.bet-list {
  width: 100%;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
  max-height: 160px;
  overflow-y: auto;
  font-size: 14px;
}

.bet-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: #374151;
}

.wallet {
  font-family: monospace;
  color: #9ca3af;
}

.bet-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
  margin-top: 10px;
}

.wallet-btn {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.wallet-btn:hover {
  background-color: #1e7e34;
}

@media (max-width: 768px) {
  .bet-row {
    flex-direction: column;
  }

  .bet-column {
    min-width: 100%;
  }
}

      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container">
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
          </div>

{expandedMatchId === match.id && (
  <div className="bet-options" onClick={(e) => e.stopPropagation()}>
    <div className="bet-row">
      {[{ team: match.option1, rate: match.rate1, sum: match.sum1 },
        { team: match.option2, rate: match.rate2, sum: match.sum2 }
      ].map((option, idx) => (
        <div key={idx} className="bet-column">
          <button
            disabled={bettingLoading}
            className="bet-btn"
            onClick={() => placeBet(match.id, option.team, option.rate)}
          >
            Bet on {option.team} ({option.rate})
          </button>
          <div className="bet-sum">
            Total bet: <strong>{Number(option.sum || 0).toFixed(2)} USDT</strong>
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
      placeholder="Enter bet amount (ETH)"
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
