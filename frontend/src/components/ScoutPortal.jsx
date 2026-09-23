import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Bookmark,
  FileText,
  X,
  ChevronRight,
  Filter,
  CheckCircle,
  MapPin,
} from "lucide-react";

function ScoutPortal({ players, shortlist, toggleShortlist, currentUser, onRequireAuth }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [minScoreFilter, setMinScoreFilter] = useState("All");
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);

  const isScoutLoggedIn = currentUser && currentUser.role === "scout";

  const getStatusColor = (classification) => {
    if (classification === "Exceptional" || classification === "Highly Promising") return "var(--accent-dark)";
    if (classification === "Promising" || classification === "Developing") return "var(--status-mid)";
    return "var(--status-low)";
  };

  const handleShortlistClick = (playerId) => {
    if (!isScoutLoggedIn) {
      onRequireAuth("scout", "Please sign in or register as a Scout to shortlist and save prospects.");
      return;
    }
    toggleShortlist(playerId);
  };

  // Score extraction helper for sorting top prospects to the top
  const getPlayerScore = (p) => {
    if (typeof p.overallScore === "number" && p.overallScore > 0) return p.overallScore;
    if (typeof p.battingScore === "number" && typeof p.bowlingScore === "number") {
      return Math.round(p.battingScore * 0.5 + p.bowlingScore * 0.5);
    }
    return Math.max(p.battingScore || 0, p.bowlingScore || 0);
  };

  // Filter and sort logic (best score prospects first)
  const filteredPlayers = players
    .filter((p) => {
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
    })
    .sort((a, b) => getPlayerScore(b) - getPlayerScore(a));

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px 24px" }}>
      
      {/* Guest Mode Banner if not logged in as Scout */}
      {!isScoutLoggedIn && (
        <div
          className="sports-card"
          style={{
            padding: "16px 20px",
            marginBottom: "24px",
            background: "var(--surface-subtle)",
            border: "1px solid var(--border-strong)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-h)" }}>
              SCOUT DIRECTORY VIEW
            </span>
            <span style={{ color: "var(--border-strong)" }}>|</span>
            <p style={{ fontSize: "13px", color: "var(--text)" }}>
              Sign in with a verified scout account to save prospects to combine shortlists and export evaluations.
            </p>
          </div>
          <button
            onClick={() => onRequireAuth("scout", "Sign in or register as an official talent scout.")}
            className="btn-primary"
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            Sign In as Scout
          </button>
        </div>
      )}

      {/* Directory Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: "900", color: "var(--text-h)" }}>
            PROSPECT FEED
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            Athlete dossiers evaluated with computer vision models.
          </p>
        </div>

        <button
          onClick={() => setShowShortlistOnly(!showShortlistOnly)}
          className={showShortlistOnly ? "btn-primary" : "btn-secondary"}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          <Bookmark size={15} />
          {showShortlistOnly ? "Shortlisted Only" : `Shortlisted (${shortlist.length})`}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="sports-card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by name, academy, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="clean-input"
              style={{ paddingLeft: "36px" }}
            />
          </div>

          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "auto" }}>
            Showing <strong>{filteredPlayers.length}</strong> profiles
          </span>
        </div>

        {/* Quick Filter Chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Filter size={12} /> Role:
          </span>
          {["All", "Batsman", "Bowler", "All-Rounder"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                border: `1px solid ${roleFilter === role ? "var(--accent)" : "var(--border)"}`,
                background: roleFilter === role ? "var(--accent-subtle)" : "var(--surface)",
                color: roleFilter === role ? "var(--accent-dark)" : "var(--text)",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {role === "All" ? "All Roles" : role}
            </button>
          ))}

          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 4px 0 12px" }}>
            Threshold:
          </span>
          {["All", "70", "80", "90"].map((sc) => (
            <button
              key={sc}
              onClick={() => setMinScoreFilter(sc)}
              style={{
                border: `1px solid ${minScoreFilter === sc ? "var(--accent)" : "var(--border)"}`,
                background: minScoreFilter === sc ? "var(--accent-subtle)" : "var(--surface)",
                color: minScoreFilter === sc ? "var(--accent-dark)" : "var(--text)",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {sc === "All" ? "Any Score" : `${sc}+ Index`}
            </button>
          ))}
        </div>
      </div>

      {/* Prospect Index Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="sports-card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-h)", marginBottom: "4px" }}>
            No matching prospects found.
          </p>
          <p style={{ fontSize: "13px" }}>
            Try expanding your search query or resetting the score filters.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredPlayers.map((player) => {
            const isShortlisted = shortlist.includes(player.id);
            const statusColor = getStatusColor(player.classification);

            return (
              <div
                key={player.id}
                className="sports-card-interactive"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* Top Header: Name, Location, Bookmark */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-h)" }}>
                          {player.name}
                        </h3>
                        <CheckCircle size={14} color="var(--accent-dark)" />
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <MapPin size={12} /> {player.location} • {player.age} yrs
                      </div>
                    </div>

                    <button
                      onClick={() => handleShortlistClick(player.id)}
                      title={isShortlisted ? "Remove from shortlist" : "Add to combine shortlist"}
                      style={{
                        background: isShortlisted ? "var(--accent-subtle)" : "transparent",
                        color: isShortlisted ? "var(--accent-dark)" : "var(--text-muted)",
                        border: `1px solid ${isShortlisted ? "var(--accent-border)" : "var(--border)"}`,
                        borderRadius: "4px",
                        padding: "5px 9px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Bookmark size={13} fill={isShortlisted ? "var(--accent-dark)" : "none"} />
                      {isShortlisted ? "Shortlisted" : "Shortlist"}
                    </button>
                  </div>

                  {/* Playing Discipline Tag */}
                  <div style={{ marginBottom: "16px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        background: "var(--surface-subtle)",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {player.role}
                    </span>
                  </div>

                  {/* Overall Score Box */}
                  <div
                    style={{
                      background: "var(--surface-subtle)",
                      borderRadius: "6px",
                      padding: "14px",
                      marginBottom: "14px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          COMBINED RANK
                        </div>
                        <div className="mono-num" style={{ fontSize: "28px", fontWeight: "900", color: "var(--text-h)", marginTop: "2px" }}>
                          {player.overallScore || "—"}
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}> / 100</span>
                        </div>
                      </div>

                      {player.classification && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            background: "var(--surface)",
                            color: statusColor,
                            border: "1px solid var(--border)",
                          }}
                        >
                          {player.classification}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Component Breakdown (Batting & Bowling) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                    <div style={{ padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Batting</div>
                      <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                        {player.battingScore ? `${player.battingScore}` : "—"}
                      </div>
                    </div>

                    <div style={{ padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Bowling</div>
                      <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                        {player.bowlingScore ? `${player.bowlingScore}` : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Scout Highlights */}
                  {player.highlights && (
                    <p style={{ fontSize: "12px", color: "var(--text)", marginBottom: "16px", lineHeight: "1.5" }}>
                      {player.highlights}
                    </p>
                  )}
                </div>

                {/* Inspect Action */}
                <button
                  onClick={() => setSelectedPlayerModal(player)}
                  className="btn-secondary"
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                >
                  <FileText size={13} />
                  Inspect Dossier
                  <ChevronRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* OFFICIAL PROSPECT DOSSIER MODAL */}
      <AnimatePresence>
        {selectedPlayerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(9, 13, 22, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
            onClick={() => setSelectedPlayerModal(null)}
          >
            <motion.div
              data-lenis-prevent="true"
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="sports-card"
              style={{
                maxWidth: "540px",
                width: "100%",
                padding: "28px",
                maxHeight: "88vh",
                overflowY: "auto",
                background: "var(--surface)",
                boxShadow: "var(--shadow-lg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-h)" }}>
                    {selectedPlayerModal.name}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {selectedPlayerModal.role} • {selectedPlayerModal.location} • {selectedPlayerModal.age} yrs
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPlayerModal(null)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Combined Score Strip */}
              <div
                style={{
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "16px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Overall Score
                  </div>
                  <div className="mono-num" style={{ fontSize: "32px", fontWeight: "900", color: "var(--text-h)" }}>
                    {selectedPlayerModal.overallScore ? `${selectedPlayerModal.overallScore}` : "Pending"}
                    <span style={{ fontSize: "14px", color: "var(--text-muted)" }}> / 100</span>
                  </div>
                </div>

                {selectedPlayerModal.classification && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "var(--surface)",
                      color: getStatusColor(selectedPlayerModal.classification),
                      border: "1px solid var(--border)",
                    }}
                  >
                    {selectedPlayerModal.classification}
                  </span>
                )}
              </div>

              {/* Detailed Feedback */}
              {selectedPlayerModal.reportDetails ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-dark)", marginBottom: "6px" }}>
                      Strengths
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6" }}>
                      {selectedPlayerModal.reportDetails.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-h)", marginBottom: "6px" }}>
                      Areas to Improve
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6" }}>
                      {selectedPlayerModal.reportDetails.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: "var(--surface-subtle)", padding: "12px 14px", borderRadius: "6px", fontSize: "13px", border: "1px solid var(--border)" }}>
                    <span style={{ fontWeight: "700", color: "var(--text-h)" }}>Recommendation: </span>
                    <span style={{ color: "var(--text)" }}>{selectedPlayerModal.reportDetails.recommendation}</span>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Detailed video metrics will populate once newly submitted trial clips are processed.
                </p>
              )}

              {/* Shortlist Action */}
              <button
                onClick={() => {
                  handleShortlistClick(selectedPlayerModal.id);
                  setSelectedPlayerModal(null);
                }}
                className={shortlist.includes(selectedPlayerModal.id) ? "btn-secondary" : "btn-primary"}
                style={{
                  marginTop: "24px",
                  width: "100%",
                  padding: "10px",
                  fontSize: "13px",
                }}
              >
                <Bookmark size={15} />
                {shortlist.includes(selectedPlayerModal.id) ? "Remove from Shortlist" : "Add to Shortlist"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ScoutPortal;
