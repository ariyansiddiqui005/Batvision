import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import PerformanceHistoryTracker from "./PerformanceHistoryTracker";
import {
  Search,
  Bookmark,
  FileText,
  X,
  ChevronRight,
  ChevronDown,
  Filter,
  CheckCircle,
  MapPin,
  Play,
  Check,
  AlertCircle,
} from "lucide-react";

function ScoutPortal({ players, shortlist, toggleShortlist, currentUser, onRequireAuth }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [minScoreFilter, setMinScoreFilter] = useState("All");
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);

  // Dropdown states for Role and Filter buttons
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Video Library and History state for Scout viewing
  const [playerVideos, setPlayerVideos] = useState([]);
  const [playerHistory, setPlayerHistory] = useState({ batting: [], bowling: [] });
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videoFilter, setVideoFilter] = useState("all");
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [activeAnalysisModal, setActiveAnalysisModal] = useState(null);

  const isScoutLoggedIn = currentUser && currentUser.role === "scout";

  // Fetch player's videos and history whenever dossier modal opens
  useEffect(() => {
    if (!selectedPlayerModal?.id) {
      setPlayerVideos([]);
      setPlayerHistory({ batting: [], bowling: [] });
      return;
    }

    let isMounted = true;
    setLoadingVideos(true);

    Promise.all([
      fetch(`http://127.0.0.1:5000/api/players/${selectedPlayerModal.id}/videos?scout_view=true`)
        .then((res) => (res.ok ? res.json() : { videos: [] }))
        .catch(() => ({ videos: [] })),
      fetch(`http://127.0.0.1:5000/api/players/${selectedPlayerModal.id}/history`)
        .then((res) => (res.ok ? res.json() : { history: { batting: [], bowling: [] } }))
        .catch(() => ({ history: { batting: [], bowling: [] } })),
    ]).then(([vData, hData]) => {
      if (!isMounted) return;
      setPlayerVideos(vData.videos || []);
      setPlayerHistory(hData.history || { batting: [], bowling: [] });
      setLoadingVideos(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedPlayerModal?.id]);

  const filteredPlayerVideos = playerVideos.filter(
    (v) => videoFilter === "all" || v.video_type === videoFilter
  );

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

        {/* Filter Dropdown Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
          
          {/* Roles Dropdown Button */}
          <div ref={roleDropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setRoleDropdownOpen((prev) => !prev);
                setFilterDropdownOpen(false);
              }}
              className="btn-secondary"
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: roleFilter !== "All" ? "var(--accent-subtle)" : "var(--surface)",
                borderColor: roleFilter !== "All" ? "var(--accent)" : "var(--border)",
                color: roleFilter !== "All" ? "var(--accent-dark)" : "var(--text-h)",
                fontWeight: "600",
              }}
            >
              <span>Roles{roleFilter !== "All" ? `: ${roleFilter}` : ""}</span>
              <ChevronDown
                size={14}
                style={{
                  transition: "transform 0.15s ease",
                  transform: roleDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {roleDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  minWidth: "160px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 50,
                  padding: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {[
                  { value: "All", label: "All Roles" },
                  { value: "Batsman", label: "Batsman" },
                  { value: "Bowler", label: "Bowler" },
                  { value: "All-Rounder", label: "All-Rounder" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRoleFilter(opt.value);
                      setRoleDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: roleFilter === opt.value ? "700" : "500",
                      color: roleFilter === opt.value ? "var(--accent-dark)" : "var(--text)",
                      background: roleFilter === opt.value ? "var(--accent-subtle)" : "transparent",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>{opt.label}</span>
                    {roleFilter === opt.value && <Check size={13} color="var(--accent-dark)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Dropdown Button (changed from Threshold) */}
          <div ref={filterDropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setFilterDropdownOpen((prev) => !prev);
                setRoleDropdownOpen(false);
              }}
              className="btn-secondary"
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: minScoreFilter !== "All" ? "var(--accent-subtle)" : "var(--surface)",
                borderColor: minScoreFilter !== "All" ? "var(--accent)" : "var(--border)",
                color: minScoreFilter !== "All" ? "var(--accent-dark)" : "var(--text-h)",
                fontWeight: "600",
              }}
            >
              <Filter size={12} />
              <span>Filter{minScoreFilter !== "All" ? `: ${minScoreFilter}+ Index` : ""}</span>
              <ChevronDown
                size={14}
                style={{
                  transition: "transform 0.15s ease",
                  transform: filterDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {filterDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  minWidth: "160px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 50,
                  padding: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {[
                  { value: "All", label: "Any Score" },
                  { value: "70", label: "70+ Index" },
                  { value: "80", label: "80+ Index" },
                  { value: "90", label: "90+ Index" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setMinScoreFilter(opt.value);
                      setFilterDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: minScoreFilter === opt.value ? "700" : "500",
                      color: minScoreFilter === opt.value ? "var(--accent-dark)" : "var(--text)",
                      background: minScoreFilter === opt.value ? "var(--accent-subtle)" : "transparent",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>{opt.label}</span>
                    {minScoreFilter === opt.value && <Check size={13} color="var(--accent-dark)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters chip if active */}
          {(roleFilter !== "All" || minScoreFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setRoleFilter("All");
                setMinScoreFilter("All");
              }}
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "var(--text-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                textDecoration: "underline",
              }}
            >
              Reset Filters
            </button>
          )}
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
                maxWidth: "660px",
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
                  marginBottom: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Current Overall Score
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

              {/* Component Breakdown (Batting & Bowling Current Scores) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                <div style={{ padding: "10px 14px", background: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "10px", color: "var(--accent-dark)", fontWeight: "700", textTransform: "uppercase" }}>
                    Current Batting
                  </div>
                  <div className="mono-num" style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-h)", marginTop: "2px" }}>
                    {selectedPlayerModal.battingScore ? `${selectedPlayerModal.battingScore}` : "—"}
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}> / 100</span>
                  </div>
                </div>

                <div style={{ padding: "10px 14px", background: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-h)", fontWeight: "700", textTransform: "uppercase" }}>
                    Current Bowling
                  </div>
                  <div className="mono-num" style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-h)", marginTop: "2px" }}>
                    {selectedPlayerModal.bowlingScore ? `${selectedPlayerModal.bowlingScore}` : "—"}
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}> / 100</span>
                  </div>
                </div>
              </div>

              {/* PERFORMANCE HISTORY TRACKER */}
              <PerformanceHistoryTracker
                history={playerHistory}
                compact={true}
                onSelectSession={(videoId) => {
                  const matched = playerVideos.find((v) => v.id === videoId);
                  if (matched) {
                    setActiveAnalysisModal(matched);
                  } else if (videoId) {
                    fetch(`http://127.0.0.1:5000/api/videos/${videoId}/analysis`)
                      .then((r) => r.json())
                      .then((data) => {
                        if (data.analysis) {
                          setActiveAnalysisModal({
                            id: videoId,
                            score: data.analysis.score,
                            classification: data.analysis.classification,
                            video_type: data.analysis.video_type,
                            analysis: data.analysis,
                            filename: data.analysis.filename,
                            date: data.analysis.date,
                            duration_formatted: data.analysis.duration_formatted,
                          });
                        }
                      })
                      .catch(() => {});
                  }
                }}
              />

              {/* PERFORMANCE VIDEOS (Read-only for scouts) */}
              <div style={{ marginBottom: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-h)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Performance Videos ({filteredPlayerVideos.length})
                    </h3>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                      Video recordings and technique evaluations made visible to scouts.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "4px", background: "var(--surface-subtle)", padding: "2px", borderRadius: "5px", border: "1px solid var(--border)" }}>
                    {["all", "batting", "bowling"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setVideoFilter(f)}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "3px",
                          fontSize: "11px",
                          fontWeight: "600",
                          border: "none",
                          cursor: "pointer",
                          textTransform: "capitalize",
                          background: videoFilter === f ? "var(--surface)" : "transparent",
                          color: videoFilter === f ? "var(--text-h)" : "var(--text-muted)",
                        }}
                      >
                        {f === "all" ? "All" : f}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingVideos ? (
                  <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", background: "var(--surface-subtle)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                    Loading performance videos...
                  </div>
                ) : filteredPlayerVideos.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", background: "var(--surface-subtle)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                    No videos published to scouts for this athlete.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
                    {filteredPlayerVideos.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: "var(--surface-subtle)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          padding: "12px 14px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                padding: "2px 6px",
                                borderRadius: "3px",
                                background: item.video_type === "batting" ? "var(--accent-subtle)" : "var(--surface)",
                                color: item.video_type === "batting" ? "var(--accent-dark)" : "var(--text-h)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {item.video_type}
                            </span>
                            <div style={{ textAlign: "right" }}>
                              <span className="mono-num" style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-h)" }}>
                                {item.score || "—"}
                              </span>
                              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}> / 100</span>
                              {item.classification && (
                                <div style={{ fontSize: "10px", color: getStatusColor(item.classification), fontWeight: "600", marginTop: "1px" }}>
                                  {item.classification}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>
                            <div>{item.date || item.uploaded_at}</div>
                            {item.duration_formatted && <div>Duration: {item.duration_formatted}</div>}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                          <button
                            onClick={() => setActiveVideoModal(item)}
                            className="btn-primary"
                            style={{ fontSize: "11px", padding: "5px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                          >
                            <Play size={11} /> Watch
                          </button>
                          <button
                            onClick={() => setActiveAnalysisModal(item)}
                            className="btn-secondary"
                            style={{ fontSize: "11px", padding: "5px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            Analysis
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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

      {/* HTML5 VIDEO PLAYER MODAL FOR SCOUTS */}
      <AnimatePresence>
        {activeVideoModal && (
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
              background: "rgba(9, 13, 22, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1100,
            }}
            onClick={() => setActiveVideoModal(null)}
          >
            <motion.div
              data-lenis-prevent="true"
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="sports-card"
              style={{
                maxWidth: "720px",
                width: "100%",
                background: "var(--surface)",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
                padding: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-h)", textTransform: "capitalize" }}>
                    {activeVideoModal.video_type} Video Footage
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Recorded: {activeVideoModal.date || activeVideoModal.uploaded_at}
                    {activeVideoModal.duration_formatted ? ` • ${activeVideoModal.duration_formatted}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: "#000000", display: "flex", justifyContent: "center" }}>
                <video
                  controls
                  autoPlay
                  src={`http://127.0.0.1:5000/api/videos/${encodeURIComponent(activeVideoModal.filename)}`}
                  style={{ width: "100%", maxHeight: "55vh" }}
                />
              </div>

              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div className="mono-num" style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-h)" }}>
                    Score: {activeVideoModal.score || "—"} <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: "11px", color: getStatusColor(activeVideoModal.classification), fontWeight: "600" }}>
                    {activeVideoModal.classification}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const v = activeVideoModal;
                    setActiveVideoModal(null);
                    setActiveAnalysisModal(v);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: "12px", padding: "7px 14px" }}
                >
                  View Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO-SPECIFIC ANALYSIS MODAL FOR SCOUTS */}
      <AnimatePresence>
        {activeAnalysisModal && (
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
              background: "rgba(9, 13, 22, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1100,
            }}
            onClick={() => setActiveAnalysisModal(null)}
          >
            <motion.div
              data-lenis-prevent="true"
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="sports-card"
              style={{
                maxWidth: "600px",
                width: "100%",
                padding: "24px",
                maxHeight: "85vh",
                overflowY: "auto",
                background: "var(--surface)",
                boxShadow: "var(--shadow-lg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-h)" }}>
                    {activeAnalysisModal.video_type === "batting" ? "Batting Video Analysis" : "Bowling Video Analysis"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Recorded on {activeAnalysisModal.date || activeAnalysisModal.uploaded_at}
                    {activeAnalysisModal.duration_formatted ? ` • ${activeAnalysisModal.duration_formatted}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setActiveAnalysisModal(null)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Score header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  background: "var(--surface-subtle)",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Video Evaluation Score
                  </div>
                  <div className="mono-num" style={{ fontSize: "36px", fontWeight: "900", color: "var(--text-h)", lineHeight: "1", marginTop: "4px" }}>
                    {activeAnalysisModal.score} <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ 100</span>
                  </div>
                </div>

                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "700",
                    background: "var(--surface)",
                    color: getStatusColor(activeAnalysisModal.classification),
                    border: "1px solid var(--border)",
                  }}
                >
                  {activeAnalysisModal.classification}
                </span>
              </div>

              {/* Metrics Breakdown */}
              {activeAnalysisModal.analysis?.metrics && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>
                    Mechanical Breakdown
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
                    {activeAnalysisModal.video_type === "batting" ? (
                      <>
                        <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Stance Stability</div>
                          <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                            {activeAnalysisModal.analysis.metrics.stance_stability || "—"} / 100
                          </div>
                        </div>
                        <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Shot Movement</div>
                          <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                            {activeAnalysisModal.analysis.metrics.shot_movement || "—"} / 100
                          </div>
                        </div>
                        <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Consistency</div>
                          <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                            {activeAnalysisModal.analysis.metrics.batting_consistency || "—"}%
                          </div>
                        </div>
                        {activeAnalysisModal.analysis.metrics.lead_elbow_angle && (
                          <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "10px", color: "var(--accent-dark)", textTransform: "uppercase", fontWeight: "700" }}>Lead Elbow</div>
                            <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent-dark)", marginTop: "2px" }}>
                              {activeAnalysisModal.analysis.metrics.lead_elbow_angle}°
                            </div>
                          </div>
                        )}
                        {activeAnalysisModal.analysis.metrics.front_knee_angle && (
                          <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Front Knee</div>
                            <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                              {activeAnalysisModal.analysis.metrics.front_knee_angle}°
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Run-Up Momentum</div>
                          <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                            {activeAnalysisModal.analysis.metrics.runup_momentum || "—"} / 100
                          </div>
                        </div>
                        <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Release Stability</div>
                          <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                            {activeAnalysisModal.analysis.metrics.release_stability || "—"} / 100
                          </div>
                        </div>
                        <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Consistency</div>
                          <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                            {activeAnalysisModal.analysis.metrics.bowling_consistency || "—"}%
                          </div>
                        </div>
                        {activeAnalysisModal.analysis.metrics.front_knee_brace_angle && (
                          <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "10px", color: "var(--accent-dark)", textTransform: "uppercase", fontWeight: "700" }}>Front-Leg Brace</div>
                            <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent-dark)", marginTop: "2px" }}>
                              {activeAnalysisModal.analysis.metrics.front_knee_brace_angle}°
                            </div>
                          </div>
                        )}
                        {activeAnalysisModal.analysis.metrics.arm_extension_angle && (
                          <div style={{ padding: "10px", background: "var(--surface-subtle)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Arm Extension</div>
                            <div className="mono-num" style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-h)", marginTop: "2px" }}>
                              {activeAnalysisModal.analysis.metrics.arm_extension_angle}°
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Strengths & Improvements */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                {activeAnalysisModal.analysis?.strengths?.length > 0 && (
                  <div style={{ padding: "12px 14px", background: "var(--accent-subtle)", borderRadius: "6px", border: "1px solid var(--accent-border)" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-dark)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Check size={13} /> Strengths
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--text)", lineHeight: "1.5" }}>
                      {activeAnalysisModal.analysis.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeAnalysisModal.analysis?.areas_for_improvement?.length > 0 && (
                  <div style={{ padding: "12px 14px", background: "var(--surface-subtle)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-h)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <AlertCircle size={13} /> Areas to Improve
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--text)", lineHeight: "1.5" }}>
                      {activeAnalysisModal.analysis.areas_for_improvement.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendation */}
              {activeAnalysisModal.analysis?.recommendation && (
                <div style={{ padding: "12px 14px", background: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", marginBottom: "20px" }}>
                  <span style={{ fontWeight: "700", color: "var(--text-h)" }}>Recommendation: </span>
                  <span style={{ color: "var(--text)" }}>{activeAnalysisModal.analysis.recommendation}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  onClick={() => {
                    const v = activeAnalysisModal;
                    setActiveAnalysisModal(null);
                    setActiveVideoModal(v);
                  }}
                  className="btn-primary"
                  style={{ fontSize: "12px", padding: "6px 14px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Play size={12} /> Watch Video
                </button>
                <button
                  onClick={() => setActiveAnalysisModal(null)}
                  className="btn-secondary"
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ScoutPortal;
