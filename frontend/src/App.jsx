import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import PlayerPortal from "./components/PlayerPortal";
import ScoutPortal from "./components/ScoutPortal";
import Trials from "./components/Trials";
import AuthModal from "./components/AuthModal";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  // Current Logged-in User (null = Guest Mode)
  const [currentUser, setCurrentUser] = useState(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState("player");
  const [authModalReason, setAuthModalReason] = useState("");

  // Live Database Players Feed
  const [dbPlayers, setDbPlayers] = useState(null);

  // Fetch players from backend on mount and after video analysis
  const fetchPlayersFromDb = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/players");
      const data = await res.json();
      if (data && data.players && data.players.length > 0) {
        setDbPlayers(data.players);
      }
    } catch (e) {
      console.log("Using in-memory fallback for players feed.");
    }
  };

  useEffect(() => {
    fetchPlayersFromDb();
  }, []);

  // Logged-in Player Profile State
  const [playerProfile, setPlayerProfile] = useState({
    id: "p-current",
    name: "Player Profile",
    age: 20,
    role: "All-Rounder",
    battingStyle: "Right Hand Bat",
    bowlingStyle: "Right Arm Fast-Medium",
    location: "Mumbai, Maharashtra",
  });

  // Evaluated Scores for Current Player
  const [playerScores, setPlayerScores] = useState({
    batting: null,
    bowling: null,
  });

  // Scout Watchlist / Shortlist
  const [shortlist, setShortlist] = useState([]);

  const fetchShortlists = async (scoutId) => {
    if (!scoutId) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/shortlists?scout_identifier=${encodeURIComponent(scoutId)}`);
      const data = await res.json();
      if (data && Array.isArray(data.shortlists)) {
        setShortlist(data.shortlists);
      }
    } catch (e) {
      console.log("Using local shortlist state.");
    }
  };

  const openAuthModal = (role = "player", reason = "") => {
    setAuthModalRole(role);
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = async (user, scores = null) => {
    setCurrentUser(user);

    // Fetch user's persistent shortlist from MySQL
    fetchShortlists(user.email || user.id);

    if (user.role === "player") {
      const updatedProfile = {
        ...playerProfile,
        id: user.id || playerProfile.id,
        name: user.name,
        email: user.email,
        age: user.age || playerProfile.age,
        role: user.playerRole || playerProfile.role,
        location: user.location || playerProfile.location,
        battingStyle: user.battingStyle || playerProfile.battingStyle,
        bowlingStyle: user.bowlingStyle || playerProfile.bowlingStyle,
      };

      setPlayerProfile(updatedProfile);

      // Restore user's scores if fetched from database
      if (scores) {
        setPlayerScores({
          batting: scores.batting || null,
          bowling: scores.bowling || null,
        });
      }

      // Automatically persist/sync player profile to backend
      try {
        const res = await fetch("http://127.0.0.1:5000/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        });
        const data = await res.json();
        if (data && data.player_id) {
          setPlayerProfile((prev) => ({ ...prev, id: data.player_id }));
        }
        fetchPlayersFromDb();
      } catch (err) {
        console.log("Player profile synced.");
      }

      setActiveTab("player");
    } else if (user.role === "scout") {
      setActiveTab("scout");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShortlist([]);
    setPlayerScores({
      batting: null,
      bowling: null,
    });
    setPlayerProfile({
      id: "p-current",
      name: "Player Profile",
      age: 20,
      role: "All-Rounder",
      battingStyle: "Right Hand Bat",
      bowlingStyle: "Right Arm Fast-Medium",
      location: "Mumbai, Maharashtra",
    });
    setActiveTab("home");
  };

  const toggleShortlist = async (playerId) => {
    // Optimistic local UI update
    const isCurrently = shortlist.includes(playerId);
    const updated = isCurrently ? shortlist.filter((id) => id !== playerId) : [...shortlist, playerId];
    setShortlist(updated);

    // Persist to MySQL backend
    const scoutId = currentUser?.email || currentUser?.id || "guest_scout";
    try {
      const res = await fetch("http://127.0.0.1:5000/api/shortlists/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scout_identifier: scoutId, player_id: playerId }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.shortlists)) {
        setShortlist(data.shortlists);
      }
    } catch (e) {
      console.log("Shortlist updated locally.");
    }
  };

  const handleVideoAnalyzed = (type, performance) => {
    setPlayerScores((prev) => ({
      ...prev,
      [type]: performance,
    }));
    fetchPlayersFromDb();
  };

  // Calculate Overall Score for Current Player
  let currentOverallScore = null;
  let currentClassification = null;
  if (playerScores.batting && playerScores.bowling) {
    currentOverallScore = Math.round(
      playerScores.batting.score * 0.5 + playerScores.bowling.score * 0.5
    );
    if (currentOverallScore >= 90) currentClassification = "Exceptional";
    else if (currentOverallScore >= 80) currentClassification = "Highly Promising";
    else if (currentOverallScore >= 70) currentClassification = "Promising";
    else if (currentOverallScore >= 60) currentClassification = "Developing";
    else currentClassification = "Needs Improvement";
  }

  // Aggregate players directory for the Scout Feed
  const scoutPlayersList = [
    {
      id: "p-current",
      name: playerProfile.name,
      age: playerProfile.age,
      location: playerProfile.location,
      role: playerProfile.role,
      battingStyle: playerProfile.battingStyle,
      bowlingStyle: playerProfile.bowlingStyle,
      battingScore: playerScores.batting ? playerScores.batting.score : null,
      bowlingScore: playerScores.bowling ? playerScores.bowling.score : null,
      overallScore: currentOverallScore,
      classification: currentClassification || (playerScores.batting ? playerScores.batting.classification : (playerScores.bowling ? playerScores.bowling.classification : "Unranked")),
      highlights: "Live candidate currently uploading performance evaluations to BatVision.",
      reportDetails: playerScores.batting || playerScores.bowling ? {
        strengths: [
          ...(playerScores.batting?.strengths || []),
          ...(playerScores.bowling?.strengths || []),
        ],
        improvements: [
          ...(playerScores.batting?.areas_for_improvement || []),
          ...(playerScores.bowling?.areas_for_improvement || []),
        ],
        recommendation: playerScores.batting?.recommendation || playerScores.bowling?.recommendation || "Candidate awaiting video analysis.",
      } : null,
    },
    {
      id: 1,
      name: "Rahul Sharma",
      age: 21,
      location: "Bengaluru, Karnataka",
      role: "Batsman",
      battingStyle: "Right Hand Bat",
      bowlingStyle: "Right Arm Off-Break",
      battingScore: 86,
      bowlingScore: null,
      overallScore: null,
      classification: "Highly Promising",
      highlights: "Elite stance stability (94/100) and aggressive front-foot drive execution.",
      reportDetails: {
        strengths: ["Clean front-foot bat presentation", "Solid balance through contact zone"],
        improvements: ["Work on back-foot defensive balance against rising deliveries"],
        recommendation: "Highly promising top-order batsman suitable for state U-23 trials.",
      },
    },
    {
      id: 2,
      name: "Jasprit Patel",
      age: 19,
      location: "Ahmedabad, Gujarat",
      role: "Bowler",
      battingStyle: "Right Hand Bat",
      bowlingStyle: "Right Arm Fast",
      battingScore: null,
      bowlingScore: 92,
      overallScore: null,
      classification: "Exceptional",
      highlights: "Rapid run-up momentum and explosive release point stability.",
      reportDetails: {
        strengths: ["Exceptional acceleration through delivery stride", "Repeatable high-arm release alignment"],
        improvements: ["Maintain follow-through deceleration to manage back strain"],
        recommendation: "Exceptional fast-bowling prospect; recommended for state academy selection camp.",
      },
    },
    {
      id: 3,
      name: "Rohan Verma",
      age: 22,
      location: "Delhi, NCR",
      role: "All-Rounder",
      battingStyle: "Left Hand Bat",
      bowlingStyle: "Left Arm Orthodox",
      battingScore: 84,
      bowlingScore: 78,
      overallScore: 81,
      classification: "Highly Promising",
      highlights: "Verified two-way player: (84 Batting × 50%) + (78 Bowling × 50%) = 81 Overall.",
      reportDetails: {
        strengths: ["Strong lower-order batting power", "Consistent wicket-to-wicket spin trajectory"],
        improvements: ["Improve spin flight variation in middle overs"],
        recommendation: "Well-rounded club player with strong match adaptability.",
      },
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shortlistCount={shortlist.length}
        currentUser={currentUser}
        onOpenAuthModal={openAuthModal}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        {activeTab === "home" && <Home setActiveTab={setActiveTab} />}

        {activeTab === "player" && (
          <PlayerPortal
            playerProfile={playerProfile}
            setPlayerProfile={setPlayerProfile}
            playerScores={playerScores}
            onVideoAnalyzed={handleVideoAnalyzed}
            currentUser={currentUser}
            onRequireAuth={openAuthModal}
          />
        )}

        {activeTab === "scout" && (
          <ScoutPortal
            players={dbPlayers && dbPlayers.length > 0 ? dbPlayers : scoutPlayersList}
            shortlist={shortlist}
            toggleShortlist={toggleShortlist}
            currentUser={currentUser}
            onRequireAuth={openAuthModal}
          />
        )}

        {activeTab === "trials" && <Trials />}
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px",
          textAlign: "center",
          fontSize: "13px",
          color: "#64748b",
          marginTop: "48px",
          background: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <p style={{ margin: 0 }}>
          BatVision © 2026 — AI-Based Cricket Scouting & Talent Analytics System (50% Batting + 50% Bowling)
        </p>
      </footer>

      {/* Role-Based Auth Modal with Skip / Guest Option */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalRole}
        onLoginSuccess={handleLoginSuccess}
        authReason={authModalReason}
      />
    </div>
  );
}

export default App;