import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Loader2, User, Search } from "lucide-react";

function AuthModal({ isOpen, onClose, initialRole = "player", onLoginSuccess, authReason = "" }) {
  const [selectedRole, setSelectedRole] = useState(initialRole); // "player" | "scout"
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState(20);
  const [playerRole, setPlayerRole] = useState("All-Rounder");
  const [battingStyle, setBattingStyle] = useState("Right Hand Bat");
  const [bowlingStyle, setBowlingStyle] = useState("Right Arm Fast");
  const [location, setLocation] = useState("Mumbai, Maharashtra");
  const [organization, setOrganization] = useState("State Cricket Academy");
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (authMode === "register" && !name) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setIsLoading(true);

    if (authMode === "login") {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, role: selectedRole }),
        });
        const data = await res.json();
        setIsLoading(false);

        if (res.ok && data.user) {
          onLoginSuccess(data.user, data.scores);
          onClose();
          return;
        } else {
          setErrorMessage(data.error || "Login failed. Please check your credentials.");
          return;
        }
      } catch (err) {
        setIsLoading(false);
        setErrorMessage("Unable to connect to BatVision authentication server. Please ensure the backend is running.");
        return;
      }
    }

    // Register Mode
    try {
      let registeredId = null;
      if (selectedRole === "player") {
        const payload = {
          name: name.trim(),
          email: email.trim(),
          password,
          age: Number(age),
          role: playerRole,
          battingStyle,
          bowlingStyle,
          location,
        };
        const res = await fetch("http://127.0.0.1:5000/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data && data.player_id) {
          registeredId = data.player_id;
        }
      } else if (selectedRole === "scout") {
        const payload = {
          name: name.trim(),
          email: email.trim(),
          password,
          organization: organization.trim() || "State Cricket Academy",
        };
        const res = await fetch("http://127.0.0.1:5000/api/scouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data && data.scout_id) {
          registeredId = data.scout_id;
        }
      }

      setIsLoading(false);
      const newUser = {
        id: registeredId || `u-${Date.now()}`,
        email: email.trim(),
        name: name.trim(),
        role: selectedRole,
        age: selectedRole === "player" ? Number(age) : 42,
        location,
        playerRole: selectedRole === "player" ? playerRole : null,
        battingStyle: selectedRole === "player" ? battingStyle : null,
        bowlingStyle: selectedRole === "player" ? bowlingStyle : null,
        organization: selectedRole === "scout" ? organization : null,
      };

      onLoginSuccess(newUser, null);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setErrorMessage("Registration failed: Unable to connect to BatVision server.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(9, 13, 22, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={onClose}
        >
          <motion.div
            data-lenis-prevent="true"
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="sports-card"
            style={{
              maxWidth: "460px",
              width: "100%",
              padding: "32px",
              background: "var(--surface)",
              boxShadow: "var(--shadow-lg)",
              textAlign: "left",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: "4px",
              }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-dark)" }}>
                BatVision Access
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-h)", marginTop: "2px" }}>
                {authMode === "login" ? "Sign In to Account" : "Create New Profile"}
              </h2>
              {authReason && (
                <p style={{ marginTop: "4px", fontSize: "12px", color: "var(--accent-dark)", fontWeight: "600" }}>
                  {authReason}
                </p>
              )}
            </div>

            {/* Role Switcher */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
                background: "var(--surface-subtle)",
                padding: "4px",
                borderRadius: "6px",
                marginBottom: "20px",
                border: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedRole("player")}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "none",
                  background: selectedRole === "player" ? "var(--surface)" : "transparent",
                  color: selectedRole === "player" ? "var(--text-h)" : "var(--text-muted)",
                  fontWeight: selectedRole === "player" ? "700" : "500",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: selectedRole === "player" ? "var(--shadow-sm)" : "none",
                }}
              >
                <User size={14} />
                Athlete / Player
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("scout")}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "none",
                  background: selectedRole === "scout" ? "var(--surface)" : "transparent",
                  color: selectedRole === "scout" ? "var(--text-h)" : "var(--text-muted)",
                  fontWeight: selectedRole === "scout" ? "700" : "500",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: selectedRole === "scout" ? "var(--shadow-sm)" : "none",
                }}
              >
                <Search size={14} />
                Scout / Selector
              </button>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "var(--status-low)",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {authMode === "register" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Siddiqui"
                    className="clean-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginTop: "4px" }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@cricketacademy.org"
                  className="clean-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  className="clean-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ marginTop: "4px" }}
                />
              </div>

              {/* Player Registration Fields */}
              {authMode === "register" && selectedRole === "player" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Age</label>
                      <input
                        type="number"
                        min="12"
                        max="50"
                        className="clean-input"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        style={{ marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Playing Role</label>
                      <select
                        className="clean-input"
                        value={playerRole}
                        onChange={(e) => setPlayerRole(e.target.value)}
                        style={{ marginTop: "4px" }}
                      >
                        <option value="Batsman">Batsman</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-Rounder">All-Rounder</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Batting Stance</label>
                      <select
                        className="clean-input"
                        value={battingStyle}
                        onChange={(e) => setBattingStyle(e.target.value)}
                        style={{ marginTop: "4px" }}
                      >
                        <option value="Right Hand Bat">Right Hand Bat</option>
                        <option value="Left Hand Bat">Left Hand Bat</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Bowling Arm</label>
                      <select
                        className="clean-input"
                        value={bowlingStyle}
                        onChange={(e) => setBowlingStyle(e.target.value)}
                        style={{ marginTop: "4px" }}
                      >
                        <option value="Right Arm Fast">Right Arm Fast</option>
                        <option value="Right Arm Spin">Right Arm Spin</option>
                        <option value="Left Arm Fast">Left Arm Fast</option>
                        <option value="Left Arm Spin">Left Arm Spin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>City / State</label>
                    <input
                      type="text"
                      className="clean-input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{ marginTop: "4px" }}
                    />
                  </div>
                </>
              )}

              {/* Scout Registration Fields */}
              {authMode === "register" && selectedRole === "scout" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Organization / Club</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai Cricket Association"
                    className="clean-input"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    style={{ marginTop: "4px" }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  marginTop: "8px",
                  padding: "11px",
                  fontSize: "14px",
                  cursor: isLoading ? "wait" : "pointer",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    {authMode === "login" ? `Sign In as ${selectedRole === "player" ? "Athlete" : "Scout"}` : "Complete Registration"}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Login / Register */}
            <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)", fontSize: "13px", color: "var(--text-muted)" }}>
              {authMode === "login" ? (
                <span>
                  New to BatVision?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setErrorMessage("");
                    }}
                    style={{ background: "none", border: "none", color: "var(--accent-dark)", fontWeight: "700", cursor: "pointer", padding: 0 }}
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setErrorMessage("");
                    }}
                    style={{ background: "none", border: "none", color: "var(--accent-dark)", fontWeight: "700", cursor: "pointer", padding: 0 }}
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
