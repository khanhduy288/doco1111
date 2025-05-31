import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ResultSettlement = () => {
  const [matches, setMatches] = useState([]);
  const now = Date.now();

  // Fetch danh sách trận từ API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/football");
        const data = await res.json();

        // Lọc các trận countdown > now
        const activeMatches = data.filter(match => Number(match.countdown) > now);
        setMatches(activeMatches);
      } catch (err) {
        console.error("Lỗi tải danh sách trận:", err);
      }
    };

    fetchMatches();
  }, [now]);

  // Hàm phân định kết quả
  const settleMatchResult = async (matchId, matchName, resultTeam) => {
    try {
      // 1. Lấy tất cả cược
      const res = await fetch("https://68271b3b397e48c913189c7d.mockapi.io/bet");
      const allBets = await res.json();

      // 2. Lọc các đơn cược của trận đó
      const relatedBets = allBets.filter(
        (bet) => bet.matchId === matchId || bet.matchName === matchName
      );

      // 3. Cập nhật status cho từng đơn
      for (let bet of relatedBets) {
        const status = bet.team === resultTeam ? "won" : "lose";

        await fetch(`https://68271b3b397e48c913189c7d.mockapi.io/bet/${bet.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
      }

      toast.success(`✅ Đã chốt kết quả: ${resultTeam} thắng`);
    } catch (err) {
      console.error("Lỗi phân định:", err);
      toast.error("❌ Lỗi khi cập nhật kết quả.");
    }
  };

  return (
    <div style={{ padding: "20px", background: "#1f1f1f", color: "#fff" }}>
      <h2 style={{ marginBottom: "20px", color: "#ff4d4f" }}>🎯 Kết Quả Trận Đấu</h2>

      {matches.length === 0 ? (
        <p>Không có trận nào đang hoạt động.</p>
      ) : (
        matches.map((match) => (
          <div key={match.id} style={{
            border: "1px solid #333",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "16px",
            background: "#2b2b2b"
          }}>
            <h3>{match.name}</h3>
            <p>⏱ Countdown: {Math.floor((match.countdown - now) / 1000)}s</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                style={{
                  padding: "8px 16px",
                  background: "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
                onClick={() => settleMatchResult(match.id, match.name, match.option1)}
              >
                ✅ {match.option1} thắng
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  background: "#ff7a45",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
                onClick={() => settleMatchResult(match.id, match.name, match.option2)}
              >
                ✅ {match.option2} thắng
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ResultSettlement;
