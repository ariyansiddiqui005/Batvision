import React, { useState } from "react";

function Trials() {
  const [registeredTrials, setRegisteredTrials] = useState([]);

  const trialsData = [
    {
      id: 1,
      title: "State Cricket Academy U-19 Open Trials",
      organizer: "State Cricket Association",
      location: "Chinnaswamy Stadium B-Ground, Bengaluru",
      date: "October 10, 2026",
      targetRoles: "Batsmen, Fast Bowlers, Spinners",
      minScore: "70+ (Promising or above)",
      slots: "40 Candidates",
      deadline: "Oct 5, 2026",
    },
    {
      id: 2,
      title: "Premier League Talent Hunt — Fast Bowling Camp",
      organizer: "Apex Cricket Foundation",
      location: "Wankhede Outer Nets, Mumbai",
      date: "October 18, 2026",
      targetRoles: "Pace Bowlers (130+ kmph potential)",
      minScore: "75+ (Bowling Score)",
      slots: "25 Bowlers",
      deadline: "Oct 12, 2026",
    },
    {
      id: 3,
      title: "District All-Rounders Scouting Showcase",
      organizer: "District Sports Council",
      location: "Feroz Shah Grounds, Delhi",
      date: "November 2, 2026",
      targetRoles: "All-Rounders (Both Bat & Ball verified)",
      minScore: "Combined Overall 75+",
      slots: "30 Candidates",
      deadline: "Oct 25, 2026",
    },
  ];

  const handleRegister = (trialId) => {
    if (registeredTrials.includes(trialId)) {
      setRegisteredTrials(registeredTrials.filter((id) => id !== trialId));
    } else {
      setRegisteredTrials([...registeredTrials, trialId]);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "36px 20px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.1)", color: "#059669", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
          🏆 Official Tryouts
        </div>
        <h2 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>Cricket Trials & Talent Showcases</h2>
        <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: "14px" }}>
          Verified talent opportunities posted by cricket academies, state associations, and club scouts.
        </p>
      </div>

      <div style={{ display: "grid", gap: "24px" }}>
        {trialsData.map((trial) => {
          const isRegistered = registeredTrials.includes(trial.id);

          return (
            <div
              key={trial.id}
              className="glass-card glass-card-hover"
              style={{
                padding: "28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
                borderLeft: "4px solid #10b981",
              }}
            >
              <div style={{ flex: "1 1 360px" }}>
                <div style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.12)", color: "#059669", padding: "3px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", marginBottom: "10px" }}>
                  {trial.organizer}
                </div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "20px", color: "#0f172a" }}>{trial.title}</h3>
                <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: "#64748b" }}>
                  📍 {trial.location} • 📅 Date: <strong style={{ color: "#0f172a" }}>{trial.date}</strong>
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "12px" }}>
                  <span style={{ background: "rgba(241, 245, 249, 0.8)", border: "1px solid var(--border)", padding: "4px 12px", borderRadius: "6px", color: "#475569" }}>
                    🎯 Roles: <strong>{trial.targetRoles}</strong>
                  </span>
                  <span style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "4px 12px", borderRadius: "6px", color: "#059669" }}>
                    ⭐ Requirement: <strong>{trial.minScore}</strong>
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#94a3b8" }}>
                  Deadline: {trial.deadline}
                </p>
                <button
                  onClick={() => handleRegister(trial.id)}
                  className={isRegistered ? "btn-glass" : "btn-green"}
                  style={{
                    padding: "11px 24px",
                    fontSize: "14px",
                    background: isRegistered ? "rgba(16, 185, 129, 0.15)" : undefined,
                    color: isRegistered ? "#059669" : undefined,
                    borderColor: isRegistered ? "#10b981" : undefined,
                  }}
                >
                  {isRegistered ? "✓ Registered / Applied" : "Express Interest / Apply"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Trials;
