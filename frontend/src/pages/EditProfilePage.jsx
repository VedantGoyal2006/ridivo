import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../services/userService";
import axiosInstance from "../utils/axiosInstance";
import RidivoLogo from "../components/RidivoLogo";

const theme = {
  bgBase: "#0B1120",
  glassCard: "rgba(255, 255, 255, 0.03)",
  glassCardHeavy: "rgba(15, 23, 42, 0.8)",
  glassHover: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  accent: "#38BDF8",
  accentHover: "#0284C7",
  successText: "#34D399",
  warningText: "#FBBF24",
  errorText: "#FCA5A5",
};

const navItems = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "🔍", label: "Find a Ride", path: "/find-ride" },
  { icon: "🚗", label: "My Rides", path: "/my-rides" },
  { icon: "➕", label: "Offer a Ride", path: "/offer-ride" },
  { icon: "📋", label: "Bookings", path: "/bookings" },
  { icon: "💰", label: "Payments", path: "/payments" },
  { icon: "⭐", label: "Reviews", path: "/reviews" },
  { icon: "👤", label: "Profile", path: "/profile" },
  { icon: "⚙️", label: "Settings", path: "/settings" },
];

// ── INPUT COMPONENT ───────────────────────────────────────────────────────────
function GlassInput({ label, type = "text", value, onChange, placeholder, disabled, hint, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "600",
        color: theme.textSecondary, marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.8px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label} {required && <span style={{ color: theme.accent }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "12px 16px",
          backgroundColor: disabled ? "rgba(0,0,0,0.2)" : focused ? "rgba(56,189,248,0.05)" : "rgba(0,0,0,0.3)",
          border: `1px solid ${focused ? theme.accent : theme.glassBorder}`,
          borderRadius: "12px", color: disabled ? theme.textSecondary : theme.textPrimary,
          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
          outline: "none", transition: "all 0.2s ease",
          cursor: disabled ? "not-allowed" : "text",
          boxShadow: focused ? `0 0 0 3px rgba(56,189,248,0.1)` : "none",
          boxSizing: "border-box",
        }}
      />
      {hint && <div style={{ fontSize: "11px", color: theme.textSecondary, marginTop: "5px", fontFamily: "'DM Sans', sans-serif" }}>{hint}</div>}
    </div>
  );
}

// ── SELECT COMPONENT ──────────────────────────────────────────────────────────
function GlassSelect({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "600",
        color: theme.textSecondary, marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.8px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label} {required && <span style={{ color: theme.accent }}>*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "12px 16px",
          backgroundColor: "rgba(0,0,0,0.3)",
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "12px", color: theme.textPrimary,
          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
          outline: "none", cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: "#0B1120" }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── SAVE BUTTON ───────────────────────────────────────────────────────────────
function SaveButton({ onClick, loading, label = "Save Changes" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "12px 28px",
        background: loading ? "rgba(56,189,248,0.3)" : `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
        color: "white", border: "none", borderRadius: "12px",
        fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
        boxShadow: loading ? "none" : `0 4px 16px rgba(56,189,248,0.3)`,
        display: "flex", alignItems: "center", gap: "8px",
      }}
      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(56,189,248,0.4)`; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px rgba(56,189,248,0.3)`; }}
    >
      {loading ? "⏳ Saving..." : `✓ ${label}`}
    </button>
  );
}

// ── ALERT COMPONENT ───────────────────────────────────────────────────────────
function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    success: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", color: theme.successText, icon: "✅" },
    error: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", color: theme.errorText, icon: "⚠️" },
  };
  const s = styles[type];
  return (
    <div style={{
      padding: "12px 16px", borderRadius: "10px",
      backgroundColor: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
      marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
    }}>
      {s.icon} {message}
    </div>
  );
}

// ── SECTION CARD ──────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{
      backgroundColor: theme.glassCard, backdropFilter: "blur(16px)",
      border: `1px solid ${theme.glassBorder}`, borderRadius: "20px",
      padding: "28px", marginBottom: "20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>{title}</div>
        {subtitle && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: theme.textSecondary }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout, updateUser } = useAuth();

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return ["personal", "password", "driver", "vehicles"].includes(tab) ? tab : "personal";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [loading, setLoading] = useState(true);

  // Sync tab state with query param if it changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["personal", "password", "driver", "vehicles"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Personal info state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalAlert, setPersonalAlert] = useState({ type: "", message: "" });

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState({ type: "", message: "" });

  // Driver verification state
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseImageUrl, setLicenseImageUrl] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharImageUrl, setAadharImageUrl] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyAlert, setVerifyAlert] = useState({ type: "", message: "" });

  // Vehicle state
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [totalSeats, setTotalSeats] = useState("");
  const [color, setColor] = useState("");
  const [vehicleImageUrl, setVehicleImageUrl] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleAlert, setVehicleAlert] = useState({ type: "", message: "" });

  // Fetch profile on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyProfile();
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setPhone(data.user.phone || "");
        setVerificationStatus(data.verification_status);

        // Fetch vehicles
        const vehicleRes = await axiosInstance.get("/vehicles");
        setVehicles(vehicleRes.data.vehicles || []);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── HANDLERS ────────────────────────────────────────────────────────────────

  const handlePersonalSave = async () => {
    if (!name.trim()) {
      setPersonalAlert({ type: "error", message: "Name is required" });
      return;
    }
    setPersonalLoading(true);
    setPersonalAlert({ type: "", message: "" });
    try {
      await updateMyProfile(name, phone, null);
      updateUser({ name, phone });
      setPersonalAlert({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setPersonalAlert({ type: "error", message: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setPersonalLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordAlert({ type: "error", message: "All password fields are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: "error", message: "New passwords don't match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordAlert({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }
    setPasswordLoading(true);
    setPasswordAlert({ type: "", message: "" });
    try {
      await changeMyPassword(oldPassword, newPassword);
      setPasswordAlert({ type: "success", message: "Password changed successfully!" });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPasswordAlert({ type: "error", message: err.response?.data?.message || "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!licenseNumber || !licenseExpiry || !aadharNumber) {
      setVerifyAlert({ type: "error", message: "License number, expiry and Aadhar number are required" });
      return;
    }
    if (aadharNumber.length !== 12) {
      setVerifyAlert({ type: "error", message: "Aadhar number must be 12 digits" });
      return;
    }
    setVerifyLoading(true);
    setVerifyAlert({ type: "", message: "" });
    try {
      await axiosInstance.post("/verification/apply", {
        license_number: licenseNumber,
        license_expiry: licenseExpiry,
        license_image_url: licenseImageUrl,
        aadhar_number: aadharNumber,
        aadhar_image_url: aadharImageUrl,
      });
      setVerifyAlert({ type: "success", message: "Verification submitted! Admin will review within 24 hours." });
      setVerificationStatus({ status: "PENDING" });
    } catch (err) {
      setVerifyAlert({ type: "error", message: err.response?.data?.message || "Failed to submit verification" });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!vehicleName || !vehicleNumber || !totalSeats) {
      setVehicleAlert({ type: "error", message: "Vehicle name, number and seats are required" });
      return;
    }
    setVehicleLoading(true);
    setVehicleAlert({ type: "", message: "" });
    try {
      const res = await axiosInstance.post("/vehicles", {
        vehicle_name: vehicleName,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        total_seats: parseInt(totalSeats),
        color,
        vehicle_image_url: vehicleImageUrl,
      });
      setVehicles([...vehicles, res.data.vehicle]);
      setVehicleAlert({ type: "success", message: "Vehicle added successfully!" });
      setVehicleName(""); setVehicleNumber(""); setTotalSeats(""); setColor(""); setVehicleImageUrl("");
    } catch (err) {
      setVehicleAlert({ type: "error", message: err.response?.data?.message || "Failed to add vehicle" });
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await axiosInstance.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await axiosInstance.put(`/vehicles/${id}/active`);
      setVehicles(vehicles.map(v => ({ ...v, is_active: v.id === id })));
    } catch (err) {
      console.error("Failed to set active vehicle:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bgBase, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: theme.accent, fontFamily: "'DM Sans', sans-serif", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: "personal", label: "👤 Personal Info", desc: "Name, phone, email" },
    { id: "password", label: "🔒 Password", desc: "Change password" },
    { id: "driver", label: "🛡️ Driver Verification", desc: "License & Aadhar" },
    { id: "vehicles", label: "🚗 My Vehicles", desc: "Add & manage vehicles" },
  ];

  const premiumBg = {
    minHeight: "100vh", display: "flex",
    backgroundColor: theme.bgBase,
    backgroundImage: `
      radial-gradient(circle at 15% 50%, rgba(56,189,248,0.06), transparent 25%),
      radial-gradient(circle at 85% 30%, rgba(167,139,250,0.06), transparent 25%),
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 100% 100%, 40px 40px, 40px 40px",
    fontFamily: "'DM Sans', sans-serif",
    color: theme.textPrimary,
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={premiumBg}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: "240px", flexShrink: 0,
          backgroundColor: "rgba(11,17,32,0.75)", backdropFilter: "blur(20px)",
          borderRight: `1px solid ${theme.glassBorder}`,
          height: "100vh", position: "fixed", left: 0, top: 0,
          display: "flex", flexDirection: "column", zIndex: 100, overflowY: "auto",
        }}>
          <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${theme.glassBorder}`, cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}>
            <RidivoLogo size={34} showText={true} textColor="white" />
          </div>

          <nav style={{ padding: "16px 12px", flex: 1 }}>
            {navItems.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 12px", borderRadius: "10px", border: "none",
                backgroundColor: item.path === "/profile" ? "rgba(56,189,248,0.15)" : "transparent",
                color: item.path === "/profile" ? theme.textPrimary : theme.textSecondary,
                cursor: "pointer", fontSize: "14px",
                fontWeight: item.path === "/profile" ? "600" : "400",
                fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                transition: "all 0.2s ease", marginBottom: "2px",
                borderLeft: item.path === "/profile" ? `3px solid ${theme.accent}` : "3px solid transparent",
              }}
                onMouseEnter={(e) => { if (item.path !== "/profile") { e.currentTarget.style.backgroundColor = theme.glassHover; e.currentTarget.style.color = theme.textPrimary; } }}
                onMouseLeave={(e) => { if (item.path !== "/profile") { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.textSecondary; } }}
              >
                <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ margin: "12px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(2,132,199,0.4))", border: `1px solid rgba(56,189,248,0.3)`, padding: "16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>🚗</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: "700", color: theme.textPrimary, marginBottom: "4px" }}>Got Empty Seats?</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.7)", marginBottom: "12px" }}>Share your ride and split the cost</div>
            <button style={{ width: "100%", padding: "8px", backgroundColor: theme.accent, color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => navigate("/offer-ride")}>Offer a Ride</button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Top bar */}
          <header style={{
            height: "64px", backgroundColor: theme.glassCardHeavy,
            backdropFilter: "blur(16px)", borderBottom: `1px solid ${theme.glassBorder}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 32px", position: "sticky", top: 0, zIndex: 50,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => navigate("/profile")} style={{
                background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.glassBorder}`,
                borderRadius: "8px", padding: "6px 12px", color: theme.textSecondary,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = theme.textPrimary; e.currentTarget.style.borderColor = theme.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.glassBorder; }}
              >
                ← Back to Profile
              </button>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.textPrimary }}>
                Edit Profile
              </div>
            </div>
            <button onClick={() => { logout(); navigate("/"); }} style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", padding: "6px 16px", color: "#FCA5A5",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
              fontWeight: "600", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"}
            >
              🚪 Sign Out
            </button>
          </header>

          <main style={{ padding: "32px", maxWidth: "900px", width: "100%" }}>

            {/* Tab navigation */}
            <div style={{
              display: "flex", gap: "8px", marginBottom: "28px",
              backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "16px",
              padding: "6px", border: `1px solid ${theme.glassBorder}`,
              flexWrap: "wrap",
            }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding: "10px 18px", borderRadius: "10px", border: "none",
                  backgroundColor: activeTab === tab.id ? `rgba(56,189,248,0.2)` : "transparent",
                  color: activeTab === tab.id ? theme.accent : theme.textSecondary,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px", fontWeight: activeTab === tab.id ? "700" : "400",
                  transition: "all 0.2s ease",
                  borderBottom: activeTab === tab.id ? `2px solid ${theme.accent}` : "2px solid transparent",
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── PERSONAL INFO TAB ── */}
            {activeTab === "personal" && (
              <>
                <SectionCard title="Personal Information" subtitle="Update your name and phone number">
                  <Alert type={personalAlert.type} message={personalAlert.message} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                    <GlassInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
                    <GlassInput label="Email Address" value={email} disabled hint="Email cannot be changed" />
                    <GlassInput label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <SaveButton onClick={handlePersonalSave} loading={personalLoading} />
                </SectionCard>
              </>
            )}

            {/* ── PASSWORD TAB ── */}
            {activeTab === "password" && (
              <SectionCard title="Change Password" subtitle="Make sure your new password is at least 6 characters">
                <Alert type={passwordAlert.type} message={passwordAlert.message} />
                <div style={{ maxWidth: "460px" }}>
                  <GlassInput label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" required />
                  <GlassInput label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required />
                  <GlassInput label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
                </div>
                <SaveButton onClick={handlePasswordSave} loading={passwordLoading} label="Change Password" />
              </SectionCard>
            )}

            {/* ── DRIVER VERIFICATION TAB ── */}
            {activeTab === "driver" && (
              <>
                {/* Status banner */}
                {verificationStatus && (
                  <div style={{
                    padding: "16px 20px", borderRadius: "14px", marginBottom: "20px",
                    backgroundColor: verificationStatus.status === "APPROVED" ? "rgba(52,211,153,0.1)" : verificationStatus.status === "REJECTED" ? "rgba(239,68,68,0.1)" : "rgba(251,191,36,0.1)",
                    border: `1px solid ${verificationStatus.status === "APPROVED" ? "rgba(52,211,153,0.3)" : verificationStatus.status === "REJECTED" ? "rgba(239,68,68,0.3)" : "rgba(251,191,36,0.3)"}`,
                    display: "flex", alignItems: "center", gap: "14px",
                  }}>
                    <span style={{ fontSize: "28px" }}>
                      {verificationStatus.status === "APPROVED" ? "✅" : verificationStatus.status === "REJECTED" ? "❌" : "⏳"}
                    </span>
                    <div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: verificationStatus.status === "APPROVED" ? theme.successText : verificationStatus.status === "REJECTED" ? theme.errorText : theme.warningText }}>
                        {verificationStatus.status === "APPROVED" ? "Verified Driver ✓" : verificationStatus.status === "REJECTED" ? "Verification Rejected" : "Verification Pending"}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary, marginTop: "3px" }}>
                        {verificationStatus.status === "APPROVED" ? "You can now offer rides on Ridivo" : verificationStatus.status === "REJECTED" ? verificationStatus.rejection_reason || "Please reapply with correct documents" : "Admin is reviewing your documents. This may take up to 24 hours."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show form only if not approved or rejected */}
                {(!verificationStatus || verificationStatus.status === "REJECTED") && (
                  <SectionCard title="Driver Verification" subtitle="Submit your documents to start offering rides">
                    <Alert type={verifyAlert.type} message={verifyAlert.message} />

                    <div style={{ marginBottom: "20px", padding: "14px 16px", backgroundColor: "rgba(56,189,248,0.05)", borderRadius: "10px", border: `1px solid rgba(56,189,248,0.15)` }}>
                      <div style={{ fontSize: "12px", color: theme.accent, fontWeight: "600", marginBottom: "4px", fontFamily: "'DM Sans', sans-serif" }}>📋 Required Documents</div>
                      <div style={{ fontSize: "12px", color: theme.textSecondary, fontFamily: "'DM Sans', sans-serif", lineHeight: "1.6" }}>
                        Valid Driving License · Aadhaar Card · Both documents must match your registered name
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                      <GlassInput label="License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. MP09 2023 1234567" required />
                      <GlassInput label="License Expiry Date" type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} required />
                      <GlassInput label="License Image URL" value={licenseImageUrl} onChange={(e) => setLicenseImageUrl(e.target.value)} placeholder="https://..." hint="Upload image to cloud and paste URL" />
                      <GlassInput label="Aadhar Number" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} placeholder="12 digit Aadhar number" required />
                      <GlassInput label="Aadhar Image URL" value={aadharImageUrl} onChange={(e) => setAadharImageUrl(e.target.value)} placeholder="https://..." hint="Upload image to cloud and paste URL" />
                    </div>

                    <SaveButton onClick={handleVerificationSubmit} loading={verifyLoading} label="Submit for Verification" />
                  </SectionCard>
                )}
              </>
            )}

            {/* ── VEHICLES TAB ── */}
            {activeTab === "vehicles" && (
              <>
                {/* Existing vehicles */}
                {vehicles.length > 0 && (
                  <SectionCard title="My Vehicles" subtitle="Manage your registered vehicles">
                    {vehicles.map((v) => (
                      <div key={v.id} style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "16px", borderRadius: "12px", marginBottom: "12px",
                        backgroundColor: "rgba(0,0,0,0.2)", border: `1px solid ${v.is_active ? "rgba(56,189,248,0.3)" : theme.glassBorder}`,
                      }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(56,189,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                          {v.vehicle_type === "BIKE" ? "🏍️" : v.vehicle_type === "SUV" ? "🚙" : "🚗"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary, marginBottom: "3px" }}>
                            {v.vehicle_name}
                            {v.is_active && <span style={{ marginLeft: "8px", fontSize: "10px", backgroundColor: "rgba(56,189,248,0.2)", color: theme.accent, padding: "2px 8px", borderRadius: "100px", fontWeight: "600" }}>ACTIVE</span>}
                          </div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>
                            {v.vehicle_number} · {v.vehicle_type} · {v.total_seats} seats · {v.color || "No color"}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {!v.is_active && (
                            <button onClick={() => handleSetActive(v.id)} style={{
                              padding: "6px 12px", backgroundColor: "rgba(56,189,248,0.1)", border: `1px solid rgba(56,189,248,0.3)`,
                              borderRadius: "8px", color: theme.accent, cursor: "pointer",
                              fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "600",
                            }}>Set Active</button>
                          )}
                          <button onClick={() => handleDeleteVehicle(v.id)} style={{
                            padding: "6px 12px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: "8px", color: theme.errorText, cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "600",
                          }}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </SectionCard>
                )}

                {/* Add new vehicle */}
                <SectionCard
                  title="Add New Vehicle"
                  subtitle={verificationStatus?.status !== "APPROVED" ? "⚠️ You must be a verified driver to add vehicles" : "Register a new vehicle to your account"}
                >
                  {verificationStatus?.status !== "APPROVED" && (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛡️</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: theme.textSecondary, marginBottom: "16px" }}>
                        Complete driver verification first to add vehicles
                      </div>
                      <button onClick={() => setActiveTab("driver")} style={{
                        padding: "10px 20px", backgroundColor: `rgba(56,189,248,0.15)`,
                        border: `1px solid rgba(56,189,248,0.3)`, borderRadius: "10px",
                        color: theme.accent, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px", fontWeight: "600",
                      }}>Go to Driver Verification →</button>
                    </div>
                  )}

                  {verificationStatus?.status === "APPROVED" && (
                    <>
                      <Alert type={vehicleAlert.type} message={vehicleAlert.message} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                        <GlassInput label="Vehicle Name" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} placeholder="e.g. Swift Dzire" required />
                        <GlassInput label="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="e.g. MP09 AB 1234" required />
                        <GlassSelect label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} options={[{ value: "CAR", label: "🚗 Car" }, { value: "SUV", label: "🚙 SUV" }, { value: "BIKE", label: "🏍️ Bike" }]} required />
                        <GlassInput label="Total Seats" type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} placeholder="e.g. 4" hint="Excluding driver" required />
                        <GlassInput label="Color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White" />
                        <GlassInput label="Vehicle Image URL" value={vehicleImageUrl} onChange={(e) => setVehicleImageUrl(e.target.value)} placeholder="https://..." hint="Optional — upload and paste URL" />
                      </div>
                      <SaveButton onClick={handleAddVehicle} loading={vehicleLoading} label="Add Vehicle" />
                    </>
                  )}
                </SectionCard>
              </>
            )}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }
        select option { background: #0B1120; color: #F8FAFC; }
      `}</style>
    </>
  );
}
