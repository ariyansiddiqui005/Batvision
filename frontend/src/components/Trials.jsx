import { useState } from "react";
import { MapPin, Calendar, Check, ArrowRight } from "lucide-react";
import AnimatedCard from "./ui/AnimatedCard";

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
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px 24px" }}>
      <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-dark)" }}>
          Academy Combines
        </span>
        <h1 style={{ fontSize: "30px", fontWeight: "900", color: "var(--text-h)", marginTop: "4px" }}>
          TRIALS & TALENT COMBINES
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
          Scheduled selection trials conducted by affiliated state academies and franchise scouts.
        </p>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {trialsData.map((trial, idx) => {
          const isRegistered = registeredTrials.includes(trial.id);

          return (
            <AnimatedCard
              key={trial.id}
              delay={idx * 0.05}
              className="sports-card"
              style={{
                padding: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div style={{ flex: "1 1 380px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--accent-dark)",
                      background: "var(--accent-subtle)",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      border: "1px solid var(--accent-border)",
                    }}
                  >
                    {trial.organizer}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    • Capacity: {trial.slots}
                  </span>
                </div>

                <h3 style={{ fontSize: "19px", fontWeight: "800", color: "var(--text-h)", marginBottom: "8px" }}>
                  {trial.title}
                </h3>

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "var(--text)", marginBottom: "14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={13} color="var(--text-muted)" /> {trial.location}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={13} color="var(--text-muted)" /> <strong>{trial.date}</strong>
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "12px" }}>
                  <span style={{ background: "var(--surface-subtle)", border: "1px solid var(--border)", padding: "3px 8px", borderRadius: "4px", color: "var(--text)" }}>
                    Target: <strong>{trial.targetRoles}</strong>
                  </span>
                  <span style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-border)", padding: "3px 8px", borderRadius: "4px", color: "var(--accent-dark)" }}>
                    Threshold: <strong>{trial.minScore}</strong>
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Application Deadline: <strong>{trial.deadline}</strong>
                </div>

                <button
                  onClick={() => handleRegister(trial.id)}
                  className={isRegistered ? "btn-secondary" : "btn-primary"}
                  style={{
                    padding: "9px 18px",
                    fontSize: "13px",
                  }}
                >
                  {isRegistered ? (
                    <>
                      <Check size={14} /> Registered / Applied
                    </>
                  ) : (
                    <>
                      Apply for Trial <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}

export default Trials;
