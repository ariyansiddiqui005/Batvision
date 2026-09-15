import React from "react";

function Home({ setActiveTab }) {
  const tiers = [
    { range: "90 – 100", label: "Exceptional", color: "#10b981", bg: "rgba(16, 185, 129, 0.08)", desc: "Top-tier talent ready for state/national academy trials" },
    { range: "80 – 89", label: "Highly Promising", color: "#0284c7", bg: "rgba(2, 132, 199, 0.08)", desc: "Strong mechanical repeatability & high scouting potential" },
    { range: "70 – 79", label: "Promising", color: "#7c3aed", bg: "rgba(124, 58, 237, 0.08)", desc: "Solid foundational skills with good growth trajectory" },
    { range: "60 – 69", label: "Developing", color: "#d97706", bg: "rgba(217, 119, 6, 0.08)", desc: "Raw talent needing targeted coaching and refinement" },
    { range: "Below 60", label: "Needs Improvement", color: "#e11d48", bg: "rgba(225, 29, 72, 0.08)", desc: "Foundational mechanics require training" },
  ];

  return (
    <div style={{ maxWidth: "1060px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.1)",
            color: "#059669",
            padding: "6px 18px",
            borderRadius: "30px",
            fontSize: "13px",
            fontWeight: "700",
            marginBottom: "20px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            boxShadow: "0 2px 10px rgba(16, 185, 129, 0.12)",
          }}
        >
          <span>⚡</span> Next-Gen AI Cricket Scouting Platform
        </div>
        
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "800",
            margin: "0 0 18px 0",
            letterSpacing: "-1.5px",
            lineHeight: "1.15",
            color: "#0f172a",
          }}
        >
          Discover & Scout Cricket Talent <br />
          with <span style={{ background: "linear-gradient(135deg, #10b981 0%, #047857 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Computer Vision</span>
        </h1>
        
        <p style={{ fontSize: "18px", color: "#475569", maxWidth: "680px", margin: "0 auto 36px auto", lineHeight: "1.6" }}>
          Bridging the gap between grassroots cricketers and professional scouts through automated pose stability, run-up momentum analysis, and objective 50/50 scouting scoring.
        </p>

        {/* Action Gateways - Liquid Glass Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginTop: "28px" }}>
          <div
            onClick={() => setActiveTab("player")}
            className="glass-card glass-card-hover"
            style={{
              padding: "32px",
              textAlign: "left",
              cursor: "pointer",
              borderLeft: "4px solid #10b981",
            }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "16px" }}>
              🏏
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#0f172a" }}>For Cricket Players</h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", lineHeight: "1.5" }}>
              Upload your batting or bowling clips, receive AI-evaluated stability and momentum scores, build your verified cricket profile, and get noticed by academies.
            </p>
            <button
              onClick={() => setActiveTab("player")}
              className="btn-green"
              style={{ width: "100%" }}
            >
              Enter Player Portal →
            </button>
          </div>

          <div
            onClick={() => setActiveTab("scout")}
            className="glass-card glass-card-hover"
            style={{
              padding: "32px",
              textAlign: "left",
              cursor: "pointer",
              borderLeft: "4px solid #0284c7",
            }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(2, 132, 199, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "16px" }}>
              🔎
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#0f172a" }}>For Scouts & Coaches</h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", lineHeight: "1.5" }}>
              Search and filter grassroots talent by role and objective AI score, inspect stance stability and run-up reports, and shortlist rising stars for trials.
            </p>
            <button
              onClick={() => setActiveTab("scout")}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "10px 22px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              }}
            >
              Explore Talent Feed →
            </button>
          </div>
        </div>
      </div>

      {/* How BatVision Works - Liquid Glass */}
      <div className="glass-card" style={{ marginBottom: "56px", padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "26px", margin: "0 0 8px 0" }}>How BatVision AI Works</h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>4-step objective talent scouting pipeline</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "20px" }}>
          <div style={{ textAlign: "center", padding: "16px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📹</div>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#0f172a" }}>1. Video Selection</h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Choose Batting or Bowling and upload a match or net practice video.</p>
          </div>
          <div style={{ textAlign: "center", padding: "16px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🤖</div>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#0f172a" }}>2. YOLO Tracking</h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Ultralytics YOLOv8 samples frames to detect stance, body displacement, and momentum.</p>
          </div>
          <div style={{ textAlign: "center", padding: "16px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📊</div>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#0f172a" }}>3. 50/50 Scoring</h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Objective formula: (Batting × 50%) + (Bowling × 50%) = Overall Talent Score.</p>
          </div>
          <div style={{ textAlign: "center", padding: "16px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏆</div>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#0f172a" }}>4. Scout Connection</h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Verified talent is discoverable by club scouts and state trial selectors.</p>
          </div>
        </div>
      </div>

      {/* Talent Tiers - Liquid Glass Cards */}
      <div className="glass-card" style={{ padding: "36px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "24px", fontSize: "22px" }}>
          Talent Classification Standards
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          {tiers.map((t, idx) => (
            <div
              key={idx}
              style={{
                padding: "20px 14px",
                borderRadius: "14px",
                border: `1px solid ${t.color}`,
                background: t.bg,
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ color: t.color, fontWeight: "800", fontSize: "16px", marginBottom: "4px" }}>
                {t.label}
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                {t.range}
              </div>
              <p style={{ fontSize: "11px", color: "#475569", margin: 0, lineHeight: "1.4" }}>
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
