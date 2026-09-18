import { motion, AnimatePresence } from "motion/react";
import { Home, User, Search, Calendar, LogOut, LogIn } from "lucide-react";

function Navbar({ activeTab, setActiveTab, shortlistCount, currentUser, onOpenAuthModal, onLogout }) {
  const navItems = [
    { id: "home", label: "Overview", icon: Home },
    { id: "player", label: "Player Portal", icon: User },
    { id: "scout", label: "Scout Feed", icon: Search, badge: shortlistCount },
    { id: "trials", label: "Trials & Combine", icon: Calendar },
  ];

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Identity: Professional, Editorial Sports Lockup */}
      <div
        onClick={() => setActiveTab("home")}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            background: "var(--text-h)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "14px",
            letterSpacing: "0.5px",
          }}
        >
          BV
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "var(--text-h)",
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              BatVision
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "2px 6px",
                borderRadius: "3px",
                background: "var(--surface-subtle)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              Scouting
            </span>
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "0.02em",
              margin: 0,
            }}
          >
            Cricket Talent Discovery Platform
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: "flex", gap: "4px", position: "relative" }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                position: "relative",
                background: "transparent",
                color: isActive ? "var(--text-h)" : "var(--text-muted)",
                border: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "500",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "color 0.15s ease",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="navbar-active-pill"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "6px",
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border-strong)",
                    zIndex: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 38,
                  }}
                />
              )}

              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}

                {item.badge !== undefined && item.badge > 0 && (
                  <AnimatePresence>
                    <motion.span
                      key={item.badge}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      style={{
                        background: "var(--accent)",
                        color: "#ffffff",
                        borderRadius: "10px",
                        padding: "1px 6px",
                        fontSize: "10px",
                        fontWeight: "700",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {item.badge}
                    </motion.span>
                  </AnimatePresence>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Account / Session Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "var(--surface-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "4px",
                  background: currentUser.role === "player" ? "var(--accent)" : "var(--text-h)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ fontSize: "12px", textAlign: "left" }}>
                <span style={{ fontWeight: "600", color: "var(--text-h)" }}>{currentUser.name}</span>
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: "6px",
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    fontWeight: "600",
                  }}
                >
                  ({currentUser.role})
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="btn-subtle"
              style={{ padding: "6px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "5px" }}
              title="Sign Out"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: "500",
              }}
            >
              Guest
            </span>
            <button
              onClick={() => onOpenAuthModal("player", "Sign in to access your cricket profile and upload match footage.")}
              className="btn-primary"
              style={{ padding: "7px 14px", fontSize: "13px" }}
            >
              <LogIn size={14} />
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
