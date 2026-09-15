import React, { useState } from "react";

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

  if (!isOpen) return null;

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
          body: JSON.stringify({ email: email.trim(), password, role: selectedRole })
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
        console.error("Login request error:", err);
        // Fallback if backend offline
        const cleanName = email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const fallbackUser = {
          id: `u-${Date.now()}`,
          email: email.trim(),
          name: cleanName,
          role: selectedRole,
          age: selectedRole === "player" ? age : 42,
          location,
          playerRole: selectedRole === "player" ? playerRole : null,
          battingStyle: selectedRole === "player" ? battingStyle : null,
          bowlingStyle: selectedRole === "player" ? bowlingStyle : null,
          organization: selectedRole === "scout" ? organization : null,
        };
        onLoginSuccess(fallbackUser, null);
        onClose();
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
          age: Number(age),
          role: playerRole,
          battingStyle,
          bowlingStyle,
          location
        };
        const res = await fetch("http://127.0.0.1:5000/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data && data.player_id) {
          registeredId = data.player_id;
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
      const newUser = {
        id: `u-${Date.now()}`,
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
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "32px",
          background: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
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
            fontSize: "20px",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>
            {selectedRole === "player" ? "🏏" : "🔎"}
          </div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "24px", color: "#0f172a" }}>
            {authMode === "login" ? "Sign In to BatVision" : "Create Your Profile"}
          </h2>
          {authReason && (
            <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#059669", fontWeight: "600" }}>
              {authReason}
            </p>
          )}
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Access verified AI cricket scouting, player analytics & talent feeds
          </p>
        </div>

        {/* Role Selector Tabs (Player vs Scout) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            background: "rgba(241, 245, 249, 0.8)",
            padding: "4px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedRole("player")}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: selectedRole === "player" ? "#ffffff" : "transparent",
              color: selectedRole === "player" ? "#047857" : "#64748b",
              fontWeight: selectedRole === "player" ? "700" : "500",
              cursor: "pointer",
              boxShadow: selectedRole === "player" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s ease",
              fontSize: "14px",
            }}
          >
            🏏 I am a Player
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("scout")}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: selectedRole === "scout" ? "#ffffff" : "transparent",
              color: selectedRole === "scout" ? "#0284c7" : "#64748b",
              fontWeight: selectedRole === "scout" ? "700" : "500",
              cursor: "pointer",
              boxShadow: selectedRole === "scout" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s ease",
              fontSize: "14px",
            }}
          >
            🔎 I am a Scout
          </button>
        </div>

        {/* Mode Switcher: Sign In vs Register */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "20px", fontSize: "14px" }}>
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            style={{
              background: "none",
              border: "none",
              fontWeight: authMode === "login" ? "700" : "500",
              color: authMode === "login" ? "#059669" : "#64748b",
              borderBottom: authMode === "login" ? "2px solid #10b981" : "2px solid transparent",
              paddingBottom: "4px",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("register")}
            style={{
              background: "none",
              border: "none",
              fontWeight: authMode === "register" ? "700" : "500",
              color: authMode === "register" ? "#059669" : "#64748b",
              borderBottom: authMode === "register" ? "2px solid #10b981" : "2px solid transparent",
              paddingBottom: "4px",
              cursor: "pointer",
            }}
          >
            Create New Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {authMode === "register" && (
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Full Name</label>
              <input
                type="text"
                className="glass-input"
                placeholder={selectedRole === "player" ? "e.g. Amaan Khan" : "e.g. Vikram Rathore"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Email Address</label>
            <input
              type="email"
              className="glass-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", marginTop: "4px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Password</label>
            <input
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", marginTop: "4px" }}
            />
          </div>

          {/* Additional Fields for Registration */}
          {authMode === "register" && selectedRole === "player" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Age</label>
                  <input
                    type="number"
                    className="glass-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Cricket Role</label>
                  <select
                    className="glass-input"
                    value={playerRole}
                    onChange={(e) => setPlayerRole(e.target.value)}
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Location / City</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>
            </>
          )}

          {authMode === "register" && selectedRole === "scout" && (
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>Club / Academy / Organization</label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g. Mumbai Cricket Academy"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
          )}

          {errorMessage && (
            <p style={{ color: "#e11d48", fontSize: "13px", margin: "4px 0 0 0", fontWeight: "600" }}>
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="btn-green"
            disabled={isLoading}
            style={{ width: "100%", marginTop: "8px", padding: "12px", opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
          >
            {isLoading
              ? "Authenticating..."
              : authMode === "login"
              ? `Sign In as ${selectedRole === "player" ? "Player" : "Scout"}`
              : `Create ${selectedRole === "player" ? "Player" : "Scout"} Profile`}
          </button>
        </form>

        {/* Skip / Continue as Guest Button */}
        <div style={{ marginTop: "20px", textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Skip & Browse as Guest →
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
