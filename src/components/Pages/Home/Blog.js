import React, { useState, useEffect } from "react";
import { Pagination } from "antd";
import { BrowserProvider, Contract } from "ethers";
import { parseUnits } from "ethers";
import "./Blog.css"
import axios from "axios"; // Giả sử dùng axios để gọi API

const CLAIM_CONTRACT_ADDRESS = "0x85761474e9953F0A8B61b7a4f4A9B33b95F3e432"; // Thay bằng địa chỉ smart contract của bạn
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
				"name": "",
				"type": "uint256"
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
  const [currentAccount, setCurrentAccount] = useState(null);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [systemWallet, setSystemWallet] = useState(null);
  const pageSize = 6;

  const fetchSystemWallet = async () => {
    try {
      const res = await fetch(SYSTEM_WALLET_API + "/1");
      const data = await res.json();
      if (data && data.address) {
        setSystemWallet(data.address);
      }
    } catch (error) {
      console.error("Lỗi lấy ví hệ thống:", error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask chưa được cài đặt. Vui lòng cài đặt và thử lại.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      console.log("Kết nối ví thành công:", accounts[0]);
    } catch (error) {
      console.error("Lỗi khi kết nối ví:", error);
      alert("Kết nối ví thất bại");
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
    alert("Vui lòng cài đặt MetaMask.");
    return;
  }

  if (bet.status !== "won") {
    alert("Chỉ có thể claim khi cược thắng.");
    return;
  }

  if (!systemWallet) {
    alert("Ví hệ thống chưa được lấy. Vui lòng thử lại sau.");
    return;
  }

  try {
    const betIdNum = Number(bet.id);
    const rawAmount = Number(bet.claim);

    if (isNaN(betIdNum) || isNaN(rawAmount)) {
      alert("ID hoặc số tiền cược không hợp lệ");
      return;
    }

    const amountInWei = parseUnits(bet.claim.toString(), 18);

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const claimContract = new Contract(CLAIM_CONTRACT_ADDRESS, CLAIM_CONTRACT_ABI, signer);

    // Gửi giao dịch claim đến smart contract
    const tx = await claimContract.claim(betIdNum, amountInWei);
    await tx.wait();

    // ✅ Claim thành công, cập nhật trạng thái trong API
await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${bet.id}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ status: "claimed" }),
})
.then((res) => {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
})
.catch((error) => {
  console.error("Lỗi khi cập nhật trạng thái claim:", error);
  alert("Lỗi khi cập nhật trạng thái claim: " + error.message);
});


    // ✅ Cập nhật lại giao diện
    const updatedBets = bets.map((b) =>
      b.id === bet.id
        ? {
            ...b,
            claim: `${bet.claim} claimed`,
            status: "claimed",
          }
        : b
    );
    setBets(updatedBets);

    alert("Claim thành công!");
  } catch (error) {
    console.error("Lỗi khi claim:", error);
    alert("Claim thất bại: " + (error?.reason || error?.message || "Lỗi không xác định"));
  }
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
          console.log("Ví thay đổi thành:", accounts[0]);
        } else {
          setCurrentAccount(null);
          setBets([]);
          console.log("Ví đã bị ngắt kết nối");
        }
      });
    }
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const currentBets = bets.slice(startIndex, startIndex + pageSize);

  return (
    <section style={{ padding: "5%" }}>
      <div className="container">
        <h1 className="text-center mb-4">Lịch Sử Cược</h1>

        {!currentAccount ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Kết nối ví MetaMask
            </button>
          </div>
        ) : (
          <>
            <p>
              Ví đang kết nối: <b>{currentAccount}</b>
            </p>

            {loading ? (
  <div style={{ textAlign: "center", margin: "40px 0" }}>
    <div className="spinner" />
    <p>Đang tải dữ liệu cược...</p>
  </div>
) : bets.length === 0 ? (
  <p>Không tìm thấy lịch sử cược cho ví này.</p>
) : (

              <>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Match ID</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Team</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Amount (USDT)</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Status</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Time</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>TxHash</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Claim (USDT)</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBets.map((bet) => (
                      <tr key={bet.id}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{bet.matchId}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{bet.team}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{bet.amount}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{bet.status}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                          {new Date(bet.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                          <a
                            href={`https://bscscan.com/tx/${bet.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {bet.txHash?.slice(0, 10)}...
                          </a>
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                          {bet.claim ? parseFloat(bet.claim).toFixed(6) : "-"}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                          {bet.status === "won" ? (
                            <button
                              onClick={() => handleClaim(bet)}
                              style={{
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Claim
                            </button>
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
      </div>
    </section>
  );
};

export default Blog;
