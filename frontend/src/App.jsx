import { useState } from "react";

function App() {
  const [video, setVideo] = useState(null);
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

    setMessage("Uploading and analyzing video...");

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
            <p>
              Selected Video: <strong>{video.name}</strong>
            </p>
          )}

          <button onClick={uploadVideo}>
            Upload & Analyze Video
          </button>

          {message && <p>{message}</p>}
        </section>

        {analysis && (
          <section>
            <h2>Video Analysis</h2>

            <p>
              <strong>Duration:</strong>{" "}
              {analysis.duration_seconds} seconds
            </p>

            <p>
              <strong>FPS:</strong> {analysis.fps}
            </p>

            <p>
              <strong>Total Frames:</strong>{" "}
              {analysis.frame_count}
            </p>

            <p>
              <strong>Resolution:</strong>{" "}
              {analysis.width} × {analysis.height}
            </p>

            {analysis.yolo_detection && (
              <div style={{ marginTop: "16px", padding: "14px", border: "1px solid var(--border)", borderRadius: "8px", textAlign: "left", maxWidth: "420px", margin: "16px auto 0" }}>
                <h3 style={{ margin: "0 0 10px 0" }}>🤖 YOLO Player Detection</h3>
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
                  <strong>Player Consistency:</strong> {analysis.yolo_detection.detection_consistency_percent}%
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