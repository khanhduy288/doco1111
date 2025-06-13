import React, { useState, useEffect, useRef } from "react";
import { Pagination } from "antd";
import { BrowserProvider, Contract } from "ethers";
import { parseUnits } from "ethers";
import { Tooltip, Button } from "antd";
import 'antd/dist/reset.css';
import "./Blog.css"
import axios from "axios"; 


const REFUND_COUNTDOWN_SECONDS = 180; 
const CLAIM_CONTRACT_ADDRESS = "0x0855EfEa0855652af88F69bc9d879907811445C5"; 
const CLAIM_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "betId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "betTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_usdt",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "betId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Claimed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawUSDT",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "claimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "usdt",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const SYSTEM_WALLET_API = "https://681de07ac1c291fa66320473.mockapi.io/addressqr/wallet";

const Blog = () => {


const greenBtnStyle = {
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};

const blueBtnStyle = {
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};



const [isClaimDay, setIsClaimDay] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [systemWallet, setSystemWallet] = useState(null);
  const pageSize = 6;
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [matchList, setMatchList] = useState([]); // Dữ liệu trận đấu
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [betList, setBetList] = useState([]);
  const [countdownMap, setCountdownMap] = useState({});
  const betListRef = useRef([]);
  const [, forceUpdate] = useState(0);
  const [userData, setUserData] = useState(null);
  const [storedUser, setStoredUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);




  const fetchSystemWallet = async () => {
    try {
      const res = await fetch(SYSTEM_WALLET_API + "/1");
      const data = await res.json();
      if (data && data.address) {
        setSystemWallet(data.address);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  const today = new Date();
  setIsClaimDay(today.getDate() === 13);
}, []);

useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("SEPuser"));
  if (stored) setStoredUser(stored);
}, []);

  useEffect(() => {
  const interval = setInterval(() => {
    setCountdownMap((prevMap) => {
      const updatedMap = { ...prevMap };
      const now = Date.now();

      betList.forEach((bet) => {
        if (bet.countdownEnd && bet.status === "refund") {
          const remaining = Math.max(0, Math.floor((bet.countdownEnd - now) / 1000));
          updatedMap[bet.id] = remaining;
        }
      });

      return updatedMap;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [betList]);


useEffect(() => {
  const interval = setInterval(() => {
    setCountdownMap((prev) => {
      const newMap = {};

      betListRef.current.forEach((bet) => {
        if (bet.status === "refund" && bet.countdownEnd) {
          const remaining = Math.max(0, Math.floor((bet.countdownEnd - Date.now()) / 1000));
          if (remaining > 0) {
            newMap[bet.id] = remaining;
          }
        }
      });

      return newMap;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    localStorage.setItem("walletUser", JSON.stringify(userData));

  betListRef.current = betList;
}, [betList]);

useEffect(() => {
  const processedBets = new Set();

  const interval = setInterval(async () => {
    try {
      const now = Date.now();

      const updatedBetList = await Promise.all(
        betListRef.current.map(async (bet) => {
          if (bet.status === "refund") {
            if (!bet.countdownEnd) {
              const matchRes = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/football");
              const matches = await matchRes.json();
              const upcoming = matches.filter(m => new Date(m.countdown) > new Date());

              if (upcoming.length > 0) {
                const countdownEnd = now + REFUND_COUNTDOWN_SECONDS * 1000;

                const putRes = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${bet.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ countdownEnd }),
                });

                if (putRes.ok) {
                  return { ...bet, countdownEnd };
                } else {
                  console.error("PUT countdownEnd failed:", await putRes.text());
                }
              }
              return bet;
            }

            if (bet.hasAutoBet) {
              return bet;
            }

            if (processedBets.has(bet.id)) {
              return bet;
            }

            if (bet.countdownEnd && now >= bet.countdownEnd && !bet.hasAutoBet) {
              processedBets.add(bet.id); // đánh dấu đã xử lý

              const matchRes = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/football");
              const matches = await matchRes.json();
              const liveMatches = matches.filter(m => new Date(m.countdown) > new Date());

              if (liveMatches.length > 0) {
                const match = liveMatches[Math.floor(Math.random() * liveMatches.length)];
                const option = Math.random() < 0.5 ? "option1" : "option2";
                const team = option === "option1" ? match.team1 : match.team2;
                const rate = option === "option1" ? match.rate1 : match.rate2;
                const claim = (bet.refund || bet.amount) * rate;

                await fetch("https://68271b3b397e48c913189c7d.mockapi.io/bet", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    matchId: match.id,
                    matchName: match.name,
                    team,
                    amount: bet.refund || bet.amount,
                    userWallet: bet.userWallet,
                    token: "USDT",
                    timestamp: new Date().toISOString(),
                    status: "pending",
                    claim,
                    countdownEnd: null,
                  }),
                });

                const putRes = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${bet.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "done", hasAutoBet: true }),
                });

                if (!putRes.ok) {
                  console.error("PUT update bet done failed:", await putRes.text());
                }

                const updatedBet = { ...bet, status: "done", hasAutoBet: true };
                const newBetList = betListRef.current.map(b => (b.id === bet.id ? updatedBet : b));
                setBetList(newBetList);
                betListRef.current = newBetList;

                return updatedBet;
              }
            }
          }
          return bet;
        })
      );

      setBetList(updatedBetList);
      betListRef.current = updatedBetList;
    } catch (error) {
      console.error(error);
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);




 useEffect(() => {
  const fetchBets = async () => {
    const res = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/bet");
    const data = await res.json();

    setBetList(data);
    betListRef.current = data;
  };

  fetchBets();
}, []);



useEffect(() => {
  const fetchMatches = async () => {
    try {
      const response = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/bet"); 
      const data = await response.json();
      setMatchList(data);
    } catch (err) {
      console.error( err);
    }
  };

  fetchMatches();
}, []);


  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      console.log("Connected:", accounts[0]);
    } catch (error) {
      alert("Failed to connect wallet!");
    }
  };

  const fetchBets = async () => {
    if (!currentAccount) {
      setBets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/bet");
      const data = await response.json();

      const filtered = data.filter(
        (bet) => bet.userWallet?.toLowerCase() === currentAccount.toLowerCase()
      );

      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setBets(filtered);
    } catch (error) {
      console.error("Error fetching bets:", error);
    } finally {
      setLoading(false);
    }
  };

const handleClaim = async (bet) => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

if (bet.status !== "won" && bet.status !== "refund") {
  alert("You can only claim when the bet is won or refunded.");
  return;
}

if (!systemWallet) {
  alert("System wallet not retrieved. Please try again later.");
  return;
}


  try {
    const betIdNum = Number(bet.id);
    const betTimeNum = Math.floor(new Date(bet.timestamp).getTime() / 1000); 

    let rawAmount;
    if (bet.status === "won") {
      rawAmount = Number(bet.claim);
    } else if (bet.status === "refund") {
      rawAmount = Number(bet.refund);
    }

    if (isNaN(betIdNum) || isNaN(betTimeNum) || isNaN(rawAmount)) {
      alert("Invalid!");
      return;
    }

    const amountInWei = parseUnits(rawAmount.toString(), 18);

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const claimContract = new Contract(CLAIM_CONTRACT_ADDRESS, CLAIM_CONTRACT_ABI, signer);

    const tx = await claimContract.claim(betIdNum, betTimeNum, amountInWei);
    await tx.wait();

    const updatedBet = { ...bet, status: "claimed" };

    const res = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${bet.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedBet),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    const updatedBets = bets.map((b) =>
      b.id === bet.id
        ? {
            ...b,
            claim: `${rawAmount} claimed`,
            status: "claimed",
          }
        : b
    );
    setBets(updatedBets);

    alert("Claimed!");
  } catch (error) {
    alert("Claim error: " + (error?.reason || error?.message || "Unknown error."));
  }
};

const handleContinue = async (bet, isWon = false) => {

  setSelectedRefund({
    ...bet,
    isWon: isWon,
    refund: isWon ? bet.claim : bet.refund, 
  });

  try {
    const res = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/football");
    const data = await res.json();
    const upcomingMatches = data.filter(match => new Date(match.countdown) > new Date());

    setMatchList(upcomingMatches);
    setShowContinueModal(true);
    console.log("showContinueModal set true");
  } catch (error) {
    alert("Load match error!");
    console.error(error);
  }
};





const handleContinueBet = async () => {
  
  if (isSubmitting) return; 
  if (!selectedMatch || !selectedOption) {
    alert("Please select a match and a betting option.");
    return;
  }

  const amount = selectedRefund?.isWon ? selectedRefund.claim : selectedRefund.refund;
  const rate = selectedOption === "option1" ? selectedMatch.rate1 : selectedMatch.rate2;
  const option = selectedOption; // "option1" hoặc "option2"
  const team = selectedMatch[option]; // "1 win" hoặc "ad1 Win"


  try {
    
const newBet = {
  matchId: selectedMatch.id,
  matchName: selectedMatch.name,
  option,
  team, // giờ là "option1" hoặc "option2" giá trị như "1 win"
  amount,
  claim: Number((amount * rate).toFixed(4)),
  userWallet: currentAccount,
  token: "USDT",
  timestamp: new Date().toISOString(),
  status: "pending",
};

    // 1. Tạo đơn cược mới
    const res = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/bet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBet),
    });

    if (!res.ok) throw new Error("Create error!");

    // 2. Cập nhật đơn gốc thành "done"
    await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${selectedRefund.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });

// Lấy lại match mới nhất
const matchRes = await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/football/${selectedMatch.id}`);
const matchData = await matchRes.json();
let updatedMatch = { ...matchData };

// Cập nhật sum1 hoặc sum2 theo selectedOption
if (selectedOption === "option1") {
  updatedMatch.sum1 = (Number(matchData.sum1) || 0) + Number(amount);
} else if (selectedOption === "option2") {
  updatedMatch.sum2 = (Number(matchData.sum2) || 0) + Number(amount);
}

// Gửi PUT để update match
await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/football/${selectedMatch.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updatedMatch),
});



    // 4. Hoàn tất
    alert("Cược tiếp thành công");
    setShowContinueModal(false);
    setSelectedMatch(null);
    setSelectedOption(null);
    setSelectedRefund(null);
    fetchBets(); // reload
  } catch (error) {
    alert("Continue boat error: " + error.message);
  }
};



const formatCountdown = (endTime) => {
  const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${mins}m ${secs}s`;
};






  useEffect(() => {
    fetchSystemWallet();
  }, []);

  useEffect(() => {
    fetchBets();
  }, [currentAccount]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          console.log("Wallet Changed:", accounts[0]);
        } else {
          setCurrentAccount(null);
          setBets([]);
          console.log("Wallet has been disconnected");
        }
      });
    }
  }, []);



const handleClaimBalanceOnly = async () => {
  if (!window.ethereum || !storedUser) return;

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const claimContract = new Contract(CLAIM_CONTRACT_ADDRESS, CLAIM_CONTRACT_ABI, signer);

    const userBalance = Number(storedUser.balance);
    if (userBalance <= 0) {
      alert("Balance is zero.");
      return;
    }

    const amountInWei = parseUnits(userBalance.toString(), 18); // USDT = 6 decimals

    // Generate betId and betTime
    const betId = Number(storedUser.id); // or hash(address) if needed
    const betTime = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds

    const tx = await claimContract.claim(betId, betTime, amountInWei);
    await tx.wait();

    // PATCH balance = 0 in backend
    const patchRes = await axios.patch(
      `https://berendersepuser.onrender.com/users/${storedUser.id}`,
      { balance: 0 },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "x-api-key": "adminsepuser",
        },
      }
    );

    // REFRESH SEPuser
    const userRes = await axios.get(`https://berendersepuser.onrender.com/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "x-api-key": "adminsepuser",
      },
    });

    const updatedUser = userRes.data.find(
      (user) => user.walletAddress?.toLowerCase() === signer.address.toLowerCase()
    );
    setStoredUser(updatedUser);

    alert("Claim successful!");
  } catch (error) {
    alert("Claim error: " + (error?.reason || error?.message || "Unknown error."));
  }
};







  const startIndex = (currentPage - 1) * pageSize;
  const currentBets = bets.slice(startIndex, startIndex + pageSize);

return (
  <section style={{ padding: "5%", backgroundColor: "#121212", color: "#eee", minHeight: "100vh" }}>
    <div className="container">
{localStorage.getItem("SEPuser") && (
  <div style={{ position: "absolute", top: 150, right: 80 }}>
    {isClaimDay ? (
      <button
        style={{
          ...greenBtnStyle,
          backgroundColor: "#28a745",
          cursor: "pointer",
          color: "#fff",
        }}
        onClick={handleClaimBalanceOnly}
      >
        Claim Balance
      </button>
    ) : (
      <Tooltip title="Claim is only available on the 19th of each month">
        <button
          style={{
            ...greenBtnStyle,
            backgroundColor: "#1b1b21",
            cursor: "not-allowed",
            opacity: 0.6,
            color: "#fff",
          }}
          disabled
        >
          Claim Balance
        </button>
      </Tooltip>
    )}
  </div>
)}









      <h1 className="text-center mb-4" style={{ color: "#eee" }}>History </h1>

      {!currentAccount ? (
        <div className="text-center">
          <button
            onClick={connectWallet}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: "#1f1f1f",
              color: "#eee",
              border: "1px solid #444",
              transition: "background-color 0.3s",
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#333")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#1f1f1f")}
          >
            Connect Wallet MetaMask
          </button>
        </div>
      ) : (
        <>
          <p>
            Wallet Connected: <b>{currentAccount}</b>
          </p>

          {loading ? (
            <div style={{ textAlign: "center", margin: "40px 0" }}>
              <div className="spinner" />
              <p>Loading...</p>
            </div>
          ) : bets.length === 0 ? (
            <p>No data.</p>
          ) : (
            <>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#1e1e1e",
                color: "#ddd",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#2c2c2c" }}>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "left" }}>Match ID</th>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "left" }}>Match Name</th>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "left" }}>Team</th>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "right" }}>Amount (USDT)</th>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "center" }}>Status</th>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "left" }}>Time</th>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "left" }}>TxHash</th>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "right" }}>Claim (USDT)</th>
                    <th style={{ borderBottom: "1px solid #444", padding: "12px 8px", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBets.map((bet, index) => (
                    <tr
                      key={bet.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#292929" : "#232323",
                        borderBottom: "1px solid #333"
                      }}
                    >
                      <td style={{ padding: "10px 8px" }}>{bet.matchId}</td>
                      <td style={{ padding: "10px 8px" }}>{bet.matchName}</td>
                      <td style={{ padding: "10px 8px" }}>{bet.team}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{bet.amount}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>{bet.status}</td>
                      <td style={{ padding: "10px 8px" }}>
                        {new Date(bet.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <a
                          href={`https://bscscan.com/tx/${bet.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#4db8ff", textDecoration: "underline" }}
                        >
                          {bet.txHash?.slice(0, 10)}...
                        </a>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>
                        {bet.claim ? parseFloat(bet.claim).toFixed(6) : "-"}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>
                        {bet.status === "won" ? (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button onClick={() => handleClaim(bet)} style={greenBtnStyle}>Claim</button>
                            <button onClick={() => handleContinue(bet, true)} style={blueBtnStyle}>Continue</button>
                          </div>
                        ) : bet.status === "refund" ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            {countdownMap[bet.id] != null ? (
                              <div style={{ color: "#ff5555", fontWeight: "bold" }}>
                                ⏳ {countdownMap[bet.id]}s to auto bet!
                              </div>
                            ) : (
                              <div style={{ color: "#999" }}>⏳ Waiting...</div>
                            )}
                            <button
                              onClick={() => handleContinue(bet, false)}
                              title="You have limited time to continue. Otherwise, the system will bet randomly!"
                              style={blueBtnStyle}
                            >
                              Continue
                            </button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {bets.length > pageSize && (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={bets.length}
                    onChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {showContinueModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#222",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
              maxWidth: "90%",
              color: "#eee",
            }}
          >
            <h3
              style={{
                color: "#eee",
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                paddingBottom: "8px",
              }}
            >
              Select a match to continue betting
            </h3>
            <select
              value={selectedMatch ? selectedMatch.id : ""}
              onChange={e => {
                const match = matchList.find(m => m.id === e.target.value);
                setSelectedMatch(match);
                setSelectedOption(null); 
              }}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                color: "#eee",
                backgroundColor: "#333",
                border: "1px solid #555",
                borderRadius: "4px",
              }}
            >
              <option value="">-- Select match --</option>
              {matchList.map(match => (
                <option key={match.id} value={match.id}>
                  {match.name} - {match.option1} / {match.option2}
                </option>
              ))}
            </select>

            {selectedMatch && (
              <select
                value={selectedOption || ""}
                onChange={e => setSelectedOption(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  color: "#eee",
                  backgroundColor: "#333",
                  border: "1px solid #555",
                  borderRadius: "4px",
                }}
              >
                <option value="">-- Select Option Boat --</option>
                <option value="option1">
                  {selectedMatch.option1} (Rate : {selectedMatch.rate1})
                </option>
                <option value="option2">
                  {selectedMatch.option2} (Rate : {selectedMatch.rate2})
                </option>
              </select>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", gap: "8px" }}>
              <button
                onClick={handleContinueBet}
                disabled={!selectedMatch || !selectedOption || isSubmitting}
                style={{
                  backgroundColor: !selectedMatch || !selectedOption ? "#555" : "#007bff",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  fontSize: "14px",
                  borderRadius: "4px",
                  cursor: !selectedMatch || !selectedOption ? "not-allowed" : "pointer",
                  opacity: !selectedMatch || !selectedOption ? 0.7 : 1,
                  transition: "background-color 0.2s",
                }}
                onMouseOver={e => {
                  if (selectedMatch && selectedOption)
                    e.currentTarget.style.backgroundColor = "#0056b3";
                }}
                onMouseOut={e => {
                  if (selectedMatch && selectedOption)
                    e.currentTarget.style.backgroundColor = "#007bff";
                }}
              >
                Cược tiếp
              </button>

              <button
                onClick={() => setShowContinueModal(false)}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  fontSize: "14px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = "#c82333")}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = "#dc3545")}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </section>
);


};

export default Blog;
