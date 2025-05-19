import React, { useState, useEffect } from "react";

const Menu = () => {
  const [matches, setMatches] = useState([]);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [bettingLoading, setBettingLoading] = useState(false);

  // Load danh sách trận đấu
  useEffect(() => {
    fetch("https://68271b3b397e48c913189c7d.mockapi.io/football")
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch(() => alert("Lỗi tải dữ liệu trận đấu"));
  }, []);

  // Kết nối ví MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask để đặt cược!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (err) {
      alert("Kết nối ví thất bại");
    }
  };

  // Đặt cược
  const placeBet = async (matchId, team) => {
    if (!currentAccount) {
      alert("Vui lòng kết nối ví MetaMask trước khi cược");
      return;
    }
    setBettingLoading(true);
    const betData = {
      matchId,
      team,
      amount: 0.01, // ví dụ số tiền cược mặc định
      userWallet: currentAccount,
      timestamp: new Date().toISOString(),
    };
    try {
      const res = await fetch(
        "https://68271b3b397e48c913189c7d.mockapi.io/football/bets",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(betData),
        }
      );
      if (res.ok) {
        alert("Đặt cược thành công!");
      } else {
        alert("Đặt cược thất bại, thử lại sau");
      }
    } catch (error) {
      alert("Lỗi khi gửi cược");
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
        @media (max-width: 600px) {
          .bet-btn {
            flex: 1 1 100%;
          }
        }
      `}</style>

      <div className="container">
        <h1 className="header">Danh sách kèo cược bóng đá</h1>

        {!currentAccount ? (
          <button className="wallet-btn" onClick={connectWallet}>
            Kết nối ví MetaMask
          </button>
        ) : (
          <p>Đã kết nối ví: {currentAccount}</p>
        )}

        {matches.length === 0 && <p>Đang tải dữ liệu trận đấu...</p>}

        {matches.map((match) => (
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
              <span>{new Date(match.time).toLocaleString()}</span>
            </div>

            {expandedMatchId === match.id && (
              <div className="bet-options">
                <button
                  disabled={bettingLoading}
                  className="bet-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    placeBet(match.id, match.team1);
                  }}
                >
                  Cược {match.team1} ({match.odds.team1})
                </button>
                <button
                  disabled={bettingLoading}
                  className="bet-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    placeBet(match.id, "draw");
                  }}
                >
                  Cược Hòa ({match.odds.draw})
                </button>
                <button
                  disabled={bettingLoading}
                  className="bet-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    placeBet(match.id, match.team2);
                  }}
                >
                  Cược {match.team2} ({match.odds.team2})
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Menu;
