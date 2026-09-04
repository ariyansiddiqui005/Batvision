import { useState } from "react";

function App() {
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");

  const handleVideoChange = (event) => {
    setVideo(event.target.files[0]);
    setMessage("");
  };

  const uploadVideo = async () => {
    if (!video) {
      setMessage("Please select a video first.");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);

    setMessage("Uploading video...");

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
            Upload Video
          </button>

          {message && <p>{message}</p>}
        </section>

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