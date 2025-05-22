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
    console.log("Current network.chainId:", network.chainId);

    if (network.chainId !== ALLOWED_CHAIN_ID) {
      const switched = await switchToBSC();
      if (!switched) {
        toast.error("Không thể chuyển sang mạng BSC.");
        setBettingLoading(false);
        return;
      }

      // Đợi chuyển mạng xong mới gọi lại
      window.ethereum.once("chainChanged", async () => {
        setTimeout(() => {
          placeBet(matchId, team, rate);  // Gọi lại kèm rate
        }, 1000);
      });

      setBettingLoading(false);
      return;
    }

    // Đã ở mạng BSC
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

    // 👉 Tính claim: betAmount * rate
    const claim = Number((Number(betAmount) * Number(rate)).toFixed(4)); // làm tròn 4 chữ số

    const betData = {
      matchId,
      team,
      amount: Number(betAmount),
      userWallet: userAddress,
      token: "USDT",
      timestamp: new Date().toISOString(),
      status: "pending",
      txHash: transferTx.hash,
      claim: claim, // 👈 Thêm trường claim
    };

    const res = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/bet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(betData),
    });

    if (res.ok) {
      toast.success("Cược thành công bằng USDT!");
    } else {
      toast.error("Lưu đơn cược thất bại.");
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
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
          cursor: pointer;
          background-color: #fafafa;
          transition: background-color 0.3s ease;
        }
        .match-card:hover {
          background-color: #f0f0f0;
        }
        .match-header {
          font-weight: bold;
          font-size: 1.2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bet-options {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .bet-btn {
          flex: 1 1 30%;
          padding: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .bet-btn:disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }
        .bet-btn:hover:not(:disabled) {
          background-color: #0056b3;
        }
        .wallet-btn {
          margin-bottom: 20px;
          padding: 10px 20px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .wallet-btn:hover {
          background-color: #1e7e34;
        }
        input.bet-input {
          width: 100px;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 1rem;
          margin-right: 10px;
        }
        @media (max-width: 600px) {
          .bet-btn {
            flex: 1 1 100%;
          }
          .bet-options {
            flex-direction: column;
            align-items: stretch;
          }
          input.bet-input {
            width: 100%;
            margin-bottom: 10px;
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
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      className="bet-input"
                      placeholder="Số ETH cược"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      disabled={bettingLoading}
                    />
                    <button
                      disabled={bettingLoading}
                      className="bet-btn"
                      onClick={() => placeBet(match.id, match.option1, match.rate1)}
                        >
                      Cược {match.option1} ({match.rate1})
                    </button>
                    <button
                      disabled={bettingLoading}
                      className="bet-btn"
                      onClick={() => placeBet(match.id, match.option2,match.rate2)}
                    >
                      Cược {match.option2} ({match.rate2})
                    </button>
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
