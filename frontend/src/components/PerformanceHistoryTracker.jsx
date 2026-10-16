import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Activity, Trophy, ChevronRight, Play, FileText } from "lucide-react";

/**
 * Modern Performance History Tracker
 * Displays athlete technique trajectory with an SVG trendline curve,
 * session delta badges, peak score callouts, and interactive timeline steps.
 */
export default function PerformanceHistoryTracker({
  history = { batting: [], bowling: [] },
  onSelectSession = null,
  compact = false,
}) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const battingItems = history.batting || [];
  const bowlingItems = history.bowling || [];

  const hasBatting = battingItems.length > 0;
  const hasBowling = bowlingItems.length > 0;

  // Only display if at least one discipline has 2+ evaluations (showing progression)
  if (battingItems.length < 2 && bowlingItems.length < 2) {
    return null;
  }

  const formatShortDate = (dateStr) => {
    if (!dateStr) return "";
    // e.g. "18 Sep 2026" -> "18 Sep"
    const parts = dateStr.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return dateStr;
  };

  const renderDisciplineTrack = (discipline, items) => {
    if (!items || items.length === 0) return null;

    const isBatting = discipline === "batting";
    const accentColor = isBatting ? "var(--accent)" : "#2563eb"; // Turf green for Batting, Royal blue for Bowling
    const accentDark = isBatting ? "var(--accent-dark)" : "#1d4ed8";
    const accentSubtle = isBatting ? "var(--accent-subtle)" : "#eff6ff";
    const accentBorder = isBatting ? "var(--accent-border)" : "#bfdbfe";

    const scores = items.map((i) => i.score);
    const currentScore = scores[scores.length - 1];
    const initialScore = scores[0];
    const netDelta = currentScore - initialScore;
    const peakScore = Math.max(...scores);

    // SVG coordinates computation
    const svgWidth = 380;
    const svgHeight = 76;
    const padX = 32;
    const padY = 20;

    const minS = Math.min(...scores);
    const maxS = Math.max(...scores);
    const rangeS = Math.max(maxS - minS, 10); // Minimum scale to avoid flat zero division

    const points = items.map((item, idx) => {
      const x = items.length === 1 ? svgWidth / 2 : padX + (idx / (items.length - 1)) * (svgWidth - 2 * padX);
      const y = svgHeight - padY - ((item.score - minS) / rangeS) * (svgHeight - 2 * padY);
      return { x, y, ...item, idx };
    });

    // Generate smooth SVG curve path
    let curvePath = "";
    if (points.length === 1) {
      curvePath = `M ${points[0].x} ${points[0].y}`;
    } else {
      curvePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) / 2;
        const cy1 = p0.y;
        const cx2 = p0.x + (p1.x - p0.x) / 2;
        const cy2 = p1.y;
        curvePath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
      }
    }

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const areaPath = `${curvePath} L ${lastPt.x} ${svgHeight} L ${firstPt.x} ${svgHeight} Z`;

    const gradientId = `grad-track-${discipline}`;

    return (
      <div
        key={discipline}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: compact ? "16px" : "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "var(--shadow-sm)",
          transition: "border-color 0.15s ease",
        }}
      >
        {/* Track Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: accentDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Activity size={12} />
                {isBatting ? "Batting Trajectory" : "Bowling Trajectory"}
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>• {items.length} Uploads</span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
              <span className="mono-num" style={{ fontSize: "28px", fontWeight: "900", color: "var(--text-h)", lineHeight: "1" }}>
                {currentScore}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>/ 100 Current</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {/* Peak Score Pill */}
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                padding: "3px 8px",
                borderRadius: "4px",
                background: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Trophy size={11} color="var(--text-muted)" />
              Peak: <strong className="mono-num" style={{ color: "var(--text-h)" }}>{peakScore}</strong>
            </div>

            {/* Net Trajectory Delta */}
            <div
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "4px",
                background: netDelta > 0 ? "var(--accent-subtle)" : netDelta < 0 ? "#fef2f2" : "var(--surface-subtle)",
                border: `1px solid ${netDelta > 0 ? "var(--accent-border)" : netDelta < 0 ? "#fecaca" : "var(--border)"}`,
                color: netDelta > 0 ? "var(--accent-dark)" : netDelta < 0 ? "#dc2626" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              {netDelta > 0 ? (
                <>
                  <TrendingUp size={12} /> +{netDelta} pts
                </>
              ) : netDelta < 0 ? (
                <>
                  <TrendingDown size={12} /> {netDelta} pts
                </>
              ) : (
                <>
                  <Minus size={12} /> Steady
                </>
              )}
            </div>
          </div>
        </div>

        {/* SVG Sparkline & Nodes */}
        <div style={{ position: "relative", width: "100%", background: "var(--surface-subtle)", borderRadius: "6px", padding: "8px 0", border: "1px solid var(--border)" }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: "100%", height: compact ? "64px" : "72px", overflow: "visible", display: "block" }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Baseline guideline */}
            <line
              x1={padX}
              y1={points[0].y}
              x2={svgWidth - padX}
              y2={points[0].y}
              stroke="var(--border-strong)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Gradient area */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Smooth trajectory line */}
            <path
              d={curvePath}
              fill="none"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Session Node Dots */}
            {points.map((pt, idx) => {
              const isLatest = idx === points.length - 1;
              const isHovered = hoveredNode === `${discipline}-${idx}`;

              return (
                <g
                  key={idx}
                  onClick={() => onSelectSession && onSelectSession(pt.video_id, pt)}
                  onMouseEnter={() => setHoveredNode(`${discipline}-${idx}`)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: onSelectSession ? "pointer" : "default" }}
                >
                  {/* Outer pulse ring for latest point */}
                  {isLatest && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="9"
                      fill="none"
                      stroke={accentColor}
                      strokeWidth="1.5"
                      opacity="0.4"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? "6" : isLatest ? "5.5" : "4.5"}
                    fill={isLatest ? accentColor : "var(--surface)"}
                    stroke={accentColor}
                    strokeWidth="2"
                    style={{ transition: "all 0.15s ease" }}
                  />

                  {/* Floating Score Label */}
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fill={isLatest ? accentDark : "var(--text-h)"}
                    fontSize={isLatest ? "11" : "10"}
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {pt.score}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Stepper Timeline Strip */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
          {items.map((item, idx) => {
            const isLatest = idx === items.length - 1;
            const prevScore = idx > 0 ? items[idx - 1].score : null;
            const stepDelta = prevScore !== null ? item.score - prevScore : null;
            const isHovered = hoveredNode === `${discipline}-${idx}`;

            return (
              <div
                key={idx}
                onClick={() => onSelectSession && onSelectSession(item.video_id, item)}
                onMouseEnter={() => setHoveredNode(`${discipline}-${idx}`)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  flex: "1 1 0px",
                  minWidth: "68px",
                  background: isLatest ? accentSubtle : isHovered ? "var(--surface-subtle)" : "var(--surface)",
                  border: `1px solid ${isLatest ? accentBorder : isHovered ? "var(--border-strong)" : "var(--border)"}`,
                  borderRadius: "6px",
                  padding: "7px 6px",
                  textAlign: "center",
                  cursor: onSelectSession ? "pointer" : "default",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", color: isLatest ? accentDark : "var(--text-muted)", fontWeight: "700" }}>
                  <span>{isLatest ? "Current" : `#${idx + 1}`}</span>
                </div>

                <div className="mono-num" style={{ fontSize: "14px", fontWeight: "800", color: isLatest ? accentDark : "var(--text-h)" }}>
                  {item.score}
                </div>

                <div style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {formatShortDate(item.date)}
                </div>

                {/* Step Delta Pill */}
                {stepDelta !== null ? (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "700",
                      padding: "1px 4px",
                      borderRadius: "3px",
                      marginTop: "2px",
                      background: stepDelta > 0 ? "var(--accent-subtle)" : stepDelta < 0 ? "#fef2f2" : "var(--surface-subtle)",
                      color: stepDelta > 0 ? "var(--accent-dark)" : stepDelta < 0 ? "#dc2626" : "var(--text-muted)",
                    }}
                  >
                    {stepDelta > 0 ? `+${stepDelta}` : `${stepDelta}`}
                  </span>
                ) : (
                  <span style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Start
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Hover / Click Prompt */}
        {onSelectSession && (
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "right", marginTop: "-4px" }}>
            Click any session to view its verified analysis →
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="sports-card"
      style={{
        padding: compact ? "16px 20px" : "22px 24px",
        marginBottom: "24px",
        background: "var(--surface-subtle)",
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h3 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-h)" }}>
            Performance Progression Track
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>
            Chronological skill trajectory evaluated across video uploads.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : hasBatting && hasBowling ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr",
          gap: "14px",
        }}
      >
        {renderDisciplineTrack("batting", battingItems)}
        {renderDisciplineTrack("bowling", bowlingItems)}
      </div>
    </div>
  );
}
