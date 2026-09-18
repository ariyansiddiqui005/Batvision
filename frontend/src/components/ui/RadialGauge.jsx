import { motion } from "motion/react";
import CounterTicker from "./CounterTicker";

/**
 * RadialGauge component
 * Displays a high-tech circular SVG score gauge with glowing stroke and central counter.
 */
export default function RadialGauge({
  score,
  size = 140,
  strokeWidth = 10,
  color = "#10b981",
  trackColor = "rgba(226, 232, 240, 0.6)",
  classification = "",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = typeof score === "number" ? Math.min(Math.max(score, 0), 100) : 0;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Progress Stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="none"
          style={{
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />
      </svg>

      {/* Center Label & Counter */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: size >= 140 ? "36px" : "24px",
            fontWeight: "900",
            color,
            lineHeight: 1,
            letterSpacing: "-0.5px",
          }}
        >
          <CounterTicker value={score} />
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", marginTop: "4px" }}>
          / 100
        </div>
        {classification && size >= 130 && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#ffffff",
              background: color,
              padding: "2px 8px",
              borderRadius: "10px",
              marginTop: "4px",
              letterSpacing: "0.3px",
              textTransform: "uppercase",
              boxShadow: `0 2px 6px ${color}40`,
            }}
          >
            {classification}
          </span>
        )}
      </div>
    </div>
  );
}
