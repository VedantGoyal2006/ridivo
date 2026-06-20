import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile } from "../services/userService";
import axiosInstance from "../utils/axiosInstance";
import {
  ShieldAlert,
  Car,
  Bike,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Save,
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
function SaveButton({ onClick, loading, label = "Add Vehicle" }) {
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
      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.backgroundColor = "#07304b"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.backgroundColor = theme.textPrimary; }}
    >
      <Save size={16} />
      {loading ? "Adding..." : `${label}`}
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
export default function AddVehiclePage() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Form state
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [totalSeats, setTotalSeats] = useState("");
  const [color, setColor] = useState("");
  const [vehicleImageUrl, setVehicleImageUrl] = useState("");
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Fetch driver verification status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getMyProfile();
        setVerificationStatus(data.verification_status);
      } catch (err) {
        console.error("Failed to fetch profile/verification status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleAddVehicle = async () => {
    if (!vehicleName.trim() || !vehicleNumber.trim() || !totalSeats) {
      setAlert({ type: "error", message: "Vehicle name, number and seats are required" });
      return;
    }

    const seatsNum = parseInt(totalSeats);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 7) {
      setAlert({ type: "error", message: "Total seats must be a number between 1 and 7" });
      return;
    }

    setSubmitLoading(true);
    setAlert({ type: "", message: "" });
    try {
      await axiosInstance.post("/vehicles", {
        vehicle_name: vehicleName,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        total_seats: seatsNum,
        color,
        vehicle_image_url: vehicleImageUrl,
      });

      setAlert({ type: "success", message: "Vehicle added successfully! Redirecting..." });
      
      // Clear form
      setVehicleName("");
      setVehicleNumber("");
      setTotalSeats("");
      setColor("");
      setVehicleImageUrl("");

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Failed to add vehicle" });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0" }}>
        <div style={{ color: theme.accent, fontFamily: "'DM Sans', sans-serif", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  const isVerified = verificationStatus?.status === "APPROVED";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Navigation Action header */}
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

        {/* ── DRIVER VERIFICATION WARNING BANNER ── */}
        {!isVerified && (
          <div style={{
            padding: "32px 24px", borderRadius: "20px",
            backgroundColor: theme.dangerBg, border: `1px solid rgba(239, 68, 68, 0.15)`,
            boxShadow: "0 4px 20px rgba(9, 60, 93, 0.01)",
            textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px"
          }}>
            <ShieldAlert size={48} style={{ color: theme.danger }} />
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: "700", color: theme.danger }}>
              Driver Verification Required
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: theme.textSecondary, maxWidth: "480px", margin: 0, lineHeight: "1.6" }}>
              To register vehicles and offer rides on the Ridivo platform, you must first verify your driving license and Aadhaar details.
            </p>
            <button onClick={() => navigate("/verify")} style={{
              padding: "12px 24px", backgroundColor: theme.textPrimary, border: "none",
              borderRadius: "10px", color: "white", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "700",
              transition: "all 0.2s ease", boxShadow: `0 4px 12px rgba(9, 60, 93, 0.15)`,
              marginTop: "8px"
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#07304b"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.textPrimary}
            >
              Verify Now →
            </button>
          </div>
        )}

        {/* ── ADD NEW VEHICLE FORM ── */}
        {isVerified && (
          <SectionCard
            title="Register New Vehicle"
            subtitle="Register a new vehicle to your verified driver profile"
          >
            <Alert type={alert.type} message={alert.message} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              <GlassInput label="Vehicle Name" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} placeholder="e.g. Swift Dzire" required />
              <GlassInput label="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="e.g. MP09 AB 1234" required />
              <GlassSelect label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} options={[{ value: "CAR", label: "Car" }, { value: "SUV", label: "SUV" }, { value: "BIKE", label: "Bike" }]} required />
              <GlassInput label="Total Passenger Seats" type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} placeholder="e.g. 4" hint="Excluding driver's seat" required />
              <GlassInput label="Vehicle Color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White" />
              <GlassInput label="Vehicle Image URL" value={vehicleImageUrl} onChange={(e) => setVehicleImageUrl(e.target.value)} placeholder="https://..." hint="Optional — upload image and paste URL link" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <SaveButton onClick={handleAddVehicle} loading={submitLoading} />
            </div>
          </SectionCard>
        )}
      </div>
    </>
  );
}
