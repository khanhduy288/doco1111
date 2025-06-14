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
  const [currentUserId, setCurrentUserId] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("SEPuser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUserId(parsed.id);
      } catch (e) {
        console.error("Invalid SEPuser format", e);
      }
    }
  }, []);

useEffect(() => {
  const interval = setInterval(async () => {
    if (!matches.length || !bets.length) return;

    const processingBets = bets.filter(
      (bet) => bet.status?.startsWith("processing") && bet.processStart
    );

    if (processingBets.length === 0) return;

    const now = Date.now();

    const betsReadyToFinalize = processingBets.filter((bet) => {
      const start = Date.parse(bet.processStart);
      return now - start >= 180000; // 3 phút
    });

    if (betsReadyToFinalize.length === 0) return;

    const updatedMatchIds = new Set();

    await Promise.all(
      betsReadyToFinalize.map(async (bet) => {
        const match = matches.find((m) => m.id.toString() === bet.matchId.toString());
        if (!match || !match.winningTeam) {
          console.warn(`Match or winningTeam not found for bet ${bet.id}`);
          return;
        }

        const winning = bet.team === match.winningTeam ? "won" : "lose";
        console.log(`Bet ${bet.id} team: ${bet.team}, match winningTeam: ${match.winningTeam}, status: ${winning}`);

        await fetch(`${API_BASE}/bet/${bet.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...bet, status: winning }),
        });

        updatedMatchIds.add(bet.matchId);
      })
    );

    for (const matchId of updatedMatchIds) {
      const relatedBets = bets.filter((b) => b.matchId.toString() === matchId.toString());
      const allDone = relatedBets.every((b) => !b.status?.startsWith("processing"));

      if (allDone) {
        const match = matches.find((m) => m.id.toString() === matchId.toString());
        if (!match || !match.option1 || !match.option2 || !match.winningTeam) continue;

        const status1 = match.winningTeam === match.option1 ? "won" : "lose";
        const status2 = match.winningTeam === match.option2 ? "won" : "lose";

        await fetch(`${API_BASE}/football/${match.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...match, status1, status2 }),
        });

        const sum1 = parseFloat(match.sum1) || 0;
        const sum2 = parseFloat(match.sum2) || 0;
        const totalBet = sum1 + sum2;

        const creatorId = match.creatorId;
        const userRes = await fetch(`${API_BASE}/user/${creatorId}`);
        const user = await userRes.json();

        if (user) {
          const level = parseFloat(user.level) || 1;
          const reward = (totalBet / 2) * (level / 100);

          await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${creatorId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...user,
              balance: (parseFloat(user.balance) || 0) + reward,
              matchesCreated: (parseInt(user.matchesCreated) || 0) + 1,
            }),
          });
        }
      }
    }

    const refreshedBetsRes = await fetch(`${API_BASE}/bet`);
    const refreshedBets = await refreshedBetsRes.json();
    setBets(refreshedBets);

    const refreshedMatchesRes = await fetch(`${API_BASE}/football`);
    const refreshedMatches = await refreshedMatchesRes.json();
    setMatches(refreshedMatches);
  }, 5000);

  return () => clearInterval(interval);
}, [bets, matches]);



useEffect(() => {
  const timer = setInterval(() => {
    setTick((prev) => prev + 1); 
  }, 1000);

  return () => clearInterval(timer);
}, []);



useEffect(() => {
  const fetchData = async () => {
    try {
      const userData = localStorage.getItem("SEPuser");
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id) {
        console.error("No user information found.");
        toast.error("User information not found.");
        return;
      }

      const [matchesRes, betsRes] = await Promise.all([
        fetch(`${API_BASE}/football`),
        fetch(`${API_BASE}/bet`),
      ]);

      const matchesData = await matchesRes.json();
      const betsData = await betsRes.json();

      const oneHourAgo = Date.now() - 3600 * 1000;

const filteredMatches = matchesData.filter((match) => {
  if (!match.countdown) return false;
  const countdownTime = Date.parse(match.countdown);
  return (
    !isNaN(countdownTime) &&
    countdownTime > oneHourAgo &&
    (user.level === 6 || match.creatorId === user.id)
  );
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

const isUserLevel5OrAdmin = () => {
  const userData = localStorage.getItem("SEPuser");
  const user = userData ? JSON.parse(userData) : null;
  return user && (user.level === 5 || user.level === 6);
};




  const refreshUserInfo = async () => {
    if (!userInfo?.id) return;

    setLoading(true);
    try {
      const res = await fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${userInfo.id}`);
      const data = await res.json();

      localStorage.setItem('SEPuser', JSON.stringify(data));
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
    setLoading(false);
  };

  const renderStars = (level) => '⭐'.repeat(level);




  useEffect(() => {
  const storedUser = localStorage.getItem("SEPuser");
  if (storedUser) {
    setUserInfo(JSON.parse(storedUser));
  }
}, []);

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

  const isResultFinalized = (match) => {
    return bets.some(
      (bet) =>
        bet.matchId.toString() === match.id.toString() &&
        bet.matchName === match.name &&
        bet.status !== "pending"
    );
  };

const getRemainingProcessingTime = (matchId) => {
  const processingBet = bets.find(
    (b) =>
      b.matchId === matchId &&
      b.status?.startsWith("processing") && 
      b.processStart
  );
  if (!processingBet) return 0;
  const elapsed = Date.now() - Date.parse(processingBet.processStart);
  return Math.max(0, 180000 - elapsed);
};


  const isUserMatchCreator = (match) => {
  return match.creatorId?.toString() === currentUserId?.toString() || userInfo?.level === 6;
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
  if (!isUserMatchCreator(selectedMatch) && userInfo?.level !== 6) {
    toast.error("Only the match creator can decide the result.");
    return;
  }

  setLoading(true);

const updateCreatorBalance = async (creatorId, sum1, sum2) => {
  try {
    const creatorRes = await fetch(`https://berendersepuser.onrender.com/users/${creatorId}`);
    const creator = await creatorRes.json();

    if (!creator || !creator.level) {
      toast.error("Creator info or level not found.");
      return;
    }

    const bonus = Math.min(sum1, sum2) * creator.level / 100;

    const newBalance = +(creator.balance + bonus).toFixed(6);


    const updateRes = await fetch(`https://berendersepuser.onrender.com/users/${creatorId}`, {
      method: "PATCH", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        balance: newBalance
      })
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error("PUT failed: " + errText);
    }

    toast.success("Creator's balance updated successfully.");
  } catch (error) {
    console.error("Error while updating balance", error);
    toast.error("Failed to update creator's balance.");
  }
};


  try {
const nowISO = new Date().toISOString(); 
await fetch(`${API_BASE}/football/${selectedMatch.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...selectedMatch,
    winningTeam,
    status: "processing",
    processingStart: nowISO,
  }),
});


    const betsToUpdate = bets.filter(
      (bet) =>
        bet.matchId.toString() === selectedMatch.id.toString() &&
        bet.matchName === selectedMatch.name
    );

    const updatePromises = betsToUpdate.map((bet) =>
      fetch(`${API_BASE}/bet/${bet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bet,
          status: `processing ${winningTeam}`,
          processStart: nowISO,
        }),
      })
    );

    await Promise.all(updatePromises);

    await updateCreatorBalance(selectedMatch.creatorId, selectedMatch.sum1, selectedMatch.sum2);

    toast.success(
      "Match result set. Bets processing will finalize after 3 minutes."
    );

    const userData = localStorage.getItem("SEPuser");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.id) {
      toast.error("User info not found.");
      setLoading(false);
      return;
    }

    const [matchesRes, betsRes] = await Promise.all([
      fetch(`${API_BASE}/football`),
      fetch(`${API_BASE}/bet`),
    ]);
    const matchesData = await matchesRes.json();
    const betsData = await betsRes.json();

    const oneHourAgo = Date.now() - 3600 * 1000;

    const filteredMatches = matchesData.filter((match) => {
      if (!match.countdown) return false;
      const countdownTime = Date.parse(match.countdown);
      return (
        !isNaN(countdownTime) &&
        countdownTime > oneHourAgo &&
        match.creatorId === user.id
      );
    });

    const filteredBets = betsData.filter((bet) =>
      filteredMatches.some(
        (match) => match.id.toString() === bet.matchId.toString()
      )
    );

    setMatches(filteredMatches);
    setBets(filteredBets);
  } catch (error) {
    console.error(error);
    toast.error("Failed to update match result.");
  }

  setLoading(false);
};

const oneHourAgo = Date.now() - 60 * 60 * 1000;
const filteredMatches = matches.filter((match) => {
  if (!match.countdown) return false;
  const countdownTime = Date.parse(match.countdown);
  return (
    !isNaN(countdownTime) &&
    countdownTime > oneHourAgo &&
    (userInfo.level === 6 || match.creatorId === userInfo.id)
  );
});



  const formatTime = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

 return (
  <div style={{ padding: "20px", backgroundColor: "#121212", color: "#eee", minHeight: "100vh" }}>


    <h1 style={{ color: "#f5f5f5", textAlign: "center" }}>Match Result Decider</h1>

    <div style={{
      margin: "0 auto 30px auto",
      backgroundColor: "#222",
      padding: "15px",
      borderRadius: "8px",
      maxWidth: "450px",
      color: "#fff",
      textAlign: "center"
    }}>
      <h3 style={{ color: "#f5f5f5" }}>Decide Result</h3>
      <p>
        Selected match: <strong>{selectedMatch ? selectedMatch.name : "None"}</strong>
      </p>
      <p style={{ color: "orange", fontSize: "0.9rem" }}>
        {selectedMatch && !isUserMatchCreator(selectedMatch) ? "You are not authorized to decide this result." : ""}
      </p>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginTop: "10px" }}>
        <select
          disabled={!selectedMatch || (!isUserMatchCreator(selectedMatch) && userInfo.level !== 6)}
          value={winningTeam}
          onChange={(e) => setWinningTeam(e.target.value)}
          style={{
            flexGrow: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #555",
            backgroundColor: "#333",
            color: "#fff",
            cursor: selectedMatch && isUserMatchCreator(selectedMatch) ? "pointer" : "not-allowed",
            minWidth: "180px"
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
            loading ||
            !selectedMatch ||
            !winningTeam ||
            (!isUserMatchCreator(selectedMatch) && userInfo.level !== 6) ||
            isResultFinalized(selectedMatch) ||
            !isUserLevel5OrAdmin()
          }
          style={{
            backgroundColor: "#ff7043",
            border: "none",
            padding: "6px 12px",
            fontSize: "0.9rem",
            color: "#222",
            fontWeight: "bold",
            cursor: "pointer",
            borderRadius: "6px",
          }}
        >
          {loading ? "Updating..." : "Submit"}
        </button>
      </div>
    </div>

    {matches.length === 0 && <p style={{ textAlign: "center" }}>No active recent matches found.</p>}

    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
      {filteredMatches.map((match) => {
        const finalized = isResultFinalized(match);
        const isCreator = isUserMatchCreator(match);
        const processingBet = bets.find(
          (b) => b.matchId === match.id && b.status?.startsWith("processing") && b.processStart
        );

        return (
          <li
            key={match.id}
            style={{
              marginBottom: "12px",
              padding: "10px",
              backgroundColor: selectedMatch?.id === match.id ? "#ff7043" : "#333",
              borderRadius: "6px",
              cursor: !isCreator ? "not-allowed" : "pointer",
              userSelect: "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#fff",
            }}
            onClick={() => {
              if (isCreator || userInfo.level === 6) {
                setSelectedMatch(match);
                setWinningTeam("");
              } else {
                toast.warn("You are not the creator of this match.");
              }
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{match.name}</div>
              <div>Option 1: {match.option1} | Option 2: {match.option2}</div>
              <div>Bet sums: {match.sum1 || 0} USDT - {match.sum2 || 0} USDT</div>
              <div>Countdown: {formatTime(countdowns[match.id] || 0)}</div>
              <div style={{ fontSize: "0.85rem", color: "#bbb" }}>
                Creator: {match.creatorId}
              </div>
            </div>

            <div style={{ fontWeight: "bold", color: "#90caf9", fontSize: "0.9rem" }}>
              {processingBet
                ? `Checking... ${formatTime(getRemainingProcessingTime(match.id))}`
                : finalized
                  ? `Result Finalized (${match.winningTeam || "?"})`
                  : ""}
            </div>
          </li>
        );
      })}
    </ul>

    <ToastContainer position="top-right" autoClose={3000} />
  </div>
);

}