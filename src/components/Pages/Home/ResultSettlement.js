import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://68271b3b397e48c913189c7d.mockapi.io";

export default function MatchResultDecider() {
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [winningTeam, setWinningTeam] = useState("");
  const countdownIntervals = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, betsRes] = await Promise.all([
          fetch(`${API_BASE}/football`),
          fetch(`${API_BASE}/bet`),
        ]);
        const matchesData = await matchesRes.json();
        const betsData = await betsRes.json();

        const oneHourAgo = Date.now() - 3600 * 1000;

        // Lọc trận với countdown > now - 1 hour
        const filteredMatches = matchesData.filter((match) => {
          if (!match.countdown) return false;
          const countdownTime = Date.parse(match.countdown);
          return !isNaN(countdownTime) && countdownTime > oneHourAgo;
        });

        setMatches(filteredMatches);
        setBets(betsData);
      } catch (err) {
        console.error("Failed to load data:", err);
        toast.error("Failed to load data from server.");
      }
    };

    fetchData();
  }, []);

  // Countdown state per match
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    matches.forEach((match) => {
      if (countdownIntervals.current[match.id]) return;

      const updateCountdown = () => {
        const now = Date.now();
        const target = Date.parse(match.countdown);
        const diff = Math.max(0, target - now);
        setCountdowns((prev) => ({ ...prev, [match.id]: diff }));

        if (diff <= 0 && countdownIntervals.current[match.id]) {
          clearInterval(countdownIntervals.current[match.id]);
          delete countdownIntervals.current[match.id];
        }
      };

      updateCountdown();
      countdownIntervals.current[match.id] = setInterval(updateCountdown, 1000);
    });

    return () => {
      Object.values(countdownIntervals.current).forEach(clearInterval);
      countdownIntervals.current = {};
    };
  }, [matches]);

  // Kiểm tra trận đã phân định chưa (có bet nào status khác "pending")
  const isResultFinalized = (match) => {
    return bets.some(
      (bet) =>
        bet.matchId.toString() === match.id.toString() &&
        bet.matchName === match.name &&
        bet.status !== "pending"
    );
  };

  const handleDecideResult = async () => {
    if (!selectedMatch) {
      toast.warn("Please select a match first.");
      return;
    }
    if (!winningTeam) {
      toast.warn("Please select the winning team.");
      return;
    }

    setLoading(true);

    try {
      const betsToUpdate = bets.filter(
        (bet) =>
          bet.matchId.toString() === selectedMatch.id.toString() &&
          bet.matchName === selectedMatch.name
      );

      const updatePromises = betsToUpdate.map((bet) => {
        const newStatus = bet.team === winningTeam ? "won" : "lose";
        return fetch(`${API_BASE}/bet/${bet.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...bet, status: newStatus }),
        });
      });

      await Promise.all(updatePromises);

      toast.success(`Updated ${betsToUpdate.length} bets based on winning team.`);

      // Cập nhật lại bets trong state
      const refreshedBetsRes = await fetch(`${API_BASE}/bet`);
      const refreshedBets = await refreshedBetsRes.json();
      setBets(refreshedBets);

      setSelectedMatch(null);
      setWinningTeam("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update bets status.");
    }

    setLoading(false);
  };

  const formatTime = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#121212", color: "#eee", minHeight: "100vh" }}>
      <h1 style={{ color: "#ff7043" }}>Match Result Decider</h1>

      <h2>Active Matches (Countdown &gt; Now - 1 hour)</h2>
      {matches.length === 0 && <p>No active matches found.</p>}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {matches.map((match) => {
          const finalized = isResultFinalized(match);
          return (
            <li
              key={match.id}
              style={{
                marginBottom: "12px",
                padding: "10px",
                backgroundColor: selectedMatch?.id === match.id ? "#ff7043" : "#333",
                borderRadius: "6px",
                cursor: "pointer",
                userSelect: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onClick={() => {
                if (!finalized) {
                  setSelectedMatch(match);
                  setWinningTeam("");
                }
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{match.name}</div>
                <div>Option 1: {match.option1} | Option 2: {match.option2}</div>
                <div>Bet sums: {match.sum1 || 0} USDT - {match.sum2 || 0} USDT</div>
                <div>Countdown: {formatTime(countdowns[match.id] || 0)}</div>
              </div>
              <div style={{ fontWeight: "bold", color: finalized ? "#90caf9" : "transparent" }}>
                {finalized ? "Result Finalized" : ""}
              </div>
            </li>
          );
        })}
      </ul>

      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#222",
          padding: "15px",
          borderRadius: "8px",
          maxWidth: "400px",
        }}
      >
        <h3>Decide Result</h3>
        <p>
          Selected match:{" "}
          <strong style={{ color: "#ffab91" }}>
            {selectedMatch ? selectedMatch.name : "None"}
          </strong>
        </p>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            disabled={!selectedMatch || isResultFinalized(selectedMatch)}
            value={winningTeam}
            onChange={(e) => setWinningTeam(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #555",
              backgroundColor: "#333",
              color: "#eee",
              cursor: selectedMatch && !isResultFinalized(selectedMatch) ? "pointer" : "not-allowed",
            }}
          >
            <option value="">-- Select Winning Team --</option>
            {selectedMatch && (
              <>
                <option value={selectedMatch.option1}>{selectedMatch.option1}</option>
                <option value={selectedMatch.option2}>{selectedMatch.option2}</option>
              </>
            )}
          </select>
<button
  onClick={handleDecideResult}
  disabled={
    loading || !selectedMatch || !winningTeam || isResultFinalized(selectedMatch)
  }
  style={{
    backgroundColor: "#ff7043",
    border: "none",
    padding: "6px 12px",      // giảm padding
    fontSize: "0.9rem",       // giảm font-size
    color: "#222",
    fontWeight: "bold",
    cursor:
      loading || !selectedMatch || !winningTeam || isResultFinalized(selectedMatch)
        ? "not-allowed"
        : "pointer",
    borderRadius: "6px",
  }}
>
  {loading ? "Updating..." : "Submit"}
</button>

        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
