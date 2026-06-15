import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RidivoLogo from "./RidivoLogo";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import {
  getNotifications as getNotificationsApi,
  markAllRead as markAllReadApi,
  markRead as markReadApi,
} from "../services/notificationService";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  Car,
  ClipboardList,
  User,
  Settings,
  Bell,
  LogOut,
  Star,
  ChevronDown,
  ShieldCheck,
  Menu,
  Coins,
} from "lucide-react";

const theme = {
  bgBase: "#F4F7FA",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#093C5D",
  textSecondary: "#6B7280",
  accent: "#3B7597",
  accentDark: "#093C5D",
  accentLight: "#EFF6FF",
  success: "#10B981",
  successBg: "#EFFDF4",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
};

const getNotificationStyles = (type) => {
  switch (type) {
    case 'BOOKING':
      return { icon: ShieldCheck, color: theme.success };
    case 'RIDE':
      return { icon: Car, color: theme.accent };
    case 'PAYMENT':
      return { icon: Coins, color: theme.warning };
    case 'VERIFICATION':
      return { icon: ShieldCheck, color: theme.success };
    case 'SYSTEM':
    default:
      return { icon: Bell, color: theme.accent };
  }
};

const formatNotificationTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 0) return "Just now";
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const currentPath = location.pathname + location.search;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Search, label: "Find a Ride", path: "/rides" },
    { icon: PlusCircle, label: "Offer a Ride", path: "/rides?tab=post" },
    { icon: Car, label: "My Rides", path: "/rides?tab=my" },
    { icon: ClipboardList, label: "Bookings", path: "/bookings" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/profile?tab=settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Socket Connection and API loading
  useEffect(() => {
    if (!user?.id) return;

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsApi();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();

    // Establish Socket connection
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("register", user.id);
    });

    socket.on("notification", (newNotif) => {
      console.log("New real-time notification received:", newNotif);
      setNotifications((prev) => [newNotif, ...prev].slice(0, 20));

      // Show beautiful custom toast
      toast.custom(
        (t) => {
          const styles = getNotificationStyles(newNotif.type);
          const Icon = styles.icon;
          return (
            <div
              onClick={() => {
                toast.dismiss(t.id);
                setNotifOpen(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                backgroundColor: theme.cardBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(9, 60, 93, 0.1)",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                maxWidth: "350px",
                transition: "all 0.2s ease-in-out",
                opacity: t.visible ? 1 : 0,
                transform: t.visible ? "translateY(0)" : "translateY(-20px)",
              }}
            >
              <div style={{ flexShrink: 0, color: styles.color, display: "flex" }}>
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", fontSize: "13px", fontFamily: "'Sora', sans-serif" }}>{newNotif.title}</div>
                <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "2px" }}>{newNotif.message}</div>
              </div>
            </div>
          );
        },
        { duration: 5000 }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  // Determine active item based on path prefix/parameters
  const isItemActive = (itemPath) => {
    if (itemPath === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (itemPath.includes("?tab=")) {
      return currentPath === itemPath;
    }
    // For general /rides without tab
    if (itemPath === "/rides") {
      return location.pathname === "/rides" && !location.search.includes("tab=post") && !location.search.includes("tab=my");
    }
    // For profile without tab
    if (itemPath === "/profile") {
      return location.pathname === "/profile" && !location.search.includes("tab=settings");
    }
    return location.pathname.startsWith(itemPath);
  };

  // Get Page Title based on route
  const getPageTitle = () => {
    if (location.pathname === "/dashboard") {
      const firstName = user?.name?.trim().split(' ')[0] || 'User';
      return `Welcome back, ${firstName}! 👋`;
    }
    if (location.pathname === "/rides") {
      if (location.search.includes("tab=post")) return "Offer a Ride";
      if (location.search.includes("tab=my")) return "My Rides";
      return "Find a Ride";
    }
    if (location.pathname === "/bookings") return "My Bookings";
    if (location.pathname === "/profile") {
      if (location.search.includes("tab=settings")) return "Settings";
      return "Profile";
    }
    if (location.pathname === "/edit-profile") return "Edit Profile";
    if (location.pathname === "/verify") return "Driver Verification";
    if (location.pathname === "/admin") return "Admin Control Panel";
    return "Ridivo";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.bgBase, fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: "260px", flexShrink: 0,
        backgroundColor: theme.cardBg,
        borderRight: `1px solid ${theme.border}`,
        height: "100vh", position: "fixed", left: 0, top: 0,
        display: "flex", flexDirection: "column",
        zIndex: 100, boxShadow: "4px 0 24px rgba(9, 60, 93, 0.02)"
      }}>
        {/* Logo container */}
        <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${theme.border}`, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}>
          <RidivoLogo size={32} showText={true} textColor={theme.textPrimary} />
        </div>

        {/* Navigation list */}
        <nav style={{ padding: "20px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const active = isItemActive(item.path);
            const IconComponent = item.icon;
            return (
              <Link key={item.label} to={item.path} style={{ textDecoration: "none" }}>
                <button
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", borderRadius: "12px", border: "none",
                    backgroundColor: active ? theme.accentLight : "transparent",
                    color: active ? theme.textPrimary : theme.textSecondary,
                    cursor: "pointer", fontSize: "14px", fontWeight: active ? "600" : "500",
                    fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                    transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                    borderLeft: active ? `3px solid ${theme.textPrimary}` : "3px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "rgba(9, 60, 93, 0.03)";
                      e.currentTarget.style.color = theme.textPrimary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = theme.textSecondary;
                    }
                  }}
                >
                  <IconComponent size={18} strokeWidth={active ? 2.5 : 2} style={{ color: active ? theme.textPrimary : theme.textSecondary }} />
                  {item.label}
                </button>
              </Link>
            );
          })}

          {/* Admin panel logic */}
          {user?.is_admin && (
            <Link to="/admin" style={{ textDecoration: "none" }}>
              <button
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 14px", borderRadius: "12px", border: "none",
                  backgroundColor: location.pathname === "/admin" ? theme.warningBg : "transparent",
                  color: location.pathname === "/admin" ? "#D97706" : theme.textSecondary,
                  cursor: "pointer", fontSize: "14px", fontWeight: "600",
                  fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                  transition: "all 0.2s ease",
                  borderLeft: location.pathname === "/admin" ? "3px solid #F59E0B" : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== "/admin") {
                    e.currentTarget.style.backgroundColor = "rgba(245, 158, 11, 0.05)";
                    e.currentTarget.style.color = "#D97706";
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== "/admin") {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.textSecondary;
                  }
                }}
              >
                <Settings size={18} strokeWidth={2} />
                Admin Panel
              </button>
            </Link>
          )}
        </nav>

        {/* Sidebar Footer (CTA Promo Card) */}
        <div style={{ margin: "16px", borderRadius: "16px", background: `linear-gradient(135deg, ${theme.accentLight}, #DBEAFE)`, border: `1px solid rgba(59, 117, 151, 0.1)`, padding: "16px", marginBottom: "24px" }}>
          <div style={{ color: theme.textPrimary, marginBottom: "8px", display: "flex", alignItems: "center" }}>
            <Car size={20} />
          </div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>Got Empty Seats?</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary, marginBottom: "12px", lineHeight: "1.4" }}>Offer your ride and split the travel cost fairly.</div>
          <button
            onClick={() => navigate("/rides?tab=post")}
            style={{
              width: "100%", padding: "10px", backgroundColor: theme.textPrimary,
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "12px", fontWeight: "700", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(9, 60, 93, 0.15)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#07304b"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.textPrimary}
          >Offer a Ride</button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ marginLeft: "260px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        {/* ── TOP NAV BAR ── */}
        <header style={{
          height: "70px", backgroundColor: theme.cardBg,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px", position: "sticky", top: 0, zIndex: 90,
          boxShadow: "0 2px 10px rgba(9, 60, 93, 0.01)"
        }}>
          {/* Page Title */}
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "20px", fontWeight: "700", color: theme.textPrimary, margin: 0 }}>
              {getPageTitle()}
            </h1>
          </div>

          {/* Right Action Icons & Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            
            {/* Search Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: theme.bgBase, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "8px 14px" }}>
              <Search size={14} style={{ color: theme.textSecondary }} />
              <input
                placeholder="Search rides..."
                style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: "13px", color: theme.textPrimary, fontFamily: "'DM Sans', sans-serif", width: "160px" }}
              />
            </div>

            {/* Notifications Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                style={{
                  position: "relative", width: "40px", height: "40px",
                  backgroundColor: theme.bgBase, border: `1px solid ${theme.border}`,
                  borderRadius: "10px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s ease", color: theme.textPrimary
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(9, 60, 93, 0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.bgBase; }}
              >
                <Bell size={18} strokeWidth={2} />
                {unreadCount > 0 && (
                  <div style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    width: "18px", height: "18px", backgroundColor: theme.danger,
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: "700", color: "white",
                    fontFamily: "'DM Sans', sans-serif", border: `2px solid ${theme.cardBg}`,
                  }}>{unreadCount}</div>
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  backgroundColor: theme.cardBg, borderRadius: "16px", width: "320px",
                  boxShadow: "0 12px 40px rgba(9, 60, 93, 0.1)", border: `1px solid ${theme.border}`,
                  zIndex: 100, overflow: "hidden", animation: "fadeInDown 0.2s ease",
                }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span onClick={handleMarkAllRead} style={{ fontSize: "12px", color: theme.accent, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: "600" }}>Mark all read</span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "24px 20px", textAlign: "center", color: theme.textSecondary, fontFamily: "'DM Sans', sans-serif", fontSize: "13px" }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const styles = getNotificationStyles(n.type);
                      const NotificationIcon = styles.icon;
                      return (
                        <div key={n.id} 
                          onClick={() => !n.is_read && handleMarkRead(n.id)}
                          style={{
                            padding: "14px 20px", display: "flex", gap: "12px", alignItems: "flex-start",
                            backgroundColor: n.is_read ? "transparent" : "rgba(9, 60, 93, 0.03)",
                            borderBottom: `1px solid ${theme.border}`,
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(9, 60, 93, 0.05)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.is_read ? "transparent" : "rgba(9, 60, 93, 0.03)"}
                        >
                          <div style={{ flexShrink: 0, color: styles.color, display: "flex", alignItems: "center", marginTop: "2px" }}>
                            <NotificationIcon size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: "700", color: theme.textPrimary, lineHeight: "1.4", marginBottom: "2px" }}>{n.title}</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary, lineHeight: "1.4", marginBottom: "4px" }}>{n.message}</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: theme.textSecondary }}>{formatNotificationTime(n.created_at)}</div>
                          </div>
                          {!n.is_read && <div style={{ width: "8px", height: "8px", backgroundColor: theme.accent, borderRadius: "50%", flexShrink: 0, marginTop: "4px" }} />}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  backgroundColor: theme.bgBase, border: `1px solid ${theme.border}`,
                  borderRadius: "10px", padding: "6px 12px 6px 6px",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(9, 60, 93, 0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.bgBase; }}
              >
                {user?.profile_pic ? (
                  <img src={user.profile_pic} alt="Profile" style={{ width: "28px", height: "28px", borderRadius: "8px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: "700" }}>
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600", color: theme.textPrimary }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={14} style={{ color: theme.textSecondary, transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>

              {profileOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  backgroundColor: theme.cardBg, borderRadius: "16px", width: "220px",
                  boxShadow: "0 12px 40px rgba(9, 60, 93, 0.1)", border: `1px solid ${theme.border}`,
                  zIndex: 100, overflow: "hidden", animation: "fadeInDown 0.2s ease",
                }}>
                  <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
                    {user?.profile_pic ? (
                      <img src={user.profile_pic} alt="Profile" style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: "700" }}>
                        {user?.name?.[0] || 'U'}
                      </div>
                    )}
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: "700", color: theme.textPrimary, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{user?.name || 'User'}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: theme.textSecondary, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{user?.email || ''}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} style={{ textDecoration: "none" }}>
                      <button style={dropdownBtnStyle}>
                        <User size={14} style={{ color: theme.textPrimary }} /> My Profile
                      </button>
                    </Link>
                    <Link to="/rides?tab=my" onClick={() => setProfileOpen(false)} style={{ textDecoration: "none" }}>
                      <button style={dropdownBtnStyle}>
                        <Car size={14} style={{ color: theme.textPrimary }} /> My Rides
                      </button>
                    </Link>
                    <Link to="/bookings" onClick={() => setProfileOpen(false)} style={{ textDecoration: "none" }}>
                      <button style={dropdownBtnStyle}>
                        <ClipboardList size={14} style={{ color: theme.textPrimary }} /> My Bookings
                      </button>
                    </Link>
                    <Link to="/verify" onClick={() => setProfileOpen(false)} style={{ textDecoration: "none" }}>
                      <button style={dropdownBtnStyle}>
                        <ShieldCheck size={14} style={{ color: theme.textPrimary }} /> Driver Verification
                      </button>
                    </Link>
                    <Link to="/profile?tab=settings" onClick={() => setProfileOpen(false)} style={{ textDecoration: "none" }}>
                      <button style={dropdownBtnStyle}>
                        <Settings size={14} style={{ color: theme.textPrimary }} /> Settings
                      </button>
                    </Link>
                  </div>

                  <div style={{ borderTop: `1px solid ${theme.border}`, padding: "8px" }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%", padding: "10px 14px", border: "none",
                        backgroundColor: "rgba(239, 68, 68, 0.05)", borderRadius: "8px",
                        cursor: "pointer", color: theme.danger,
                        fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                        fontWeight: "600", display: "flex", alignItems: "center", justifyStyle: "center", gap: "8px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)"}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── PAGE CONTENT OUTLET ── */}
        <main style={{ padding: "32px 40px", flex: 1, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(9, 60, 93, 0.15); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(9, 60, 93, 0.25); }
      `}</style>
    </div>
  );
}

const dropdownBtnStyle = {
  width: "100%", display: "flex", alignItems: "center", gap: "10px",
  padding: "10px 16px", border: "none", backgroundColor: "transparent",
  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  fontSize: "13px", color: theme.textPrimary, textAlign: "left",
  transition: "background 0.15s",
};
