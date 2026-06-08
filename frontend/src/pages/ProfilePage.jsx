import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile } from "../services/userService";
import axiosInstance from "../utils/axiosInstance";
import RidivoLogo from "../components/RidivoLogo";

const avatarColors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];
function getColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function Avatar({ name, size = 48, src }) {
  const initials = name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = getColor(name || "U");
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>{initials}</div>
  );
}

function StarRating({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 20 20" fill={s <= Math.round(rating) ? "#f59e0b" : "#374151"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 16, padding: 32,
        width: "100%", maxWidth: 420, boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 6, textTransform: "capitalize", fontFamily: "'DM Sans', sans-serif" }}>Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              width: "100%", background: "#0f1420", border: "1px solid #2d3748", borderRadius: 8,
              color: "#f1f5f9", padding: "10px 14px", fontSize: 14, outline: "none",
              fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Email Address</label>
          <input
            value={user.email}
            disabled
            style={{
              width: "100%", background: "#0a0f1a", border: "1px solid #1e2535", borderRadius: 8,
              color: "#64748b", padding: "10px 14px", fontSize: 14, outline: "none",
              fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", cursor: "not-allowed",
            }}
          />
          <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>Email cannot be changed</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Phone Number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{
              width: "100%", background: "#0f1420", border: "1px solid #2d3748", borderRadius: 8,
              color: "#f1f5f9", padding: "10px 14px", fontSize: 14, outline: "none",
              fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #2d3748",
            background: "none", color: "#94a3b8", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14
          }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
            background: loading ? "#1e3a5f" : "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff",
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600
          }}>{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const location = useLocation();
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return ["overview", "reviews", "settings"].includes(tab) ? tab : "overview";
  };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [editOpen, setEditOpen] = useState(false);
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["overview", "reviews", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        const vehicleRes = await axiosInstance.get("/vehicles");
        setUser({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "Not added",
          avg_rating: parseFloat(data.user.avg_rating) || 0,
          total_rides: data.user.total_rides || 0,
          rides_offered: 0,
          total_saved: 0,
          is_email_verified: data.user.is_email_verified,
          created_at: data.user.created_at,
          profile_pic: data.user.profile_pic || null,
          verification_status: data.verification_status,
          vehicles: vehicleRes.data.vehicles || [],
          reviews: [],
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (updated) => {
    try {
      const data = await updateMyProfile(updated.name, updated.phone, user.profile_pic);
      setUser({ ...user, name: data.user.name, phone: data.user.phone });
      updateUser({ name: data.user.name, phone: data.user.phone });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUser({ ...user, ...updated });
    } finally {
      setEditOpen(false);
    }
  };

  const memberSince = user
    ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  const tabs = user
    ? [
        { id: "overview", label: "Overview" },
        { id: "reviews", label: `Reviews (${user.reviews.length})` },
        { id: "settings", label: "Settings" },
      ]
    : [];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1420", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#3b82f6", fontFamily: "'DM Sans', sans-serif", fontSize: "18px" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1420; }
        .profile-page { min-height: 100vh; background: #0f1420; font-family: 'DM Sans', sans-serif; display: flex; }
        .sidebar { width: 240px; background: #131825; border-right: 1px solid #1e2535; padding: 24px 0; display: flex; flex-direction: column; flex-shrink: 0; }
        .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 28px; border-bottom: 1px solid #1e2535; cursor: pointer; }
        .logo-box { width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 16px; }
        .logo-text { font-size: 18px; font-weight: 700; color: #f1f5f9; }
        .nav-items { padding: 16px 12px; flex: 1; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; margin-bottom: 2px; }
        .nav-item:hover { background: #1e2535; color: #94a3b8; }
        .nav-item.active { background: #1e3a5f; color: #3b82f6; }
        .main { flex: 1; overflow-y: auto; }
        .topbar { background: #131825; border-bottom: 1px solid #1e2535; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
        .topbar-title { color: #f1f5f9; font-size: 18px; font-weight: 700; }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .content { padding: 32px; max-width: 900px; }
        .profile-hero { background: linear-gradient(135deg, #1a2235 0%, #131825 100%); border: 1px solid #1e2535; border-radius: 16px; padding: 32px; margin-bottom: 24px; position: relative; overflow: hidden; }
        .profile-hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%); border-radius: 50%; }
        .profile-hero-inner { display: flex; align-items: flex-start; gap: 24px; position: relative; }
        .avatar-wrapper { position: relative; }
        .avatar-edit-btn { position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #131825; }
        .profile-info { flex: 1; }
        .profile-name { font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .profile-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
        .meta-badge { display: flex; align-items: center; gap: 5px; background: #1e2535; border-radius: 20px; padding: 4px 10px; font-size: 12px; color: #94a3b8; }
        .verified-badge { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; }
        .rating-display { display: flex; align-items: center; gap: 6px; }
        .rating-num { font-size: 15px; font-weight: 700; color: #f59e0b; }
        .profile-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
        .btn-primary { padding: 9px 20px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.15s; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-secondary { padding: 9px 20px; background: none; color: #94a3b8; border: 1px solid #2d3748; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .btn-secondary:hover { border-color: #3b82f6; color: #3b82f6; }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: #131825; border: 1px solid #1e2535; border-radius: 12px; padding: 20px; text-align: center; }
        .stat-num { font-size: 28px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; font-family: 'DM Mono', monospace; }
        .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }
        .stat-sub { font-size: 11px; color: #3b82f6; margin-top: 3px; }
        .tabs { display: flex; gap: 4px; background: #131825; border: 1px solid #1e2535; border-radius: 10px; padding: 4px; margin-bottom: 24px; width: fit-content; }
        .tab { padding: 8px 18px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; color: #64748b; transition: all 0.15s; }
        .tab.active { background: #1e3a5f; color: #3b82f6; }
        .tab:hover:not(.active) { color: #94a3b8; }
        .section-card { background: #131825; border: 1px solid #1e2535; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
        .section-title { font-size: 14px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-item label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 5px; }
        .info-item span { font-size: 14px; color: #e2e8f0; font-weight: 500; }
        .review-item { padding: 16px 0; border-bottom: 1px solid #1e2535; }
        .review-item:last-child { border-bottom: none; padding-bottom: 0; }
        .review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .reviewer-info { flex: 1; }
        .reviewer-name { font-size: 14px; font-weight: 600; color: #e2e8f0; }
        .review-date { font-size: 11px; color: #64748b; margin-top: 2px; }
        .review-comment { font-size: 13px; color: #94a3b8; line-height: 1.5; }
        .setting-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #1e2535; }
        .setting-row:last-child { border-bottom: none; }
        .setting-label { font-size: 14px; color: #e2e8f0; font-weight: 500; }
        .setting-desc { font-size: 12px; color: #64748b; margin-top: 2px; }
        .toggle { width: 40px; height: 22px; background: #3b82f6; border-radius: 11px; position: relative; cursor: pointer; transition: background 0.2s; }
        .toggle.off { background: #2d3748; }
        .toggle-thumb { width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 3px; right: 3px; transition: right 0.2s; }
        .toggle.off .toggle-thumb { right: auto; left: 3px; }
        .danger-zone { background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15); border-radius: 12px; padding: 20px; margin-top: 8px; }
        .danger-title { font-size: 13px; font-weight: 600; color: #ef4444; margin-bottom: 12px; }
        .btn-danger { padding: 8px 16px; background: none; color: #ef4444; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .btn-danger:hover { background: rgba(239,68,68,0.1); }
      `}</style>

      <div className="profile-page">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo" onClick={() => navigate("/dashboard")}>
            <RidivoLogo size={36} showText={true} textColor="#f1f5f9" />
          </div>
          <nav className="nav-items">
            {[
              { label: "Dashboard", icon: "⊞", path: "/dashboard" },
              { label: "Find a Ride", icon: "🔍", path: "/find-ride" },
              { label: "My Rides", icon: "🚗", path: "/my-rides" },
              { label: "Offer a Ride", icon: "➕", path: "/offer-ride" },
              { label: "Bookings", icon: "📋", path: "/bookings" },
              { label: "Payments", icon: "💰", path: "/payments" },
              { label: "Reviews", icon: "⭐", path: "/reviews" },
              { label: "Profile", icon: "👤", path: "/profile", active: true },
              { label: "Settings", icon: "⚙️", path: "/profile?tab=settings" },
            ].map((item) => (
              <div
                key={item.label}
                className={`nav-item ${item.active ? "active" : ""}`}
                onClick={() => item.path && navigate(item.path)}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
          <div style={{ padding: "16px 20px", margin: "0 12px 12px", background: "rgba(59,130,246,0.07)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.15)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", marginBottom: 4 }}>Got Empty Seats?</div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>Share your ride and split the cost</div>
            <button className="btn-primary" style={{ width: "100%", fontSize: 12, padding: "7px 0" }}
              onClick={() => navigate("/offer-ride")}>
              Offer a Ride
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <span className="topbar-title">My Profile</span>
            <div className="topbar-right">
              <button
                onClick={() => { logout(); navigate("/"); }}
                style={{ background: "none", border: "1px solid #2d3748", color: "#94a3b8", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d3748"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                Sign Out
              </button>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e2535", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: 14 }}>🔔</span>
              </div>
              <Avatar name={user.name} size={34} src={user.profile_pic} />
            </div>
          </div>

          <div className="content">
            {/* Hero */}
            <div className="profile-hero">
              <div className="profile-hero-inner">
                <div className="avatar-wrapper">
                  <Avatar name={user.name} size={80} src={user.profile_pic} />
                  <div className="avatar-edit-btn">
                    <svg width="12" height="12" fill="white" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                </div>
                <div className="profile-info">
                  <div className="profile-name">{user.name}</div>
                  <div className="profile-meta">
                    <div className={`meta-badge ${user.is_email_verified ? "verified-badge" : ""}`}>
                      {user.is_email_verified ? "✓ Verified" : "✗ Unverified"}
                    </div>
                    <div className="meta-badge">
                      <span>📅</span> Member since {memberSince}
                    </div>
                  </div>
                  <div className="rating-display">
                    <StarRating rating={user.avg_rating} size={16} />
                    <span className="rating-num">{user.avg_rating}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>({user.reviews.length} reviews)</span>
                  </div>
                  <div className="profile-actions">
                    <button className="btn-primary" onClick={() => navigate('/edit-profile')}>✏️ Edit Profile</button>

                    {/* Dynamic verification button */}
                    {user.verification_status === null && (
                      <button className="btn-secondary" onClick={() => navigate("/verify")}>
                        🛡️ Become a Driver
                      </button>
                    )}
                    {user.verification_status?.status === "PENDING" && (
                      <button className="btn-secondary" style={{ color: "#FBBF24", borderColor: "#FBBF24", cursor: "default" }}>
                        ⏳ Verification Pending
                      </button>
                    )}
                    {user.verification_status?.status === "APPROVED" && (
                      <button className="btn-secondary" style={{ color: "#10B981", borderColor: "#10B981", cursor: "default" }}>
                        ✅ Verified Driver
                      </button>
                    )}
                    {user.verification_status?.status === "REJECTED" && (
                      <button className="btn-secondary" style={{ color: "#EF4444", borderColor: "#EF4444" }} onClick={() => navigate("/verify")}>
                        ❌ Rejected — Reapply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-num">{user.total_rides}</div>
                <div className="stat-label">Rides Taken</div>
                <div className="stat-sub">↑ 3 this month</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{user.rides_offered}</div>
                <div className="stat-label">Rides Offered</div>
                <div className="stat-sub">↑ 1 this month</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">₹{user.total_saved.toLocaleString("en-IN")}</div>
                <div className="stat-label">Total Saved</div>
                <div className="stat-sub">vs solo travel</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              {tabs.map((t) => (
                <div key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                </div>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <>
                <div className="section-card">
                  <div className="section-title">Personal Information</div>
                  <div className="info-grid">
                    <div className="info-item"><label>Full Name</label><span>{user.name}</span></div>
                    <div className="info-item"><label>Email Address</label><span>{user.email}</span></div>
                    <div className="info-item"><label>Phone Number</label><span>{user.phone}</span></div>
                    <div className="info-item"><label>Member Since</label><span>{memberSince}</span></div>
                  </div>
                </div>
                <div className="section-card">
                  <div className="section-title">Ride Statistics</div>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Average Rating</label>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <StarRating rating={user.avg_rating} /> {user.avg_rating}
                      </span>
                    </div>
                    <div className="info-item"><label>Total Rides Taken</label><span>{user.total_rides} rides</span></div>
                    <div className="info-item"><label>Rides Offered</label><span>{user.rides_offered} rides</span></div>
                    <div className="info-item"><label>Total Saved</label><span style={{ color: "#10b981" }}>₹{user.total_saved.toLocaleString("en-IN")}</span></div>
                  </div>
                </div>

                {/* Verification Status Card */}
                <div className="section-card">
                  <div className="section-title">Driver Verification</div>
                  {user.verification_status === null && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Not Applied</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>Apply to become a verified driver and start offering rides</div>
                      </div>
                      <button className="btn-primary" onClick={() => navigate("/verify")}>Apply Now</button>
                    </div>
                  )}
                  {user.verification_status?.status === "PENDING" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⏳</div>
                      <div>
                        <div style={{ color: "#FBBF24", fontSize: 14, fontWeight: 600 }}>Verification Pending</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>Admin is reviewing your documents</div>
                      </div>
                    </div>
                  )}
                  {user.verification_status?.status === "APPROVED" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✅</div>
                      <div>
                        <div style={{ color: "#10B981", fontSize: 14, fontWeight: 600 }}>Verified Driver</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>You can now offer rides on Ridivo</div>
                      </div>
                    </div>
                  )}
                  {user.verification_status?.status === "REJECTED" && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>❌</div>
                        <div>
                          <div style={{ color: "#EF4444", fontSize: 14, fontWeight: 600 }}>Verification Rejected</div>
                          <div style={{ color: "#64748b", fontSize: 12 }}>{user.verification_status.rejection_reason || "Please reapply with correct documents"}</div>
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => navigate("/verify")}>Reapply</button>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Vehicles Section */}
            {activeTab === "overview" && user.verification_status?.status === "APPROVED" && (
              <div className="section-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div className="section-title" style={{ margin: 0 }}>My Vehicles</div>
                  <button className="btn-primary" style={{ fontSize: "12px", padding: "6px 14px" }}
                    onClick={() => navigate("/edit-profile?tab=vehicles")}>
                    + Add Vehicle
                  </button>
                </div>

                {user.vehicles && user.vehicles.length > 0 ? (
                  user.vehicles.map((v) => (
                    <div key={v.id} style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px", borderRadius: "10px", marginBottom: "10px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      border: `1px solid ${v.is_active ? "rgba(59,130,246,0.4)" : "#1e2535"}`,
                    }}>
                      <div style={{ fontSize: "28px" }}>
                        {v.vehicle_type === "BIKE" ? "🏍️" : v.vehicle_type === "SUV" ? "🚙" : "🚗"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "600", marginBottom: "3px" }}>
                          {v.vehicle_name}
                          {v.is_active && (
                            <span style={{ marginLeft: "8px", fontSize: "10px", backgroundColor: "rgba(59,130,246,0.2)", color: "#3b82f6", padding: "2px 8px", borderRadius: "100px", fontWeight: "600" }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "12px" }}>
                          {v.vehicle_number} · {v.vehicle_type} · {v.total_seats} seats {v.color ? `· ${v.color}` : ""}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#64748b" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚗</div>
                    <div style={{ fontSize: "13px", marginBottom: "12px" }}>No vehicles added yet</div>
                    <button className="btn-primary" style={{ fontSize: "12px", padding: "7px 16px" }}
                      onClick={() => navigate("/edit-profile?tab=vehicles")}>
                      Add Your First Vehicle
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === "reviews" && (
              <div className="section-card">
                <div className="section-title">Reviews From Co-Passengers</div>
                {user.reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#94a3b8", marginBottom: 4 }}>No reviews yet</div>
                    <div style={{ fontSize: 12 }}>Complete rides to receive reviews from co-passengers</div>
                  </div>
                ) : (
                  user.reviews.map((r) => (
                    <div key={r.id} className="review-item">
                      <div className="review-header">
                        <Avatar name={r.reviewer} size={38} />
                        <div className="reviewer-info">
                          <div className="reviewer-name">{r.reviewer}</div>
                          <div className="review-date">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                        </div>
                        <StarRating rating={r.rating} />
                      </div>
                      <div className="review-comment">"{r.comment}"</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === "settings" && (
              <>
                <div className="section-card">
                  <div className="section-title">Notifications</div>
                  {[
                    { label: "Ride Alerts", desc: "Get notified when a ride matches your route", on: true },
                    { label: "Booking Updates", desc: "Confirmations and cancellation alerts", on: true },
                    { label: "Promotions", desc: "Deals and offers from Ridivo", on: false },
                    { label: "Review Reminders", desc: "Reminders to review past rides", on: true },
                  ].map((s) => (
                    <div key={s.label} className="setting-row">
                      <div>
                        <div className="setting-label">{s.label}</div>
                        <div className="setting-desc">{s.desc}</div>
                      </div>
                      <div className={`toggle ${s.on ? "" : "off"}`}><div className="toggle-thumb" /></div>
                    </div>
                  ))}
                </div>
                <div className="section-card">
                  <div className="section-title">Privacy</div>
                  {[
                    { label: "Show Phone Number", desc: "Visible to co-passengers after booking", on: false },
                    { label: "Public Profile", desc: "Anyone can view your profile and reviews", on: true },
                  ].map((s) => (
                    <div key={s.label} className="setting-row">
                      <div>
                        <div className="setting-label">{s.label}</div>
                        <div className="setting-desc">{s.desc}</div>
                      </div>
                      <div className={`toggle ${s.on ? "" : "off"}`}><div className="toggle-thumb" /></div>
                    </div>
                  ))}
                </div>
                <div className="danger-zone">
                  <div className="danger-title">⚠️ Danger Zone</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-danger">Deactivate Account</button>
                    <button className="btn-danger">Delete Account</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {editOpen && <EditModal user={user} onClose={() => setEditOpen(false)} onSave={handleSave} />}
    </>
  );
}
