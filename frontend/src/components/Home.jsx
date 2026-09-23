import { ArrowRight } from "lucide-react";
import AnimatedCard from "./ui/AnimatedCard";

function Home({ setActiveTab, players = [] }) {
  // Helper to extract the best score for ranking
  const getPlayerScore = (p) => {
    if (!p) return 0;
    if (typeof p.overallScore === "number" && p.overallScore > 0) return p.overallScore;
    if (typeof p.battingScore === "number" && typeof p.bowlingScore === "number") {
      return Math.round(p.battingScore * 0.5 + p.bowlingScore * 0.5);
    }
    return Math.max(p.battingScore || 0, p.bowlingScore || 0);
  };

  // Find the prospect with the highest score from the active scout feed
  const scoredPlayers = players.filter((p) => getPlayerScore(p) > 0);
  const topPlayer = scoredPlayers.length > 0
    ? [...scoredPlayers].sort((a, b) => getPlayerScore(b) - getPlayerScore(a))[0]
    : players[0] || null;

  const topScore = topPlayer ? getPlayerScore(topPlayer) : null;

  const workflowSteps = [
    {
      step: "01",
      title: "CREATE PROFILE",
      desc: "Set up role, playing style, and domestic region.",
    },
    {
      step: "02",
      title: "UPLOAD VIDEO",
      desc: "Upload net sessions or match footage in MP4 or MOV.",
    },
    {
      step: "03",
      title: "AI ANALYSIS",
      desc: "AI tracks movement, balance, and key biomechanics.",
    },
    {
      step: "04",
      title: "PERFORMANCE SCORE",
      desc: "Get objective 0–100 ratings and diagnostic scores.",
    },
    {
      step: "05",
      title: "GET DISCOVERED",
      desc: "Selectors review dossiers and shortlist for upcoming trials.",
    },
  ];

  const standards = [
    { score: "90 – 100", label: "Exceptional", desc: "Top-tier talent ready for immediate state & high-performance academy selection.", status: "high" },
    { score: "80 – 89", label: "Highly Promising", desc: "Demonstrates consistent mechanical repeatability, solid balance, and strong upside.", status: "high" },
    { score: "70 – 79", label: "Promising", desc: "Sound foundational technique with clear technical areas targeted for development.", status: "mid" },
    { score: "60 – 69", label: "Developing", desc: "Raw athletic talent requiring structured coaching in footwork and balance.", status: "mid" },
    { score: "< 60", label: "Needs Improvement", desc: "Biomechanical fundamentals need correction before competitive trial entry.", status: "low" },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 80px 24px" }}>
      
      {/* SECTION 1: ASYMMETRIC EDITORIAL HERO */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "48px", alignItems: "center", marginBottom: "80px" }}>
        
        {/* Left Column: Bold Editorial Statement */}
        <div>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 54px)",
              fontWeight: "900",
              lineHeight: "1.05",
              letterSpacing: "-0.035em",
              color: "var(--text-h)",
              marginBottom: "24px",
            }}
          >
            DISCOVER<br />
            CRICKET TALENT<br />
            BEFORE THE TRIAL.
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "var(--text)",
              lineHeight: "1.65",
              marginBottom: "32px",
              maxWidth: "520px",
            }}
          >
            Upload match footage for instant biomechanical analysis and objective talent scoring.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setActiveTab("scout")}
              className="btn-primary"
              style={{ padding: "12px 24px", fontSize: "14px" }}
            >
              Find Talent
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setActiveTab("player")}
              className="btn-secondary"
              style={{ padding: "12px 22px", fontSize: "14px" }}
            >
              Get Evaluated
            </button>
          </div>
        </div>

        {/* Right Column: Authentic Product Scouting Dossier Preview */}
        <AnimatedCard
          className="sports-card"
          style={{
            padding: "24px",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {topPlayer ? (
            <>
              {/* Dossier Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border)",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                      Top Scout Prospect Dossier
                    </span>
                    <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "3px", background: "var(--accent-subtle)", color: "var(--accent-dark)", fontWeight: "700", textTransform: "uppercase" }}>
                      Rank #1
                    </span>
                  </div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-h)" }}>
                    {topPlayer.name}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {topPlayer.role} • {topPlayer.location} • {topPlayer.bowlingStyle || topPlayer.battingStyle || "Verified Stance"}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="mono-num" style={{ fontSize: "32px", fontWeight: "800", color: "var(--accent-dark)", lineHeight: "1" }}>
                    {topScore}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent-dark)" }}>
                    {topPlayer.classification || (topScore >= 90 ? "Exceptional" : "Highly Promising")}
                  </span>
                </div>
              </div>

              {/* Core Performance Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "6px",
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    Batting
                  </div>
                  <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                    {topPlayer.battingScore ? (
                      <>
                        {topPlayer.battingScore} <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ 100</span>
                      </>
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>—</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "6px",
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    Bowling
                  </div>
                  <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                    {topPlayer.bowlingScore ? (
                      <>
                        {topPlayer.bowlingScore} <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ 100</span>
                      </>
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Telemetry Rows */}
              <div style={{ marginBottom: "20px" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {topPlayer.role === "Bowler" ? (
                    <>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>Run-Up Momentum</span>
                          <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>{Math.min(topScore + 2, 96)}%</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(topScore + 2, 96)}%`, height: "100%", background: "var(--accent)" }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>Release Stability</span>
                          <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>{topScore}%</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${topScore}%`, height: "100%", background: "var(--accent)" }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>Follow-Through</span>
                          <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>{Math.max(topScore - 4, 80)}%</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(topScore - 4, 80)}%`, height: "100%", background: "var(--accent)" }}></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>Head Stability</span>
                          <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>{Math.min(topScore + 2, 96)}%</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(topScore + 2, 96)}%`, height: "100%", background: "var(--accent)" }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>Front Foot Alignment</span>
                          <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>{topScore}%</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${topScore}%`, height: "100%", background: "var(--accent)" }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>Weight Transfer</span>
                          <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>{Math.max(topScore - 3, 80)}%</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(topScore - 3, 80)}%`, height: "100%", background: "var(--accent)" }}></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <button
                  onClick={() => setActiveTab("scout")}
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  View in Scout Feed
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
              <p style={{ fontWeight: "600", color: "var(--text-h)" }}>Awaiting Evaluated Prospects</p>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>Upload video evaluations to populate the top prospect dossier.</p>
            </div>
          )}
        </AnimatedCard>
      </section>

      {/* SECTION 2: HOW BATVISION WORKS (CONCRETE 5-STEP PIPELINE) */}
      <section style={{ marginBottom: "80px" }}>
        <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-h)" }}>
            HOW BATVISION WORKS
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {workflowSteps.map((s) => {
            return (
              <div
                key={s.step}
                className="sports-card"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ marginBottom: "16px" }}>
                    <span className="mono-num" style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-dark)" }}>
                      {s.step}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-h)", marginBottom: "8px", textTransform: "uppercase" }}>
                    {s.title}
                  </h3>

                  <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: "1.55" }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: RESTRAINED STANDARDS & BENCHMARKS TABLE */}
      <section style={{ marginBottom: "80px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-h)" }}>
            EVALUATION CLASSIFICATIONS
          </h2>
        </div>

        <div className="sports-card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "var(--surface-subtle)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-h)", fontSize: "12px", textTransform: "uppercase" }}>
                  Score Range
                </th>
                <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-h)", fontSize: "12px", textTransform: "uppercase" }}>
                  Classification
                </th>
                <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-h)", fontSize: "12px", textTransform: "uppercase" }}>
                  Scouting Description
                </th>
                <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-h)", fontSize: "12px", textTransform: "uppercase" }}>
                  Selection Action
                </th>
              </tr>
            </thead>
            <tbody>
              {standards.map((row, idx) => (
                <tr
                  key={row.score}
                  style={{
                    borderBottom: idx === standards.length - 1 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <td className="mono-num" style={{ padding: "14px 16px", fontWeight: "700", color: "var(--text-h)" }}>
                    {row.score}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "600" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background:
                          row.status === "high"
                            ? "var(--accent-subtle)"
                            : row.status === "low"
                            ? "#fef2f2"
                            : "var(--surface-subtle)",
                        color:
                          row.status === "high"
                            ? "var(--accent-dark)"
                            : row.status === "low"
                            ? "var(--status-low)"
                            : "var(--text)",
                        border:
                          row.status === "high"
                            ? "1px solid var(--accent-border)"
                            : row.status === "low"
                            ? "1px solid #fecaca"
                            : "1px solid var(--border)",
                      }}
                    >
                      {row.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text)", maxWidth: "420px" }}>
                    {row.desc}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "13px" }}>
                    {row.status === "high"
                      ? "High Priority Shortlist"
                      : row.status === "mid"
                      ? "Monitor for Progress"
                      : "Remedial Coaching"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: DIRECT DUAL CALLOUT */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        <div
          className="sports-card"
          style={{
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-h)", marginBottom: "12px" }}>
              Upload match footage and receive an evaluation.
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: "1.6", marginBottom: "24px" }}>
              Upload batting and bowling clips. Computer vision analyzes your biomechanics and provides measurable data to verify your skill for selectors.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("player")}
            className="btn-primary"
            style={{ width: "fit-content" }}
          >
            Access Player Portal
            <ArrowRight size={15} />
          </button>
        </div>

        <div
          className="sports-card"
          style={{
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-h)", marginBottom: "12px" }}>
              Filter prospects by location, style, and score.
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: "1.6", marginBottom: "24px" }}>
              Review standardized dossiers, inspect batting and bowling ratings, and shortlist top candidates directly into your combine shortlist.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("scout")}
            className="btn-secondary"
            style={{ width: "fit-content" }}
          >
            Open Scout Feed
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

    </div>
  );
}

export default Home;
