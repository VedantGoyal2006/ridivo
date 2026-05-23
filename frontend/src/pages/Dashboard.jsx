import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import RidivoLogo from "../components/RidivoLogo";

// ── NEW THEME: PREMIUM DARK GLASSMORPHISM ─────────────────────────────────────
const theme = {
  bgBase: "#0B1120",
  glassCard: "rgba(255, 255, 255, 0.03)",
  glassCardHeavy: "rgba(15, 23, 42, 0.6)",
  glassHover: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  accent: "#38BDF8", // Vibrant Sky Blue
  accentHover: "#0284C7",
  successBg: "rgba(16, 185, 129, 0.15)",
  successText: "#34D399",
  warningBg: "rgba(245, 158, 11, 0.15)",
  warningText: "#FBBF24",
};

// ── DUMMY DATA (UNCHANGED) ────────────────────────────────────────────────────
const upcomingRides = [
  { id: 1, from: "Bhopal", to: "Indore", date: "20 May", day: "Tue", time: "08:30 AM", driver: "Rahul Sharma", rating: 4.8, reviews: 32, vehicle: "Swift Dzire", plate: "MP09AB1234", price: 320, seats: 2, status: "CONFIRMED", avatar: "#F59E0B", initials: "RS" },
  { id: 2, from: "Indore", to: "Ujjain", date: "24 May", day: "Sat", time: "07:00 AM", driver: "Aman Verma", rating: 4.6, reviews: 18, vehicle: "Honda City", plate: "MP09CD5678", price: 180, seats: 1, status: "PENDING", avatar: "#10B981", initials: "AV" },
];

const recentActivity = [
  { id: 1, type: "ride_taken", text: "Bhopal → Indore", date: "15 May", amount: "₹320", status: "Completed", color: "#34D399" },
  { id: 2, type: "ride_offered", text: "Indore → Bhopal", date: "12 May", amount: "₹640", status: "Completed", color: "#38BDF8" },
  { id: 3, type: "ride_taken", text: "Bhopal → Jabalpur", date: "8 May", amount: "₹450", status: "Completed", color: "#34D399" },
  { id: 4, type: "ride_offered", text: "Ujjain → Indore", date: "3 May", amount: "₹380", status: "Completed", color: "#38BDF8" },
];

const notifications = [
  { id: 1, text: "Rahul accepted your booking request", time: "2 min ago", read: false, icon: "✅" },
  { id: 2, text: "Your ride to Indore is tomorrow at 8:30 AM", time: "1 hr ago", read: false, icon: "🚗" },
  { id: 3, text: "Payment of ₹320 confirmed", time: "2 hrs ago", read: true, icon: "💰" },
  { id: 4, text: "Kiran left you a 5★ review", time: "Yesterday", read: true, icon: "⭐" },
];

const navItems = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard", active: true },
  { icon: "🔍", label: "Find a Ride", path: "/find-ride" },
  { icon: "🚗", label: "My Rides", path: "/my-rides" },
  { icon: "➕", label: "Offer a Ride", path: "/offer-ride" },
  { icon: "📋", label: "Bookings", path: "/bookings" },
  { icon: "💰", label: "Payments", path: "/payments" },
  { icon: "⭐", label: "Reviews", path: "/reviews" },
  { icon: "👤", label: "Profile", path: "/profile" },
  { icon: "⚙️", label: "Settings", path: "/settings" },
  { icon: "⚙️", label: "Admin Panel", path: "/admin" },
];

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ activePath, onNavigate, user }) {
  return (
    <aside style={{
      width: "240px", flexShrink: 0,
      backgroundColor: "rgba(11, 17, 32, 0.75)",
      backdropFilter: "blur(20px)",
      borderRight: `1px solid ${theme.glassBorder}`,
      height: "100vh", position: "fixed", left: 0, top: 0,
      display: "flex", flexDirection: "column",
      zIndex: 100, overflowY: "auto",
    }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${theme.glassBorder}` }}>
        <RidivoLogo size={34} showText={true} textColor="white" />
      </div>

      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {navItems.map((item) => (
          <button key={item.path} onClick={() => onNavigate(item.path)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "11px 12px", borderRadius: "10px", border: "none",
              backgroundColor: activePath === item.path ? "rgba(56, 189, 248, 0.15)" : "transparent",
              color: activePath === item.path ? theme.textPrimary : theme.textSecondary,
              cursor: "pointer", fontSize: "14px", fontWeight: activePath === item.path ? "600" : "400",
              fontFamily: "'DM Sans', sans-serif", textAlign: "left",
              transition: "all 0.2s ease", marginBottom: "2px",
              borderLeft: activePath === item.path ? `3px solid ${theme.accent}` : "3px solid transparent",
            }}
            onMouseEnter={(e) => { if (activePath !== item.path) { e.currentTarget.style.backgroundColor = theme.glassHover; e.currentTarget.style.color = theme.textPrimary; } }}
            onMouseLeave={(e) => { if (activePath !== item.path) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.textSecondary; } }}
          >
            <span style={{ fontSize: "16px", width: "20px", textAlign: "center", filter: activePath === item.path ? "drop-shadow(0 0 8px rgba(56,189,248,0.5))" : "none" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ margin: "12px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(2,132,199,0.4))", backdropFilter: "blur(10px)", border: `1px solid rgba(56,189,248,0.3)`, padding: "16px", marginBottom: "20px" }}>
        <div style={{ fontSize: "20px", marginBottom: "6px" }}>🚗</div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>Got Empty Seats?</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.7)", marginBottom: "12px" }}>Share your ride and split the cost</div>
        <button style={{
          width: "100%", padding: "8px", backgroundColor: theme.accent,
          color: "#fff", border: "none", borderRadius: "8px",
          fontSize: "12px", fontWeight: "700", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", transition: "0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.accentHover}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.accent}
        >Offer a Ride</button>
      </div>
    </aside>
  );
}

// ── TOP NAVBAR ────────────────────────────────────────────────────────────────
function TopNav({ user, notifications, onLogout, onNavigate }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header style={{
      height: "64px", backgroundColor: theme.glassCardHeavy,
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${theme.glassBorder}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    }}>
      <div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.textPrimary }}>
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>
          Ready for your next journey?
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.glassBorder}`, borderRadius: "10px", padding: "8px 14px" }}>
          <span style={{ color: theme.textSecondary, fontSize: "14px" }}>🔍</span>
          <input placeholder="Search rides..." style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: "13px", color: theme.textPrimary, fontFamily: "'DM Sans', sans-serif", width: "160px" }} />
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} style={{
            position: "relative", width: "40px", height: "40px",
            backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.glassBorder}`,
            borderRadius: "10px", cursor: "pointer", fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease", color: theme.textPrimary
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.glassHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.3)"; }}
          >
            🔔
            {unread > 0 && (
              <div style={{
                position: "absolute", top: "-4px", right: "-4px",
                width: "18px", height: "18px", backgroundColor: "#EF4444",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: "700", color: "white",
                fontFamily: "'DM Sans', sans-serif", border: `2px solid ${theme.bgBase}`,
              }}>{unread}</div>
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              backgroundColor: theme.glassCardHeavy, backdropFilter: "blur(24px)",
              borderRadius: "16px", width: "320px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)", border: `1px solid ${theme.glassBorder}`,
              zIndex: 100, overflow: "hidden", animation: "fadeInDown 0.2s ease",
            }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.glassBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary }}>Notifications</span>
                <span style={{ fontSize: "12px", color: theme.accent, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: "600" }}>Mark all read</span>
              </div>
              {notifications.map((n) => (
                <div key={n.id} style={{
                  padding: "14px 20px", display: "flex", gap: "12px", alignItems: "flex-start",
                  backgroundColor: n.read ? "transparent" : "rgba(56, 189, 248, 0.05)",
                  borderBottom: `1px solid ${theme.glassBorder}`,
                  transition: "background 0.2s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.glassHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? "transparent" : "rgba(56, 189, 248, 0.05)"}
                >
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textPrimary, lineHeight: "1.5", marginBottom: "4px" }}>{n.text}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary }}>{n.time}</div>
                  </div>
                  {!n.read && <div style={{ width: "8px", height: "8px", backgroundColor: theme.accent, borderRadius: "50%", flexShrink: 0, marginTop: "4px", boxShadow: `0 0 8px ${theme.accent}` }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <button onClick={() => {setProfileOpen(!profileOpen); setNotifOpen(false); }} 
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.glassBorder}`,
            borderRadius: "10px", padding: "6px 12px 6px 6px",
            cursor: "pointer", transition: "all 0.2s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.glassHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.3)"; }}
          >
            {user?.profile_pic ? (
              <img src={user.profile_pic} alt="Profile" style={{ width: "30px", height: "30px", borderRadius: "8px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #38BDF8, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif" }}>
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600", color: theme.textPrimary }}>{user?.name?.split(' ')[0] || 'User'}</div>
            </div>
            <span style={{ color: theme.textSecondary, fontSize: "12px", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              backgroundColor: theme.glassCardHeavy, backdropFilter: "blur(24px)",
              borderRadius: "16px", width: "220px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)", border: `1px solid ${theme.glassBorder}`,
              zIndex: 100, overflow: "hidden", animation: "fadeInDown 0.2s ease",
            }}>
              <div style={{ padding: "16px", borderBottom: `1px solid ${theme.glassBorder}`, display: "flex", alignItems: "center", gap: "12px" }}>
                {user?.profile_pic ? (
                  <img src={user.profile_pic} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #38BDF8, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "16px", fontWeight: "700" }}>
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary }}>{user?.name || 'User'}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary }}>{user?.email || ''}</div>
                </div>
              </div>

              {[
                { icon: "👤", label: "My Profile", path: "/profile" },
                { icon: "🚗", label: "My Rides", path: "/my-rides" },
                { icon: "📋", label: "My Bookings", path: "/bookings" },
                { icon: "🛡️", label: "Become a Driver", path: "/verify" },
                { icon: "⚙️", label: "Settings", path: "/settings" },
              ].map((item) => (
                <button key={item.path} 
                onClick={() => {onNavigate(item.path); navigate(item.path); setProfileOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px",
                  padding: "11px 16px", border: "none", backgroundColor: "transparent",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13.5px", color: theme.textPrimary, textAlign: "left",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.glassHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}

              <div style={{ borderTop: `1px solid ${theme.glassBorder}`, padding: "8px" }}>
                <button onClick={onLogout} style={{
                  width: "100%", padding: "10px 16px", border: "none",
                  backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "8px",
                  cursor: "pointer", color: "#FCA5A5",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px",
                  fontWeight: "600", display: "flex", alignItems: "center", gap: "8px",
                  transition: "background 0.2s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div style={{
      backgroundColor: theme.glassCard, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderRadius: "16px", padding: "20px 22px",
      border: `1px solid ${theme.glassBorder}`, transition: "all 0.3s ease",
      display: "flex", alignItems: "center", gap: "16px",
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${bg.replace('0.1', '0.2')}`; e.currentTarget.style.borderColor = color; e.currentTarget.style.backgroundColor = theme.glassHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.1)"; e.currentTarget.style.borderColor = theme.glassBorder; e.currentTarget.style.backgroundColor = theme.glassCard; }}
    >
      <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0, boxShadow: `inset 0 0 10px ${color}` }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary, marginTop: "4px" }}>{label}</div>
        {sub && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color, marginTop: "2px", fontWeight: "600" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── SEARCH BAR ────────────────────────────────────────────────────────────────
function SearchSection() {
  const [tab, setTab] = useState("find");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div style={{
      borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      border: `1px solid ${theme.glassBorder}`,
      marginBottom: "32px",
      backgroundColor: theme.glassCard,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)"
    }}>
      <div style={{
        background: `linear-gradient(135deg, rgba(11,17,32,0.8) 0%, rgba(15,23,42,0.6) 100%), url('/src/assets/hero.jpg') center/cover`,
        padding: "24px 28px 0", borderBottom: `1px solid ${theme.glassBorder}`
      }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "0" }}>
          {[{ id: "find", label: "🔍 Find a Ride" }, { id: "offer", label: "🚗 Offer a Ride" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 20px", border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "600",
              borderRadius: "10px 10px 0 0", transition: "all 0.2s ease",
              backgroundColor: tab === t.id ? "rgba(255,255,255,0.1)" : "transparent",
              color: tab === t.id ? theme.textPrimary : theme.textSecondary,
              backdropFilter: tab === t.id ? "blur(10px)" : "none",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "16px", alignItems: "end" }}>
        {[
          { label: "From", placeholder: "Leaving from", value: from, onChange: setFrom, icon: "📍" },
          { label: "To", placeholder: "Going to", value: to, onChange: setTo, icon: "🏁" },
        ].map((f) => (
          <div key={f.label}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.textSecondary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'DM Sans', sans-serif" }}>{f.label}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", border: `1px solid ${theme.glassBorder}`, borderRadius: "10px", padding: "10px 12px", backgroundColor: "rgba(0,0,0,0.3)" }}>
              <span>{f.icon}</span>
              <input value={f.value} onChange={(e) => f.onChange(e.target.value)} placeholder={f.placeholder} style={{ border: "none", outline: "none", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: theme.textPrimary, width: "100%", background: "transparent" }} />
            </div>
          </div>
        ))}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.textSecondary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'DM Sans', sans-serif" }}>Date</label>
          <input type="date" style={{ width: "100%", border: `1px solid ${theme.glassBorder}`, borderRadius: "10px", padding: "10px 12px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: theme.textPrimary, background: "rgba(0,0,0,0.3)", colorScheme: "dark" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.textSecondary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'DM Sans', sans-serif" }}>Seats</label>
          <select style={{ width: "100%", border: `1px solid ${theme.glassBorder}`, borderRadius: "10px", padding: "10px 12px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: theme.textPrimary, background: "rgba(0,0,0,0.3)" }}>
            {[1, 2, 3, 4].map(n => <option key={n} style={{background: theme.bgBase}}>{n} Seat{n > 1 ? "s" : ""}</option>)}
          </select>
        </div>
        <button style={{
          backgroundColor: theme.accent, color: "white", border: "none",
          borderRadius: "12px", padding: "12px 24px", fontSize: "14px",
          fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "nowrap", transition: "all 0.2s ease",
          boxShadow: `0 4px 20px rgba(56, 189, 248, 0.4)`,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.accent; e.currentTarget.style.transform = "translateY(0)"; }}
        >Search Rides</button>
      </div>
    </div>
  );
}

// ── UPCOMING RIDES ────────────────────────────────────────────────────────────
function UpcomingRides() {
  return (
    <div style={{ backgroundColor: theme.glassCard, backdropFilter: "blur(16px)", borderRadius: "20px", border: `1px solid ${theme.glassBorder}`, overflow: "hidden", marginBottom: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${theme.glassBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary }}>Upcoming Rides</div>
        <button style={{ background: "none", border: "none", color: theme.accent, fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View all →</button>
      </div>
      {upcomingRides.map((ride, i) => (
        <div key={ride.id} style={{
          padding: "20px 24px", display: "grid",
          gridTemplateColumns: "60px 1fr 1fr auto",
          gap: "16px", alignItems: "center",
          borderBottom: i < upcomingRides.length - 1 ? `1px solid ${theme.glassBorder}` : "none",
          transition: "background 0.2s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.glassHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <div style={{ textAlign: "center", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "10px 8px", border: `1px solid ${theme.glassBorder}` }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>{ride.date.split(' ')[0]}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.accent, fontWeight: "600" }}>{ride.date.split(' ')[1]}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: theme.textSecondary }}>{ride.day}</div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary }}>{ride.from}</span>
              <span style={{ color: theme.textSecondary, fontSize: "14px" }}>→</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary }}>{ride.to}</span>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>
              {ride.time} · {ride.seats} seat{ride.seats > 1 ? "s" : ""} booked
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: ride.avatar, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
              {ride.initials}
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600", color: theme.textPrimary }}>{ride.driver}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary }}>⭐ {ride.rating} · {ride.vehicle}</div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "800", color: theme.textPrimary, marginBottom: "6px" }}>₹{ride.price}</div>
            <div style={{
              display: "inline-block", padding: "3px 10px", borderRadius: "100px",
              backgroundColor: ride.status === "CONFIRMED" ? theme.successBg : theme.warningBg,
              color: ride.status === "CONFIRMED" ? theme.successText : theme.warningText,
              fontSize: "11px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif",
              border: `1px solid ${ride.status === "CONFIRMED" ? theme.successText : theme.warningText}`
            }}>{ride.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── RECENT ACTIVITY ───────────────────────────────────────────────────────────
function RecentActivity() {
  return (
    <div style={{ backgroundColor: theme.glassCard, backdropFilter: "blur(16px)", borderRadius: "20px", border: `1px solid ${theme.glassBorder}`, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${theme.glassBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary }}>Recent Activity</div>
        <button style={{ background: "none", border: "none", color: theme.accent, fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View all →</button>
      </div>
      {recentActivity.map((a, i) => (
        <div key={a.id} style={{
          padding: "14px 24px", display: "flex", alignItems: "center", gap: "14px",
          borderBottom: i < recentActivity.length - 1 ? `1px solid ${theme.glassBorder}` : "none",
          transition: "background 0.2s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.glassHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${theme.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
            {a.type === "ride_taken" ? "🧳" : "🚗"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", fontWeight: "600", color: theme.textPrimary }}>{a.text}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary }}>{a.date} · {a.type === "ride_taken" ? "Ride taken" : "Ride offered"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: a.color }}>{a.amount}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.successText }}>{a.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── RIGHT PANEL ───────────────────────────────────────────────────────────────
function RightPanel({ user }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Profile card */}
      <div style={{
        background: `linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(2,132,199,0.3) 100%)`,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: "20px", padding: "24px", color: "white", position: "relative", overflow: "hidden",
        border: `1px solid rgba(56,189,248,0.3)`, boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}>
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", background: "radial-gradient(circle, rgba(56,189,248,0.4), transparent)", borderRadius: "50%" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", position: "relative" }}>
          {user?.profile_pic ? (
            <img src={user.profile_pic} alt="Profile" style={{ width: "52px", height: "52px", borderRadius: "14px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
          ) : (
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", border: `1px solid ${theme.glassBorder}` }}>
              {user?.name?.[0] || 'U'}
            </div>
          )}
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary }}>{user?.name || 'User'}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>{user?.email || ''}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", position: "relative" }}>
          {[["12", "Rides"], ["3", "Offered"], ["4.8★", "Rating"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center", backgroundColor: "rgba(0,0,0,0.2)", border: `1px solid ${theme.glassBorder}`, borderRadius: "10px", padding: "10px 8px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "800", color: theme.textPrimary }}>{val}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ backgroundColor: theme.glassCard, backdropFilter: "blur(16px)", borderRadius: "20px", border: `1px solid ${theme.glassBorder}`, padding: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary, marginBottom: "16px" }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { icon: "🔍", label: "Find Ride", bg: "rgba(56, 189, 248, 0.1)", border: "rgba(56, 189, 248, 0.3)", textColor: "#38BDF8" },
            { icon: "🚗", label: "Offer Ride", bg: "rgba(52, 211, 153, 0.1)", border: "rgba(52, 211, 153, 0.3)", textColor: "#34D399" },
            { icon: "📋", label: "Bookings", bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.3)", textColor: "#FBBF24" },
            { icon: "🛡️", label: "Verify", bg: "rgba(167, 139, 250, 0.1)", border: "rgba(167, 139, 250, 0.3)", textColor: "#A78BFA" },
          ].map((action) => (
            <button key={action.label} style={{
              padding: "14px 10px", borderRadius: "12px", border: `1px solid ${action.border}`,
              backgroundColor: action.bg, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${action.bg}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{ fontSize: "22px" }}>{action.icon}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "600", color: action.textColor }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Savings card */}
      <div style={{ backgroundColor: theme.glassCard, backdropFilter: "blur(16px)", borderRadius: "20px", border: `1px solid ${theme.glassBorder}`, padding: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: theme.textPrimary, marginBottom: "16px" }}>My Savings</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary }}>Total Saved</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: "800", color: theme.successText }}>₹2,450</span>
        </div>
        <div style={{ backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "8px", height: "6px", marginBottom: "12px", border: `1px solid ${theme.glassBorder}` }}>
          <div style={{ width: "68%", height: "100%", borderRadius: "8px", background: `linear-gradient(to right, ${theme.accent}, ${theme.successText})`, boxShadow: `0 0 10px ${theme.successText}` }} />
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>68% saved vs solo travel this month 🎉</div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState("/dashboard");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path) => {
    setActivePath(path);
    navigate(path);
  };

  // The premium map/grid glowing background style
  const premiumBackgroundStyle = {
    display: "flex", 
    minHeight: "100vh", 
    backgroundColor: theme.bgBase,
    backgroundImage: `
      radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.08), transparent 25%),
      radial-gradient(circle at 85% 30%, rgba(167, 139, 250, 0.08), transparent 25%),
      radial-gradient(circle at 50% 100%, rgba(52, 211, 153, 0.05), transparent 30%),
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 100% 100%, 100% 100%, 40px 40px, 40px 40px",
    backgroundAttachment: "fixed",
    fontFamily: "'DM Sans', sans-serif",
    color: theme.textPrimary
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={premiumBackgroundStyle}>

        {/* Sidebar */}
        <Sidebar activePath={activePath} onNavigate={handleNavigate} user={user} />

        {/* Main content */}
        <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

          {/* Top navbar */}
          <TopNav user={user} notifications={notifications} onLogout={handleLogout} onNavigate={navigate} />

          {/* Page content */}
          <main style={{
            padding: "28px 32px", flex: 1,
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s ease",
            zIndex: 1,
          }}>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
              <StatCard icon="🧳" label="Rides Taken" value="12" sub="↑ 3 this month" color={theme.accent} bg="rgba(56, 189, 248, 0.15)" />
              <StatCard icon="🚗" label="Rides Offered" value="3" sub="↑ 1 this month" color={theme.successText} bg="rgba(52, 211, 153, 0.15)" />
              <StatCard icon="💰" label="Total Saved" value="₹2,450" sub="vs solo travel" color={theme.warningText} bg="rgba(251, 191, 36, 0.15)" />
              <StatCard icon="⭐" label="Avg Rating" value="4.8" sub="From 12 reviews" color="#A78BFA" bg="rgba(167, 139, 250, 0.15)" />
            </div>

            {/* Search */}
            <SearchSection />

            {/* Bottom grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
              <div>
                <UpcomingRides />
                <RecentActivity />
              </div>
              <RightPanel user={user} />
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        
        /* Custom Scrollbar for a premium feel */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </>
  );
}