import React, { useState } from "react";

function PlayerPortal({ playerProfile, setPlayerProfile, playerScores, onVideoAnalyzed, currentUser, onRequireAuth }) {
  const [video, setVideo] = useState(null);
  const [analysisType, setAnalysisType] = useState("batting");
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [message, setMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(playerProfile);

  const isPlayerLoggedIn = currentUser && currentUser.role === "player";

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
    setCurrentAnalysis(null);
    setMessage("");
  };

  const uploadVideo = async () => {
    // If not logged in as a player, prompt authentication
    if (!isPlayerLoggedIn) {
      onRequireAuth("player", "Please sign in or register as a Player to upload and save performance videos.");
      return;
    }

    if (!video) {
      setMessage("Please select a cricket video first.");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);
    formData.append("analysis_type", analysisType);
    formData.append("player_id", playerProfile.id && String(playerProfile.id) !== "p-current" ? String(playerProfile.id) : (currentUser?.id || "4"));
    if (currentUser?.email || playerProfile?.email) {
      formData.append("email", (currentUser?.email || playerProfile?.email).trim());
    }

    setMessage(`Uploading and running AI analysis on ${analysisType} video...`);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setCurrentAnalysis(data.analysis);
        if (data.analysis && data.analysis.performance) {
          onVideoAnalyzed(data.analysis_type, data.analysis.performance);
        }
      } else {
        setMessage(data.error || "Analysis failed.");
      }
    } catch (err) {
      setMessage("Could not connect to the backend server (ensure Flask is running).");
    }
  };

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

  const getClassification = (score) => {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Highly Promising";
    if (score >= 70) return "Promising";
    if (score >= 60) return "Developing";
    return "Needs Improvement";
  };

  // Calculate Overall Scouting Score: (Batting 50%) + (Bowling 50%)
  const hasBatting = !!playerScores.batting;
  const hasBowling = !!playerScores.bowling;
  let overallScore = null;
  let overallClassification = null;

  if (hasBatting && hasBowling) {
    overallScore = Math.round(
      playerScores.batting.score * 0.5 + playerScores.bowling.score * 0.5
    );
    overallClassification = getClassification(overallScore);
  }

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!isPlayerLoggedIn) {
      onRequireAuth("player", "Please sign in or register to customize your cricket profile.");
      return;
    }
    setPlayerProfile(editForm);
    setIsEditingProfile(false);

    try {
      await fetch("http://127.0.0.1:5000/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
    } catch (err) {
      console.log("Profile saved locally.");
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "36px 20px" }}>
      {/* Guest Mode Banner if not logged in as Player */}
      {!isPlayerLoggedIn && (
        <div
          className="glass-card"
          style={{
            padding: "16px 24px",
            marginBottom: "24px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>🏏</span>
            <p style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>
              <strong>Player Registration:</strong> Create a player profile to save videos, track scores, and be discovered by scouts.
            </p>
          </div>
          <button
            onClick={() => onRequireAuth("player", "Sign up to create your verified player profile.")}
            className="btn-green"
            style={{ padding: "8px 18px", fontSize: "13px" }}
          >
            Create Player Profile / Sign In
          </button>
        </div>
      )}

      {/* Player Cricket Profile Header - Liquid Glass */}
      <div
        className="glass-card"
        style={{
          padding: "28px",
          marginBottom: "28px",
          borderTop: "3px solid #10b981",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "800",
                boxShadow: "0 6px 18px rgba(16, 185, 129, 0.35)",
                border: "2px solid rgba(255, 255, 255, 0.9)",
              }}
            >
              {playerProfile.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2 style={{ margin: 0, fontSize: "26px", color: "#0f172a" }}>{playerProfile.name}</h2>
                <span
                  style={{
                    fontSize: "12px",
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#059669",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontWeight: "700",
                  }}
                >
                  {playerProfile.role}
                </span>
              </div>
              <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#64748b" }}>
                {playerProfile.age} yrs • 📍 {playerProfile.location} • 🏏 {playerProfile.battingStyle} • 🎯 {playerProfile.bowlingStyle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isPlayerLoggedIn) {
                onRequireAuth("player", "Sign in to customize your cricket profile.");
              } else {
                setIsEditingProfile(!isEditingProfile);
              }
            }}
            className="btn-glass"
          >
            {isEditingProfile ? "Cancel" : "✏️ Edit Profile"}
          </button>
        </div>

        {/* Profile Edit Form */}
        {isEditingProfile && (
          <form onSubmit={saveProfile} style={{ marginTop: "24px", borderTop: "1px solid rgba(16, 185, 129, 0.2)", paddingTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Full Name</label>
              <input
                type="text"
                className="glass-input"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Age</label>
              <input
                type="number"
                className="glass-input"
                value={editForm.age}
                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Cricket Role</label>
              <select
                className="glass-input"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                style={{ width: "100%", marginTop: "4px" }}
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Location / State</label>
              <input
                type="text"
                className="glass-input"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1", textAlign: "right", marginTop: "10px" }}>
              <button
                type="submit"
                className="btn-green"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Overall AI Scouting Score Banner - Liquid Glass */}
      <div
        className="glass-card"
        style={{
          padding: "32px",
          marginBottom: "28px",
          textAlign: "center",
          border: overallScore ? `2px solid ${getTierColor(overallClassification)}` : "1px solid var(--border)",
          boxShadow: overallScore ? `0 12px 32px ${getTierColor(overallClassification)}20` : "var(--glass-shadow)",
        }}
      >
        <div style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.1)", color: "#059669", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
          ⭐ Overall AI Talent Evaluation
        </div>
        
        {overallScore ? (
          <div>
            <div style={{ fontSize: "64px", fontWeight: "900", color: getTierColor(overallClassification), margin: "4px 0", letterSpacing: "-1px" }}>
              {overallScore} <span style={{ fontSize: "24px", color: "#64748b", fontWeight: "600" }}>/ 100</span>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{
                  background: getTierColor(overallClassification),
                  color: "#fff",
                  padding: "6px 18px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "700",
                  display: "inline-block",
                  boxShadow: `0 4px 12px ${getTierColor(overallClassification)}40`,
                }}
              >
                {overallClassification}
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Calculated via: <strong>(Batting: {playerScores.batting.score} × 50%) + (Bowling: {playerScores.bowling.score} × 50%)</strong>
            </p>
          </div>
        ) : (
          <div style={{ padding: "16px 0" }}>
            <p style={{ color: "#0f172a", fontSize: "16px", fontWeight: "600", margin: "0 0 6px 0" }}>
              Status: Overall score requires both Batting (50%) and Bowling (50%) evaluations.
            </p>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              {hasBatting && !hasBowling && "✅ Batting evaluation complete. Upload a Bowling video below to unlock your Overall Talent Score."}
              {!hasBatting && hasBowling && "✅ Bowling evaluation complete. Upload a Batting video below to unlock your Overall Talent Score."}
              {!hasBatting && !hasBowling && "Upload both batting and bowling performance videos below to unlock your official scouting rank."}
            </p>
          </div>
        )}
      </div>

      {/* Performance Summary Cards (Batting & Bowling) - Liquid Glass */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {/* Batting Card */}
        <div className="glass-card" style={{ padding: "24px", borderTop: "3px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>🏏 Batting Evaluation</h4>
            {hasBatting && (
              <span style={{ fontSize: "12px", fontWeight: "700", color: getTierColor(playerScores.batting.classification) }}>
                {playerScores.batting.classification}
              </span>
            )}
          </div>
          {hasBatting ? (
            <div>
              <div style={{ fontSize: "40px", fontWeight: "800", color: getTierColor(playerScores.batting.classification), marginBottom: "10px" }}>
                {playerScores.batting.score} <span style={{ fontSize: "18px", color: "#64748b" }}>/ 100</span>
              </div>
              <ul style={{ fontSize: "13px", paddingLeft: "18px", margin: 0, color: "#475569", lineHeight: "1.7" }}>
                <li><strong>Stance Stability:</strong> {playerScores.batting.metrics?.stance_stability} / 100</li>
                <li><strong>Shot Movement:</strong> {playerScores.batting.metrics?.shot_movement} / 100</li>
                <li><strong>Batting Consistency:</strong> {playerScores.batting.metrics?.batting_consistency}%</li>
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#64748b", margin: "12px 0 0 0" }}>No batting video evaluated yet.</p>
          )}
        </div>

        {/* Bowling Card */}
        <div className="glass-card" style={{ padding: "24px", borderTop: "3px solid #0284c7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>🎯 Bowling Evaluation</h4>
            {hasBowling && (
              <span style={{ fontSize: "12px", fontWeight: "700", color: getTierColor(playerScores.bowling.classification) }}>
                {playerScores.bowling.classification}
              </span>
            )}
          </div>
          {hasBowling ? (
            <div>
              <div style={{ fontSize: "40px", fontWeight: "800", color: getTierColor(playerScores.bowling.classification), marginBottom: "10px" }}>
                {playerScores.bowling.score} <span style={{ fontSize: "18px", color: "#64748b" }}>/ 100</span>
              </div>
              <ul style={{ fontSize: "13px", paddingLeft: "18px", margin: 0, color: "#475569", lineHeight: "1.7" }}>
                <li><strong>Run-Up Momentum:</strong> {playerScores.bowling.metrics?.runup_momentum} / 100</li>
                <li><strong>Release Stability:</strong> {playerScores.bowling.metrics?.release_stability} / 100</li>
                <li><strong>Delivery Consistency:</strong> {playerScores.bowling.metrics?.bowling_consistency}%</li>
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#64748b", margin: "12px 0 0 0" }}>No bowling video evaluated yet.</p>
          )}
        </div>
      </div>

      {/* Video Upload & AI Analysis Tool - Liquid Glass */}
      <div
        className="glass-card"
        style={{
          padding: "32px",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#0f172a" }}>📹 Upload Video for AI Analysis</h3>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
          Select your match or practice clip and choose whether it shows Batting or Bowling.
        </p>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "#fff",
              width: "100%",
              maxWidth: "400px",
            }}
          />
        </div>

        {video && (
          <p style={{ fontSize: "14px", color: "#0f172a", margin: "0 0 18px 0" }}>
            Selected File: <strong style={{ color: "#059669" }}>{video.name}</strong>
          </p>
        )}

        {/* Video Type Radio Selector with Green Accents */}
        <div style={{ display: "flex", gap: "28px", marginBottom: "24px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              fontWeight: analysisType === "batting" ? "700" : "500",
              color: analysisType === "batting" ? "#047857" : "#475569",
              background: analysisType === "batting" ? "rgba(16, 185, 129, 0.12)" : "rgba(241, 245, 249, 0.7)",
              padding: "8px 16px",
              borderRadius: "10px",
              border: `1px solid ${analysisType === "batting" ? "rgba(16, 185, 129, 0.4)" : "var(--border)"}`,
            }}
          >
            <input
              type="radio"
              name="portalAnalysisType"
              value="batting"
              checked={analysisType === "batting"}
              onChange={(e) => setAnalysisType(e.target.value)}
              style={{ accentColor: "#10b981" }}
            />
            🏏 Batting Video
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              fontWeight: analysisType === "bowling" ? "700" : "500",
              color: analysisType === "bowling" ? "#0284c7" : "#475569",
              background: analysisType === "bowling" ? "rgba(2, 132, 199, 0.12)" : "rgba(241, 245, 249, 0.7)",
              padding: "8px 16px",
              borderRadius: "10px",
              border: `1px solid ${analysisType === "bowling" ? "rgba(2, 132, 199, 0.4)" : "var(--border)"}`,
            }}
          >
            <input
              type="radio"
              name="portalAnalysisType"
              value="bowling"
              checked={analysisType === "bowling"}
              onChange={(e) => setAnalysisType(e.target.value)}
              style={{ accentColor: "#0284c7" }}
            />
            🎯 Bowling Video
          </label>
        </div>

        <button
          onClick={uploadVideo}
          className="btn-green"
          style={{ fontSize: "15px", padding: "12px 28px" }}
        >
          Upload & Run AI {analysisType === "batting" ? "Batting" : "Bowling"} Evaluation
        </button>

        {message && (
          <p style={{ marginTop: "16px", fontSize: "14px", fontWeight: "600", color: message.includes("success") ? "#059669" : "#475569" }}>
            {message}
          </p>
        )}

        {/* Live Analysis Scorecard - Liquid Glass */}
        {currentAnalysis && currentAnalysis.performance && (
          <div
            className="glass-card"
            style={{
              marginTop: "28px",
              padding: "24px",
              borderTop: `4px solid ${getTierColor(currentAnalysis.performance.classification)}`,
              background: "rgba(255, 255, 255, 0.9)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, textTransform: "capitalize", fontSize: "18px" }}>
                {currentAnalysis.performance.analysis_type === "batting" ? "🏏 Batting Performance Report" : "🎯 Bowling Performance Report"}
              </h4>
              <span
                style={{
                  background: getTierColor(currentAnalysis.performance.classification),
                  color: "#fff",
                  padding: "4px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {currentAnalysis.performance.classification}
              </span>
            </div>

            <div style={{ textAlign: "center", margin: "16px 0" }}>
              <div style={{ fontSize: "52px", fontWeight: "900", color: getTierColor(currentAnalysis.performance.classification) }}>
                {currentAnalysis.performance.score} <span style={{ fontSize: "20px", color: "#64748b" }}>/ 100</span>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginBottom: "14px" }}>
              <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#0f172a" }}>Computer Vision Metrics</h5>
              {currentAnalysis.performance.analysis_type === "batting" ? (
                <ul style={{ fontSize: "13px", paddingLeft: "18px", margin: 0, color: "#475569", lineHeight: "1.7" }}>
                  <li><strong>Stance Stability:</strong> {currentAnalysis.performance.metrics.stance_stability} / 100</li>
                  <li><strong>Shot Movement:</strong> {currentAnalysis.performance.metrics.shot_movement} / 100</li>
                  <li><strong>Batting Presence Consistency:</strong> {currentAnalysis.performance.metrics.batting_consistency}%</li>
                </ul>
              ) : (
                <ul style={{ fontSize: "13px", paddingLeft: "18px", margin: 0, color: "#475569", lineHeight: "1.7" }}>
                  <li><strong>Run-Up Momentum:</strong> {currentAnalysis.performance.metrics.runup_momentum} / 100</li>
                  <li><strong>Release Stability:</strong> {currentAnalysis.performance.metrics.release_stability} / 100</li>
                  <li><strong>Delivery Consistency:</strong> {currentAnalysis.performance.metrics.bowling_consistency}%</li>
                </ul>
              )}
            </div>

            {/* Strengths & Improvements */}
            {currentAnalysis.performance.strengths?.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <h5 style={{ margin: "0 0 4px 0", color: "#059669", fontSize: "13px" }}>Key Strengths</h5>
                <ul style={{ fontSize: "13px", paddingLeft: "18px", margin: 0, color: "#475569", lineHeight: "1.6" }}>
                  {currentAnalysis.performance.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentAnalysis.performance.areas_for_improvement?.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <h5 style={{ margin: "0 0 4px 0", color: "#d97706", fontSize: "13px" }}>Areas for Improvement</h5>
                <ul style={{ fontSize: "13px", paddingLeft: "18px", margin: 0, color: "#475569", lineHeight: "1.6" }}>
                  {currentAnalysis.performance.areas_for_improvement.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scout Recommendation */}
            <div style={{ marginTop: "14px", padding: "12px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", fontSize: "13px" }}>
              <strong style={{ color: "#059669" }}>Scout Recommendation:</strong> {currentAnalysis.performance.recommendation}
            </div>

            {/* YOLO Tracking Spec */}
            {currentAnalysis.yolo_detection && (
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "14px", textAlign: "right" }}>
                Processed via {currentAnalysis.yolo_detection.model} • {currentAnalysis.yolo_detection.frames_analyzed} frames sampled
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerPortal;
