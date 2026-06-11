import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../services/userService";
import axiosInstance from "../utils/axiosInstance";
import {
  User,
  Key,
  ShieldCheck,
  Car,
  Bike,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Check,
  Trash2,
  Lock,
} from "lucide-react";

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
  errorText: "#EF4444",
};

// ── INPUT COMPONENT ───────────────────────────────────────────────────────────
function GlassInput({ label, type = "text", value, onChange, placeholder, disabled, hint, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "700",
        color: theme.textSecondary, marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.8px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label} {required && <span style={{ color: theme.danger }}>*</span>}
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
          backgroundColor: disabled ? "#F3F4F6" : "#F9FAFB",
          border: `1.5px solid ${focused ? theme.accent : theme.border}`,
          borderRadius: "12px", color: disabled ? theme.textMuted : theme.textPrimary,
          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
          outline: "none", transition: "all 0.2s ease",
          cursor: disabled ? "not-allowed" : "text",
          boxShadow: focused ? `0 0 0 3px rgba(59,117,151,0.1)` : "none",
          boxSizing: "border-box",
        }}
      />
      {hint && <div style={{ fontSize: "11px", color: theme.textSecondary, marginTop: "5px", fontFamily: "'DM Sans', sans-serif", fontWeight: "500" }}>{hint}</div>}
    </div>
  );
}

// ── SELECT COMPONENT ──────────────────────────────────────────────────────────
function GlassSelect({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "700",
        color: theme.textSecondary, marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.8px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label} {required && <span style={{ color: theme.danger }}>*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "12px 16px",
          backgroundColor: "#F9FAFB",
          border: `1.5px solid ${theme.border}`,
          borderRadius: "12px", color: theme.textPrimary,
          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
          outline: "none", cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
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
        background: loading ? theme.border : theme.textPrimary,
        color: "white", border: "none", borderRadius: "12px",
        fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
        boxShadow: loading ? "none" : `0 4px 12px rgba(9, 60, 93, 0.15)`,
        display: "flex", alignItems: "center", gap: "8px",
      }}
      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "#07304b"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.textPrimary; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <Check size={16} />
      {loading ? "Saving..." : `${label}`}
    </button>
  );
}

// ── ALERT COMPONENT ───────────────────────────────────────────────────────────
function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    success: { bg: theme.successBg, border: "rgba(16,185,129,0.2)", color: theme.successText, icon: CheckCircle },
    error: { bg: theme.dangerBg, border: "rgba(239,68,68,0.2)", color: theme.errorText, icon: AlertCircle },
  };
  const s = styles[type];
  const IconComp = s.icon;
  return (
    <div style={{
      padding: "12px 16px", borderRadius: "10px",
      backgroundColor: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
      marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
      fontWeight: "600"
    }}>
      <IconComp size={16} /> {message}
    </div>
  );
}

// ── SECTION CARD ──────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{
      backgroundColor: theme.bgCard,
      border: `1px solid ${theme.border}`, borderRadius: "20px",
      padding: "28px", marginBottom: "20px",
      boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)",
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
  const { user: authUser, updateUser } = useAuth();

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0" }}>
        <div style={{ color: theme.accent, fontFamily: "'DM Sans', sans-serif", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "driver", label: "Driver Verification", icon: ShieldCheck },
    { id: "vehicles", label: "My Vehicles", icon: Car },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Navigation Action Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => navigate("/profile")} style={{
            background: "white", border: `1px solid ${theme.border}`,
            borderRadius: "8px", padding: "8px 14px", color: theme.textSecondary,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
            display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
            fontWeight: "600"
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.textPrimary; e.currentTarget.style.borderColor = theme.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.border; }}
          >
            <ArrowLeft size={14} /> Back to Profile
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: "flex", gap: "6px", marginBottom: "28px",
          backgroundColor: "rgba(9, 60, 93, 0.03)", borderRadius: "12px",
          padding: "4px", border: `1px solid ${theme.border}`,
          width: "fit-content", flexWrap: "wrap",
        }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { navigate(`/edit-profile?tab=${tab.id}`); setActiveTab(tab.id); }} style={{
                padding: "10px 18px", borderRadius: "8px", border: "none",
                backgroundColor: active ? "white" : "transparent",
                color: active ? theme.textPrimary : theme.textSecondary,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                fontSize: "13.5px", fontWeight: "600",
                transition: "all 0.2s ease",
                boxShadow: active ? "0 4px 10px rgba(9, 60, 93, 0.03)" : "none",
              }}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── PERSONAL INFO TAB ── */}
        {activeTab === "personal" && (
          <SectionCard title="Personal Information" subtitle="Update your general profile name and contact number">
            <Alert type={personalAlert.type} message={personalAlert.message} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              <GlassInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" required />
              <GlassInput label="Email Address" value={email} disabled hint="Email address cannot be changed" />
              <GlassInput label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <SaveButton onClick={handlePersonalSave} loading={personalLoading} />
            </div>
          </SectionCard>
        )}

        {/* ── PASSWORD TAB ── */}
        {activeTab === "password" && (
          <SectionCard title="Change Password" subtitle="Modify your password. Make sure to use a secure value.">
            <Alert type={passwordAlert.type} message={passwordAlert.message} />
            <div style={{ maxWidth: "460px" }}>
              <GlassInput label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter old password" required />
              <GlassInput label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" required />
              <GlassInput label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <SaveButton onClick={handlePasswordSave} loading={passwordLoading} label="Change Password" />
            </div>
          </SectionCard>
        )}

        {/* ── DRIVER VERIFICATION TAB ── */}
        {activeTab === "driver" && (
          <>
            {verificationStatus && (
              <div style={{
                padding: "20px", borderRadius: "16px", marginBottom: "24px",
                backgroundColor: verificationStatus.status === "APPROVED" ? theme.successBg : verificationStatus.status === "REJECTED" ? theme.dangerBg : theme.warningBg,
                border: `1px solid ${verificationStatus.status === "APPROVED" ? "rgba(16, 185, 129, 0.15)" : verificationStatus.status === "REJECTED" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)"}`,
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <span style={{ fontSize: "28px" }}>
                  {verificationStatus.status === "APPROVED" ? "✅" : verificationStatus.status === "REJECTED" ? "❌" : "⏳"}
                </span>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "700", color: verificationStatus.status === "APPROVED" ? theme.success : verificationStatus.status === "REJECTED" ? theme.danger : theme.warningText }}>
                    {verificationStatus.status === "APPROVED" ? "Verified Driver!" : verificationStatus.status === "REJECTED" ? "Verification Rejected" : "Verification Pending Admin Audit"}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: theme.textSecondary, marginTop: "4px", fontWeight: "500" }}>
                    {verificationStatus.status === "APPROVED" ? "You are fully authorized to offer rides on Ridivo." : verificationStatus.status === "REJECTED" ? verificationStatus.rejection_reason || "Re-submit correct document details." : "Admin is audit-verifying your details. Typically resolves within 24 hours."}
                  </div>
                </div>
              </div>
            )}

            {(!verificationStatus || verificationStatus.status === "REJECTED") && (
              <SectionCard title="Submit Identity Verification" subtitle="Provide documents to verify driving credentials">
                <Alert type={verifyAlert.type} message={verifyAlert.message} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <GlassInput label="License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. MP09 2023 1234567" required />
                  <GlassInput label="License Expiry Date" type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} required />
                  <GlassInput label="License Front Image URL" value={licenseImageUrl} onChange={(e) => setLicenseImageUrl(e.target.value)} placeholder="https://..." hint="Upload license image and paste URL link" />
                  <GlassInput label="Aadhar Card Number" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} placeholder="12 digit Aadhaar number" required />
                  <GlassInput label="Aadhar Front Image URL" value={aadharImageUrl} onChange={(e) => setAadharImageUrl(e.target.value)} placeholder="https://..." hint="Upload Aadhaar image and paste URL link" />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                  <SaveButton onClick={handleVerificationSubmit} loading={verifyLoading} label="Submit Documents" />
                </div>
              </SectionCard>
            )}
          </>
        )}

        {/* ── VEHICLES TAB ── */}
        {activeTab === "vehicles" && (
          <>
            {vehicles.length > 0 && (
              <SectionCard title="Registered Vehicles" subtitle="Your vehicles registered on the platform">
                {vehicles.map((v) => (
                  <div key={v.id} style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    padding: "16px 18px", borderRadius: "14px", marginBottom: "12px",
                    backgroundColor: "#F9FAFB", border: `1px solid ${v.is_active ? "rgba(9, 60, 93, 0.2)" : theme.border}`,
                  }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: theme.accentLight, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textPrimary }}>
                      {v.vehicle_type === "BIKE" ? <Bike size={20} /> : <Car size={20} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: "700", color: theme.textPrimary, marginBottom: "3px" }}>
                        {v.vehicle_name}
                        {v.is_active && <span style={{ marginLeft: "8px", fontSize: "10px", backgroundColor: theme.successBg, color: theme.success, padding: "2px 8px", borderRadius: "100px", fontWeight: "700" }}>ACTIVE</span>}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: theme.textSecondary }}>
                        {v.vehicle_number} · {v.vehicle_type} · {v.total_seats} passenger seats {v.color ? `· ${v.color}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!v.is_active && (
                        <button onClick={() => handleSetActive(v.id)} style={{
                          padding: "6px 12px", backgroundColor: "white", border: `1px solid ${theme.border}`,
                          borderRadius: "8px", color: theme.textPrimary, cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "700",
                        }}>Set Active</button>
                      )}
                      <button onClick={() => handleDeleteVehicle(v.id)} style={{
                        padding: "6px 12px", backgroundColor: theme.dangerBg, border: "none",
                        borderRadius: "8px", color: theme.danger, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "700",
                        display: "flex", alignItems: "center", gap: "4px"
                      }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Add vehicle form */}
            <SectionCard
              title="Add New Vehicle"
              subtitle={verificationStatus?.status !== "APPROVED" ? "Verification is required to add vehicles." : "Register a vehicle for offering rides."}
            >
              {verificationStatus?.status !== "APPROVED" && (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <ShieldCheck size={40} style={{ color: theme.textSecondary, marginBottom: "12px" }} />
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: theme.textSecondary, marginBottom: "16px", fontWeight: "500" }}>
                    Driver verification approval is required to register vehicles.
                  </div>
                  <button onClick={() => setActiveTab("driver")} style={{
                    padding: "10px 20px", backgroundColor: theme.accentLight,
                    border: `1px solid rgba(9, 60, 93, 0.1)`, borderRadius: "10px",
                    color: theme.textPrimary, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px", fontWeight: "700",
                  }}>Verify Credentials →</button>
                </div>
              )}

              {verificationStatus?.status === "APPROVED" && (
                <>
                  <Alert type={vehicleAlert.type} message={vehicleAlert.message} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                    <GlassInput label="Vehicle Model Name" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} placeholder="e.g. Swift Dzire" required />
                    <GlassInput label="Vehicle Plate Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="e.g. MP09 AB 1234" required />
                    <GlassSelect label="Vehicle Category" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} options={[{ value: "CAR", label: "Car" }, { value: "SUV", label: "SUV" }, { value: "BIKE", label: "Bike" }]} required />
                    <GlassInput label="Passenger Seats" type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} placeholder="e.g. 4" hint="Excluding driver" required />
                    <GlassInput label="Vehicle Color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White" />
                    <GlassInput label="Vehicle Image Link" value={vehicleImageUrl} onChange={(e) => setVehicleImageUrl(e.target.value)} placeholder="https://..." hint="Optional — image URL address" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                    <SaveButton onClick={handleAddVehicle} loading={vehicleLoading} label="Register Vehicle" />
                  </div>
                </>
              )}
            </SectionCard>
          </>
        )}
      </div>
    </>
  );
}
