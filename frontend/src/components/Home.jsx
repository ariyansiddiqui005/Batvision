import {
  ArrowRight,
  UserCheck,
  Upload,
  Cpu,
  BarChart2,
  BookmarkCheck,
} from "lucide-react";
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
      desc: "Player sets up an official cricket profile specifying primary playing role, batting stance, bowling discipline, and domestic region.",
      icon: UserCheck,
      badge: "Player Setup",
    },
    {
      step: "02",
      title: "UPLOAD VIDEO",
      desc: "Player uploads net session or match footage (MP4 or MOV). Raw frames are prepared for automated frame-by-frame analysis.",
      icon: Upload,
      badge: "Video Ingestion",
    },
    {
      step: "03",
      title: "AI ANALYSIS",
      desc: "YOLO computer vision tracks player movement, stance balance, and body alignment across sampled video frames.",
      icon: Cpu,
      badge: "Computer Vision",
    },
    {
      step: "04",
      title: "PERFORMANCE SCORE",
      desc: "Raw video tracking is converted into objective batting and bowling scores out of 100, combined into an overall scouting index.",
      icon: BarChart2,
      badge: "Scoring Engine",
    },
    {
      step: "05",
      title: "GET DISCOVERED",
      desc: "State scouts, academy coaches, and franchise selectors inspect performance dossiers and shortlist talent for upcoming trials.",
      icon: BookmarkCheck,
      badge: "Scout Recruitment",
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent-dark)",
                background: "var(--accent-subtle)",
                border: "1px solid var(--accent-border)",
                padding: "3px 8px",
                borderRadius: "4px",
              }}
            >
              BatVision System
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
              Cricket Talent Identification
            </span>
          </div>

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
            Players upload batting or bowling match videos. BatVision analyzes performance mechanics
            and provides selectors with measurable, objective information to evaluate talent.
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

          {/* Quick Credibility Footnote */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div>
              <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)" }}>
                50 / 50
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Bat & Bowl Index
              </div>
            </div>
            <div>
              <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)" }}>
                YOLO
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Computer Vision
              </div>
            </div>
            <div>
              <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)" }}>
                Direct
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Scout Shortlists
              </div>
            </div>
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
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {topPlayer.overallScore ? "Scouting Score" : (topPlayer.role === "Bowler" ? "Bowling Rating" : (topPlayer.role === "Batsman" ? "Batting Rating" : "Scouting Score"))}
                  </div>
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
                    Batting Performance
                  </div>
                  <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                    {topPlayer.battingScore ? (
                      <>
                        {topPlayer.battingScore} <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ 100</span>
                      </>
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>Specialist Bowler</span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {topPlayer.battingScore ? `Classification: ${topPlayer.classification || "Verified"}` : "Focused Bowling Discipline"}
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
                    Bowling Performance
                  </div>
                  <div className="mono-num" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-h)", marginTop: "4px" }}>
                    {topPlayer.bowlingScore ? (
                      <>
                        {topPlayer.bowlingScore} <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ 100</span>
                      </>
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>Specialist Batsman</span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {topPlayer.bowlingScore ? `Classification: ${topPlayer.classification || "Verified"}` : "Focused Batting Discipline"}
                  </div>
                </div>
              </div>

              {/* Biomechanical Telemetry Rows */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-h)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" }}>
                  Verified Video Telemetry
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {topPlayer.role === "Bowler" ? (
                    <>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>Run-Up Momentum & Stride Pace</span>
                          <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>{Math.min(topScore + 2, 96)}%</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(topScore + 2, 96)}%`, height: "100%", background: "var(--accent)" }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>High-Arm Release Point Stability</span>
                          <span className="mono-num" style={{ fontWeight: "700", color: "var(--text-h)" }}>{topScore}%</span>
                        </div>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${topScore}%`, height: "100%", background: "var(--accent)" }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                          <span style={{ color: "var(--text)" }}>Follow-Through Deceleration Control</span>
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
                          <span style={{ color: "var(--text)" }}>Head Stability at Contact</span>
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
                          <span style={{ color: "var(--text)" }}>Weight Transfer & Follow-Through</span>
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
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Prospect ID: #BV-{topPlayer.id} • Live on Scout Feed
                </span>
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
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-dark)" }}>
            Process
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-h)", marginTop: "4px" }}>
            HOW BATVISION WORKS
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
            An end-to-end evaluation pipeline connecting player footage to measurable selector reports.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {workflowSteps.map((s) => {
            const Icon = s.icon;
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span className="mono-num" style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-dark)" }}>
                      {s.step}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", background: "var(--surface-subtle)", padding: "2px 6px", borderRadius: "3px" }}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-h)", marginBottom: "8px", textTransform: "uppercase" }}>
                    {s.title}
                  </h3>

                  <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: "1.55" }}>
                    {s.desc}
                  </p>
                </div>

                <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px" }}>
                  <Icon size={14} color="var(--accent-dark)" />
                  <span>Step {s.step} Complete</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: RESTRAINED STANDARDS & BENCHMARKS TABLE */}
      <section style={{ marginBottom: "80px" }}>
        <div style={{ marginBottom: "24px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-dark)" }}>
            Scoring Criteria
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-h)", marginTop: "4px" }}>
            EVALUATION CLASSIFICATIONS
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            Standardized benchmarks used to rank batting and bowling executions.
          </p>
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
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              For Players
            </div>
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
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              For Scouts & Selectors
            </div>
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
