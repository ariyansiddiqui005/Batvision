import { useState } from "react";

function App() {
  const [video, setVideo] = useState(null);
  const [analysisType, setAnalysisType] = useState("batting");
  const [analysis, setAnalysis] = useState(null);
  const [message, setMessage] = useState("");

  const handleVideoChange = (event) => {
    setVideo(event.target.files[0]);
    setAnalysis(null);
    setMessage("");
  };

  const uploadVideo = async () => {
    if (!video) {
      setMessage("Please select a video first.");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);
    formData.append("analysis_type", analysisType);

    setMessage(`Uploading and analyzing ${analysisType} video...`);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setAnalysis(data.analysis);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Could not connect to the backend.");
    }
  };

  const getTierColor = (classification) => {
    switch (classification) {
      case "Exceptional":
        return "#10b981";
      case "Highly Promising":
        return "#3b82f6";
      case "Promising":
        return "#8b5cf6";
      case "Developing":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  };

  return (
    <div>
      <header>
        <h1>BatVision</h1>
        <p>AI-Powered Cricket Scouting & Performance Analysis</p>
      </header>

      <main>
        <section>
          <h2>Discover Cricket Talent with AI</h2>

          <p>
            Upload a cricket video and analyze player performance
            using Artificial Intelligence.
          </p>

          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
          />

          {video && (
            <p style={{ marginTop: "10px" }}>
              Selected Video: <strong>{video.name}</strong>
            </p>
          )}

          {/* Explicit Video Type Selection */}
          <div style={{ margin: "16px 0", display: "flex", justifyContent: "center", gap: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: analysisType === "batting" ? "bold" : "normal" }}>
              <input
                type="radio"
                name="analysisType"
                value="batting"
                checked={analysisType === "batting"}
                onChange={(e) => setAnalysisType(e.target.value)}
              />
              🏏 Batting Video
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: analysisType === "bowling" ? "bold" : "normal" }}>
              <input
                type="radio"
                name="analysisType"
                value="bowling"
                checked={analysisType === "bowling"}
                onChange={(e) => setAnalysisType(e.target.value)}
              />
              🎯 Bowling Video
            </label>
          </div>

          <button onClick={uploadVideo}>
            Upload & Analyze {analysisType === "batting" ? "Batting" : "Bowling"} Video
          </button>

          {message && <p style={{ marginTop: "12px" }}>{message}</p>}
        </section>

        {analysis && (
          <section>
            <h2>Performance Evaluation</h2>

            {/* Cricket Performance Scorecard */}
            {analysis.performance && (
              <div
                style={{
                  margin: "20px auto",
                  padding: "20px",
                  borderRadius: "12px",
                  border: `2px solid ${getTierColor(analysis.performance.classification)}`,
                  maxWidth: "520px",
                  textAlign: "left",
                  background: "var(--social-bg)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, textTransform: "capitalize" }}>
                    {analysis.performance.analysis_type === "batting" ? "🏏 Batting Performance" : "🎯 Bowling Performance"}
                  </h3>
                  <span
                    style={{
                      background: getTierColor(analysis.performance.classification),
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "16px",
                      fontSize: "13px",
                      fontWeight: "bold"
                    }}
                  >
                    {analysis.performance.classification}
                  </span>
                </div>

                <div style={{ margin: "16px 0", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", fontWeight: "bold", color: getTierColor(analysis.performance.classification) }}>
                    {analysis.performance.score}
                    <span style={{ fontSize: "20px", color: "var(--text)" }}> / 100</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--text)" }}>
                    AI-Calculated {analysis.performance.analysis_type === "batting" ? "Batting" : "Bowling"} Score
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                  <h4 style={{ margin: "0 0 8px 0" }}>Key Performance Metrics</h4>
                  {analysis.performance.analysis_type === "batting" ? (
                    <ul style={{ paddingLeft: "20px", margin: "0 0 12px 0" }}>
                      <li><strong>Stance Stability:</strong> {analysis.performance.metrics.stance_stability} / 100</li>
                      <li><strong>Shot Commitment & Movement:</strong> {analysis.performance.metrics.shot_movement} / 100</li>
                      <li><strong>Batting Consistency:</strong> {analysis.performance.metrics.batting_consistency}%</li>
                    </ul>
                  ) : (
                    <ul style={{ paddingLeft: "20px", margin: "0 0 12px 0" }}>
                      <li><strong>Run-Up Momentum:</strong> {analysis.performance.metrics.runup_momentum} / 100</li>
                      <li><strong>Release Point Stability:</strong> {analysis.performance.metrics.release_stability} / 100</li>
                      <li><strong>Delivery Consistency:</strong> {analysis.performance.metrics.bowling_consistency}%</li>
                    </ul>
                  )}
                </div>

                {analysis.performance.strengths?.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#10b981" }}>Key Strengths</h4>
                    <ul style={{ paddingLeft: "20px", margin: "0" }}>
                      {analysis.performance.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.performance.areas_for_improvement?.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#f59e0b" }}>Areas for Improvement</h4>
                    <ul style={{ paddingLeft: "20px", margin: "0" }}>
                      {analysis.performance.areas_for_improvement.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ marginTop: "14px", padding: "10px", background: "var(--code-bg)", borderRadius: "6px" }}>
                  <strong>Scout Recommendation:</strong>
                  <p style={{ marginTop: "4px", fontSize: "14px" }}>{analysis.performance.recommendation}</p>
                </div>

                <div style={{ marginTop: "14px", fontSize: "12px", color: "var(--text)", textAlign: "center", fontStyle: "italic" }}>
                  ⭐ Overall Scouting Score = (Batting × 50%) + (Bowling × 50%).
                  <br />
                  Upload both batting and bowling videos to unlock the overall player score.
                </div>
              </div>
            )}

            {/* Video & YOLO Specs */}
            <div style={{ marginTop: "16px", fontSize: "14px" }}>
              <p>
                <strong>Video:</strong> {analysis.duration_seconds}s | {analysis.fps} FPS | {analysis.width} × {analysis.height}
              </p>
            </div>

            {analysis.yolo_detection && (
              <div style={{ marginTop: "16px", padding: "14px", border: "1px solid var(--border)", borderRadius: "8px", textAlign: "left", maxWidth: "520px", margin: "16px auto 0" }}>
                <h3 style={{ margin: "0 0 10px 0" }}>🤖 YOLO Tracking Summary</h3>
                <p>
                  <strong>Model:</strong> {analysis.yolo_detection.model}
                </p>
                <p>
                  <strong>Sampled Frames Analyzed:</strong> {analysis.yolo_detection.frames_analyzed}
                </p>
                <p>
                  <strong>Max Players in Frame:</strong> {analysis.yolo_detection.max_players_detected}
                </p>
                <p>
                  <strong>Avg Players per Frame:</strong> {analysis.yolo_detection.avg_players_detected}
                </p>
                <p>
                  <strong>Player Presence Consistency:</strong> {analysis.yolo_detection.detection_consistency_percent}%
                </p>
                <p style={{ marginTop: "8px", color: "#10b981", fontWeight: "bold" }}>
                  ✔ {analysis.yolo_detection.status}
                </p>
              </div>
            )}
          </section>
        )}

        <section>
          <h2>What BatVision Does</h2>

          <div>
            <h3>🏏 Batting Analysis</h3>
            <p>Analyze batting performance and consistency.</p>
          </div>

          <div>
            <h3>🎯 Bowling Analysis</h3>
            <p>Evaluate bowling accuracy and performance.</p>
          </div>

          <div>
            <h3>⭐ AI Scouting Score</h3>
            <p>Generate an overall player performance score.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;