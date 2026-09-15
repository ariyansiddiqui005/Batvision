import React, { useState } from "react";

function ScoutPortal({ players, shortlist, toggleShortlist, currentUser, onRequireAuth }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [minScoreFilter, setMinScoreFilter] = useState("All");
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);

  const isScoutLoggedIn = currentUser && currentUser.role === "scout";

  const getTierColor = (classification) => {
    switch (classification) {
      case "Exceptional":
        return "#10b981";
      case "Highly Promising":
        return "#0284c7";
      case "Promising":
        return "#7c3aed";
      case "Developing":
        return "#d97706";
      default:
        return "#e11d48";
    }
  };

  const handleShortlistClick = (playerId) => {
    if (!isScoutLoggedIn) {
      onRequireAuth("scout", "Please sign in or register as a Scout to shortlist and save prospects.");
      return;
    }
    toggleShortlist(playerId);
  };

  // Filter logic
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "All" || p.role === roleFilter;

    let matchesScore = true;
    if (minScoreFilter !== "All") {
      const minVal = parseInt(minScoreFilter, 10);
      matchesScore = (p.overallScore || p.battingScore || p.bowlingScore || 0) >= minVal;
    }

    const matchesShortlist = !showShortlistOnly || shortlist.includes(p.id);

    return matchesSearch && matchesRole && matchesScore && matchesShortlist;
  });

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 20px" }}>
      {/* Guest Mode Banner if not logged in as Scout */}
      {!isScoutLoggedIn && (
        <div
          className="glass-card"
          style={{
            padding: "16px 24px",
            marginBottom: "24px",
            background: "rgba(2, 132, 199, 0.08)",
            border: "1px solid rgba(2, 132, 199, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>🔎</span>
            <p style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>
              <strong>Scout Portal Access:</strong> Sign in as a Scout to shortlist prospects, view full computer vision reports, and connect with talent.
            </p>
          </div>
          <button
            onClick={() => onRequireAuth("scout", "Sign in or register as an official talent scout.")}
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Register as Scout / Sign In
          </button>
        </div>
      )}

      {/* Scout Feed Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(2, 132, 199, 0.1)", color: "#0284c7", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
            🔎 Scout Talent Directory
          </div>
          <h2 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>Verified Cricket Talent Feed</h2>
          <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Grassroots cricketers evaluated objectively using BatVision computer vision.
          </p>
        </div>

        <button
          onClick={() => setShowShortlistOnly(!showShortlistOnly)}
          className="btn-glass"
          style={{
            borderColor: showShortlistOnly ? "#f59e0b" : "var(--border)",
            background: showShortlistOnly ? "rgba(245, 158, 11, 0.12)" : "var(--glass-bg)",
            color: showShortlistOnly ? "#d97706" : "var(--text-h)",
          }}
        >
          ⭐ {showShortlistOnly ? "Showing Shortlist" : `Shortlisted Talent (${shortlist.length})`}
        </button>
      </div>

      {/* Search & Filter Controls - Liquid Glass */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          gap: "14px",
          marginBottom: "32px",
          flexWrap: "wrap",
          padding: "18px 24px",
        }}
      >
        <input
          type="text"
          placeholder="Search by player name or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input"
          style={{ flex: "1 1 240px" }}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="glass-input"
        >
          <option value="All">All Cricket Roles</option>
          <option value="Batsman">Batsmen</option>
          <option value="Bowler">Bowlers</option>
          <option value="All-Rounder">All-Rounders</option>
        </select>

        <select
          value={minScoreFilter}
          onChange={(e) => setMinScoreFilter(e.target.value)}
          className="glass-input"
        >
          <option value="All">Any AI Score</option>
          <option value="70">70+ (Promising & above)</option>
          <option value="80">80+ (Highly Promising)</option>
          <option value="90">90+ (Exceptional)</option>
        </select>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
          <p style={{ fontSize: "16px", margin: 0 }}>No players match your search filters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {filteredPlayers.map((player) => {
            const isShortlisted = shortlist.includes(player.id);
            const tierColor = getTierColor(player.classification);

            return (
              <div
                key={player.id}
                className="glass-card glass-card-hover"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderTop: `3px solid ${player.overallScore ? tierColor : "#10b981"}`,
                }}
              >
                <div>
                  {/* Top Bar: Name & Shortlist */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "19px", color: "#0f172a" }}>{player.name}</h3>
                      <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                        {player.age} yrs • 📍 {player.location} • <strong style={{ color: "#059669" }}>{player.role}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => handleShortlistClick(player.id)}
                      title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                      style={{
                        background: isShortlisted ? "#f59e0b" : "rgba(255, 255, 255, 0.8)",
                        color: isShortlisted ? "#fff" : "#64748b",
                        border: `1px solid ${isShortlisted ? "#f59e0b" : "var(--border)"}`,
                        borderRadius: "8px",
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        boxShadow: isShortlisted ? "0 2px 8px rgba(245, 158, 11, 0.35)" : "none",
                      }}
                    >
                      {isShortlisted ? "⭐ Saved" : "☆ Save"}
                    </button>
                  </div>

                  {/* Overall Score Badge - Liquid Glass inner pill */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.65)",
                      borderRadius: "12px",
                      padding: "14px",
                      textAlign: "center",
                      marginBottom: "16px",
                      border: `1px solid ${player.overallScore ? tierColor : "var(--border)"}`,
                      boxShadow: player.overallScore ? `0 4px 16px ${tierColor}18` : "none",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>
                      Overall AI Talent Score
                    </div>
                    {player.overallScore ? (
                      <div>
                        <div style={{ fontSize: "36px", fontWeight: "900", color: tierColor, margin: "2px 0" }}>
                          {player.overallScore} <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "600" }}>/ 100</span>
                        </div>
                        <span style={{ background: tierColor, color: "#fff", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                          {player.classification}
                        </span>
                      </div>
                    ) : (
                      <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                        Requires both Batting & Bowling evaluations
                      </p>
                    )}
                  </div>

                  {/* Component Scores */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ background: "rgba(241, 245, 249, 0.6)", padding: "10px", borderRadius: "10px", textAlign: "center", border: "1px solid rgba(226, 232, 240, 0.6)" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>🏏 Batting</div>
                      <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                        {player.battingScore ? `${player.battingScore} ⭐` : "N/A"}
                      </div>
                    </div>
                    <div style={{ background: "rgba(241, 245, 249, 0.6)", padding: "10px", borderRadius: "10px", textAlign: "center", border: "1px solid rgba(226, 232, 240, 0.6)" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>🎯 Bowling</div>
                      <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                        {player.bowlingScore ? `${player.bowlingScore} ⭐` : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {player.highlights && (
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                      <strong>Key Insight:</strong> {player.highlights}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPlayerModal(player)}
                  className="btn-glass"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  Inspect Full AI Report →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Full AI Report Modal - Liquid Glass */}
      {selectedPlayerModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() => setSelectedPlayerModal(null)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: "520px",
              width: "100%",
              padding: "28px",
              maxHeight: "85vh",
              overflowY: "auto",
              textAlign: "left",
              background: "rgba(255, 255, 255, 0.95)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px" }}>📊 Scout Report: {selectedPlayerModal.name}</h3>
              <button
                onClick={() => setSelectedPlayerModal(null)}
                style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
              {selectedPlayerModal.age} yrs • {selectedPlayerModal.location} • {selectedPlayerModal.role} • {selectedPlayerModal.battingStyle} • {selectedPlayerModal.bowlingStyle}
            </p>

            <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "16px", borderRadius: "12px", marginBottom: "18px" }}>
              <h4 style={{ margin: "0 0 6px 0", color: "#059669" }}>Scouting Evaluation Score</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                Formula: (Batting 50%) + (Bowling 50%)
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                Overall Score: {selectedPlayerModal.overallScore ? `${selectedPlayerModal.overallScore} / 100 (${selectedPlayerModal.classification})` : "Pending completion of both evaluations"}
              </p>
            </div>

            {selectedPlayerModal.reportDetails ? (
              <div>
                <h4 style={{ margin: "0 0 6px 0", color: "#059669", fontSize: "14px" }}>Verified Strengths</h4>
                <ul style={{ fontSize: "13px", paddingLeft: "18px", margin: "0 0 14px 0", color: "#475569", lineHeight: "1.6" }}>
                  {selectedPlayerModal.reportDetails.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>

                <h4 style={{ margin: "0 0 6px 0", color: "#d97706", fontSize: "14px" }}>Areas for Improvement</h4>
                <ul style={{ fontSize: "13px", paddingLeft: "18px", margin: "0 0 14px 0", color: "#475569", lineHeight: "1.6" }}>
                  {selectedPlayerModal.reportDetails.improvements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>

                <div style={{ background: "rgba(241, 245, 249, 0.8)", padding: "12px", borderRadius: "8px", fontSize: "13px", marginTop: "12px", border: "1px solid var(--border)" }}>
                  <strong style={{ color: "#0f172a" }}>Scout Recommendation:</strong> {selectedPlayerModal.reportDetails.recommendation}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "#64748b" }}>Detailed AI metrics will appear once new videos are uploaded and processed.</p>
            )}

            <button
              onClick={() => {
                handleShortlistClick(selectedPlayerModal.id);
                setSelectedPlayerModal(null);
              }}
              className={shortlist.includes(selectedPlayerModal.id) ? "btn-glass" : "btn-green"}
              style={{
                marginTop: "22px",
                width: "100%",
                padding: "12px",
              }}
            >
              {shortlist.includes(selectedPlayerModal.id) ? "Remove from Shortlist" : "⭐ Add to Scout Shortlist"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoutPortal;
