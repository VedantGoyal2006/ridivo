import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile } from "../services/userService";
import axiosInstance from "../utils/axiosInstance";
import {
  Calendar,
  Star,
  Car,
  Bike,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit3,
  User,
  Settings,
  Bell,
  Mail,
  Phone,
  Plus,
} from "lucide-react";

const avatarColors = ["#3B7597", "#093C5D", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B"];
function getColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const theme = {
  bgCard: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#093C5D",
  textSecondary: "#6B7280",
  textMuted: "#94A3B8",
  accent: "#3B7597",
  accentDark: "#093C5D",
  accentLight: "#EFF6FF",
  success: "#10B981",
  successBg: "#EFFDF4",
  successText: "#10B981",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  warningText: "#D97706",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
};

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

function StarRating({ rating, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} fill={s <= Math.round(rating) ? "#F59E0B" : "transparent"} color={s <= Math.round(rating) ? "#F59E0B" : theme.textMuted} />
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
      position: "fixed", inset: 0, background: "rgba(9, 60, 93, 0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 32,
        width: "100%", maxWidth: 420, boxShadow: "0 25px 60px rgba(9, 60, 93, 0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Sora', sans-serif" }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: theme.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: "600", fontFamily: "'DM Sans', sans-serif" }}>Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              width: "100%", background: "#F9FAFB", border: `1px solid ${theme.border}`, borderRadius: 8,
              color: theme.textPrimary, padding: "10px 14px", fontSize: 14, outline: "none",
              fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: theme.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: "600", fontFamily: "'DM Sans', sans-serif" }}>Email Address</label>
          <input
            value={user.email}
            disabled
            style={{
              width: "100%", background: "#F3F4F6", border: `1px solid ${theme.border}`, borderRadius: 8,
              color: theme.textMuted, padding: "10px 14px", fontSize: 14, outline: "none",
              fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", cursor: "not-allowed",
            }}
          />
          <span style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, display: "block" }}>Email cannot be changed</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: theme.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: "600", fontFamily: "'DM Sans', sans-serif" }}>Phone Number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{
              width: "100%", background: "#F9FAFB", border: `1px solid ${theme.border}`, borderRadius: 8,
              color: theme.textPrimary, padding: "10px 14px", fontSize: 14, outline: "none",
              fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 8, border: `1px solid ${theme.border}`,
            background: "none", color: theme.textSecondary, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: "600"
          }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{
            flex: 1, padding: "12px 0", borderRadius: 8, border: "none",
            background: loading ? theme.accent : theme.textPrimary, color: "#fff",
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600
          }}>{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return ["overview", "reviews", "settings"].includes(tab) ? tab : "overview";
  };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [editOpen, setEditOpen] = useState(false);

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0" }}>
        <div style={{ color: theme.accent, fontFamily: "'DM Sans', sans-serif", fontSize: "18px" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Profile Hero Card */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.accentLight} 0%, #E0F2FE 100%)`,
          border: `1px solid ${theme.border}`,
          borderRadius: "20px", padding: "32px", marginBottom: "28px",
          position: "relative", overflow: "hidden",
          boxShadow: "0 10px 30px rgba(9, 60, 93, 0.02)"
        }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(9,60,93,0.06), transparent)", borderRadius: "50%" }} />
          
          <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <Avatar name={user.name} size={84} src={user.profile_pic} />
              <button 
                onClick={() => navigate('/edit-profile')}
                style={{
                  position: "absolute", bottom: 0, right: 0, width: "28px", height: "28px",
                  backgroundColor: theme.textPrimary, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer", border: `2px solid ${theme.bgCard}`,
                  color: "white"
                }}
              >
                <Edit3 size={12} />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "24px", fontWeight: "800", color: theme.textPrimary, fontFamily: "'Sora', sans-serif", marginBottom: "6px" }}>{user.name}</div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  backgroundColor: user.is_email_verified ? theme.successBg : theme.dangerBg,
                  borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: "700",
                  color: user.is_email_verified ? theme.success : theme.danger,
                  border: `1px solid ${user.is_email_verified ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
                }}>
                  {user.is_email_verified ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {user.is_email_verified ? "Verified User" : "Unverified"}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#fff", border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "4px 12px", fontSize: "11px", color: theme.textSecondary, fontWeight: "600" }}>
                  <Calendar size={12} /> Member since {memberSince}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <StarRating rating={user.avg_rating} size={14} />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#F59E0B" }}>{user.avg_rating}</span>
                <span style={{ fontSize: "12px", color: theme.textSecondary }}>({user.reviews.length} reviews)</span>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button 
                  onClick={() => navigate('/edit-profile')}
                  style={{
                    padding: "10px 20px", backgroundColor: theme.textPrimary, color: "white",
                    border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "6px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#07304b"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.textPrimary}
                >
                  <Edit3 size={14} /> Edit Profile
                </button>

                {user.verification_status === null && (
                  <button 
                    onClick={() => navigate("/verify")}
                    style={{
                      padding: "10px 20px", backgroundColor: "white", color: theme.textPrimary,
                      border: `1px solid ${theme.border}`, borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.textPrimary; e.currentTarget.style.backgroundColor = theme.accentLight; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.backgroundColor = "white"; }}
                  >
                    🛡️ Become a Driver
                  </button>
                )}
                {user.verification_status?.status === "PENDING" && (
                  <div style={{
                    padding: "10px 20px", backgroundColor: theme.warningBg, color: theme.warningText,
                    border: `1px solid rgba(245, 158, 11, 0.2)`, borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                    display: "flex", alignItems: "center", gap: "6px"
                  }}>
                    <Clock size={14} /> Verification Pending
                  </div>
                )}
                {user.verification_status?.status === "APPROVED" && (
                  <div style={{
                    padding: "10px 20px", backgroundColor: theme.successBg, color: theme.success,
                    border: `1px solid rgba(16, 185, 129, 0.2)`, borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                    display: "flex", alignItems: "center", gap: "6px"
                  }}>
                    <ShieldCheck size={14} /> Verified Driver
                  </div>
                )}
                {user.verification_status?.status === "REJECTED" && (
                  <button 
                    onClick={() => navigate("/verify")}
                    style={{
                      padding: "10px 20px", backgroundColor: theme.dangerBg, color: theme.danger,
                      border: `1px solid rgba(239, 68, 68, 0.2)`, borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <AlertTriangle size={14} /> Reapply Verification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { num: user.total_rides, label: "Rides Taken", sub: "↑ 3 this month" },
            { num: user.rides_offered, label: "Rides Offered", sub: "↑ 1 this month" },
            { num: `₹${user.total_saved}`, label: "Total Saved", sub: "vs solo travel" },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: theme.textPrimary, marginBottom: "4px", fontFamily: "'Sora', sans-serif" }}>{stat.num}</div>
              <div style={{ fontSize: "13px", color: theme.textSecondary, fontWeight: "600" }}>{stat.label}</div>
              <div style={{ fontSize: "11px", color: theme.accent, marginTop: "4px", fontWeight: "500" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(9,60,93,0.03)", padding: "4px", borderRadius: "12px", border: `1px solid ${theme.border}`, marginBottom: "28px", width: "fit-content" }}>
          {tabs.map((t) => (
            <div 
              key={t.id} 
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "8px 20px", borderRadius: "8px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer",
                backgroundColor: activeTab === t.id ? theme.bgCard : "transparent",
                color: activeTab === t.id ? theme.textPrimary : theme.textSecondary,
                transition: "all 0.2s",
                boxShadow: activeTab === t.id ? "0 4px 10px rgba(9, 60, 93, 0.03)" : "none"
              }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <>
            <div style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "20px" }}>Personal Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {[
                  { label: "Full Name", value: user.name, icon: User },
                  { label: "Email Address", value: user.email, icon: Mail },
                  { label: "Phone Number", value: user.phone, icon: Phone },
                  { label: "Member Since", value: memberSince, icon: Calendar },
                ].map((item, i) => {
                  const IconComp = item.icon;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: `1px solid ${theme.border}`, borderRadius: "10px", backgroundColor: "#F9FAFB" }}>
                      <IconComp size={18} style={{ color: theme.textSecondary }} />
                      <div>
                        <div style={{ fontSize: "11px", color: theme.textSecondary, fontWeight: "600", textTransform: "uppercase" }}>{item.label}</div>
                        <div style={{ fontSize: "14px", color: theme.textPrimary, fontWeight: "700", marginTop: "2px" }}>{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Status Card */}
            <div style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "20px" }}>Driver Verification</div>
              {user.verification_status === null && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Not Applied</div>
                    <div style={{ color: theme.textSecondary, fontSize: 12 }}>Apply to become a verified driver and start offering rides</div>
                  </div>
                  <button onClick={() => navigate("/verify")} style={{ padding: "8px 16px", backgroundColor: theme.textPrimary, color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Apply Now</button>
                </div>
              )}
              {user.verification_status?.status === "PENDING" && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: theme.warningBg, display: "flex", alignItems: "center", justifyContent: "center", color: theme.warningText }}><Clock size={20} /></div>
                  <div>
                    <div style={{ color: theme.warningText, fontSize: 14, fontWeight: 700 }}>Verification Pending</div>
                    <div style={{ color: theme.textSecondary, fontSize: 12 }}>Admin is reviewing your documents</div>
                  </div>
                </div>
              )}
              {user.verification_status?.status === "APPROVED" && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: theme.successBg, display: "flex", alignItems: "center", justifyContent: "center", color: theme.success }}><ShieldCheck size={20} /></div>
                  <div>
                    <div style={{ color: theme.success, fontSize: 14, fontWeight: 700 }}>Verified Driver</div>
                    <div style={{ color: theme.textSecondary, fontSize: 12 }}>You can now offer rides on Ridivo</div>
                  </div>
                </div>
              )}
              {user.verification_status?.status === "REJECTED" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: theme.dangerBg, display: "flex", alignItems: "center", justifyContent: "center", color: theme.danger }}><AlertTriangle size={20} /></div>
                    <div>
                      <div style={{ color: theme.danger, fontSize: 14, fontWeight: 700 }}>Verification Rejected</div>
                      <div style={{ color: theme.textSecondary, fontSize: 12 }}>{user.verification_status.rejection_reason || "Please reapply with correct documents"}</div>
                    </div>
                  </div>
                  <button onClick={() => navigate("/verify")} style={{ padding: "8px 16px", backgroundColor: theme.textPrimary, color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Reapply</button>
                </div>
              )}
            </div>
            
            {/* Vehicles section */}
            {user.verification_status?.status === "APPROVED" && (
              <div style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary, textTransform: "uppercase", letterSpacing: "0.8px" }}>My Vehicles</div>
                  <button onClick={() => navigate("/edit-profile?tab=vehicles")} style={{ padding: "8px 14px", backgroundColor: theme.accentLight, color: theme.textPrimary, border: `1px solid rgba(9, 60, 93, 0.1)`, borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Plus size={14} /> Add Vehicle
                  </button>
                </div>

                {user.vehicles && user.vehicles.length > 0 ? (
                  user.vehicles.map((v) => (
                    <div key={v.id} style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px 18px", borderRadius: "12px", marginBottom: "10px",
                      backgroundColor: "#F9FAFB",
                      border: `1px solid ${v.is_active ? "rgba(9, 60, 93, 0.2)" : theme.border}`,
                    }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: theme.accentLight, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textPrimary }}>
                        {v.vehicle_type === "BIKE" ? <Bike size={22} /> : <Car size={22} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: "700", marginBottom: "3px" }}>
                          {v.vehicle_name}
                          {v.is_active && (
                            <span style={{ marginLeft: "8px", fontSize: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: theme.success, padding: "2px 8px", borderRadius: "100px", fontWeight: "700" }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div style={{ color: theme.textSecondary, fontSize: "12px" }}>
                          {v.vehicle_number} · {v.vehicle_type} · {v.total_seats} seats {v.color ? `· ${v.color}` : ""}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 0", color: theme.textSecondary }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: '#94A3B8', marginBottom: '8px' }}>
                      <Car size={36} />
                    </div>
                    <div style={{ fontSize: "13px", marginBottom: "12px" }}>No vehicles added yet</div>
                    <button onClick={() => navigate("/edit-profile?tab=vehicles")} style={{ padding: "8px 16px", backgroundColor: theme.textPrimary, color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                      Add Your First Vehicle
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tab: Reviews */}
        {activeTab === "reviews" && (
          <div style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "20px" }}>Reviews From Co-Passengers</div>
            {user.reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: theme.textSecondary }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#94A3B8', marginBottom: '12px' }}>
                  <Star size={40} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.textPrimary, marginBottom: 4 }}>No reviews yet</div>
                <div style={{ fontSize: 12 }}>Complete rides to receive reviews from co-passengers</div>
              </div>
            ) : (
              user.reviews.map((r) => (
                <div key={r.id} style={{ padding: "16px 0", borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <Avatar name={r.reviewer} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: theme.textPrimary }}>{r.reviewer}</div>
                      <div style={{ fontSize: "11px", color: theme.textSecondary, marginTop: "2px" }}>{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  <div style={{ fontSize: "13px", color: theme.textSecondary, lineLineHeight: "1.5" }}>"{r.comment}"</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === "settings" && (
          <>
            <div style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "20px" }}>Notifications</div>
              {[
                { label: "Ride Alerts", desc: "Get notified when a ride matches your route", on: true },
                { label: "Booking Updates", desc: "Confirmations and cancellation alerts", on: true },
                { label: "Promotions", desc: "Deals and offers from Ridivo", on: false },
                { label: "Review Reminders", desc: "Reminders to review past rides", on: true },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 3 ? `1px solid ${theme.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: theme.textPrimary, fontWeight: "600" }}>{s.label}</div>
                    <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "2px" }}>{s.desc}</div>
                  </div>
                  <div style={{ width: "40px", height: "22px", backgroundColor: s.on ? theme.success : theme.border, borderRadius: "11px", position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ width: "16px", height: "16px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", top: "3px", right: s.on ? "3px" : "auto", left: s.on ? "auto" : "3px", transition: "all 0.2s" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "20px" }}>Privacy</div>
              {[
                { label: "Show Phone Number", desc: "Visible to co-passengers after booking", on: false },
                { label: "Public Profile", desc: "Anyone can view your profile and reviews", on: true },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 1 ? `1px solid ${theme.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: theme.textPrimary, fontWeight: "600" }}>{s.label}</div>
                    <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "2px" }}>{s.desc}</div>
                  </div>
                  <div style={{ width: "40px", height: "22px", backgroundColor: s.on ? theme.success : theme.border, borderRadius: "11px", position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ width: "16px", height: "16px", backgroundColor: "#fff", borderRadius: "50%", position: "absolute", top: "3px", right: s.on ? "3px" : "auto", left: s.on ? "auto" : "3px", transition: "all 0.2s" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: theme.dangerBg, border: `1px solid rgba(239, 68, 68, 0.15)`, borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.danger, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>⚠️ Danger Zone</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ padding: "10px 16px", background: "none", color: theme.danger, border: `1px solid rgba(239,68,68,0.3)`, borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.05)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>Deactivate Account</button>
                <button style={{ padding: "10px 16px", background: "none", color: theme.danger, border: `1px solid rgba(239,68,68,0.3)`, borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.05)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>Delete Account</button>
              </div>
            </div>
          </>
        )}
      </div>

      {editOpen && <EditModal user={user} onClose={() => setEditOpen(false)} onSave={handleSave} />}
    </>
  );
}
