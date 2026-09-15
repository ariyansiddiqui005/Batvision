import React from "react";

function Navbar({ activeTab, setActiveTab, shortlistCount, currentUser, onOpenAuthModal, onLogout }) {
  const navItems = [
    { id: "home", label: "🏠 Home" },
    { id: "player", label: "🏏 Player Portal" },
    { id: "scout", label: `🔎 Scout Feed ${shortlistCount > 0 ? `(${shortlistCount})` : ""}` },
    { id: "trials", label: "🏆 Trials & Events" },
  ];

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 28px",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(16, 185, 129, 0.15)",
        boxShadow: "0 4px 20px -2px rgba(16, 185, 129, 0.05)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Logo */}
      <div
        onClick={() => setActiveTab("home")}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          🏏
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
            BatVision<span style={{ color: "#10b981" }}>.ai</span>
          </h2>
          <p style={{ margin: 0, fontSize: "11px", fontWeight: "600", color: "#059669", letterSpacing: "0.2px" }}>
            AI Cricket Scouting Platform
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: "flex", gap: "8px" }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: isActive ? "rgba(16, 185, 129, 0.12)" : "transparent",
                color: isActive ? "#047857" : "#475569",
                border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.35)" : "transparent"}`,
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isActive ? "0 2px 8px rgba(16, 185, 129, 0.12)" : "none",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Auth / Account Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px 4px 6px",
                borderRadius: "24px",
                background: "rgba(241, 245, 249, 0.8)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: currentUser.role === "player" ? "#10b981" : "#0284c7",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div style={{ fontSize: "12px", textAlign: "left" }}>
                <strong style={{ color: "#0f172a" }}>{currentUser.name}</strong>
                <span
                  style={{
                    display: "block",
                    fontSize: "10px",
                    color: currentUser.role === "player" ? "#059669" : "#0284c7",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="btn-glass"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              title="Sign Out"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "12px",
                background: "rgba(100, 116, 139, 0.1)",
                color: "#64748b",
                fontWeight: "600",
              }}
            >
              Guest View
            </span>
            <button
              onClick={() => onOpenAuthModal("player", "Sign in to access your cricket profile and upload videos.")}
              className="btn-green"
              style={{ padding: "7px 16px", fontSize: "13px" }}
            >
              Sign In / Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
