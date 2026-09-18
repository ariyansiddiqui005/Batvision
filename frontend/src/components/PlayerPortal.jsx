import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  CheckCircle2,
  Edit2,
  Loader2,
  FileVideo,
  AlertCircle,
  Check,
} from "lucide-react";

function PlayerPortal({ playerProfile, setPlayerProfile, playerScores, onVideoAnalyzed, currentUser, onRequireAuth }) {
  const [video, setVideo] = useState(null);
  const [analysisType, setAnalysisType] = useState("batting");
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(playerProfile);
  const [isDragging, setIsDragging] = useState(false);

  const isPlayerLoggedIn = currentUser && currentUser.role === "player";

  const handleVideoFile = (file) => {
    if (file) {
      setVideo(file);
      setCurrentAnalysis(null);
      setMessage("");
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  const uploadVideo = async () => {
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

    const playerEmail = currentUser?.email || playerProfile?.email;
    if (playerEmail) {
      formData.append("email", playerEmail.trim());
    }

    setIsUploading(true);
    setMessage(`Uploading ${analysisType} video for computer vision analysis...`);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setIsUploading(false);

      if (response.ok) {
        setMessage(data.message);
        setCurrentAnalysis(data.analysis);
        if (data.analysis && data.analysis.performance) {
          onVideoAnalyzed(data.analysis_type, data.analysis.performance);
        }
      } else {
        setMessage(data.error || "Analysis failed.");
      }
    } catch {
      setIsUploading(false);
      setMessage("Could not connect to the backend server (ensure Flask is running).");
    }
  };

  const getStatusColor = (classification) => {
    if (classification === "Exceptional" || classification === "Highly Promising") return "var(--accent-dark)";
    if (classification === "Promising" || classification === "Developing") return "var(--status-mid)";
    return "var(--status-low)";
  };

  const getClassification = (score) => {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Highly Promising";
    if (score >= 70) return "Promising";
    if (score >= 60) return "Developing";
    return "Needs Improvement";
  };

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
    } catch {
      console.log("Profile saved locally.");
    }
  };

  return (
    <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "40px 24px 80px 24px" }}>
      
      {/* Guest Notice if not signed in */}
      {!isPlayerLoggedIn && (
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
              DEMO ATHLETE PROFILE
            </span>
            <span style={{ color: "var(--border-strong)" }}>|</span>
            <p style={{ fontSize: "13px", color: "var(--text)" }}>
              Sign in as a player to upload footage, track your official index, and appear on scout combines.
            </p>
          </div>
          <button
            onClick={() => onRequireAuth("player", "Sign up or sign in to save your cricket profile.")}
            className="btn-primary"
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* ATHLETE PERFORMANCE DOSSIER HEADER */}
      <div
        className="sports-card"
        style={{
          padding: "28px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "6px",
                background: "var(--text-h)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "800",
                fontFamily: "var(--font-mono)",
              }}
            >
              {playerProfile.name ? playerProfile.name.charAt(0).toUpperCase() : "P"}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-h)" }}>
                  {playerProfile.name}
                </h1>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background: "var(--accent-subtle)",
                    color: "var(--accent-dark)",
                    border: "1px solid var(--accent-border)",
                  }}
                >
                  {playerProfile.role}
                </span>
                <span className="mono-num" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  ID: #{playerProfile.id || "BV-PROSPECT"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                <span><strong>Age:</strong> {playerProfile.age}</span>
                <span>•</span>
                <span><strong>Location:</strong> {playerProfile.location}</span>
                <span>•</span>
                <span><strong>Batting:</strong> {playerProfile.battingStyle}</span>
                <span>•</span>
                <span><strong>Bowling:</strong> {playerProfile.bowlingStyle}</span>
              </div>
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
            className="btn-secondary"
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            <Edit2 size={13} />
            {isEditingProfile ? "Close Editor" : "Edit Profile"}
          </button>
        </div>

        {/* Inline Profile Editing Form */}
        <AnimatePresence>
          {isEditingProfile && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={saveProfile}
              style={{
                overflow: "hidden",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Full Name</label>
                <input
                  type="text"
                  className="clean-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Age</label>
                <input
                  type="number"
                  className="clean-input"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  style={{ marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Cricket Role</label>
                <select
                  className="clean-input"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{ marginTop: "4px" }}
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Location / State</label>
                <input
                  type="text"
                  className="clean-input"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  style={{ marginTop: "4px" }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="btn-secondary"
                  style={{ fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: "13px" }}
                >
                  Save Profile
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 2: STANDARDIZED PERFORMANCE EVALUATION SUMMARY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        
        {/* Overall Combine Index */}
        <div
          className="sports-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                COMBINED TALENT RANK
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                50% Bat + 50% Bowl
              </span>
            </div>

            {overallScore ? (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
                  <span className="mono-num" style={{ fontSize: "48px", fontWeight: "800", color: getStatusColor(overallClassification), lineHeight: "1" }}>
                    {overallScore}
                  </span>
                  <span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: "600" }}>/ 100</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: getStatusColor(overallClassification), marginBottom: "16px" }}>
                  Classification: {overallClassification}
                </div>
                <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: "1.5" }}>
                  Standardized composite score based on verified batting and bowling video telemetry.
                </p>
              </div>
            ) : (
              <div style={{ padding: "16px 0", color: "var(--text-muted)", fontSize: "13px" }}>
                <p style={{ fontWeight: "600", color: "var(--text-h)", marginBottom: "4px" }}>
                  Combined Score Locked
                </p>
                <p>
                  Requires both Batting (50%) and Bowling (50%) video evaluations to compute an official combine rank.
                </p>
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)" }}>
            Status: {hasBatting && hasBowling ? "Full Evaluation Complete" : "Partial Video Record"}
          </div>
        </div>

        {/* Batting Performance Tile */}
        <div
          className="sports-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-dark)" }}>
                BATTING PERFORMANCE
              </span>
              {hasBatting && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    background: "var(--surface-subtle)",
                    color: getStatusColor(playerScores.batting.classification),
                  }}
                >
                  {playerScores.batting.classification}
                </span>
              )}
            </div>

            {hasBatting ? (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
                  <span className="mono-num" style={{ fontSize: "40px", fontWeight: "800", color: "var(--text-h)", lineHeight: "1" }}>
                    {playerScores.batting.score}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "600" }}>/ 100</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Stance Stability</span>
                    <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>
                      {playerScores.batting.metrics?.stance_stability} / 100
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Shot Movement</span>
                    <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>
                      {playerScores.batting.metrics?.shot_movement} / 100
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Consistency</span>
                    <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>
                      {playerScores.batting.metrics?.batting_consistency}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 0", color: "var(--text-muted)", fontSize: "13px" }}>
                <p style={{ fontWeight: "600", color: "var(--text-h)", marginBottom: "4px" }}>
                  No Batting Analysis On File
                </p>
                <p>Upload a net or match video below to measure stance and execution.</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)" }}>
            Weight: 50% of Combined Rank
          </div>
        </div>

        {/* Bowling Performance Tile */}
        <div
          className="sports-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-h)" }}>
                BOWLING PERFORMANCE
              </span>
              {hasBowling && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    background: "var(--surface-subtle)",
                    color: getStatusColor(playerScores.bowling.classification),
                  }}
                >
                  {playerScores.bowling.classification}
                </span>
              )}
            </div>

            {hasBowling ? (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
                  <span className="mono-num" style={{ fontSize: "40px", fontWeight: "800", color: "var(--text-h)", lineHeight: "1" }}>
                    {playerScores.bowling.score}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "600" }}>/ 100</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Run-Up Momentum</span>
                    <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>
                      {playerScores.bowling.metrics?.runup_momentum} / 100
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Release Stability</span>
                    <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>
                      {playerScores.bowling.metrics?.release_stability} / 100
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Delivery Consistency</span>
                    <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>
                      {playerScores.bowling.metrics?.bowling_consistency}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 0", color: "var(--text-muted)", fontSize: "13px" }}>
                <p style={{ fontWeight: "600", color: "var(--text-h)", marginBottom: "4px" }}>
                  No Bowling Analysis On File
                </p>
                <p>Upload a bowling clip below to evaluate run-up and release mechanics.</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)" }}>
            Weight: 50% of Combined Rank
          </div>
        </div>

      </div>

      {/* SECTION 3: VIDEO UPLOAD DIAGNOSTIC LAB */}
      <div
        className="sports-card"
        style={{
          padding: "32px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-h)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              VIDEO ANALYSIS UPLOAD
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Upload side-on or front-on cricket footage to run automated pose stability analysis.
            </p>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", background: "var(--surface-subtle)", padding: "3px 8px", borderRadius: "3px", border: "1px solid var(--border)" }}>
            MP4 • MOV • AVI (Max 60fps)
          </span>
        </div>

        {/* Discipline Selector (Batting vs Bowling) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setAnalysisType("batting")}
            style={{
              padding: "12px 16px",
              borderRadius: "6px",
              border: `1px solid ${analysisType === "batting" ? "var(--accent)" : "var(--border)"}`,
              background: analysisType === "batting" ? "var(--accent-subtle)" : "var(--surface)",
              color: analysisType === "batting" ? "var(--accent-dark)" : "var(--text)",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontWeight: "700" }}>Batting Video</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Stance balance, foot movement & execution
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAnalysisType("bowling")}
            style={{
              padding: "12px 16px",
              borderRadius: "6px",
              border: `1px solid ${analysisType === "bowling" ? "var(--accent)" : "var(--border)"}`,
              background: analysisType === "bowling" ? "var(--accent-subtle)" : "var(--surface)",
              color: analysisType === "bowling" ? "var(--accent-dark)" : "var(--text)",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontWeight: "700" }}>Bowling Video</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Run-up momentum & release point stability
            </div>
          </button>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("video-file-input")?.click()}
          style={{
            border: `1px dashed ${isDragging ? "var(--accent)" : "var(--border-strong)"}`,
            background: isDragging ? "var(--accent-subtle)" : "var(--surface-subtle)",
            borderRadius: "6px",
            padding: "32px 20px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "20px",
            transition: "all 0.15s ease",
          }}
        >
          <input
            id="video-file-input"
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ display: "none" }}
          />

          <FileVideo size={28} color="var(--text-muted)" style={{ margin: "0 auto 10px auto" }} />

          {video ? (
            <div>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-h)" }}>
                Selected: {video.name}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                {(video.size / (1024 * 1024)).toFixed(1)} MB • Click to replace file
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-h)" }}>
                Drag and drop a cricket video, or <span style={{ color: "var(--accent-dark)", textDecoration: "underline" }}>browse files</span>
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Side-view or pitch-level camera angle recommended
              </p>
            </div>
          )}
        </div>

        {/* Upload Action */}
        <button
          onClick={uploadVideo}
          disabled={isUploading}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "12px 20px",
            fontSize: "14px",
            opacity: isUploading ? 0.8 : 1,
            cursor: isUploading ? "wait" : "pointer",
          }}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing Video Frames via Computer Vision...
            </>
          ) : (
            <>
              <Upload size={16} />
              Run {analysisType === "batting" ? "Batting" : "Bowling"} Video Evaluation
            </>
          )}
        </button>

        {/* Upload Feedback */}
        {message && (
          <div
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              background: message.includes("success") || message.includes("complete") ? "var(--accent-subtle)" : "var(--surface-subtle)",
              color: message.includes("success") || message.includes("complete") ? "var(--accent-dark)" : "var(--text)",
              border: `1px solid ${message.includes("success") || message.includes("complete") ? "var(--accent-border)" : "var(--border)"}`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {message.includes("success") ? <CheckCircle2 size={15} color="var(--accent-dark)" /> : <AlertCircle size={15} />}
            {message}
          </div>
        )}
      </div>

      {/* SECTION 4: REAL-TIME EVALUATION DOSSIER RESULT */}
      <AnimatePresence>
        {currentAnalysis && currentAnalysis.performance && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="sports-card"
            style={{
              padding: "32px",
              borderLeft: `4px solid ${getStatusColor(currentAnalysis.performance.classification)}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                  ANALYSIS REPORT #BV-{playerProfile.id || "8842"}
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-h)", marginTop: "4px" }}>
                  {currentAnalysis.performance.analysis_type === "batting" ? "Batting Evaluation Report" : "Bowling Evaluation Report"}
                </h3>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "700",
                    background: "var(--surface-subtle)",
                    color: getStatusColor(currentAnalysis.performance.classification),
                    border: "1px solid var(--border)",
                  }}
                >
                  {currentAnalysis.performance.classification}
                </span>
              </div>
            </div>

            {/* Score Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                padding: "16px 20px",
                background: "var(--surface-subtle)",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                marginBottom: "24px",
              }}
            >
              <div className="mono-num" style={{ fontSize: "48px", fontWeight: "900", color: "var(--text-h)", lineHeight: "1" }}>
                {currentAnalysis.performance.score}
                <span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: "600" }}> / 100</span>
              </div>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "20px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-h)" }}>
                  Verified Performance Classification: {currentAnalysis.performance.classification}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Calculated across {currentAnalysis.yolo_detection?.frames_analyzed || 60} sampled video frames.
                </div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "12px" }}>
                Detailed Mechanical Breakdown
              </div>

              {currentAnalysis.performance.analysis_type === "batting" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Stance Stability</div>
                    <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                      {currentAnalysis.performance.metrics.stance_stability} <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Shot Movement</div>
                    <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                      {currentAnalysis.performance.metrics.shot_movement} <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Batting Consistency</div>
                    <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                      {currentAnalysis.performance.metrics.batting_consistency}%
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Run-Up Momentum</div>
                    <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                      {currentAnalysis.performance.metrics.runup_momentum} <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Release Stability</div>
                    <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                      {currentAnalysis.performance.metrics.release_stability} <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Bowling Consistency</div>
                    <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                      {currentAnalysis.performance.metrics.bowling_consistency}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Strengths & Deficits */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              {currentAnalysis.performance.strengths?.length > 0 && (
                <div style={{ padding: "16px", background: "var(--accent-subtle)", border: "1px solid var(--accent-border)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Check size={14} /> Observed Strengths
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6" }}>
                    {currentAnalysis.performance.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentAnalysis.performance.areas_for_improvement?.length > 0 && (
                <div style={{ padding: "16px", background: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-h)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertCircle size={14} /> Targeted Technical Corrections
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6" }}>
                    {currentAnalysis.performance.areas_for_improvement.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Scout Recommendation */}
            <div style={{ padding: "14px 16px", background: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13px" }}>
              <span style={{ fontWeight: "700", color: "var(--text-h)" }}>Scout Evaluation Note: </span>
              <span style={{ color: "var(--text)" }}>{currentAnalysis.performance.recommendation}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default PlayerPortal;
